import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Icons
const Icons = {
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  History: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  More: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
  Close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  ChevronDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  File: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  React: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 text-accent-cyan"><circle cx="12" cy="12" r="2" /><path d="M12 2.5c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" opacity="0.5" /><path d="M12 2.5c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" transform="rotate(60 12 12)" opacity="0.5" /><path d="M12 2.5c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" transform="rotate(120 12 12)" opacity="0.5" /></svg>,
  Undo: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>,
  ArrowUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>,
  Images: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2} /><circle cx="8.5" cy="8.5" r="1.5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15l-5-5L5 21" /></svg>,
  Mentions: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>,
  Workflows: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
}

// Mock Data matching screenshot
const mockHistory = [
  {
    id: '1',
    type: 'user-query',
    content: 'solve terminal error'
  },
  {
    id: '2',
    type: 'thought',
    content: 'Thought for 2s',
    details: 'Analyzing the terminal error...'
  },
  {
    id: '3',
    type: 'action-card',
    title: 'Fixing ChatPanel Syntax Error',
    description: 'I confirmed that ChatPanel.jsx was truncated and caused the error. I am now rewriting the file with the complete and correct code.',
    files: [
      { name: 'ChatPanel.jsx', icon: <Icons.React /> }
    ]
  },
  {
    id: '4',
    type: 'progress',
    title: 'Progress Updates',
    steps: [
      {
        id: 1,
        title: 'Investigating ChatPanel.jsx content and terminal errors',
        items: [
          { type: 'file', text: 'Analyzed ChatPanel.jsx#L1-13' },
          { type: 'terminal', text: 'Read terminal: npm run dev' },
          { type: 'thought', text: 'Thought for 20s' }
        ]
      },
      {
        id: 2,
        title: 'Restoring ChatPanel.jsx with correct content',
        items: [
          { type: 'edit', text: 'Edited ChatPanel.jsx +209 -11', action: 'Open diff' }
        ]
      }
    ]
  },
  {
    id: '5',
    type: 'assistant-message',
    content: "I've fixed the `ChatPanel.jsx` file which was causing the error. It should be working correctly now. Please check the browser to verify the UI.",
    attachment: { name: 'ChatPanel.jsx', icon: <Icons.React /> }
  },
  {
    id: '6',
    type: 'user-query',
    content: 'explorer should look like this'
  },
  {
    id: '7',
    type: 'thought',
    content: 'Thought for 10s'
  }
]

