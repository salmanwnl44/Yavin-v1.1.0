import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import {
  MdFolder, MdFolderOpen, MdInsertDriveFile, MdDelete, MdEdit, MdRefresh, MdNoteAdd, MdCreateNewFolder
} from 'react-icons/md'
import {
  SiReact, SiJavascript, SiTypescript, SiCss3, SiHtml5, SiJson, SiPython, SiDocker, SiMarkdown, SiGit, SiGnubash
} from 'react-icons/si'
import { VscChevronRight, VscChevronDown, VscCollapseAll } from 'react-icons/vsc'

// Icons mapping
const getFileIcon = (name, type) => {
  if (type === 'folder') return null // Handled in component

  const lowerName = name.toLowerCase()

  if (lowerName.endsWith('.jsx') || lowerName.endsWith('.tsx')) return <SiReact className="text-[#61DAFB]" />
  if (lowerName.endsWith('.js')) return <SiJavascript className="text-[#F7DF1E]" />
  if (lowerName.endsWith('.ts')) return <SiTypescript className="text-[#3178C6]" />
  if (lowerName.endsWith('.css')) return <SiCss3 className="text-[#1572B6]" />
  if (lowerName.endsWith('.html')) return <SiHtml5 className="text-[#E34F26]" />
  if (lowerName.endsWith('.json')) return <SiJson className="text-[#F7DF1E]" /> // JSON often yellow/gold
  if (lowerName.includes('docker')) return <SiDocker className="text-[#2496ED]" />
  if (lowerName.endsWith('.py')) return <SiPython className="text-[#3776AB]" />
  if (lowerName.endsWith('.md')) return <SiMarkdown className="text-[#000000] dark:text-white" />
  if (lowerName.startsWith('.git')) return <SiGit className="text-[#F05032]" />
  if (lowerName.endsWith('.sh')) return <SiGnubash className="text-[#4EAA25]" />

  return <MdInsertDriveFile className="text-gray-500" />
}

const Icons = {
  Folder: () => <MdFolder className="w-5 h-5 text-[#FFCA28]" />, // Material Folder Yellow
  FolderOpen: () => <MdFolderOpen className="w-5 h-5 text-[#FFCA28]" />,
  ChevronRight: () => <VscChevronRight className="w-4 h-4" />,
  ChevronDown: () => <VscChevronDown className="w-4 h-4" />,
  NewFile: () => <MdNoteAdd className="w-4 h-4" />,
  NewFolder: () => <MdCreateNewFolder className="w-4 h-4" />,
  Refresh: () => <MdRefresh className="w-4 h-4" />,
  CollapseAll: () => <VscCollapseAll className="w-4 h-4" />,
  Rename: () => <MdEdit className="w-4 h-4" />,
  Trash: () => <MdDelete className="w-4 h-4" />,
}

