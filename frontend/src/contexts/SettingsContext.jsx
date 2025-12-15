import { createContext, useContext, useState, useEffect } from 'react'

export const terminalThemes = {
    'default': {
        name: 'Default',
        background: '#0a0e14',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
        cursorAccent: '#000000'
    },
    'campbell': {
        name: 'Campbell',
        background: '#0C0C0C',
        foreground: '#CCCCCC',
        cursor: '#FFFFFF',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
        black: '#0C0C0C',
        red: '#C50F1F',
        green: '#13A10E',
        yellow: '#C19C00',
        blue: '#0037DA',
        magenta: '#881798',
        cyan: '#3A96DD',
        white: '#CCCCCC',
        brightBlack: '#767676',
        brightRed: '#E74856',
        brightGreen: '#16C60C',
        brightYellow: '#F9F1A5',
        brightBlue: '#3B78FF',
        brightMagenta: '#B4009E',
        brightCyan: '#61D6D6',
        brightWhite: '#F2F2F2'
    },
    'dracula': {
        name: 'Dracula',
        background: '#282a36',
        foreground: '#f8f8f2',
        cursor: '#f8f8f2',
        selectionBackground: '#44475a',
        black: '#21222c',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2',
        brightBlack: '#6272a4',
        brightRed: '#ff6e6e',
        brightGreen: '#69ff94',
        brightYellow: '#ffffa5',
        brightBlue: '#d6acff',
        brightMagenta: '#ff92df',
        brightCyan: '#a4ffff',
        brightWhite: '#ffffff'
    },
    'oneDark': {
        name: 'One Dark',
        background: '#1e2127',
        foreground: '#abb2bf',
        cursor: '#528bff',
        selectionBackground: '#3e4451',
        black: '#1e2127',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#d19a66',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#abb2bf',
        brightBlack: '#5c6370',
        brightRed: '#e06c75',
        brightGreen: '#98c379',
        brightYellow: '#d19a66',
        brightBlue: '#61afef',
        brightMagenta: '#c678dd',
        brightCyan: '#56b6c2',
        brightWhite: '#ffffff'
    },
    'monokai': {
        name: 'Monokai',
        background: '#272822',
        foreground: '#f8f8f2',
        cursor: '#f8f8f0',
        selectionBackground: '#49483e',
        black: '#272822',
        red: '#f92672',
        green: '#a6e22e',
        yellow: '#f4bf75',
        blue: '#66d9ef',
        magenta: '#ae81ff',
        cyan: '#a1efe4',
        white: '#f8f8f2',
        brightBlack: '#75715e',
        brightRed: '#f92672',
        brightGreen: '#a6e22e',
        brightYellow: '#f4bf75',
        brightBlue: '#66d9ef',
        brightMagenta: '#ae81ff',
        brightCyan: '#a1efe4',
        brightWhite: '#f9f8f5'
    },
    'solarizedDark': {
        name: 'Solarized Dark',
        background: '#002b36',
        foreground: '#839496',
        cursor: '#93a1a1',
        selectionBackground: '#073642',
        black: '#002b36',
        red: '#dc322f',
        green: '#859900',
        yellow: '#b58900',
        blue: '#268bd2',
        magenta: '#d33682',
        cyan: '#2aa198',
        white: '#93a1a1',
        brightBlack: '#657b83',
        brightRed: '#dc322f',
        brightGreen: '#859900',
        brightYellow: '#b58900',
        brightBlue: '#268bd2',
        brightMagenta: '#d33682',
        brightCyan: '#2aa198',
        brightWhite: '#fdf6e3'
    }
}