export default function ChatPanel() {
  const [input, setInput] = useState('')
  const [expandedThoughts, setExpandedThoughts] = useState({})
  const [expandedProgress, setExpandedProgress] = useState(true)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showModeDropdown, setShowModeDropdown] = useState(false)
  const [showContextDropdown, setShowContextDropdown] = useState(false)
  const [currentModel, setCurrentModel] = useState('Gemini 3 Pro (High)')
  const [currentMode, setCurrentMode] = useState('Planning')

  const modelOptions = [
    'Gemini 3 Pro (High)',
    'Gemini 3 Pro (Low)',
    'Claude Sonnet 4.5',
    'Claude Sonnet 4.5 (Thinking)',
    'GPT-OSS 120B (Medium)'
  ]

  const modeOptions = [
    'Planning',
    'Coding',
    'Debugging',
    'Architecting'
  ]

  const toggleThought = (id) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="h-full flex flex-col bg-deep text-text-primary font-sans text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="font-medium text-xs text-text-secondary">Terminal Panel Redesign</span>
        <div className="flex items-center gap-2 text-text-secondary">
          <button className="hover:text-white"><Icons.Plus /></button>
          <button className="hover:text-white"><Icons.History /></button>
          <button className="hover:text-white"><Icons.More /></button>
          <button className="hover:text-white"><Icons.Close /></button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">

        {/* Recent Actions Header */}
        <div className="flex items-center gap-2 text-xs text-text-dim mb-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span>Recent actions</span>
        </div>

        {mockHistory.map(item => {
          if (item.type === 'user-query') {
            return (
              <div key={item.id} className="bg-elevated rounded-lg p-3 flex items-center justify-between group">
                <span>{item.content}</span>
                <span className="text-text-dim opacity-0 group-hover:opacity-100 cursor-pointer"><Icons.Undo /></span>
              </div>
            )
          }

          if (item.type === 'thought') {
            return (
              <div key={item.id} className="flex items-center gap-2 text-text-dim cursor-pointer hover:text-text-secondary" onClick={() => toggleThought(item.id)}>
                <span className={`transform transition-transform ${expandedThoughts[item.id] ? 'rotate-90' : ''}`}><Icons.ChevronRight /></span>
                <span>{item.content}</span>
              </div>
            )
          }

          if (item.type === 'action-card') {
            return (
              <div key={item.id} className="border border-white/10 rounded-lg overflow-hidden bg-surface">
                <div className="p-3 border-b border-white/10">
                  <div className="font-bold text-text-primary mb-1">{item.title}</div>
                  <div className="text-text-secondary text-xs leading-relaxed">
                    {item.description.split('ChatPanel.jsx').map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && <span className="text-accent-cyan"><Icons.React /> ChatPanel.jsx</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 p-2">
                  <div className="text-xs text-text-dim mb-1">Files Edited</div>
                  {item.files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-accent-cyan text-xs font-medium">
                      {file.icon}
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          if (item.type === 'progress') {
            return (
              <div key={item.id} className="border border-white/10 rounded-lg bg-surface overflow-hidden">
                <div
                  className="flex items-center justify-between p-2 bg-white/5 cursor-pointer"
                  onClick={() => setExpandedProgress(!expandedProgress)}
                >
                  <span className="text-xs text-text-secondary">Progress Updates</span>
                  <div className="flex items-center gap-1 text-xs text-text-dim">
                    <span>{expandedProgress ? 'Collapse all' : 'Expand all'}</span>
                    <Icons.ChevronDown />
                  </div>
                </div>

                {expandedProgress && (
                  <div className="p-3 space-y-4">
                    {item.steps.map(step => (
                      <div key={step.id} className="relative pl-4 border-l border-white/10">
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-surface border border-text-dim text-[9px] flex items-center justify-center text-text-dim">
                          {step.id}
                        </div>
                        <div className="font-bold text-text-secondary text-xs mb-2">{step.title}</div>
                        <div className="space-y-2">
                          {step.items.map((subItem, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-text-dim pl-1">
                              {subItem.type === 'file' && <span className="text-text-dim">📄</span>}
                              {subItem.type === 'terminal' && <span className="text-text-dim">💻</span>}
                              {subItem.type === 'thought' && <span className="text-text-dim">💭</span>}
                              {subItem.type === 'edit' && <span className="text-text-dim">📝</span>}

                              <span className="flex-1 truncate">{subItem.text}</span>

                              {subItem.action && (
                                <span className="text-text-dim hover:text-white cursor-pointer">{subItem.action}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          if (item.type === 'assistant-message') {
            return (
              <div key={item.id} className="border border-white/10 rounded-lg p-3 bg-surface">
                <div className="text-sm text-text-primary mb-3 leading-relaxed">
                  {item.content.split('`ChatPanel.jsx`').map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && <code className="bg-white/10 px-1 rounded text-xs">ChatPanel.jsx</code>}
                    </span>
                  ))}
                </div>
                {item.attachment && (
                  <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/5">
                    <div className="flex items-center gap-2 text-xs font-medium text-text-primary">
                      {item.attachment.icon}
                      <span>{item.attachment.name}</span>
                    </div>
                    <button className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-xs text-text-primary transition-colors">
                      Open
                    </button>
                  </div>
                )}
              </div>
            )
          }

          return null
        })}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/5 bg-deep">
        <div className="flex items-center justify-between text-xs text-text-dim mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="hover:text-text-secondary cursor-pointer">0 Files With Changes</span>
          </div>
          <div className="flex items-center gap-1 hover:text-text-secondary cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span>Review Changes</span>
          </div>
        </div>

        <div className="relative bg-elevated rounded-lg border border-white/5 focus-within:border-white/20 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (Ctrl+L), @ to mention, / for workflows"
            className="w-full bg-transparent text-sm text-text-primary p-3 pr-10 resize-none focus:outline-none min-h-[40px] max-h-[200px]"
            rows={1}
            style={{ height: 'auto', minHeight: '44px' }}
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1 relative">
              <button
                className={`p-1 rounded hover:text-text-primary transition-colors ${showContextDropdown ? 'text-text-primary bg-white/10' : 'text-text-dim'}`}
                onClick={() => { setShowContextDropdown(!showContextDropdown); setShowModeDropdown(false); setShowModelDropdown(false) }}
              >
                <Icons.Plus />
              </button>

              {/* Context Dropdown */}
              {showContextDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-40 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="px-3 py-2 text-[11px] text-gray-400 font-medium border-b border-white/5">Add context</div>
                  <div className="p-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-white/10 rounded cursor-pointer">
                      <Icons.Images />
                      <span>Images</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-white/10 rounded cursor-pointer">
                      <Icons.Mentions />
                      <span>Mentions</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-white/10 rounded cursor-pointer">
                      <Icons.Workflows />
                      <span>Workflows</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 relative">
              {/* Mode Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-1 text-[10px] text-text-dim hover:text-text-primary transition-colors"
                  onClick={() => { setShowModeDropdown(!showModeDropdown); setShowModelDropdown(false) }}
                >
                  <Icons.Plus />
                  {currentMode}
                </button>
                {showModeDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">Mode</div>
                    {modeOptions.map(mode => (
                      <div
                        key={mode}
                        className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-white/10 ${currentMode === mode ? 'text-white bg-white/5' : 'text-gray-400'}`}
                        onClick={() => { setCurrentMode(mode); setShowModeDropdown(false) }}
                      >
                        {mode}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Model Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-1 text-[10px] text-text-dim hover:text-text-primary transition-colors"
                  onClick={() => { setShowModelDropdown(!showModelDropdown); setShowModeDropdown(false) }}
                >
                  <Icons.ArrowUp />
                  {currentModel}
                </button>
                {showModelDropdown && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">Model</div>
                    {modelOptions.map(model => (
                      <div
                        key={model}
                        className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-white/10 ${currentModel === model ? 'text-white bg-white/5' : 'text-gray-400'}`}
                        onClick={() => { setCurrentModel(model); setShowModelDropdown(false) }}
                      >
                        {model}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className={`p-1 rounded-full ${input ? 'bg-white text-black' : 'bg-white/10 text-text-dim'}`}>
                <Icons.ArrowUp />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
