import { useState } from 'react'

import {
  SiReact, SiJavascript, SiTypescript, SiCss3, SiHtml5, SiJson, SiPython, SiDocker, SiMarkdown, SiGit, SiGnubash
} from 'react-icons/si'
import { MdInsertDriveFile } from 'react-icons/md'

// Icons mapping
const getFileIcon = (name) => {
  const lowerName = name.toLowerCase()

  if (lowerName.endsWith('.jsx') || lowerName.endsWith('.tsx')) return <SiReact className="text-[#61DAFB]" />
  if (lowerName.endsWith('.js')) return <SiJavascript className="text-[#F7DF1E]" />
  if (lowerName.endsWith('.ts')) return <SiTypescript className="text-[#3178C6]" />
  if (lowerName.endsWith('.css')) return <SiCss3 className="text-[#1572B6]" />
  if (lowerName.endsWith('.html')) return <SiHtml5 className="text-[#E34F26]" />
  if (lowerName.endsWith('.json')) return <SiJson className="text-[#F7DF1E]" />
  if (lowerName.includes('docker')) return <SiDocker className="text-[#2496ED]" />
  if (lowerName.endsWith('.py')) return <SiPython className="text-[#3776AB]" />
  if (lowerName.endsWith('.md')) return <SiMarkdown className="text-[#000000] dark:text-white" />
  if (lowerName.startsWith('.git')) return <SiGit className="text-[#F05032]" />
  if (lowerName.endsWith('.sh')) return <SiGnubash className="text-[#4EAA25]" />

  return <MdInsertDriveFile className="text-gray-500" />
}

export default function TabBar({ tabs = [], activeTab, onTabChange, onTabClose }) {
  const [hoveredTab, setHoveredTab] = useState(null)

  return (
    <div className="flex items-center bg-[#0a0e14] border-b border-white/5 overflow-x-auto no-scrollbar">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          className={`
            group relative flex items-center px-3 py-2 min-w-[120px] max-w-[200px] cursor-pointer
            border-r border-white/5 transition-all duration-200 select-none
            ${activeTab === tab.id
              ? 'bg-[#1e1e1e] text-white'
              : 'bg-transparent text-gray-500 hover:bg-[#1e1e1e]/50 hover:text-gray-300'
            }
          `}
          onClick={() => onTabChange(tab.id)}
          onMouseEnter={() => setHoveredTab(tab.id)}
          onMouseLeave={() => setHoveredTab(null)}
        >
          {/* Active Indicator Line */}
          {activeTab === tab.id && (
            <div className="absolute top-0 left-0 w-full h-[1px] bg-accent-blue"></div>
          )}

          <span className="mr-2 flex items-center">
            {getFileIcon(tab.name)}
          </span>
          <span className="text-xs truncate flex-1 font-medium">{tab.name}</span>

          {tab.modified && (
            <span className={`ml-2 w-2 h-2 rounded-full ${activeTab === tab.id ? 'bg-white' : 'bg-gray-500'} transform scale-75`}></span>
          )}

          <button
            className={`
              ml-2 p-0.5 rounded-md opacity-0 group-hover:opacity-100 
              hover:bg-white/10 hover:text-white transition-all
              ${activeTab === tab.id ? 'opacity-0 hover:opacity-100' : ''}
            `}
            onClick={(e) => {
              e.stopPropagation()
              onTabClose(tab.id)
            }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      {tabs.length === 0 && (
        <div className="px-4 py-2 text-xs text-gray-600 italic">
          No active files
        </div>
      )}
    </div>
  )
}
