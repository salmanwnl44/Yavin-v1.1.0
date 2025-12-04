import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import parsePlist from 'fast-plist'

export class ExtensionLoader {
    constructor() {
        this.extensions = [];
        this.wasmLoaded = false;
        this.registry = null;
        this.grammarMap = new Map(); // scopeName -> { path, extPath }
        this.scopeMap = new Map(); // languageId -> scopeName
    }

    async init() {
        if (this.wasmLoaded) return;
        try {
            await loadWASM('/onigasm.wasm');
            this.wasmLoaded = true;

            this.registry = new Registry({
                getGrammarDefinition: async (scopeName) => {
                    const grammarInfo = this.grammarMap.get(scopeName);
                    if (!grammarInfo) {
                        console.warn(`Grammar not found for scope: ${scopeName}`);
                        return null;
                    }

                    const fullPath = `${grammarInfo.extPath}\\${grammarInfo.path.replace(/^\.\//, '').replace(/\//g, '\\')}`;
                    try {
                        const result = await window.electron.fileSystem.readFile(fullPath);
                        if (result.success) {
                            let content = null;
                            if (fullPath.endsWith('.json')) {
                                content = JSON.parse(result.content);
                            } else if (fullPath.endsWith('.plist') || fullPath.endsWith('.tmLanguage')) {
                                content = parsePlist(result.content);
                            }

                            if (content) {
                                return {
                                    format: fullPath.endsWith('.json') ? 'json' : 'plist',
                                    content: content
                                };
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to load grammar file: ${fullPath}`, err);
                    }
                    return null;
                }
            });
        } catch (err) {
            console.error('Failed to load onigasm:', err);
        }
    }

    async loadExtensions() {
        if (!window.electron?.extensions) {
            console.warn('Extension API not available');
            return;
        }

        await this.init();

        try {
            this.extensions = await window.electron.extensions.list();
            console.log('Loaded extensions:', this.extensions);

            // First pass: Register languages and build maps
            for (const ext of this.extensions) {
                const manifest = ext.manifest;
                if (!manifest.contributes) continue;

                // Register Languages
                if (manifest.contributes.languages) {
                    for (const lang of manifest.contributes.languages) {
                        if (window.monaco) {
                            // Register Language
                            const existing = window.monaco.languages.getLanguages().find(l => l.id === lang.id);
                            if (!existing) {
                                window.monaco.languages.register({
                                    id: lang.id,
                                    extensions: lang.extensions,
                                    aliases: lang.aliases,
                                    mimetypes: lang.mimetypes,
                                    filenamePatterns: lang.filenamePatterns
                                });
                                console.log(`Registered language: ${lang.id}`);
                            }

                            // Load Language Configuration (comments, brackets, etc.)
                            if (lang.configuration) {
                                this.loadLanguageConfiguration(ext.path, lang.id, lang.configuration);
                            }
                        }
                    }
                }

                // Index Grammars
                if (manifest.contributes.grammars) {
                    for (const grammar of manifest.contributes.grammars) {
                        if (grammar.scopeName && grammar.path) {
                            this.grammarMap.set(grammar.scopeName, {
                                path: grammar.path,
                                extPath: ext.path
                            });
                            if (grammar.language) {
                                this.scopeMap.set(grammar.language, grammar.scopeName);
                            }
                        }
                    }
                }
            }

            // Second pass: Process other contributions (themes, etc.)
            for (const ext of this.extensions) {
                await this.processExtension(ext);
            }
        } catch (err) {
            console.error('Failed to load extensions:', err);
        }
    }

    async loadLanguageConfiguration(extPath, languageId, configPath) {
        try {
            const fullPath = `${extPath}\\${configPath.replace(/^\.\//, '').replace(/\//g, '\\')}`;
            const result = await window.electron.fileSystem.readFile(fullPath);
            if (result.success) {
                // Language config often contains comments, so we might need a loose JSON parser
                // For now, let's try standard JSON and maybe strip comments if needed
                // Or use a library like 'json5' or 'strip-json-comments' if we had it.
                // Monaco's JSON parser is strict. Let's try to strip comments simply.
                const cleanContent = result.content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
                const config = JSON.parse(cleanContent);

                window.monaco.languages.setLanguageConfiguration(languageId, config);
                console.log(`Loaded configuration for ${languageId}`);
            }
        } catch (err) {
            console.error(`Failed to load language config for ${languageId}:`, err);
        }
    }

    async processExtension(ext) {
        const manifest = ext.manifest;
        if (!manifest.contributes) return;

        // Process Themes
        if (manifest.contributes.themes) {
            console.log(`Found themes in ${ext.id}`, manifest.contributes.themes);
            for (const theme of manifest.contributes.themes) {
                await this.loadTheme(ext.path, theme);
            }
        }
    }

    async wireEditor(editor) {
        if (!this.registry || !window.monaco) return;

        try {
            const grammars = new Map();
            this.scopeMap.forEach((scopeName, languageId) => {
                grammars.set(languageId, scopeName);
            });

            await wireTmGrammars(window.monaco, this.registry, grammars, editor);
            console.log('Wired TextMate grammars to editor');
        } catch (err) {
            console.error('Failed to wire TextMate grammars:', err);
        }
    }

    async loadTheme(extPath, themeEntry) {
        try {
            const themePath = `${extPath}\\${themeEntry.path.replace(/^\.\//, '').replace(/\//g, '\\')}`;
            const result = await window.electron.fileSystem.readFile(themePath);

            if (!result.success) {
                console.error(`Failed to read theme file: ${themePath}`, result.error);
                return;
            }

            const themeContent = JSON.parse(result.content);
            const monacoTheme = this.convertTheme(themeContent);

            if (window.monaco) {
                const themeId = themeEntry.id || themeEntry.label.replace(/\s+/g, '-');
                window.monaco.editor.defineTheme(themeId, monacoTheme);
                console.log(`Theme registered: ${themeId}`);
            }
        } catch (err) {
            console.error('Error loading theme:', err);
        }
    }

    convertTheme(vscodeTheme) {
        // Basic conversion from VS Code theme to Monaco theme
        const rules = [];
        if (vscodeTheme.tokenColors) {
            for (const token of vscodeTheme.tokenColors) {
                if (token.scope && token.settings) {
                    const scopes = Array.isArray(token.scope) ? token.scope : token.scope.split(',');
                    for (const scope of scopes) {
                        rules.push({
                            token: scope.trim(),
                            foreground: token.settings.foreground,
                            background: token.settings.background,
                            fontStyle: token.settings.fontStyle
                        });
                    }
                }
            }
        }

        return {
            base: vscodeTheme.type === 'light' ? 'vs' : 'vs-dark',
            inherit: true,
            rules: rules,
            colors: vscodeTheme.colors || {}
        };
    }
}

export const extensionLoader = new ExtensionLoader();
