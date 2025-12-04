import { useRef, useState, useEffect, useCallback } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { HTMLHint } from 'htmlhint';
import { CSSLint } from 'csslint';
import { extensionLoader } from '../../utils/ExtensionLoader';

export default function CodeEditor({
  value = '',
  onChange,
  onValidate,
  onMonacoReady,
  language = 'javascript',
  readOnly = false,
  path,

  rootPath,
  selection // { line, column }
}) {
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

  function handleEditorWillMount(monaco) {
    // Define Deep Space Dark theme
    monaco.editor.defineTheme('deep-space-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'f8f8f2', background: '0a0e14' },
        { token: 'comment', foreground: '6272a4' },
        { token: 'string', foreground: '50fa7b' },
        { token: 'constant', foreground: 'bd93f9' },
        { token: 'constant.numeric', foreground: 'bd93f9' },
        { token: 'constant.language', foreground: 'bd93f9' },
        { token: 'constant.character', foreground: 'bd93f9' },
        { token: 'constant.other', foreground: 'bd93f9' },
        { token: 'keyword', foreground: 'ff5555' },
        { token: 'keyword.control', foreground: 'ff5555' },
        { token: 'keyword.operator', foreground: 'ff5555' },
        { token: 'storage', foreground: 'ff5555' },
        { token: 'storage.type', foreground: '8be9fd', fontStyle: 'italic' },
        { token: 'entity.name.class', foreground: '8be9fd', fontStyle: 'underline' },
        { token: 'entity.other.inherited-class', foreground: '8be9fd', fontStyle: 'italic underline' },
        { token: 'entity.name.function', foreground: '4da6ff' },
        { token: 'variable.parameter', foreground: 'ffb86c', fontStyle: 'italic' },
        { token: 'entity.name.tag', foreground: 'ff5555' },
        { token: 'entity.other.attribute-name', foreground: '50fa7b' },
        { token: 'support.function', foreground: '4da6ff' },
        { token: 'support.constant', foreground: 'bd93f9' },
        { token: 'support.type', foreground: '8be9fd', fontStyle: 'italic' },
        { token: 'support.class', foreground: '8be9fd', fontStyle: 'italic' },
        { token: 'invalid', foreground: 'f8f8f0', background: 'ff5555' },
        { token: 'invalid.deprecated', foreground: 'f8f8f0', background: 'bd93f9' },

        // Monaco specific
        { token: 'identifier', foreground: 'f8f8f2' },
        { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
        { token: 'function', foreground: '4da6ff' },
        { token: 'class', foreground: '8be9fd' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'regexp', foreground: 'f1fa8c' },
        { token: 'delimiter', foreground: 'f8f8f2' },
        { token: 'tag', foreground: 'ff5555' },
        { token: 'attribute.name', foreground: '50fa7b' },
        { token: 'attribute.value', foreground: 'f1fa8c' },
        { token: 'key', foreground: 'ff5555' },
        { token: 'string.key.json', foreground: 'ff5555' },
        { token: 'string.value.json', foreground: '50fa7b' }
      ],
      colors: {
        'editor.background': '#0a0e14',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#3e3d32',
        'editor.selectionBackground': '#49483e',
        'editorCursor.foreground': '#f8f8f0',
        'editorWhitespace.foreground': '#3b3a32',
        'editorIndentGuide.background': '#464741',
        'editorIndentGuide.activeBackground': '#707070',
        'editorLineNumber.foreground': '#90908a',
        'editorLineNumber.activeForeground': '#f8f8f2',
        'editorHoverWidget.background': '#0a0e14cc',
        'editorHoverWidget.border': '#8be9fd',
        'editorSuggestWidget.background': '#272822',
        'editorSuggestWidget.border': '#75715e',
        'editorSuggestWidget.foreground': '#f8f8f2',
        'editorSuggestWidget.selectedBackground': '#49483e',
        'editorSuggestWidget.highlightForeground': '#ff5555',
      }
    })
  }

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
    })

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument').run().then(() => {
        console.log('Formatted and Save triggered')
        // Trigger save action here if available
      })
    })

    // Wire extensions (grammars)
    requestAnimationFrame(() => {
      try {
        extensionLoader.wireEditor(editor)
      } catch (err) {
        console.error('Failed to wire editor:', err)
      }
    })
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
        theme="deep-space-dark"
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
