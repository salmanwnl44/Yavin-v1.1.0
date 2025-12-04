import { useState } from 'react'

export default function SettingsPanel({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'Fira Code',
    tabSize: 2,
    wordWrap: false,
    minimap: true,
    lineNumbers: true,
    autoSave: false,
  })

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-deepest/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative glass-panel rounded-xl shadow-elevated max-w-2xl w-full mx-4 p-8 max-h-[85vh] overflow-y-auto animate-slide-in border border-white/10">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gradient-to-r from-accent-blue via-accent-violet to-accent-gold border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl icon-glow">⚙️</span>
            <h2 className="text-2xl font-bold text-gradient-blue font-code tracking-wide">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-accent-blue transition-all duration-300 text-2xl w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center icon-glow"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">{/* Theme */}
          <div>
            <label className="text-sm font-semibold text-accent-blue mb-3 font-code tracking-wide flex items-center gap-2">
              <span>🎨</span> Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="w-full px-4 py-3 bg-deepest border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-blue focus:shadow-glow-blue/30 transition-all duration-300 font-code cursor-pointer hover:bg-elevated"
            >
              <option value="dark">🌑 Deep Space Dark</option>
              <option value="light">☀️ Light</option>
              <option value="vs-dark">🌙 VS Dark</option>
              <option value="hc-black">🔲 High Contrast</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-sm font-semibold text-accent-violet mb-3 font-code tracking-wide flex items-center gap-2">
              <span>📏</span> Font Size: <span className="text-accent-gold">{settings.fontSize}px</span>
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={settings.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              className="w-full h-2 bg-elevated rounded-full appearance-none cursor-pointer accent-accent-blue hover:accent-accent-violet transition-all"
              style={{
                background: `linear-gradient(to right, #00d4ff 0%, #00d4ff ${((settings.fontSize - 10) / 14) * 100}%, #1a1d26 ${((settings.fontSize - 10) / 14) * 100}%, #1a1d26 100%)`
              }}
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="text-sm font-semibold text-accent-blue mb-3 font-code tracking-wide flex items-center gap-2">
              <span>🔤</span> Font Family
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="w-full px-4 py-3 bg-deepest border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-violet focus:shadow-glow-violet/30 transition-all duration-300 font-code cursor-pointer hover:bg-elevated"
            >
              <option value="Fira Code">Fira Code (Recommended)</option>
              <option value="Consolas">Consolas</option>
              <option value="Monaco">Monaco</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          {/* Tab Size */}
          <div>
            <label className="text-sm font-semibold text-accent-violet mb-3 font-code tracking-wide flex items-center gap-2">
              <span>↹</span> Tab Size
            </label>
            <select
              value={settings.tabSize}
              onChange={(e) => handleChange('tabSize', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-deepest border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-gold focus:shadow-glow-gold/30 transition-all duration-300 font-code cursor-pointer hover:bg-elevated"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces (Default)</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center justify-between panel-elevated p-4 rounded-lg cursor-pointer hover:bg-accent-blue/5 transition-all duration-300 group">
                <span className="text-sm font-semibold text-gray-300 group-hover:text-accent-blue transition-colors font-code">Word Wrap</span>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => handleChange('wordWrap', e.target.checked)}
                  className="w-5 h-5 text-accent-blue bg-deepest border-white/20 rounded focus:ring-accent-blue cursor-pointer accent-accent-blue"
                />
              </label>

              <label className="flex items-center justify-between panel-elevated p-4 rounded-lg cursor-pointer hover:bg-accent-violet/5 transition-all duration-300 group">
                <span className="text-sm font-semibold text-gray-300 group-hover:text-accent-violet transition-colors font-code">Minimap</span>
                <input
                  type="checkbox"
                  checked={settings.minimap}
                  onChange={(e) => handleChange('minimap', e.target.checked)}
                  className="w-5 h-5 text-accent-violet bg-deepest border-white/20 rounded focus:ring-accent-violet cursor-pointer accent-accent-violet"
                />
              </label>

              <label className="flex items-center justify-between panel-elevated p-4 rounded-lg cursor-pointer hover:bg-accent-gold/5 transition-all duration-300 group">
                <span className="text-sm font-semibold text-gray-300 group-hover:text-accent-gold transition-colors font-code">Line Numbers</span>
                <input
                  type="checkbox"
                  checked={settings.lineNumbers}
                  onChange={(e) => handleChange('lineNumbers', e.target.checked)}
                  className="w-5 h-5 text-accent-gold bg-deepest border-white/20 rounded focus:ring-accent-gold cursor-pointer accent-accent-gold"
                />
              </label>

              <label className="flex items-center justify-between panel-elevated p-4 rounded-lg cursor-pointer hover:bg-accent-blue/5 transition-all duration-300 group">
                <span className="text-sm font-semibold text-gray-300 group-hover:text-accent-blue transition-colors font-code">Auto Save</span>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleChange('autoSave', e.target.checked)}
                  className="w-5 h-5 text-accent-blue bg-deepest border-white/20 rounded focus:ring-accent-blue cursor-pointer accent-accent-blue"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-white/10 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-code font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log('Settings saved:', settings)
                onClose()
              }}
              className="btn-neumorphic px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-violet hover:from-accent-violet hover:to-accent-gold text-white rounded-lg transition-all duration-300 font-code font-bold shadow-glow-blue hover:shadow-glow-violet"
            >
              💾 Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
