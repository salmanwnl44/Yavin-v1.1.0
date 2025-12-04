import { useState } from 'react'

export default function StatusBar({
  line = 1,
  column = 1,
  language = 'JavaScript',
  encoding = 'UTF-8',
  lineEnding = 'LF'
}) {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
    'HTML', 'CSS', 'JSON', 'Markdown', 'YAML'
  ]

  return (
    <div className="flex items-center justify-between glass-panel border-t border-white/5 px-6 py-2 text-xs font-medium relative">
      {/* Gradient underline effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-blue via-accent-violet to-accent-gold opacity-50"></div>

      <div className="flex items-center space-x-6">
        <div className="text-gray-400 flex items-center gap-2">
          <span className="text-accent-blue">📍</span>
          <span className="font-code">Ln {line}, Col {column}</span>
        </div>
        <div className="text-gray-500 font-code">
          {encoding}
        </div>
        <div className="text-gray-500 font-code">
          {lineEnding}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <button
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            className="text-gray-400 hover:text-accent-blue transition-all duration-200 font-code flex items-center gap-2"
          >
            <span className="icon-glow">⚡</span>
            <span>{language}</span>
          </button>
          {showLanguageSelector && (
            <div className="absolute bottom-full right-0 mb-3 panel-elevated rounded-xl shadow-elevated overflow-hidden min-w-[160px] animate-slide-in">
              {languages.map((lang, index) => (
                <div
                  key={lang}
                  className="px-4 py-2 hover:bg-accent-blue/10 cursor-pointer text-gray-300 hover:text-accent-blue transition-all duration-200 border-l-2 border-transparent hover:border-accent-blue font-code"
                  style={{ animationDelay: `${index * 20}ms` }}
                  onClick={() => {
                    setShowLanguageSelector(false)
                  }}
                >
                  {lang}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-gradient-blue font-bold tracking-wide flex items-center gap-2">
          <span className="icon-glow">⚡</span>
          YAVIN 1
        </div>
      </div>
    </div>
  )
}
