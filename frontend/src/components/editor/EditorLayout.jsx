import { useState, useRef, useEffect, useCallback } from 'react'
import FileTree from './FileTree'
import SearchPanel from './SearchPanel'
import GitPanel from './GitPanel'
import ExtensionsPanel from './ExtensionsPanel'
import CodeEditor from './CodeEditor'
import TabBar from './TabBar'
import StatusBar from './StatusBar'
import SettingsPanel from './SettingsPanel'
import ChatPanel from '../chat/ChatPanel'
import Breadcrumbs from './Breadcrumbs'
import Terminal from './Terminal'
import { extensionLoader } from '../../utils/ExtensionLoader'
import ErrorBoundary from '../common/ErrorBoundary'

import {
  MdMenu, MdSearch, MdSettings, MdPerson, MdFolderOpen, MdAdd, MdCheck
} from 'react-icons/md'
import {
  VscLayoutSidebarLeft, VscLayoutPanel, VscLayoutSidebarRight,
  VscChromeMinimize, VscChromeMaximize, VscChromeClose,
  VscChevronRight, VscChevronDown, VscFiles, VscSourceControl,
  VscDebugAlt, VscExtensions, VscDebugStart
} from 'react-icons/vsc'

// Icons
const Icons = {
  Menu: () => <MdMenu className="w-4 h-4" />,
  Search: () => <MdSearch className="w-5 h-5" />,
  Settings: () => <MdSettings className="w-5 h-5" />,
  User: () => <MdPerson className="w-5 h-5" />,
  LayoutSidebarLeft: () => <VscLayoutSidebarLeft className="w-4 h-4" />,
  LayoutBottom: () => <VscLayoutPanel className="w-4 h-4" />,
  LayoutSidebarRight: () => <VscLayoutSidebarRight className="w-4 h-4" />,
  WindowMin: () => <VscChromeMinimize className="w-3 h-3" />,
  WindowMax: () => <VscChromeMaximize className="w-3 h-3" />,
  WindowClose: () => <VscChromeClose className="w-3 h-3" />,
  ChevronRight: () => <VscChevronRight className="w-3 h-3" />,
  Files: () => <VscFiles className="w-5 h-5" />,
  Git: () => <VscSourceControl className="w-5 h-5" />,
  Debug: () => <VscDebugAlt className="w-5 h-5" />,
  Extensions: () => <VscExtensions className="w-5 h-5" />,
  FolderOpen: () => <MdFolderOpen className="w-3 h-3" />,
  Plus: () => <MdAdd className="w-4 h-4" />,
  Check: () => <MdCheck className="w-3 h-3" />,
  ChevronDown: () => <VscChevronDown className="w-3 h-3" />,
}