export const editorThemes = {
    'deep-space-dark': {
        name: 'Deep Space Dark',
        base: 'vs-dark',
        inherit: true,
        rules: [
            // Base
            { token: '', foreground: 'f8f8f2', background: '0a0e14' },

            // Comments
            { token: 'comment', foreground: '6272a4' },
            { token: 'comment.line', foreground: '6272a4' },
            { token: 'comment.block', foreground: '6272a4' },

            // Strings
            { token: 'string', foreground: '50fa7b' },
            { token: 'string.quoted', foreground: '50fa7b' },
            { token: 'string.template', foreground: '50fa7b' },
            { token: 'string.regexp', foreground: '50fa7b' },

            // Numbers & Constants
            { token: 'constant', foreground: 'bd93f9' },
            { token: 'constant.numeric', foreground: 'bd93f9' },
            { token: 'constant.language', foreground: 'bd93f9' },
            { token: 'constant.character', foreground: 'bd93f9' },
            { token: 'number', foreground: 'bd93f9' },

            // Keywords
            { token: 'keyword', foreground: 'ff5555' },
            { token: 'keyword.control', foreground: 'ff5555', fontStyle: 'bold' },
            { token: 'keyword.operator', foreground: 'ff79c6' },
            { token: 'keyword.other', foreground: 'ff5555' },
            { token: 'storage', foreground: 'ff5555' },
            { token: 'storage.type', foreground: '8be9fd' },
            { token: 'storage.modifier', foreground: 'ff5555' },

            // Operators
            { token: 'operator', foreground: 'ff79c6' },
            { token: 'punctuation', foreground: 'f8f8f2' },
            { token: 'delimiter', foreground: 'f8f8f2' },

            // Functions
            { token: 'entity.name.function', foreground: '50fa7b' },
            { token: 'function', foreground: '50fa7b' },
            { token: 'support.function', foreground: '50fa7b' },
            { token: 'meta.function-call', foreground: '50fa7b' },
            { token: 'meta.function-call.generic', foreground: '50fa7b' },

            // Variables
            { token: 'variable', foreground: 'f8f8f2' },
            { token: 'variable.name', foreground: 'f8f8f2' },
            { token: 'variable.parameter', foreground: 'ffb86c', fontStyle: 'italic' },
            { token: 'variable.other', foreground: 'f8f8f2' },
            { token: 'variable.other.readwrite', foreground: 'f8f8f2' },
            { token: 'variable.other.object', foreground: 'f8f8f2' },
            { token: 'variable.other.property', foreground: '8be9fd' },
            { token: 'variable.language', foreground: 'bd93f9' },

            // Types & Classes
            { token: 'type', foreground: '8be9fd' },
            { token: 'class', foreground: '8be9fd' },
            { token: 'entity.name.class', foreground: '8be9fd' },
            { token: 'entity.name.type', foreground: '8be9fd' },
            { token: 'entity.name.type.class', foreground: '8be9fd' },
            { token: 'entity.other.inherited-class', foreground: '8be9fd', fontStyle: 'italic' },
            { token: 'interface', foreground: '8be9fd' },
            { token: 'support.type', foreground: '8be9fd' },
            { token: 'support.class', foreground: '8be9fd' },

            // Modules & Imports
            { token: 'entity.name.module', foreground: '8be9fd' },
            { token: 'meta.import', foreground: 'ff5555' },
            { token: 'meta.import keyword', foreground: 'ff5555' },
            { token: 'meta.import entity.name', foreground: '50fa7b' },

            // Identifiers (catch-all for anything not yet covered)
            { token: 'identifier', foreground: 'f8f8f2' },

            // Properties & Attributes
            { token: 'entity.other.attribute-name', foreground: '50fa7b' },
            { token: 'attribute.name', foreground: '50fa7b' },
            { token: 'meta.object-literal.key', foreground: '8be9fd' },
            { token: 'support.type.property-name', foreground: '8be9fd' },

            // Tags (HTML/XML)
            { token: 'tag', foreground: 'ff5555' },
            { token: 'entity.name.tag', foreground: 'ff5555' },
            { token: 'meta.tag', foreground: 'ff5555' },

            // Support (built-ins)
            { token: 'support.constant', foreground: 'bd93f9' },
            { token: 'support.variable', foreground: 'f8f8f2' },

            // Meta
            { token: 'meta.selector', foreground: 'ff79c6' },
            { token: 'meta.brace', foreground: 'f8f8f2' },

            // Invalid
            { token: 'invalid', foreground: 'f8f8f0', background: 'ff5555' },
            { token: 'invalid.deprecated', foreground: 'f8f8f0', background: 'bd93f9' }
        ],
        colors: {
            'editor.background': '#0a0e14',
            'editor.foreground': '#f8f8f2'
        }
    },
    'dracula': {
        name: 'Dracula',
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: '', foreground: 'f8f8f2', background: '282a36' },
            { token: 'comment', foreground: '6272a4' },
            { token: 'string', foreground: 'f1fa8c' },
            { token: 'constant', foreground: 'bd93f9' },
            { token: 'keyword', foreground: 'ff79c6' },
            { token: 'storage', foreground: 'ff79c6' },
            { token: 'entity.name.function', foreground: '50fa7b' },
            { token: 'variable.parameter', foreground: 'ffb86c', fontStyle: 'italic' }
        ],
        colors: {
            'editor.background': '#282a36',
            'editor.foreground': '#f8f8f2'
        }
    },
    'monokai': {
        name: 'Monokai',
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: '', foreground: 'f8f8f2', background: '272822' },
            { token: 'comment', foreground: '75715e' },
            { token: 'string', foreground: 'e6db74' },
            { token: 'constant', foreground: 'ae81ff' },
            { token: 'keyword', foreground: 'f92672' },
            { token: 'storage', foreground: 'f92672' },
            { token: 'entity.name.function', foreground: 'a6e22e' },
            { token: 'variable.parameter', foreground: 'fd971f', fontStyle: 'italic' }
        ],
        colors: {
            'editor.background': '#272822',
            'editor.foreground': '#f8f8f2'
        }
    },
    'solarized-dark': {
        name: 'Solarized Dark',
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: '', foreground: '839496', background: '002b36' },
            { token: 'comment', foreground: '586e75' },
            { token: 'string', foreground: '2aa198' },
            { token: 'constant', foreground: 'd33682' },
            { token: 'keyword', foreground: '859900' },
            { token: 'storage', foreground: '859900' },
            { token: 'entity.name.function', foreground: '268bd2' },
            { token: 'variable.parameter', foreground: 'cb4b16', fontStyle: 'italic' }
        ],
        colors: {
            'editor.background': '#002b36',
            'editor.foreground': '#839496'
        }
    }
}

