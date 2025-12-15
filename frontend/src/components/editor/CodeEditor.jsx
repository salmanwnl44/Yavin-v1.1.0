import { useRef, useState, useEffect, useCallback } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useSettings, editorThemes } from '../../contexts/SettingsContext'
import { HTMLHint } from 'htmlhint';
import { CSSLint } from 'csslint';
// ExtensionLoader removed
// import { extensionLoader } from '../../utils/ExtensionLoader';

export default function CodeEditor({
  value = '',
  onChange,
  onValidate,
  onMonacoReady,
  language = 'javascript',
  readOnly = false,
  path,

  rootPath,

  selection, // { line, column }
  onCursorPositionChange
}) {
  const { settings } = useSettings()
  const editorRef = useRef(null)
  const [monacoInstance, setMonacoInstance] = useState(null)


  const onValidateRef = useRef(onValidate)

  useEffect(() => {
    onValidateRef.current = onValidate
  }, [onValidate])

  // ... (validation functions remain the same) ...

  // HTML Validation Function
  const validateHtml = useCallback((code) => {
    if (language !== 'html' || !monacoInstance || !editorRef.current) return;

    const messages = HTMLHint.verify(code, {
      "tagname-lowercase": true,
      "attr-lowercase": true,
      "attr-value-double-quotes": true,
      "doctype-first": false,
      "tag-pair": true,
      "spec-char-escape": true,
      "id-unique": true,
      "src-not-empty": true,
      "attr-no-duplication": true,
      "title-require": false
    });

    const markers = messages.map(msg => ({
      severity: monacoInstance.MarkerSeverity.Error,
      message: msg.message,
      startLineNumber: msg.line,
      startColumn: msg.col,
      endLineNumber: msg.line,
      endColumn: msg.col + 1,
      source: 'HTMLHint'
    }));

    monacoInstance.editor.setModelMarkers(editorRef.current.getModel(), 'htmlhint', markers);
  }, [language, monacoInstance]);

  // CSS Validation Function
  const validateCss = useCallback((code) => {
    if (language !== 'css' || !monacoInstance || !editorRef.current) return;

    const result = CSSLint.verify(code);
    const messages = result.messages;

    const markers = messages.map(msg => ({
      severity: msg.type === 'error' ? monacoInstance.MarkerSeverity.Error : monacoInstance.MarkerSeverity.Warning,
      message: msg.message,
      startLineNumber: msg.line,
      startColumn: msg.col,
      endLineNumber: msg.line,
      endColumn: msg.col + 1,
      source: 'CSSLint'
    }));

    monacoInstance.editor.setModelMarkers(editorRef.current.getModel(), 'csslint', markers);
  }, [language, monacoInstance]);

  useEffect(() => {
    if (language === 'html' && value) {
      validateHtml(value);
    } else if (language === 'css' && value) {
      validateCss(value);
    }
  }, [value, language, validateHtml, validateCss]);

  // Handle selection updates
  useEffect(() => {
    if (editorRef.current && selection) {
      const { line, column } = selection
      editorRef.current.revealLineInCenter(line)
      editorRef.current.setPosition({ lineNumber: line, column: column || 1 })
      editorRef.current.focus()
    }
  }, [selection])

  const defineThemes = useCallback((monaco) => {
    Object.entries(editorThemes).forEach(([id, theme]) => {
      const newTheme = JSON.parse(JSON.stringify(theme))

      // Handle italic comments setting
      const commentRule = newTheme.rules.find(r => r.token === 'comment')
      if (commentRule) {
        if (settings.editor.italicComments) {
          commentRule.fontStyle = 'italic'
        } else {
          delete commentRule.fontStyle
        }
      }

      monaco.editor.defineTheme(id, newTheme)
    })
  }, [settings.editor.italicComments])

  function handleEditorWillMount(monaco) {
    defineThemes(monaco)
  }

  // Update themes when settings change
  useEffect(() => {
    if (monacoInstance) {
      defineThemes(monacoInstance)
      monacoInstance.editor.setTheme(settings.editor.theme)
    }
  }, [monacoInstance, defineThemes, settings.editor.theme])

  function handleEditorDidMount(editor, monaco) {
    console.log('CodeEditor mounted');
    editorRef.current = editor
    setMonacoInstance(monaco)

    if (onMonacoReady) {
      onMonacoReady(monaco)
    }

    // Listen for diagnostics (errors/warnings)
    monaco.editor.onDidChangeMarkers(() => {
      if (onValidateRef.current) {
        const markers = monaco.editor.getModelMarkers({})
        onValidateRef.current(markers)
      }
    })

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      fontFamily: 'Fira Code, Consolas, monospace',
      fontLigatures: true,
      lineNumbers: 'on',
      rulers: [80, 120],
      wordWrap: 'off',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      bracketPairColorization: { enabled: true },
      guides: {
        indentation: true,
        bracketPairs: true
      },
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      renderLineHighlight: 'all',
      renderWhitespace: 'boundary',
      lightbulb: {
        enabled: true
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      formatOnType: true,
      formatOnPaste: true
    });

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorPositionChange) {
        onCursorPositionChange({
          line: e.position.lineNumber,
          column: e.position.column
        })
      }
    });

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument').run().then(() => {
        console.log('Formatted and Save triggered')
        // Trigger save action here if available
      })
    })

    // Wire extensions removed
    // requestAnimationFrame(() => {
    //   try {
    //     extensionLoader.wireEditor(editor)
    //   } catch (err) {
    //     console.error('Failed to wire editor:', err)
    //   }
    // })
  }

  function handleEditorChange(value) {
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <div className="h-full bg-[#0a0e14] rounded-lg border border-white/10 overflow-hidden relative shadow-elevated">
      <style>{`
        /* Glass effect for hover widget */
        .monaco-editor .monaco-hover {
          background-color: rgba(20, 20, 30, 0.65) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border-radius: 12px !important;
          border: 1px solid rgba(189, 147, 249, 0.3) !important; /* Purple tint border */
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5) !important;
        }
        .monaco-editor .monaco-hover-content {
          background: transparent !important;
        }
        /* Custom scrollbar for hover */
        .monaco-editor .monaco-hover .monaco-scrollable-element > .scrollbar > .slider {
          background: rgba(189, 147, 249, 0.4) !important;
          border-radius: 4px !important;
        }
        /* Lightbulb customization */
        .monaco-editor .contentWidgets .lightbulb-glyph {
          filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
        }
      `}</style>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        path={path}
        theme={settings.editor.theme}
        onChange={handleEditorChange}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          readOnly: readOnly,
          selectOnLineNumbers: true,
          roundedSelection: true,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12
          }
        }}
      />
    </div>
  )
}