export default function EditorLayout() {
  const [openTabs, setOpenTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  const [currentLanguage, setCurrentLanguage] = useState('javascript')
  const [showSettings, setShowSettings] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

  // Layout State
  const [showPrimarySidebar, setShowPrimarySidebar] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [showAgentSidebar, setShowAgentSidebar] = useState(true)
  const [activeActivity, setActiveActivity] = useState('explorer')
  const [showTerminalDropdown, setShowTerminalDropdown] = useState(false)

  // Terminal State
  const [terminals, setTerminals] = useState([
    { id: '1', name: 'powershell', type: 'powershell' }
  ])
  const [activeTerminalId, setActiveTerminalId] = useState('1')

  const handleNewTerminal = (type = 'powershell') => {
    const newId = Math.random().toString(36).substr(2, 9)
    const newTerminal = {
      id: newId,
      name: type,
      type: type
    }
    setTerminals([...terminals, newTerminal])
    setActiveTerminalId(newId)
    setShowTerminalDropdown(false)
    setShowPanel(true) // Ensure panel is visible
  }

  const handleCloseTerminal = (id, e) => {
    e.stopPropagation()
    const newTerminals = terminals.filter(t => t.id !== id)
    setTerminals(newTerminals)
    if (activeTerminalId === id && newTerminals.length > 0) {
      setActiveTerminalId(newTerminals[newTerminals.length - 1].id)
    } else if (newTerminals.length === 0) {
      setActiveTerminalId(null)
    }
  }

  // File System State
  const [files, setFiles] = useState(null)
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [currentPath, setCurrentPath] = useState(undefined)
  const [isPanelMaximized, setIsPanelMaximized] = useState(false)
  const [activePanelTab, setActivePanelTab] = useState('terminal')
  const [problems, setProblems] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const monacoInstanceRef = useRef(null)

  // Resizing State
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [panelHeight, setPanelHeight] = useState(192)
  const [chatWidth, setChatWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(null)

  const startResizing = (direction) => {
    setIsResizing(direction)
  }

  const stopResizing = () => {
    setIsResizing(null)
  }

  const resize = (e) => {
    if (!isResizing) return

    if (isResizing === 'sidebar') {
      setSidebarWidth(Math.max(150, Math.min(600, e.clientX)))
    } else if (isResizing === 'panel') {
      setPanelHeight(Math.max(100, Math.min(window.innerHeight - 100, window.innerHeight - e.clientY)))
    } else if (isResizing === 'chat') {
      setChatWidth(Math.max(200, Math.min(600, window.innerWidth - e.clientX)))
    }
  }

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
    } else {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing])

  // Menu State
  const [activeMenu, setActiveMenu] = useState(null)
  const menuRef = useRef(null)
  const terminalDropdownRef = useRef(null)
  const [showSettingsMenu, setShowSettingsMenu] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const [selectedExplorerNode, setSelectedExplorerNode] = useState(null)
  const [collapseSignal, setCollapseSignal] = useState(0)
  const [confirmDialog, setConfirmDialog] = useState(null) // { message, onConfirm }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null)
      }
      if (terminalDropdownRef.current && !terminalDropdownRef.current.contains(event.target)) {
        setShowTerminalDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // --- File System Logic ---
  const readDirectory = async (dirHandle) => {
    const entries = []
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        entries.push({
          id: Math.random().toString(36).substr(2, 9),
          name: entry.name,
          type: 'file',
          handle: entry
        })
      } else if (entry.kind === 'directory') {
        const children = await readDirectory(entry)
        entries.push({
          id: Math.random().toString(36).substr(2, 9),
          name: entry.name,
          type: 'folder',
          children: children,
          handle: entry
        })
      }
    }
    return entries.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'folder' ? -1 : 1
    })
  }

  // Helper to recursively update the file tree
  const updateNodeChildren = (nodes, targetId, newChildren) => {
    return nodes.map(node => {
      if (node.id === targetId) {
        return { ...node, children: newChildren }
      }
      if (node.children) {
        return { ...node, children: updateNodeChildren(node.children, targetId, newChildren) }
      }
      return node
    })
  }

  const handleToggleFolder = async (folderNode) => {
    if (!window.electron?.fileSystem) return

    try {
      const children = await window.electron.fileSystem.readDirectory(folderNode.path)

      setFiles(prevFiles => {
        if (prevFiles.id === folderNode.id) {
          return { ...prevFiles, children }
        }
        return {
          ...prevFiles,
          children: updateNodeChildren(prevFiles.children, folderNode.id, children)
        }
      })
    } catch (err) {
      console.error('Error reading directory:', err)
    }
  }

  const handleOpenFolder = async () => {
    setActiveMenu(null) // Close menu if open

    // Use Electron's native dialog if available
    if (window.electron?.fileSystem) {
      try {
        setIsLoadingFiles(true)
        const folderPath = await window.electron.fileSystem.openFolder()

        if (!folderPath) {
          // User cancelled
          setIsLoadingFiles(false)
          return
        }

        // Store the full path for terminal
        setCurrentPath(folderPath)

        // Read directory contents
        const children = await window.electron.fileSystem.readDirectory(folderPath)

        const folderName = folderPath.split(/[/\\]/).pop()
        setFiles({
          id: 'root',
          name: folderName,
          type: 'folder',
          isOpen: true,
          children: children,
          path: folderPath
        })

        setShowPrimarySidebar(true)
        setActiveActivity('explorer')
        setShowPanel(true) // Auto-open terminal panel when folder is loaded
        setIsLoadingFiles(false)
      } catch (err) {
        console.error('Error opening folder:', err)
        alert(`Error opening folder: ${err.message}`)
        setIsLoadingFiles(false)
      }
      return
    }

    // Fallback to browser File System Access API
    if (!('showDirectoryPicker' in window)) {
      alert('Your browser does not support the File System Access API. Please use Chrome, Edge, or Opera.')
      return
    }

    try {
      setIsLoadingFiles(true)
      const dirHandle = await window.showDirectoryPicker()
      const children = await readDirectory(dirHandle)

      setFiles({
        id: 'root',
        name: dirHandle.name,
        type: 'folder',
        isOpen: true,
        children: children,
        handle: dirHandle
      })
      setCurrentPath(dirHandle.name) // Browser API doesn't give full path
      setShowPrimarySidebar(true)
      setActiveActivity('explorer')
      setShowPanel(true) // Auto-open terminal panel when folder is loaded
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error opening folder:', err)
        alert(`Error opening folder: ${err.message}`)
      }
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const handleNewFile = () => {
    setActiveMenu(null)
    const newId = Math.random().toString(36).substr(2, 9)
    const newTab = {
      id: newId,
      name: 'Untitled',
      language: 'plaintext',
      content: '',
      modified: true,
      icon: '📄'
    }
    setOpenTabs([...openTabs, newTab])
    setActiveTabId(newId)
    setEditorContent('')
    setCurrentLanguage('plaintext')
  }

  const handleRefreshExplorer = async () => {
    if (!files || !window.electron?.fileSystem) return

    try {
      setIsLoadingFiles(true)
      const children = await window.electron.fileSystem.readDirectory(files.path)

      setFiles(prev => ({
        ...prev,
        children
      }))
    } catch (err) {
      console.error('Error refreshing explorer:', err)
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const handleCreateFile = async (parentPath, fileName) => {
    if (!window.electron?.fileSystem || !fileName) return
    const filePath = `${parentPath}\\${fileName}`
    try {
      const result = await window.electron.fileSystem.writeFile(filePath, '')
      if (result.success) {
        handleRefreshExplorer()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('Error creating file:', err)
      alert('Error creating file.')
    }
  }

  const handleCreateFolder = async (parentPath, folderName) => {
    if (!window.electron?.fileSystem || !folderName) return
    const folderPath = `${parentPath}\\${folderName}`
    try {
      const result = await window.electron.fileSystem.createFolder(folderPath)
      if (result.success) {
        handleRefreshExplorer()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('Error creating folder:', err)
      alert('Error creating folder.')
    }
  }

  const handleCreateItem = async (parentPath, name, type) => {
    if (type === 'file') {
      await handleCreateFile(parentPath, name)
    } else {
      await handleCreateFolder(parentPath, name)
    }
  }

  const handleCollapseAll = () => {
    setCollapseSignal(prev => prev + 1)
  }

  const handleRename = async (node, newName) => {
    if (!node || !window.electron?.fileSystem) return

    // If newName is not provided, we might be coming from a context that expects a prompt (fallback)
    // But for inline renaming, newName will be passed.
    if (!newName) {
      newName = prompt('Enter new name:', node.name)
    }

    if (!newName || newName === node.name) return

    const parentPath = node.path.substring(0, node.path.lastIndexOf('\\'))
    const newPath = `${parentPath}\\${newName}`

    try {
      const result = await window.electron.fileSystem.rename(node.path, newPath)
      if (result.success) {
        // If it was an open file, update the tab
        setOpenTabs(prev => prev.map(tab => {
          if (tab.path === node.path) {
            return { ...tab, name: newName, path: newPath, language: getLanguageFromFilename(newName) }
          }
          return tab
        }))
        handleRefreshExplorer()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('Error renaming:', err)
      alert(`Error renaming: ${err.message}`)
    }
  }

  const handleDelete = (node) => {
    if (!node || !window.electron?.fileSystem) return

    setConfirmDialog({
      message: `Are you sure you want to delete '${node.name}'?`,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          const result = await window.electron.fileSystem.delete(node.path)
          if (result.success) {
            // Close tab if it was open
            const tab = openTabs.find(t => t.path === node.path)
            if (tab) {
              handleTabClose(tab.id)
            }
            handleRefreshExplorer()
          } else {
            throw new Error(result.error)
          }
        } catch (err) {
          console.error('Error deleting:', err)
          alert(`Error deleting: ${err.message}`)
        }
      }
    })
  }

  const handleSaveAs = async () => {
    setActiveMenu(null)
    const activeTab = openTabs.find(t => t.id === activeTabId)
    if (!activeTab) return

    if (window.electron?.fileSystem) {
      try {
        const defaultPath = activeTab.path || activeTab.name
        const result = await window.electron.fileSystem.saveFile(activeTab.content, defaultPath)
        if (result.success && result.filePath) {
          const fileName = result.filePath.split(/[/\\]/).pop()
          const newTabs = openTabs.map(tab =>
            tab.id === activeTabId ? { ...tab, name: fileName, path: result.filePath, modified: false, language: getLanguageFromFilename(fileName) } : tab
          )
          setOpenTabs(newTabs)
          setCurrentLanguage(getLanguageFromFilename(fileName))
        }
      } catch (err) {
        console.error('Error saving file:', err)
        alert('Error saving file.')
      }
    } else {
      alert('Save As not supported in browser mode yet.')
    }
  }

  const handleSave = async () => {
    setActiveMenu(null)
    const activeTab = openTabs.find(t => t.id === activeTabId)
    if (!activeTab) return

    if (!activeTab.path) {
      handleSaveAs()
      return
    }

    if (window.electron?.fileSystem) {
      try {
        const result = await window.electron.fileSystem.writeFile(activeTab.path, activeTab.content)
        if (result.success) {
          const newTabs = openTabs.map(tab =>
            tab.id === activeTabId ? { ...tab, modified: false } : tab
          )
          setOpenTabs(newTabs)
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        console.error('Error saving file:', err)
        alert('Error saving file.')
      }
    } else {
      alert('Save not supported in browser mode yet.')
    }
  }

  // --- Tab Logic ---
  const getLanguageFromFilename = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    const map = {
      js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
      html: 'html', css: 'css', json: 'json', py: 'python', md: 'markdown',
      yml: 'yaml', yaml: 'yaml', sql: 'sql', java: 'java', c: 'c', cpp: 'cpp'
    }
    return map[ext] || 'plaintext'
  }

  const handleFileSelect = async (file, options = {}) => {
    setSelectedExplorerNode(file)
    if (file.type === 'folder') return

    const existingTab = openTabs.find(tab => tab.id === file.id)

    if (existingTab) {
      setActiveTabId(file.id)
      setEditorContent(existingTab.content)
      setCurrentLanguage(existingTab.language)
      // Update tab with new selection options if provided
      if (options.line) {
        setOpenTabs(prev => prev.map(t =>
          t.id === file.id ? { ...t, selection: { line: options.line, column: options.column || 1 } } : t
        ))
      }
    } else {
      try {
        let content = ''

        // Check if we are using Electron backend
        if (window.electron?.fileSystem) {
          const result = await window.electron.fileSystem.readFile(file.path)
          if (result.success) {
            content = result.content
          } else {
            throw new Error(result.error)
          }
        } else {
          // Fallback for browser API (if still used)
          const fileData = await file.handle.getFile()
          content = await fileData.text()
        }

        const newTab = {
          id: file.id,
          name: file.name,
          language: getLanguageFromFilename(file.name),
          content: content,
          modified: false,
          icon: '📄',
          path: file.path, // Store path for saving
          selection: options.line ? { line: options.line, column: options.column || 1 } : null
        }

        setOpenTabs([...openTabs, newTab])
        setActiveTabId(file.id)
        setEditorContent(content)
        setCurrentLanguage(newTab.language)
      } catch (err) {
        console.error('Error reading file:', err)
        alert('Error reading file content. It might be a binary file.')
      }
    }
  }

  const handleTabChange = (tabId) => {
    setActiveTabId(tabId)
    const tab = openTabs.find(t => t.id === tabId)
    if (tab) {
      setEditorContent(tab.content)
      setCurrentLanguage(tab.language)
    }
  }

  const handleTabClose = (tabId) => {
    const newTabs = openTabs.filter(tab => tab.id !== tabId)
    setOpenTabs(newTabs)

    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        setActiveTabId(newTabs[0].id)
        setEditorContent(newTabs[0].content)
      } else {
        setActiveTabId(null)
        setEditorContent('')
      }
    }
  }

  const handleEditorChange = (value) => {
    setEditorContent(value)
    setOpenTabs(openTabs.map(tab =>
      tab.id === activeTabId ? { ...tab, content: value, modified: true } : tab
    ))
  }

  const handleValidate = useCallback((markers) => {
    console.log('Diagnostics received:', markers)
    setProblems(markers)
  }, [])

  const handleMonacoReady = useCallback((monaco) => {
    console.log('Monaco is ready, setting instance ref')
    monacoInstanceRef.current = monaco
    // Expose monaco globally for ExtensionLoader
    window.monaco = monaco
    // Load extensions once Monaco is ready
    extensionLoader.loadExtensions()
  }, [])

  const scanProject = async () => {
    if (!files || !monacoInstanceRef.current || !window.electron?.fileSystem) return

    setIsScanning(true)
    const processedPaths = new Set()

    const processNode = async (node) => {
      if (node.type === 'file' && node.path) {
        if (processedPaths.has(node.path)) return
        processedPaths.add(node.path)

        try {
          // Skip if model already exists
          const uri = monacoInstanceRef.current.Uri.file(node.path)
          if (monacoInstanceRef.current.editor.getModel(uri)) return

          const result = await window.electron.fileSystem.readFile(node.path)
          if (result.success) {
            monacoInstanceRef.current.editor.createModel(result.content, undefined, uri)
          }
        } catch (err) {
          console.error('Error scanning file:', node.path, err)
        }
      } else if (node.children) {
        for (const child of node.children) {
          await processNode(child)
        }
      }
    }

    try {
      await processNode(files)
    } finally {
      setIsScanning(false)
    }
  }

  // Helper to get breadcrumb path
  const getBreadcrumbPath = () => {
    if (!activeTabId) return []
    const activeTab = openTabs.find(tab => tab.id === activeTabId)
    if (!activeTab) return []
    return activeTab.path ? activeTab.path.split(/[/\\]/) : [activeTab.name]
  }

  // --- Menu Data ---
  const menuItems = {
    File: [
      { label: 'New Text File', shortcut: 'Ctrl+N', action: handleNewFile, highlight: true },
      { label: 'New File...', shortcut: 'Ctrl+Alt+Windows+N' },
      { label: 'New Window', shortcut: 'Ctrl+Shift+N' },
      { label: 'New Window with Profile', hasSubmenu: true },
      { separator: true },
      { label: 'Open File...', shortcut: 'Ctrl+O' },
      { label: 'Open Folder...', shortcut: 'Ctrl+K Ctrl+O', action: handleOpenFolder },
      { label: 'Open Workspace from File...' },
      { label: 'Open Recent', hasSubmenu: true },
      { separator: true },
      { label: 'Add Folder to Workspace...' },
      { label: 'Save Workspace As...' },
      { label: 'Duplicate Workspace' },
      { separator: true },
      { label: 'Save', shortcut: 'Ctrl+S', action: handleSave },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: handleSaveAs },
      { label: 'Save All', shortcut: 'Ctrl+K S' },
      { separator: true },
      { label: 'Share', hasSubmenu: true },
      { separator: true },
      { label: 'Auto Save', checked: autoSaveEnabled, action: () => setAutoSaveEnabled(!autoSaveEnabled) },
      { label: 'Preferences', hasSubmenu: true },
      { separator: true },
      { label: 'Revert File' },
      { label: 'Close Editor', shortcut: 'Ctrl+F4' },
      { label: 'Close Folder', shortcut: 'Ctrl+K F', action: () => { setFiles(null); setActiveMenu(null) } },
      { label: 'Close Window', shortcut: 'Alt+F4' },
      { separator: true },
      { label: 'Exit' },
    ]
  }

  const SettingsMenu = ({ positionClass, onClose }) => (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className={`absolute z-50 w-72 bg-[#1e1e1e]/20 backdrop-blur-md border border-[#333] rounded-lg shadow-2xl py-1 text-xs text-gray-300 font-sans ${positionClass}`}>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Editor Settings</span>
        </div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Open Antigravity User Settings</span>
          <span className="text-xs text-gray-500 group-hover:text-green-400/70">Ctrl+,</span>
        </div>
        <div className="h-[1px] bg-[#333] my-1"></div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Extensions</span>
          <span className="text-xs text-gray-500 group-hover:text-green-400/70">Ctrl+Shift+X</span>
        </div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Open Keyboard Shortcuts</span>
          <span className="text-xs text-gray-500 group-hover:text-green-400/70">Ctrl+K Ctrl+S</span>
        </div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Configure Snippets</span>
        </div>
        <div className="h-[1px] bg-[#333] my-1"></div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Tasks</span>
        </div>
      </div>
    </>
  )

  const ProfileMenu = ({ positionClass, onClose }) => (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className={`absolute z-50 w-72 bg-[#1e1e1e]/20 backdrop-blur-md border border-[#333] rounded-lg shadow-2xl py-1 text-xs text-gray-300 font-sans ${positionClass}`}>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>salman ansari (Google Auth)</span>
          <Icons.ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-green-400/70" />
        </div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Quick Settings Panel</span>
        </div>
        <div className="h-[1px] bg-[#333] my-1"></div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Check for Updates...</span>
        </div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Docs</span>
        </div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Report Issue</span>
        </div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Changelog</span>
        </div>
        <div className="h-[1px] bg-[#333] my-1"></div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Themes</span>
          <Icons.ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-green-400/70" />
        </div>
        <div className="h-[1px] bg-[#333] my-1"></div>
        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group">
          <span>Download Diagnostics</span>
        </div>
      </div>
    </>
  )

  const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-96 bg-[#1e1e1e]/40 backdrop-blur-xl border border-[#333] rounded-xl shadow-2xl p-6 animate-fade-in font-sans">
        <h3 className="text-lg font-semibold text-white mb-2">Confirm Action</h3>
        <p className="text-sm text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors border border-white/5"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium transition-colors border border-red-500/30"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  )

  const ActivityIcon = ({ icon: Icon, id, label, onClick }) => (
    <div
      className={`
        w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 relative group
        ${activeActivity === id ? 'text-accent-blue' : 'text-gray-500 hover:text-gray-300'}
      `}
      onClick={(e) => {
        if (onClick) {
          onClick(e)
        } else {
          setActiveActivity(id)
          if (id === 'explorer' && !showPrimarySidebar) setShowPrimarySidebar(true)
        }
      }}
      title={label}
    >
      {activeActivity === id && !onClick && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent-blue shadow-[0_0_10px_rgba(139,233,253,0.5)]"></div>
      )}
      <Icon />
    </div>
  )

  const RunButton = ({ activeTab, onRun }) => {
    const [isCompilerAvailable, setIsCompilerAvailable] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
      const check = async () => {
        if (!activeTab || !window.electron?.shell?.checkCompiler) {
          setIsCompilerAvailable(false)
          return
        }

        // Map language to compiler check key
        let lang = activeTab.language
        if (lang === 'javascript' || lang === 'typescript') lang = 'javascript' // Check node

        const available = await window.electron.shell.checkCompiler(lang)
        setIsCompilerAvailable(available)
      }
      check()
    }, [activeTab])

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setShowDropdown(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!isCompilerAvailable) return null

    const handleRun = () => {
      if (!activeTab) return
      let cmd = ''
      const path = activeTab.path || activeTab.name // Fallback if path not set (unsaved)

      // Quote path to handle spaces
      const quotedPath = `"${path}"`

      switch (activeTab.language) {
        case 'python': cmd = `python ${quotedPath}`; break;
        case 'javascript': cmd = `node ${quotedPath}`; break;
        case 'typescript': cmd = `ts-node ${quotedPath}`; break;
        case 'c': cmd = `gcc ${quotedPath} -o "${path}.exe" && "${path}.exe"`; break;
        case 'cpp': cmd = `g++ ${quotedPath} -o "${path}.exe" && "${path}.exe"`; break;
        case 'java': cmd = `javac ${quotedPath} && java "${path.replace('.java', '')}"`; break;
        case 'go': cmd = `go run ${quotedPath}`; break;
        case 'rust': cmd = `rustc ${quotedPath} && "${path.replace('.rs', '.exe')}"`; break;
        case 'php': cmd = `php ${quotedPath}`; break;
      }

      if (cmd) onRun(cmd)
    }

    return (
      <div className="flex items-center mr-2 relative" ref={dropdownRef}>
        <div className="flex items-center bg-green-600/10 hover:bg-green-600/20 text-green-400 rounded-md border border-green-600/30 transition-colors">
          <button
            className="p-1.5 hover:bg-green-600/20 rounded-l-md transition-colors"
            title="Run Code"
            onClick={handleRun}
          >
            <VscDebugStart className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-green-600/30"></div>
          <button
            className="p-1.5 hover:bg-green-600/20 rounded-r-md transition-colors"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <VscChevronDown className="w-3 h-3" />
          </button>
        </div>

        {showDropdown && (
          <div className="absolute top-full right-0 mt-1 w-64 bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl py-1 z-50">
            <div
              className="px-3 py-2 hover:bg-[#2a2d2e] cursor-pointer flex items-center gap-2 text-xs text-gray-300"
              onClick={() => { handleRun(); setShowDropdown(false); }}
            >
              <VscDebugStart className="w-3 h-3 text-green-400" />
              <span>Run {activeTab.language === 'python' ? 'Python File' : 'Code'}</span>
            </div>
            <div className="px-3 py-2 hover:bg-[#2a2d2e] cursor-pointer flex items-center gap-2 text-xs text-gray-300">
              <VscDebugStart className="w-3 h-3 text-gray-500" />
              <span>Run in Dedicated Terminal</span>
            </div>
            <div className="h-[1px] bg-[#333] my-1"></div>
            <div className="px-3 py-2 hover:bg-[#2a2d2e] cursor-pointer flex items-center gap-2 text-xs text-gray-300">
              <Icons.Settings className="w-3 h-3" />
              <span>Configure Run Task...</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0e14] text-gray-300 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Title Bar */}
      <div className="h-10 bg-[#0a0e14] flex items-center justify-between px-4 border-b border-white/5 select-none draggable">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map((label) => (
              <div key={label} className="relative">
                <span
                  className={`hover:text-white cursor-pointer transition-colors ${activeMenu === label ? 'text-white' : ''}`}
                  onClick={() => setActiveMenu(activeMenu === label ? null : label)}
                >
                  {label}
                </span>
                {activeMenu === label && menuItems[label] && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                    <div className="absolute top-6 left-0 z-50 w-72 bg-[#1e1e1e]/20 backdrop-blur-md border border-[#333] rounded-lg shadow-2xl py-1 text-xs text-gray-300 font-sans">
                      {menuItems[label].map((item, index) => {
                        if (item.separator) {
                          return <div key={index} className="h-[1px] bg-[#333] my-1"></div>
                        }
                        return (
                          <div
                            key={index}
                            className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer flex justify-between items-center group"
                            onClick={() => {
                              if (item.action) item.action()
                              setActiveMenu(null)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {item.checked !== undefined && (
                                <div className="w-4 flex items-center justify-center">
                                  {item.checked && <Icons.Check className="w-3 h-3 text-white" />}
                                </div>
                              )}
                              <span>{item.label}</span>
                            </div>
                            {item.shortcut && <span className="text-xs text-gray-500 group-hover:text-green-400/70 ml-4">{item.shortcut}</span>}
                            {item.hasSubmenu && <Icons.ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-green-400/70" />}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-4">
            <button className="text-xs text-accent-blue hover:text-blue-400 transition-colors font-medium">
              Open Agent Manager
            </button>

            <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5 border border-white/10">
              <button
                onClick={() => setShowPrimarySidebar(!showPrimarySidebar)}
                className={`p-1 rounded ${showPrimarySidebar ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                title="Toggle Primary Sidebar"
              >
                <Icons.LayoutSidebarLeft />
              </button>
              <button
                onClick={() => setShowPanel(!showPanel)}
                className={`p-1 rounded ${showPanel ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                title="Toggle Panel"
              >
                <Icons.LayoutBottom />
              </button>
              <button
                onClick={() => setShowAgentSidebar(!showAgentSidebar)}
                className={`p-1 rounded ${showAgentSidebar ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                title="Toggle Agent Sidebar"
              >
                <Icons.LayoutSidebarRight />
              </button>
            </div>

            <button className="text-gray-400 hover:text-white transition-colors">
              <Icons.Search />
            </button>

            <div className="w-[1px] h-4 bg-white/10"></div>

            <button className="text-gray-400 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
            </button>

            <div className="relative">
              <button
                className={`text-gray-400 hover:text-white transition-colors ${showSettingsMenu === 'header' ? 'text-white' : ''}`}
                onClick={() => setShowSettingsMenu(showSettingsMenu === 'header' ? null : 'header')}
              >
                <Icons.Settings />
              </button>
              {showSettingsMenu === 'header' && (
                <SettingsMenu positionClass="top-10 right-0" onClose={() => setShowSettingsMenu(null)} />
              )}
            </div>

            <div className="relative">
              <div
                className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-5 h-5 rounded-full bg-teal-900/50 flex items-center justify-center text-[10px] text-teal-400 border border-teal-500/30">
                  S
                </div>
                <Icons.ChevronDown />
              </div>
              {showProfileMenu && (
                <ProfileMenu positionClass="top-8 right-0" onClose={() => setShowProfileMenu(false)} />
              )}
            </div>
          </div>
          <div className="text-xs font-medium text-gray-500">Codudu - {currentPath ? currentPath.split(/[/\\]/).pop() : 'Untitled'}</div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Activity Bar & Sidebar */}
        <div className="flex flex-col z-20">
          <div className="w-12 bg-[#0a0e14] border-r border-white/5 flex flex-col items-center py-2 flex-1">
            <ActivityIcon icon={Icons.Files} id="explorer" label="Explorer" />
            <ActivityIcon icon={Icons.Search} id="search" label="Search" />
            <ActivityIcon icon={Icons.Git} id="git" label="Source Control" />
            <ActivityIcon icon={Icons.Debug} id="debug" label="Run and Debug" />
            <ActivityIcon icon={Icons.Extensions} id="extensions" label="Extensions" />

            <div className="flex-1"></div>
          </div>
        </div>

        {/* Left Sidebar - File Tree (or other views) */}
        {
          showPrimarySidebar && (
            <div
              className="glass-panel border-r border-white/5 z-10 flex flex-col animate-slide-in-left relative"
              style={{ width: sidebarWidth }}
            >
              <div
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 z-50 transition-colors"
                onMouseDown={() => startResizing('sidebar')}
              />
              {activeActivity === 'explorer' ? (
                <FileTree
                  files={files}
                  onFileSelect={handleFileSelect}
                  onOpenFolder={handleOpenFolder}
                  isLoading={isLoadingFiles}
                  onCloseFolder={() => setFiles(null)}
                  onToggleFolder={handleToggleFolder}
                  onCreateItem={handleCreateItem}
                  onRefresh={handleRefreshExplorer}
                  onCollapseAll={handleCollapseAll}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  collapseSignal={collapseSignal}
                  problems={problems}
                />
              ) : activeActivity === 'search' ? (
                <SearchPanel
                  files={files}
                  onFileSelect={handleFileSelect}
                />
              ) : activeActivity === 'git' ? (
                <GitPanel rootPath={currentPath} />
              ) : activeActivity === 'extensions' ? (
                <ExtensionsPanel />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  {activeActivity.charAt(0).toUpperCase() + activeActivity.slice(1)} View
                </div>
              )}
            </div>
          )
        }
        <div className="flex-1 flex flex-col bg-transparent z-10 relative min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center bg-[#0a0e14] border-b border-white/5">
              <div className="flex-1 overflow-hidden">
                <TabBar
                  tabs={openTabs}
                  activeTab={activeTabId}
                  onTabChange={handleTabChange}
                  onTabClose={handleTabClose}
                />
              </div>
              <RunButton
                activeTab={openTabs.find(t => t.id === activeTabId)}
                onRun={(cmd) => {
                  // Find active terminal or create one
                  let termId = activeTerminalId;
                  if (!termId && terminals.length > 0) termId = terminals[0].id;
                  if (!termId) {
                    handleNewTerminal();
                    // We need to wait for state update, but for now let's just use the newly created one if possible
                    // Ideally handleNewTerminal returns the ID or we wait. 
                    // For simplicity, let's assume user has a terminal or we just log for now if none.
                    return;
                  }

                  // Send command to terminal
                  if (window.electron?.terminal) {
                    window.electron.terminal.write(termId, cmd + '\r\n');
                  }
                }}
              />
            </div>

            {/* Breadcrumbs */}
            {activeTabId && (
              <Breadcrumbs path={getBreadcrumbPath().map(name => ({ name }))} />
            )}

            <div className="flex-1 relative bg-deepest/50 backdrop-blur-sm min-h-0">
              {activeTabId ? (
                <ErrorBoundary>
                  <CodeEditor
                    key={activeTabId}
                    value={editorContent}
                    onChange={handleEditorChange}
                    onValidate={handleValidate}
                    onMonacoReady={handleMonacoReady}
                    language={currentLanguage}
                    path={openTabs.find(t => t.id === activeTabId)?.path}
                    rootPath={currentPath}
                    selection={openTabs.find(t => t.id === activeTabId)?.selection}
                  />
                </ErrorBoundary>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-[#0a0e14]">
                  <VscFiles className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm">Select a file to start editing</p>
                  <p className="text-xs mt-2 opacity-60">or use Ctrl+P to search</p>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Panel */}
          {showPanel && (
            <div
              className={`flex-shrink-0 border-t border-white/5 bg-[#0a0e14] flex flex-col transition-all duration-300 ease-in-out relative`}
              style={{ height: isPanelMaximized ? '80%' : panelHeight }}
            >
              <div
                className="absolute top-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-500/50 z-50 transition-colors"
                onMouseDown={() => startResizing('panel')}
              />
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 select-none">
                <div className="flex items-center gap-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <span
                    className={`cursor-pointer transition-colors ${activePanelTab === 'problems' ? 'text-white border-b-2 border-accent-lightblue pb-2 -mb-2.5' : 'hover:text-white'}`}
                    onClick={() => setActivePanelTab('problems')}
                  >
                    Problems {problems.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-accent-red/20 text-accent-red rounded-full text-[10px]">{problems.length}</span>}
                  </span>
                  <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setActivePanelTab('output')}>Output</span>
                  <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setActivePanelTab('debug')}>Debug Console</span>
                  <span
                    className={`cursor-pointer transition-colors ${activePanelTab === 'terminal' ? 'text-white border-b-2 border-accent-lightblue pb-2 -mb-2.5' : 'hover:text-white'}`}
                    onClick={() => setActivePanelTab('terminal')}
                  >
                    Terminal
                  </span>
                  <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setActivePanelTab('ports')}>Ports</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  {/* Scan Project Button */}
                  {activePanelTab === 'problems' && (
                    <button
                      onClick={scanProject}
                      disabled={isScanning}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${isScanning ? 'bg-blue-500/20 text-blue-300 cursor-wait' : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'}`}
                      title="Scan all files in the workspace for errors"
                    >
                      {isScanning ? (
                        <>
                          <div className="w-2 h-2 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          <span>Scan Project</span>
                        </>
                      )}
                    </button>
                  )}
                  <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5 border border-white/5 relative" ref={terminalDropdownRef}>
                    <button
                      onClick={() => handleNewTerminal('powershell')}
                      className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                      title="New Terminal (Ctrl+Shift+`)"
                    >
                      <Icons.Plus />
                    </button>
                    <button
                      className={`p-0.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors ${showTerminalDropdown ? 'bg-white/10 text-white' : ''}`}
                      onClick={() => setShowTerminalDropdown(!showTerminalDropdown)}
                    >
                      <Icons.ChevronDown />
                    </button>

                    {/* Terminal Dropdown */}
                    {showTerminalDropdown && (
                      <div className="absolute bottom-full right-0 mb-1 w-72 bg-[#1e1e1e]/20 backdrop-blur-md border border-[#333] rounded-lg shadow-2xl py-1 z-50 font-sans">
                        <div
                          className="px-3 py-1.5 flex items-center justify-between hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer group text-gray-300 text-xs"
                          onClick={() => handleNewTerminal('powershell')}
                        >
                          <span>New Terminal</span>
                          <span className="text-xs text-gray-500 group-hover:text-green-400/70">Ctrl+Shift+`</span>
                        </div>
                        <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer group text-gray-300 text-xs">
                          <span>New Terminal Window</span>
                          <span className="text-xs text-gray-500 group-hover:text-green-400/70">Ctrl+Shift+Alt+`</span>
                        </div>
                        <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer group text-gray-300 text-xs">
                          <span>Split Terminal</span>
                          <span className="text-xs text-gray-500 group-hover:text-green-400/70">Ctrl+Shift+5</span>
                        </div>

                        <div className="h-[1px] bg-[#333] my-1 mx-2" />

                        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer text-gray-300 text-xs" onClick={() => handleNewTerminal('powershell')}>PowerShell</div>
                        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer text-gray-300 text-xs" onClick={() => handleNewTerminal('git-bash')}>Git Bash</div>
                        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer text-gray-300 text-xs" onClick={() => handleNewTerminal('cmd')}>Command Prompt</div>
                        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer text-gray-300 text-xs" onClick={() => handleNewTerminal('node')}>JavaScript Debug Terminal</div>
                        <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer text-gray-300 text-xs group">
                          <span>Split Terminal with Profile</span>
                          <Icons.ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-green-400/70" />
                        </div>

                        <div className="h-[1px] bg-[#333] my-1 mx-2" />

                        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer text-gray-300 text-xs">Configure Terminal Settings</div>
                        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer text-gray-300 text-xs">Select Default Profile</div>

                        <div className="h-[1px] bg-[#333] my-1 mx-2" />

                        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer text-gray-300 text-xs">Run Task...</div>
                        <div className="px-3 py-1.5 hover:bg-[#2a2d2e] hover:text-green-400 cursor-pointer text-gray-300 text-xs">Configure Tasks...</div>
                      </div>
                    )}
                  </div>
                  <button className="p-1 hover:bg-white/10 rounded hover:text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                  <div className="w-px h-3 bg-white/10 mx-1"></div>
                  <button onClick={() => setIsPanelMaximized(!isPanelMaximized)} className="p-1 hover:bg-white/10 rounded hover:text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></button>
                  <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-white/10 rounded hover:text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 flex overflow-hidden">
                {activePanelTab === 'problems' && (
                  <div className="flex-1 overflow-y-auto p-0 bg-[#0a0e14]">
                    {problems.length === 0 ? (
                      <div className="text-gray-500 text-sm text-center mt-8">No problems detected in the workspace.</div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                          <span className="text-xs text-gray-400">Send all to Agent</span>
                          <div className="flex items-center gap-2">
                            <input type="text" placeholder="Filter (e.g. text, **/*.ts, !**/node_modules/**)" className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500 w-64" />
                          </div>
                        </div>
                        {Object.entries(problems.reduce((acc, problem) => {
                          const resource = problem.resource?.toString() || 'unknown';
                          if (!acc[resource]) acc[resource] = [];
                          acc[resource].push(problem);
                          return acc;
                        }, {})).map(([resource, fileProblems]) => {
                          const decodedResource = decodeURIComponent(resource);
                          const fileName = decodedResource.split(/[/\\]/).pop();
                          const filePath = decodedResource.replace('file:///', '').replace(fileName, '');

                          return (
                            <div key={resource} className="flex flex-col">
                              {/* File Header */}
                              <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border-b border-white/5 cursor-pointer hover:bg-white/10">
                                <Icons.ChevronDown />
                                <Icons.Files />
                                <span className="text-xs font-bold text-gray-200">{fileName}</span>
                                <span className="text-xs text-gray-500 truncate flex-1">{filePath}</span>
                                <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 rounded-full">{fileProblems.length}</span>
                                <span className="text-xs text-gray-500 hover:text-white transition-colors">Send to Agent</span>
                              </div>
                              {/* Problems List */}
                              <div className="flex flex-col">
                                {fileProblems.map((problem, index) => (
                                  <div key={index} className="flex items-start gap-2 px-8 py-1 hover:bg-white/5 cursor-pointer group border-b border-white/5 last:border-0">
                                    <div className="mt-0.5">
                                      {problem.severity === 8 ? (
                                        <span className="text-accent-red" title="Error">
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><circle cx="12" cy="12" r="10" strokeWidth="2" /><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" /></svg>
                                        </span>
                                      ) : (
                                        <span className="text-yellow-400" title="Warning">
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-300 truncate" title={problem.message}>{problem.message}</span>
                                        <span className="text-xs text-gray-500">[{`Ln ${problem.startLineNumber}, Col ${problem.startColumn}`}]</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activePanelTab === 'terminal' && (
                  <div className="flex-1 flex overflow-hidden">
                    {/* Terminal Area */}
                    <div className="flex-1 overflow-hidden relative">
                      {terminals.map(term => (
                        <div
                          key={term.id}
                          className={`absolute inset-0 ${activeTerminalId === term.id ? 'block' : 'hidden'}`}
                        >
                          <Terminal name={term.name} cwd={currentPath} shellType={term.type} />
                        </div>
                      ))}
                      {terminals.length === 0 && (
                        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                          No open terminals
                        </div>
                      )}
                    </div>

                    {/* Right Tabs (Terminal Sessions) */}
                    <div className="w-48 border-l border-white/5 bg-[#0a0e14]/50 flex flex-col">
                      <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <span>Open Terminals</span>
                        <button onClick={() => handleNewTerminal()} className="hover:text-white"><Icons.Plus /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {terminals.map(term => (
                          <div
                            key={term.id}
                            className={`px-3 py-1.5 flex items-center justify-between group cursor-pointer border-l-2 ${activeTerminalId === term.id ? 'bg-white/10 border-white text-white' : 'border-transparent text-gray-400 hover:bg-white/5'}`}
                            onClick={() => setActiveTerminalId(term.id)}
                          >
                            <div className="flex items-center gap-2 text-xs">
                              <span>💻</span>
                              <span>{term.name}</span>
                            </div>
                            <button
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/20 rounded"
                              onClick={(e) => handleCloseTerminal(term.id, e)}
                            >
                              <Icons.WindowClose />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <StatusBar
            line={cursorPosition.line}
            column={cursorPosition.column}
            language={currentLanguage}
          />
        </div>

        {/* Right Sidebar - Chat */}
        {
          showAgentSidebar && (
            <div
              className="glass-panel border-l border-white/5 z-10 animate-slide-in-right relative"
              style={{ width: chatWidth }}
            >
              <div
                className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 z-50 transition-colors"
                onMouseDown={() => startResizing('chat')}
              />
              <ChatPanel />
            </div>
          )
        }
      </div >

      {/* Settings Modal */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Confirmation Modal */}
      {confirmDialog && (
        <ConfirmationModal
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}
