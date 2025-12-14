import { useState } from 'react'
import {
  VscRemote,
  VscSourceControl,
  VscSync,
  VscError,
  VscWarning,
  VscBell,
  VscCheck,
  VscJson,
  VscBroadcast
} from 'react-icons/vsc'

export default function StatusBar({
  line = 1,
  column = 1,
  language = 'JavaScript',
  encoding = 'UTF-8',
  lineEnding = 'CRLF',
  errorCount = 0,
  warningCount = 0,
  onBranchClick,
  onProblemsClick,
  onFeedbackClick,
  gitUser = 'Guest'
}) {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  // Mock data for things we don't have yet
  const branchName = 'main*'
  const indent = 'Spaces: 2'

  return (
    <div className="h-6 bg-[#0a0e14] text-white flex items-center justify-between text-[11px] select-none font-sans z-50 border-t border-white/5">
      {/* Left Section */}
      <div className="flex items-center h-full">
        {/* Remote */}
        <div className="h-full px-3 flex items-center justify-center bg-[#2d8cba] hover:bg-[#2d8cba]/80 cursor-pointer transition-colors" title="Open Remote Window">
          <VscRemote className="w-3.5 h-3.5" />
        </div>

        {/* Branch */}
        <div
          className="h-full px-2 flex items-center gap-1.5 hover:bg-white/10 cursor-pointer transition-colors"
          onClick={onBranchClick}
          title="Checkout Branch"
        >
          <VscSourceControl className="w-3 h-3" />
          <span>{branchName}</span>
        </div>

        {/* Sync */}
        <div className="h-full px-2 flex items-center hover:bg-white/10 cursor-pointer transition-colors" title="Synchronize Changes">
          <VscSync className="w-3 h-3" />
        </div>

        {/* Diagnostics */}
        <div
          className="h-full px-2 flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors ml-1"
          onClick={onProblemsClick}
          title="No Problems"
        >
          <div className="flex items-center gap-1">
            <VscError className="w-3 h-3" />
            <span>{errorCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <VscWarning className="w-3 h-3" />
            <span>{warningCount}</span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center h-full">
        {/* Language */}
        <div className="h-full px-2 flex items-center gap-1.5 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => setShowLanguageSelector(!showLanguageSelector)}>
          <span className="font-medium text-[10px]">{'{ }'}</span>
          <span>{language}</span>
        </div>

        {/* Status Msg */}
        <div className="h-full px-2 flex items-center hover:bg-white/10 cursor-pointer transition-colors hidden sm:flex">
          <span className="opacity-90">Antigravity - Settings</span>
        </div>

        {/* Bell */}
        <div className="h-full px-2 flex items-center hover:bg-white/10 cursor-pointer transition-colors">
          <VscBell className="w-3.5 h-3.5" />
        </div>

        {/* Git User */}
        <div className="h-full px-2 flex items-center hover:bg-white/10 cursor-pointer transition-colors hidden md:flex">
          <span>{gitUser}</span>
        </div>

        {/* Cursor Position */}
        <div className="h-full px-2 flex items-center hover:bg-white/10 cursor-pointer transition-colors">
          <span>Ln {line}, Col {column}</span>
        </div>

        {/* Indentation */}
        <div className="h-full px-2 flex items-center hover:bg-white/10 cursor-pointer transition-colors hidden sm:flex">
          <span>{indent}</span>
        </div>

        {/* Encoding */}
        <div className="h-full px-2 flex items-center hover:bg-white/10 cursor-pointer transition-colors hidden sm:flex">
          <span>{encoding}</span>
        </div>

        {/* Line Ending */}
        <div className="h-full px-2 flex items-center hover:bg-white/10 cursor-pointer transition-colors hidden sm:flex">
          <span>{lineEnding}</span>
        </div>

        {/* Smile/Feedback */}
        <div
          className="h-full px-2.5 flex items-center hover:bg-white/10 cursor-pointer transition-colors"
          onClick={onFeedbackClick}
          title="Send Feedback"
        >
          <VscBroadcast className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  )
}
