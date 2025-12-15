import { useState, useMemo } from 'react'

export default function SettingsPanel({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('editor')
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState({
    // Editor
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'Fira Code',
    tabSize: 2,
    lineHeight: 1.5,
    cursorStyle: 'line',
    wordWrap: false,
    minimap: true,
    lineNumbers: true,
    // Files
    autoSave: false,
    autoSaveDelay: 1000,
    trimTrailingWhitespace: true,
    insertFinalNewline: true,
    fileEncoding: 'utf8',
    // Code
    formatOnSave: false,
    formatOnPaste: false,
    bracketPairColorization: true,
    autoClosingBrackets: true,
    autoClosingQuotes: true,
    indentGuides: true,
    // Suggestions
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    // Display
    renderWhitespace: 'selection',
    scrollBeyondLastLine: true,
    smoothScrolling: true,
    cursorBlinking: 'blink',
    folding: true,
    highlightActiveIndent: true,
  })

  const defaultSettings = {
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'Fira Code',
    tabSize: 2,
    lineHeight: 1.5,
    cursorStyle: 'line',
    wordWrap: false,
    minimap: true,
    lineNumbers: true,
    autoSave: false,
    autoSaveDelay: 1000,
    trimTrailingWhitespace: true,
    insertFinalNewline: true,
    fileEncoding: 'utf8',
    formatOnSave: false,
    formatOnPaste: false,
    bracketPairColorization: true,
    autoClosingBrackets: true,
    autoClosingQuotes: true,
    indentGuides: true,
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    renderWhitespace: 'selection',
    scrollBeyondLastLine: true,
    smoothScrolling: true,
    cursorBlinking: 'blink',
    folding: true,
    highlightActiveIndent: true,
  }

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(defaultSettings)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'yavin-settings.json'
    link.click()
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result)
          setSettings({ ...settings, ...imported })
        } catch (err) {
          alert('Invalid settings file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const tabs = [
    { id: 'editor', label: 'Editor', icon: '✏️' },
    { id: 'files', label: 'Files', icon: '📁' },
    { id: 'code', label: 'Code', icon: '🔧' },
    { id: 'display', label: 'Display', icon: '🖥️' },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-deepest/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative glass-panel rounded-xl shadow-elevated max-w-4xl w-full mx-4 max-h-[90vh] animate-slide-in border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl icon-glow">⚙️</span>
            <h2 className="text-2xl font-bold text-gradient-blue font-code tracking-wide">Settings</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImport}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-accent-blue hover:bg-white/5 rounded-lg transition-all duration-200 flex items-center gap-1.5"
              title="Import Settings"
            >
              📥 Import
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-accent-violet hover:bg-white/5 rounded-lg transition-all duration-200 flex items-center gap-1.5"
              title="Export Settings"
            >
              📤 Export
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex items-center gap-1.5"
              title="Reset to Defaults"
            >
              🔄 Reset
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-accent-blue transition-all duration-300 text-2xl w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 bg-deepest/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue focus:shadow-glow-blue/20 transition-all duration-300 font-code text-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-code font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-deepest text-accent-blue border-b-2 border-accent-blue'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="space-y-6">
            {/* Editor Tab */}
            {activeTab === 'editor' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <SettingSection title="Appearance">
                  <SelectSetting
                    label="Theme"
                    icon="🎨"
                    value={settings.theme}
                    onChange={(val) => handleChange('theme', val)}
                    options={[
                      { value: 'dark', label: '🌑 Deep Space Dark' },
                      { value: 'light', label: '☀️ Light' },
                      { value: 'vs-dark', label: '🌙 VS Dark' },
                      { value: 'hc-black', label: '🔲 High Contrast' },
                    ]}
                  />
                  <RangeSetting
                    label="Font Size"
                    icon="📏"
                    value={settings.fontSize}
                    onChange={(val) => handleChange('fontSize', val)}
                    min={10}
                    max={24}
                    unit="px"
                  />
                  <SelectSetting
                    label="Font Family"
                    icon="🔤"
                    value={settings.fontFamily}
                    onChange={(val) => handleChange('fontFamily', val)}
                    options={[
                      { value: 'Fira Code', label: 'Fira Code (Recommended)' },
                      { value: 'Consolas', label: 'Consolas' },
                      { value: 'Monaco', label: 'Monaco' },
                      { value: 'Courier New', label: 'Courier New' },
                      { value: 'JetBrains Mono', label: 'JetBrains Mono' },
                      { value: 'Source Code Pro', label: 'Source Code Pro' },
                    ]}
                  />
                  <RangeSetting
                    label="Line Height"
                    icon="📐"
                    value={settings.lineHeight}
                    onChange={(val) => handleChange('lineHeight', val)}
                    min={1.0}
                    max={2.5}
                    step={0.1}
                  />
                </SettingSection>

                <SettingSection title="Editor Behavior">
                  <SelectSetting
                    label="Tab Size"
                    icon="↹"
                    value={settings.tabSize}
                    onChange={(val) => handleChange('tabSize', parseInt(val))}
                    options={[
                      { value: 2, label: '2 spaces' },
                      { value: 4, label: '4 spaces' },
                      { value: 8, label: '8 spaces' },
                    ]}
                  />
                  <SelectSetting
                    label="Cursor Style"
                    icon="┃"
                    value={settings.cursorStyle}
                    onChange={(val) => handleChange('cursorStyle', val)}
                    options={[
                      { value: 'line', label: 'Line' },
                      { value: 'block', label: 'Block' },
                      { value: 'underline', label: 'Underline' },
                      { value: 'line-thin', label: 'Line (Thin)' },
                      { value: 'block-outline', label: 'Block Outline' },
                    ]}
                  />
                  <SelectSetting
                    label="Cursor Blinking"
                    icon="✨"
                    value={settings.cursorBlinking}
                    onChange={(val) => handleChange('cursorBlinking', val)}
                    options={[
                      { value: 'blink', label: 'Blink' },
                      { value: 'smooth', label: 'Smooth' },
                      { value: 'phase', label: 'Phase' },
                      { value: 'expand', label: 'Expand' },
                      { value: 'solid', label: 'Solid' },
                    ]}
                  />
                </SettingSection>

                <SettingSection title="Display Options">
                  <div className="grid grid-cols-2 gap-3">
                    <ToggleSetting
                      label="Word Wrap"
                      checked={settings.wordWrap}
                      onChange={(val) => handleChange('wordWrap', val)}
                    />
                    <ToggleSetting
                      label="Minimap"
                      checked={settings.minimap}
                      onChange={(val) => handleChange('minimap', val)}
                    />
                    <ToggleSetting
                      label="Line Numbers"
                      checked={settings.lineNumbers}
                      onChange={(val) => handleChange('lineNumbers', val)}
                    />
                    <ToggleSetting
                      label="Folding"
                      checked={settings.folding}
                      onChange={(val) => handleChange('folding', val)}
                    />
                    <ToggleSetting
                      label="Smooth Scrolling"
                      checked={settings.smoothScrolling}
                      onChange={(val) => handleChange('smoothScrolling', val)}
                    />
                    <ToggleSetting
                      label="Scroll Beyond Last Line"
                      checked={settings.scrollBeyondLastLine}
                      onChange={(val) => handleChange('scrollBeyondLastLine', val)}
                    />
                  </div>
                </SettingSection>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <SettingSection title="File Management">
                  <div className="grid grid-cols-2 gap-3">
                    <ToggleSetting
                      label="Auto Save"
                      checked={settings.autoSave}
                      onChange={(val) => handleChange('autoSave', val)}
                    />
                    <ToggleSetting
                      label="Trim Trailing Whitespace"
                      checked={settings.trimTrailingWhitespace}
                      onChange={(val) => handleChange('trimTrailingWhitespace', val)}
                    />
                    <ToggleSetting
                      label="Insert Final Newline"
                      checked={settings.insertFinalNewline}
                      onChange={(val) => handleChange('insertFinalNewline', val)}
                    />
                  </div>
                  {settings.autoSave && (
                    <RangeSetting
                      label="Auto Save Delay"
                      icon="⏱️"
                      value={settings.autoSaveDelay}
                      onChange={(val) => handleChange('autoSaveDelay', val)}
                      min={100}
                      max={5000}
                      step={100}
                      unit="ms"
                    />
                  )}
                  <SelectSetting
                    label="File Encoding"
                    icon="📝"
                    value={settings.fileEncoding}
                    onChange={(val) => handleChange('fileEncoding', val)}
                    options={[
                      { value: 'utf8', label: 'UTF-8' },
                      { value: 'utf8bom', label: 'UTF-8 with BOM' },
                      { value: 'utf16le', label: 'UTF-16 LE' },
                      { value: 'utf16be', label: 'UTF-16 BE' },
                      { value: 'iso88591', label: 'ISO 8859-1' },
                    ]}
                  />
                </SettingSection>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === 'code' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <SettingSection title="Formatting">
                  <div className="grid grid-cols-2 gap-3">
                    <ToggleSetting
                      label="Format On Save"
                      checked={settings.formatOnSave}
                      onChange={(val) => handleChange('formatOnSave', val)}
                    />
                    <ToggleSetting
                      label="Format On Paste"
                      checked={settings.formatOnPaste}
                      onChange={(val) => handleChange('formatOnPaste', val)}
                    />
                  </div>
                </SettingSection>

                <SettingSection title="Code Features">
                  <div className="grid grid-cols-2 gap-3">
                    <ToggleSetting
                      label="Bracket Pair Colorization"
                      checked={settings.bracketPairColorization}
                      onChange={(val) => handleChange('bracketPairColorization', val)}
                    />
                    <ToggleSetting
                      label="Auto Closing Brackets"
                      checked={settings.autoClosingBrackets}
                      onChange={(val) => handleChange('autoClosingBrackets', val)}
                    />
                    <ToggleSetting
                      label="Auto Closing Quotes"
                      checked={settings.autoClosingQuotes}
                      onChange={(val) => handleChange('autoClosingQuotes', val)}
                    />
                    <ToggleSetting
                      label="Indent Guides"
                      checked={settings.indentGuides}
                      onChange={(val) => handleChange('indentGuides', val)}
                    />
                    <ToggleSetting
                      label="Highlight Active Indent"
                      checked={settings.highlightActiveIndent}
                      onChange={(val) => handleChange('highlightActiveIndent', val)}
                    />
                  </div>
                </SettingSection>

                <SettingSection title="IntelliSense">
                  <div className="grid grid-cols-2 gap-3">
                    <ToggleSetting
                      label="Quick Suggestions"
                      checked={settings.quickSuggestions}
                      onChange={(val) => handleChange('quickSuggestions', val)}
                    />
                    <ToggleSetting
                      label="Suggest On Trigger Characters"
                      checked={settings.suggestOnTriggerCharacters}
                      onChange={(val) => handleChange('suggestOnTriggerCharacters', val)}
                    />
                  </div>
                  <SelectSetting
                    label="Accept Suggestion On Enter"
                    icon="⏎"
                    value={settings.acceptSuggestionOnEnter}
                    onChange={(val) => handleChange('acceptSuggestionOnEnter', val)}
                    options={[
                      { value: 'on', label: 'On' },
                      { value: 'off', label: 'Off' },
                      { value: 'smart', label: 'Smart' },
                    ]}
                  />
                  <SelectSetting
                    label="Tab Completion"
                    icon="⭾"
                    value={settings.tabCompletion}
                    onChange={(val) => handleChange('tabCompletion', val)}
                    options={[
                      { value: 'on', label: 'On' },
                      { value: 'off', label: 'Off' },
                      { value: 'onlySnippets', label: 'Only Snippets' },
                    ]}
                  />
                </SettingSection>
              </div>
            )}

            {/* Display Tab */}
            {activeTab === 'display' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <SettingSection title="Rendering">
                  <SelectSetting
                    label="Render Whitespace"
                    icon="·"
                    value={settings.renderWhitespace}
                    onChange={(val) => handleChange('renderWhitespace', val)}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'boundary', label: 'Boundary' },
                      { value: 'selection', label: 'Selection' },
                      { value: 'trailing', label: 'Trailing' },
                      { value: 'all', label: 'All' },
                    ]}
                  />
                </SettingSection>

                <SettingSection title="Preview">
                  <div className="p-6 bg-deepest/50 rounded-lg border border-white/10 font-code text-sm">
                    <div className="mb-4 flex items-center gap-2 text-accent-blue">
                      <span className="text-lg">👁️</span>
                      <span className="font-semibold">Live Preview</span>
                    </div>
                    <div style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}>
                      <div className="text-gray-400">{'// Example code with current settings'}</div>
                      <div className="text-accent-violet">function <span className="text-accent-blue">example</span>() {'{'}</div>
                      <div className="ml-4 text-gray-300">const message = <span className="text-accent-gold">"Hello World"</span>;</div>
                      <div className="ml-4 text-gray-300">console.<span className="text-accent-blue">log</span>(message);</div>
                      <div className="text-accent-violet">{'}'}</div>
                    </div>
                  </div>
                </SettingSection>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 pt-4 border-t border-white/10">
          <div className="text-xs text-gray-500 font-code">
            {Object.keys(settings).length} settings configured
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-code font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log('Settings saved:', settings)
                localStorage.setItem('yavin-settings', JSON.stringify(settings))
                onClose()
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-accent-blue to-accent-violet hover:from-accent-violet hover:to-accent-gold text-white rounded-lg transition-all duration-300 font-code font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>💾</span>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function SettingSection({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-accent-blue tracking-wide uppercase flex items-center gap-2">
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

function SelectSetting({ label, icon, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-300 mb-2 font-code flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-deepest border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-blue focus:shadow-glow-blue/20 transition-all duration-300 font-code cursor-pointer hover:bg-elevated text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function RangeSetting({ label, icon, value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-300 mb-2 font-code flex items-center justify-between">
        <span className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className="text-accent-blue font-bold">{value}{unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-elevated rounded-full appearance-none cursor-pointer accent-accent-blue transition-all"
        style={{
          background: `linear-gradient(to right, #00d4ff 0%, #00d4ff ${((value - min) / (max - min)) * 100}%, #1a1d26 ${((value - min) / (max - min)) * 100}%, #1a1d26 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

function ToggleSetting({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-accent-blue/5 transition-all duration-300 group bg-deepest/30 border border-white/5">
      <span className="text-sm font-semibold text-gray-300 group-hover:text-accent-blue transition-colors font-code">
        {label}
      </span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-blue rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
      </div>
    </label>
  )
}