const FileCreationInput = ({ type, initialValue = '', onCommit, onCancel, level }) => {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      if (initialValue) {
        inputRef.current.select()
      }
    }
  }, [initialValue])

  const handleKeyDown = (e) => {
    e.stopPropagation()
    if (e.key === 'Enter') {
      if (value.trim()) {
        onCommit(value.trim())
      } else {
        onCancel()
      }
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleBlur = () => {
    if (value.trim()) {
      onCommit(value.trim())
    } else {
      onCancel()
    }
  }

  const paddingLeft = level * 12 + 10

  return (
    <div
      className="flex items-center py-0.5 px-2"
      style={{ paddingLeft: `${paddingLeft}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="mr-1 w-4 flex items-center justify-center">
        <span className="w-4" />
      </span>
      <span className="mr-1.5 flex items-center">
        {type === 'folder' ? <Icons.Folder /> : <Icons.File />}
      </span>
      <input
        ref={inputRef}
        type="text"
        className="bg-[#0a0e14] border border-accent-blue text-white text-[13px] leading-6 flex-1 outline-none px-1 h-6"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

const FileNode = ({ node, level, onSelect, selectedId, onToggleFolder, collapseSignal, problems = [], creationState, onCreateItem, onCancelCreation, renamingId, onRenameCommit, onCancelRename, onContextMenu }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for collapse signal
  useEffect(() => {
    if (collapseSignal > 0) {
      setIsOpen(false)
    }
  }, [collapseSignal])

  // Auto-expand if creating inside this folder
  useEffect(() => {
    if (creationState && creationState.parentId === node.id && node.type === 'folder') {
      setIsOpen(true)
    }
  }, [creationState, node.id, node.type])

  const handleToggle = async (e) => {
    e.stopPropagation()
    onSelect(node)
    if (node.type === 'folder') {
      const newIsOpen = !isOpen
      setIsOpen(newIsOpen)
      if (newIsOpen && onToggleFolder && (!node.children || node.children.length === 0)) {
        await onToggleFolder(node)
      }
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect(node)
    if (onContextMenu) {
      onContextMenu(e, node)
    }
  }

  const isSelected = selectedId === node.id
  const isRenaming = renamingId === node.id
  const paddingLeft = level * 12 + 10

  // Calculate error count for this file
  const errorCount = node.type === 'file'
    ? problems.filter(p => p.resource && p.resource.fsPath === node.path).length
    : 0

  if (isRenaming) {
    return (
      <FileCreationInput
        type={node.type}
        initialValue={node.name}
        level={level}
        onCommit={(newName) => onRenameCommit(node, newName)}
        onCancel={onCancelRename}
      />
    )
  }

  return (
    <div className="relative">
      {/* Indentation Guide */}
      {level > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px bg-white/5"
          style={{ left: `${(level - 1) * 12 + 15}px` }}
        />
      )}

      <div
        className={`
          flex items-center py-0.5 px-2 cursor-pointer transition-colors duration-150
          group relative
          ${isSelected ? 'bg-accent-blue/20 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleToggle}
        onContextMenu={handleContextMenu}
      >
        {/* Selection Border */}
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent-blue"></div>}

        <span className="mr-1 w-4 flex items-center justify-center transition-colors duration-200">
          {node.type === 'folder' ? (
            <span
              className={`transform transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'} text-gray-500 group-hover:text-white`}
              onClick={(e) => {
                e.stopPropagation()
                handleToggle(e)
              }}
            >
              <Icons.ChevronDown />
            </span>
          ) : <span className="w-4" />}
        </span>

        <span className="mr-1.5 flex items-center">
          {node.type === 'folder' ? (
            isOpen ? <Icons.FolderOpen /> : <Icons.Folder />
          ) : (
            getFileIcon(node.name, node.type)
          )}
        </span>

        <span className="truncate font-code text-[13px] leading-6 flex-1">
          {node.name}
        </span>

        {/* Error Indicator */}
        {errorCount > 0 && (
          <span className="ml-2 bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 rounded-full min-w-[18px] text-center border border-red-500/30">
            {errorCount}
          </span>
        )}
      </div>

      {node.type === 'folder' && isOpen && (
        <div>
          {/* Render Input if creating in this folder */}
          {creationState && creationState.parentId === node.id && (
            <FileCreationInput
              type={creationState.type}
              level={level + 1}
              onCommit={(name) => onCreateItem(node.path, name, creationState.type)}
              onCancel={onCancelCreation}
            />
          )}

          {node.children && node.children.map(child => (
            <FileNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              onToggleFolder={onToggleFolder}
              collapseSignal={collapseSignal}
              problems={problems}
              creationState={creationState}
              onCreateItem={onCreateItem}
              onCancelCreation={onCancelCreation}
              renamingId={renamingId}
              onRenameCommit={onRenameCommit}
              onCancelRename={onCancelRename}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FileTree({ files, onFileSelect, onOpenFolder, isLoading, onCloseFolder, onToggleFolder, onCreateItem, onRefresh, onCollapseAll, onRename, onDelete, collapseSignal, problems = [] }) {
  const [selectedId, setSelectedId] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [isRootExpanded, setIsRootExpanded] = useState(true)
  const [creationState, setCreationState] = useState(null) // { type: 'file'|'folder', parentId: string }
  const [renamingId, setRenamingId] = useState(null)
  const [contextMenu, setContextMenu] = useState(null) // { x, y, node }
  const contextMenuRef = useRef(null)

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null)
      }
    }

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu])

  const handleFileClick = (node) => {
    setSelectedId(node.id)
    setSelectedNode(node)
    if (onFileSelect) {
      onFileSelect(node)
    }
  }

  const handleContextMenu = (e, node) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if we should position above based on available space
    // We assume a max height of ~300px for safety, but CSS will handle the exact positioning
    const windowHeight = window.innerHeight
    const spaceBelow = windowHeight - e.clientY
    const shouldPositionAbove = spaceBelow < 300

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node,
      isAbove: shouldPositionAbove
    })
  }

  const handleContextMenuAction = (action) => {
    if (!contextMenu) return

    switch (action) {
      case 'rename':
        setRenamingId(contextMenu.node.id)
        break
      case 'delete':
        if (onDelete) onDelete(contextMenu.node)
        break
      case 'newFile':
        if (contextMenu.node.type === 'folder') {
          setCreationState({ type: 'file', parentId: contextMenu.node.id })
        }
        break
      case 'newFolder':
        if (contextMenu.node.type === 'folder') {
          setCreationState({ type: 'folder', parentId: contextMenu.node.id })
        }
        break
      case 'cut':
        // Store in clipboard for cut operation
        if (navigator.clipboard) {
          navigator.clipboard.writeText(contextMenu.node.path)
          // TODO: Implement actual cut/paste functionality
        }
        break
      case 'copy':
        // Copy file path to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(contextMenu.node.path)
        }
        break
      case 'copyPath':
        if (navigator.clipboard) {
          navigator.clipboard.writeText(contextMenu.node.path)
        }
        break
      case 'copyRelativePath':
        if (navigator.clipboard && files) {
          const relativePath = contextMenu.node.path.replace(files.path + '\\', '')
          navigator.clipboard.writeText(relativePath)
        }
        break
      case 'revealInExplorer':
        if (window.electron?.shell) {
          window.electron.shell.showItemInFolder(contextMenu.node.path)
        }
        break
    }

    setContextMenu(null)
  }

  const handleCreateFile = (e) => {
    e.stopPropagation()
    if (!files) return

    let targetId = files.id
    if (selectedNode) {
      if (selectedNode.type === 'folder') {
        targetId = selectedNode.id
      } else {
        const findParent = (node, targetId) => {
          if (!node.children) return null
          for (const child of node.children) {
            if (child.id === targetId) return node
            const found = findParent(child, targetId)
            if (found) return found
          }
          return null
        }
        const parent = findParent(files, selectedNode.id)
        if (parent) targetId = parent.id
      }
    }

    setCreationState({ type: 'file', parentId: targetId })
    if (targetId === files.id) setIsRootExpanded(true)
  }

  const handleCreateFolder = (e) => {
    e.stopPropagation()
    if (!files) return

    let targetId = files.id
    if (selectedNode) {
      if (selectedNode.type === 'folder') {
        targetId = selectedNode.id
      } else {
        const findParent = (node, targetId) => {
          if (!node.children) return null
          for (const child of node.children) {
            if (child.id === targetId) return node
            const found = findParent(child, targetId)
            if (found) return found
          }
          return null
        }
        const parent = findParent(files, selectedNode.id)
        if (parent) targetId = parent.id
      }
    }

    setCreationState({ type: 'folder', parentId: targetId })
    if (targetId === files.id) setIsRootExpanded(true)
  }

  const handleCreationCommit = (parentPath, name, type) => {
    if (onCreateItem) onCreateItem(parentPath, name, type)
    setCreationState(null)
  }

  const handleRenameClick = (e) => {
    e.stopPropagation()
    if (selectedNode) {
      setRenamingId(selectedNode.id)
    }
  }

  const handleRenameCommit = (node, newName) => {
    if (onRename) onRename(node, newName)
    setRenamingId(null)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete && selectedNode) onDelete(selectedNode)
  }

  if (!files) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 text-6xl opacity-20 animate-pulse">📂</div>
        <h3 className="text-gray-300 font-semibold mb-2">No Folder Open</h3>
        <p className="text-xs text-gray-500 mb-6 max-w-[200px]">
          Open a local folder to start editing files in the browser.
        </p>
        <button
          onClick={onOpenFolder}
          disabled={isLoading}
          className="btn-neumorphic px-6 py-2 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/30 rounded-lg transition-all duration-300 flex items-center gap-2 group"
        >
          {isLoading ? (
            <span className="animate-spin">⌛</span>
          ) : (
            <span className="group-hover:scale-110 transition-transform">📂</span>
          )}
          <span>{isLoading ? 'Loading...' : 'Open Folder'}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0e14]">
      {/* Root Folder Header */}
      <div
        className="px-2 py-1 flex items-center justify-between text-xs font-bold text-gray-300 cursor-pointer hover:bg-white/5 group"
        onClick={() => {
          setSelectedId(files.id)
          setSelectedNode(files)
          setIsRootExpanded(!isRootExpanded)
        }}
      >
        <div className="flex items-center">
          <span className={`mr-1 transform transition-transform duration-200 ${isRootExpanded ? 'rotate-0' : '-rotate-90'}`}>
            <Icons.ChevronDown />
          </span>
          <span>{files.name.toUpperCase()}</span>
        </div>
        <div className="flex gap-1 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-green-400"
            title="New File"
            onClick={handleCreateFile}
          >
            <Icons.NewFile />
          </button>
          <button
            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-green-400"
            title="New Folder"
            onClick={handleCreateFolder}
          >
            <Icons.NewFolder />
          </button>
          <button
            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-green-400"
            title="Refresh Explorer"
            onClick={(e) => { e.stopPropagation(); if (onRefresh) onRefresh(); }}
          >
            <Icons.Refresh />
          </button>
          <button
            className={`p-1 hover:bg-white/10 rounded text-gray-400 hover:text-green-400 ${!selectedNode ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="Rename Selected"
            onClick={handleRenameClick}
            disabled={!selectedNode}
          >
            <Icons.Rename />
          </button>
          <button
            className={`p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 ${!selectedNode ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="Delete Selected"
            onClick={handleDelete}
            disabled={!selectedNode}
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {isRootExpanded && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Render Input if creating in root */}
          {creationState && creationState.parentId === files.id && (
            <FileCreationInput
              type={creationState.type}
              level={1}
              onCommit={(name) => handleCreationCommit(files.path, name, creationState.type)}
              onCancel={() => setCreationState(null)}
            />
          )}

          {files.children.map(node => (
            <FileNode
              key={node.id}
              node={node}
              level={1}
              onSelect={handleFileClick}
              selectedId={selectedId}
              onToggleFolder={onToggleFolder}
              collapseSignal={collapseSignal}
              problems={problems}
              creationState={creationState}
              onCreateItem={handleCreationCommit}
              onCancelCreation={() => setCreationState(null)}
              renamingId={renamingId}
              onRenameCommit={handleRenameCommit}
              onCancelRename={() => setRenamingId(null)}
              onContextMenu={handleContextMenu}
            />
          ))}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && createPortal(
        <div
          ref={contextMenuRef}
          className="fixed z-[9999] w-72 bg-[#1e1e1e]/20 backdrop-blur-md border border-[#333] rounded-lg shadow-2xl py-1 text-xs text-gray-300 font-sans"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            transform: contextMenu.isAbove ? 'translateY(-100%)' : 'none'
          }}
        >
          {contextMenu.node.type === 'folder' && (
            <>
              <div
                className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer"
                onClick={() => handleContextMenuAction('newFile')}
              >
                New File
              </div>
              <div
                className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer"
                onClick={() => handleContextMenuAction('newFolder')}
              >
                New Folder
              </div>
              <div className="h-[1px] bg-[#333] my-1"></div>
            </>
          )}

          <div
            className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group"
            onClick={() => handleContextMenuAction('revealInExplorer')}
          >
            <span>Reveal in Explorer</span>
            <span className="text-gray-500 group-hover:text-green-400/70">Shift+Alt+R</span>
          </div>

          <div className="h-[1px] bg-[#333] my-1"></div>

          <div
            className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group"
            onClick={() => handleContextMenuAction('cut')}
          >
            <span>Cut</span>
            <span className="text-gray-500 group-hover:text-green-400/70">Ctrl+X</span>
          </div>
          <div
            className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group"
            onClick={() => handleContextMenuAction('copy')}
          >
            <span>Copy</span>
            <span className="text-gray-500 group-hover:text-green-400/70">Ctrl+C</span>
          </div>

          <div className="h-[1px] bg-[#333] my-1"></div>

          <div
            className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group"
            onClick={() => handleContextMenuAction('copyPath')}
          >
            <span>Copy Path</span>
            <span className="text-gray-500 group-hover:text-green-400/70">Shift+Alt+C</span>
          </div>
          <div
            className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group"
            onClick={() => handleContextMenuAction('copyRelativePath')}
          >
            <span>Copy Relative Path</span>
            <span className="text-gray-500 group-hover:text-green-400/70">Ctrl+K C</span>
          </div>

          <div className="h-[1px] bg-[#333] my-1"></div>

          <div
            className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group"
            onClick={() => handleContextMenuAction('rename')}
          >
            <span>Rename...</span>
            <span className="text-gray-500 group-hover:text-green-400/70">F2</span>
          </div>
          <div
            className="px-3 py-1.5 hover:bg-[#2a2d2e] cursor-pointer flex justify-between items-center text-red-400 hover:text-red-300 group"
            onClick={() => handleContextMenuAction('delete')}
          >
            <span>Delete</span>
            <span className="text-gray-500 group-hover:text-red-300">Delete</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