const defaultSettings = {
    // Editor Settings
    editor: {
        theme: 'deep-space-dark',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 14,
        lineHeight: 1.5,
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'on',
        lineNumbers: true,
        minimap: true,
        bracketPairColorization: true,
        autoClosingBrackets: true,
        autoClosingQuotes: true,
        formatOnSave: false,
        formatOnPaste: false,
        cursorStyle: 'line',
        cursorBlinking: 'blink',
        accessibilitySupport: 'auto',
        variableFonts: true,
        variableFontsInAccessibility: false,
        variableLineHeights: true,
        italicComments: true
    },

    // Terminal Settings
    terminal: {
        defaultShell: 'cmd',
        theme: 'default',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 14,
        cursorStyle: 'block',
        cursorBlink: true,
        scrollback: 1000,
        copyOnSelection: false,
        rightClickBehavior: 'default'
    },

    // Git Settings
    git: {
        userName: '',
        userEmail: '',
        autoFetch: true,
        confirmSync: true,
        enableSmartCommit: true,
        defaultCloneDirectory: ''
    },

    // Appearance Settings
    appearance: {
        colorTheme: 'dark',
        iconTheme: 'default',
        activityBarPosition: 'left',
        statusBarVisible: true,
        breadcrumbsVisible: true,
        sidebarPosition: 'left',
        panelPosition: 'bottom',
        zoomLevel: 0
    },

    // Files Settings
    files: {
        autoSave: 'off', // off, afterDelay, onFocusChange, onWindowChange
        autoSaveDelay: 1000,
        encoding: 'utf8',
        eol: '\n',
        trimTrailingWhitespace: false,
        insertFinalNewline: false,
        excludePatterns: ['**/node_modules/**', '**/.git/**', '**/dist/**']
    },

    // Keybindings (future)
    keybindings: {}
}

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        // Load from localStorage on init
        const saved = localStorage.getItem('yavin-settings')
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) }
            } catch (e) {
                console.error('Failed to parse saved settings:', e)
                return defaultSettings
            }
        }
        return defaultSettings
    })

    // Save to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('yavin-settings', JSON.stringify(settings))
    }, [settings])

    const updateSettings = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }))
    }

    const resetSettings = () => {
        setSettings(defaultSettings)
        localStorage.removeItem('yavin-settings')
    }

    const resetCategory = (category) => {
        setSettings(prev => ({
            ...prev,
            [category]: defaultSettings[category]
        }))
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, resetCategory }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider')
    }
    return context
}
