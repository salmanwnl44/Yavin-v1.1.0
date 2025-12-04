import { useState, useEffect, useRef } from 'react'

// Icons
const Icons = {
    Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    File: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-accent-blue"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2v7h7" /></svg>,
    ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
    ChevronDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
    Replace: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    ReplaceAll: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-8H7v8M7 3v5h8" /></svg>,
    Close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    Refresh: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    CollapseAll: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m-4 12h2a2 2 0 002-2v-2" /></svg>,
    More: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
    Book: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Exclude: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
    Warning: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
}

const getFileColor = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    switch (ext) {
        case 'js':
        case 'jsx':
            return 'text-yellow-400'
        case 'ts':
        case 'tsx':
            return 'text-blue-400'
        case 'css':
        case 'scss':
        case 'less':
            return 'text-cyan-400'
        case 'html':
            return 'text-orange-500'
        case 'json':
            return 'text-yellow-200'
        case 'md':
            return 'text-blue-300'
        case 'py':
            return 'text-blue-500'
        case 'java':
            return 'text-red-500'
        case 'c':
        case 'cpp':
            return 'text-blue-600'
        case 'go':
            return 'text-cyan-500'
        case 'rs':
            return 'text-orange-600'
        case 'php':
            return 'text-purple-400'
        default:
            return 'text-gray-400'
    }
}

const FileIcon = ({ filename, className = "w-4 h-4" }) => {
    const colorClass = getFileColor(filename)
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`${className} ${colorClass}`}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2v7h7" />
        </svg>
    )
}

export default function SearchPanel({ files, onFileSelect }) {
    const [query, setQuery] = useState('')
    const [replaceQuery, setReplaceQuery] = useState('')
    const [results, setResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showReplace, setShowReplace] = useState(false)
    const [expandedFiles, setExpandedFiles] = useState({})

    // Advanced Search Options
    const [showDetails, setShowDetails] = useState(false)
    const [includeTags, setIncludeTags] = useState([])
    const [excludeTags, setExcludeTags] = useState([])
    const [includeInput, setIncludeInput] = useState('')
    const [excludeInput, setExcludeInput] = useState('')

    // File Suggestions
    const [allFiles, setAllFiles] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [activeField, setActiveField] = useState(null) // 'include' | 'exclude'

    // Confirmation Modal
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const searchAbortController = useRef(null)

    // Flatten files for search and suggestions
    useEffect(() => {
        if (!files) return
        const list = []
        const traverse = (nodes) => {
            for (const node of nodes) {
                if (node.type === 'file') {
                    if (!node.path.includes('node_modules') && !node.name.startsWith('.')) {
                        list.push(node)
                    }
                } else if (node.children) {
                    if (!node.name.includes('node_modules') && !node.name.startsWith('.')) {
                        traverse(node.children)
                    }
                }
            }
        }
        traverse(files.children || [])
        setAllFiles(list)
    }, [files])

    const toggleFileExpand = (fileId) => {
        setExpandedFiles(prev => ({
            ...prev,
            [fileId]: !prev[fileId]
        }))
    }

    const handleInputChange = (e, field) => {
        const value = e.target.value
        if (field === 'include') setIncludeInput(value)
        else setExcludeInput(value)

        const lastTerm = value.trim().toLowerCase()

        if (lastTerm) {
            const matches = allFiles
                .filter(f => f.name.toLowerCase().includes(lastTerm))
                .slice(0, 8)
            setSuggestions(matches)
            setActiveField(field)
        } else {
            setSuggestions([])
            setActiveField(null)
        }
    }

    const addTag = (field, tag) => {
        const cleanTag = tag.trim()
        if (!cleanTag) return

        if (field === 'include') {
            if (includeTags.includes(cleanTag)) return
            if (excludeTags.includes(cleanTag)) {
                setExcludeTags(prev => prev.filter(t => t !== cleanTag))
            }
            setIncludeTags(prev => [...prev, cleanTag])
            setIncludeInput('')
        } else {
            if (excludeTags.includes(cleanTag)) return
            if (includeTags.includes(cleanTag)) {
                setIncludeTags(prev => prev.filter(t => t !== cleanTag))
            }
            setExcludeTags(prev => [...prev, cleanTag])
            setExcludeInput('')
        }
        setSuggestions([])
        setActiveField(null)
    }

    const handleKeyDown = (e, field) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const value = field === 'include' ? includeInput : excludeInput
            if (value.trim()) {
                addTag(field, value)
            }
        }
        if (e.key === 'Backspace' && (field === 'include' ? !includeInput : !excludeInput)) {
            if (field === 'include') {
                setIncludeTags(prev => prev.slice(0, -1))
            } else {
                setExcludeTags(prev => prev.slice(0, -1))
            }
        }
    }

    const applySuggestion = (file) => {
        addTag(activeField, file.name)
    }

    const removeTag = (field, tagToRemove) => {
        if (field === 'include') {
            setIncludeTags(prev => prev.filter(t => t !== tagToRemove))
        } else {
            setExcludeTags(prev => prev.filter(t => t !== tagToRemove))
        }
    }

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([])
            return
        }

        if (searchAbortController.current) {
            searchAbortController.current.abort()
        }
        searchAbortController.current = new AbortController()
        const signal = searchAbortController.current.signal

        setIsSearching(true)
        setResults([])

        // Use pre-calculated allFiles
        const fileList = allFiles

        const newResults = []
        let processedCount = 0

        const processChunk = async () => {
            if (signal.aborted) return

            const chunk = fileList.slice(processedCount, processedCount + 10)
            if (chunk.length === 0) {
                setIsSearching(false)
                return
            }

            const chunkResults = await Promise.all(chunk.map(async (file) => {
                try {
                    // Advanced filtering for include/exclude
                    if (includeTags.length > 0 || includeInput.trim()) {
                        const includePatterns = [...includeTags, includeInput.trim()].filter(Boolean)
                        if (includePatterns.length > 0) {
                            const matchesInclude = includePatterns.some(pattern => {
                                // Extension match (e.g., .js)
                                if (pattern.startsWith('.') && !pattern.includes('*')) {
                                    return file.name.toLowerCase().endsWith(pattern.toLowerCase())
                                }
                                // Wildcard match (e.g., *.ts, src/*)
                                if (pattern.includes('*')) {
                                    const regexStr = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
                                    return new RegExp(regexStr, 'i').test(file.name) || new RegExp(regexStr, 'i').test(file.path)
                                }
                                // Substring match on path or name
                                return file.path.toLowerCase().includes(pattern.toLowerCase())
                            })
                            if (!matchesInclude) return null
                        }
                    }

                    if (excludeTags.length > 0 || excludeInput.trim()) {
                        const excludePatterns = [...excludeTags, excludeInput.trim()].filter(Boolean)
                        if (excludePatterns.length > 0) {
                            const matchesExclude = excludePatterns.some(pattern => {
                                if (pattern.startsWith('.') && !pattern.includes('*')) {
                                    return file.name.toLowerCase().endsWith(pattern.toLowerCase())
                                }
                                if (pattern.includes('*')) {
                                    const regexStr = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
                                    return new RegExp(regexStr, 'i').test(file.name) || new RegExp(regexStr, 'i').test(file.path)
                                }
                                return file.path.toLowerCase().includes(pattern.toLowerCase())
                            })
                            if (matchesExclude) return null
                        }
                    }

                    if (!window.electron?.fileSystem) return null
                    const result = await window.electron.fileSystem.readFile(file.path)
                    if (!result.success) return null

                    const content = result.content
                    const lines = content.split('\n')
                    const matches = []

                    lines.forEach((line, index) => {
                        // Simple case-insensitive search
                        if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
                            const trimmedLine = line.trim()
                            const displayLine = trimmedLine.length > 100 ? trimmedLine.substring(0, 100) + '...' : trimmedLine

                            matches.push({
                                line: index + 1,
                                content: displayLine,
                                fullLine: line
                            })
                        }
                    })

                    if (matches.length > 0) {
                        return { file, matches }
                    }
                    return null
                } catch (err) {
                    return null
                }
            }))

            const validResults = chunkResults.filter(r => r !== null)
            if (validResults.length > 0) {
                setResults(prev => {
                    const next = [...prev, ...validResults]
                    const newExpanded = { ...expandedFiles }
                    validResults.forEach(r => newExpanded[r.file.id] = true)
                    setExpandedFiles(newExpanded)
                    return next
                })
            }

            processedCount += 10
            setTimeout(processChunk, 10)
        }

        processChunk()
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(query)
        }, 500)

        return () => clearTimeout(timer)
    }, [query, files, includeTags, excludeTags, includeInput, excludeInput])

    const handleReplace = async (file, matchIndex) => {
        if (!window.electron?.fileSystem) return

        const resultItem = results.find(r => r.file.id === file.id)
        if (!resultItem) return

        const match = resultItem.matches[matchIndex]

        try {
            const readResult = await window.electron.fileSystem.readFile(file.path)
            if (!readResult.success) throw new Error("Could not read file")

            let content = readResult.content
            const lines = content.split('\n')

            if (lines[match.line - 1] !== match.fullLine) {
                alert("File has changed on disk. Please refresh search.")
                return
            }

            // Perform replacement using case-insensitive global replacement
            const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
            const newLine = lines[match.line - 1].replace(regex, replaceQuery)

            lines[match.line - 1] = newLine
            const newContent = lines.join('\n')

            const writeResult = await window.electron.fileSystem.writeFile(file.path, newContent)

            if (writeResult.success) {
                handleSearch(query)
            }
        } catch (err) {
            console.error("Replace error:", err)
            alert("Failed to replace text.")
        }
    }

    const initiateReplaceAll = () => {
        if (!window.electron?.fileSystem || results.length === 0) return
        setShowConfirmModal(true)
    }

    const executeReplaceAll = async () => {
        setShowConfirmModal(false)

        for (const result of results) {
            try {
                const readResult = await window.electron.fileSystem.readFile(result.file.path)
                if (!readResult.success) continue

                let content = readResult.content

                const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
                const newContent = content.replace(regex, replaceQuery)

                if (content !== newContent) {
                    await window.electron.fileSystem.writeFile(result.file.path, newContent)
                }
            } catch (err) {
                console.error("Error replacing in file:", result.file.path, err)
            }
        }

        handleSearch(query)
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0e14] relative">
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-[2px] animate-fade-in">
                    <div className="bg-[#1e1e1e] border border-red-500/30 rounded-lg shadow-2xl w-full max-w-[90%] overflow-hidden transform scale-100 animate-scale-in">
                        <div className="bg-red-500/10 px-4 py-3 border-b border-red-500/20 flex items-center gap-3">
                            <div className="text-red-500">
                                <Icons.Warning />
                            </div>
                            <h3 className="text-sm font-bold text-red-400 tracking-wide">CONFIRM REPLACE</h3>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Are you sure you want to replace <span className="text-white font-bold">{results.reduce((acc, r) => acc + r.matches.length, 0)}</span> occurrences across <span className="text-white font-bold">{results.length}</span> files?
                            </p>
                            <p className="text-xs text-gray-500 mt-2">This action cannot be undone easily.</p>
                        </div>
                        <div className="px-4 py-3 bg-[#151515] flex justify-end gap-3 border-t border-white/5">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-3 py-1.5 rounded text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeReplaceAll}
                                className="px-3 py-1.5 rounded text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-[0_0_10px_rgba(220,38,38,0.3)] hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                            >
                                Replace All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 border-b border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Search</h2>
                    <div className="flex items-center gap-1">
                        <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Refresh">
                            <Icons.Refresh />
                        </button>
                        <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Collapse All">
                            <Icons.CollapseAll />
                        </button>
                        <button
                            onClick={() => setResults([])}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                            title="Clear Search Results"
                        >
                            <Icons.Close />
                        </button>
                    </div>
                </div>

                {/* Search Input Container */}
                <div className="relative group">
                    <div
                        className="absolute inset-y-0 left-0 pl-2 flex items-center cursor-pointer text-gray-500 hover:text-white z-10"
                        onClick={() => setShowReplace(!showReplace)}
                    >
                        {showReplace ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                    </div>
                    <div className="relative w-full">
                        <input
                            type="text"
                            className="w-full bg-[#1e1e1e] text-gray-300 border border-[#333] rounded-md py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all placeholder-gray-600"
                            placeholder="Search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Replace Input Container */}
                {showReplace && (
                    <div className="relative group animate-fade-in flex items-center gap-1">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-500">
                                <Icons.Replace />
                            </div>
                            <input
                                type="text"
                                className="w-full bg-[#1e1e1e] text-gray-300 border border-[#333] rounded-md py-1.5 pl-8 pr-8 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all placeholder-gray-600"
                                placeholder="Replace"
                                value={replaceQuery}
                                onChange={(e) => setReplaceQuery(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-1 flex items-center">
                                <button
                                    onClick={initiateReplaceAll}
                                    className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                    title="Replace All (Ctrl+Alt+Enter)"
                                >
                                    <Icons.ReplaceAll />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toggle Details Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className={`p-1 rounded hover:bg-white/10 ${showDetails ? 'text-accent-blue' : 'text-gray-500'}`}
                        title="Toggle Search Details"
                    >
                        <Icons.More />
                    </button>
                </div>

                {/* Advanced Search Details */}
                {showDetails && (
                    <div className="flex flex-col gap-2 animate-fade-in">
                        <div className="flex flex-col gap-1 relative">
                            <label className="text-[10px] text-gray-500 font-medium ml-1">files to include</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full bg-[#1e1e1e] text-gray-300 border border-[#333] rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all placeholder-gray-600"
                                    value={includeInput}
                                    onChange={(e) => handleInputChange(e, 'include')}
                                    onKeyDown={(e) => handleKeyDown(e, 'include')}
                                />
                                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500">
                                    <Icons.Book />
                                </div>
                            </div>
                            {/* Suggestions Dropdown for Include */}
                            {activeField === 'include' && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-[#252526] border border-[#333] rounded-md mt-1 z-50 shadow-xl max-h-40 overflow-y-auto">
                                    {suggestions.map(file => (
                                        <div
                                            key={file.id}
                                            className="px-3 py-1.5 text-xs text-gray-300 hover:bg-accent-blue hover:text-white cursor-pointer flex items-center gap-2"
                                            onClick={() => applySuggestion(file)}
                                        >
                                            <FileIcon filename={file.name} />
                                            <span className="truncate">{file.name}</span>
                                            <span className="text-[10px] text-gray-500 ml-auto truncate max-w-[100px] opacity-60">{file.path.split('/').slice(-2, -1)[0]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Selected Tags Display */}
                            <div className="flex flex-wrap gap-1 mt-1.5 px-1">
                                {includeTags.map((tag, i) => (
                                    <div key={i} className="flex items-center gap-1.5 bg-[#2a2d32] px-2 py-0.5 rounded-md text-[10px] text-gray-300 border border-white/10 group animate-fade-in">
                                        <FileIcon filename={tag} />
                                        <span className="max-w-[120px] truncate">{tag}</span>
                                        <button
                                            onClick={() => removeTag('include', tag)}
                                            className="hover:text-white text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Icons.Close />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 relative">
                            <label className="text-[10px] text-gray-500 font-medium ml-1">files to exclude</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full bg-[#1e1e1e] text-gray-300 border border-[#333] rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all placeholder-gray-600"
                                    value={excludeInput}
                                    onChange={(e) => handleInputChange(e, 'exclude')}
                                    onKeyDown={(e) => handleKeyDown(e, 'exclude')}
                                />
                                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500">
                                    <Icons.Exclude />
                                </div>
                            </div>
                            {/* Suggestions Dropdown for Exclude */}
                            {activeField === 'exclude' && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-[#252526] border border-[#333] rounded-md mt-1 z-50 shadow-xl max-h-40 overflow-y-auto">
                                    {suggestions.map(file => (
                                        <div
                                            key={file.id}
                                            className="px-3 py-1.5 text-xs text-gray-300 hover:bg-accent-blue hover:text-white cursor-pointer flex items-center gap-2"
                                            onClick={() => applySuggestion(file)}
                                        >
                                            <FileIcon filename={file.name} />
                                            <span className="truncate">{file.name}</span>
                                            <span className="text-[10px] text-gray-500 ml-auto truncate max-w-[100px] opacity-60">{file.path.split('/').slice(-2, -1)[0]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Selected Tags Display */}
                            <div className="flex flex-wrap gap-1 mt-1.5 px-1">
                                {excludeTags.map((tag, i) => (
                                    <div key={i} className="flex items-center gap-1.5 bg-[#2a2d32] px-2 py-0.5 rounded-md text-[10px] text-gray-300 border border-white/10 group animate-fade-in">
                                        <FileIcon filename={tag} />
                                        <span className="max-w-[120px] truncate">{tag}</span>
                                        <button
                                            onClick={() => removeTag('exclude', tag)}
                                            className="hover:text-white text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Icons.Close />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                {!files && (
                    <div className="text-center text-gray-500 text-xs mt-8">No folder open</div>
                )}

                {files && query && results.length === 0 && !isSearching && (
                    <div className="text-center text-gray-500 text-xs mt-4">No results found</div>
                )}

                {isSearching && results.length === 0 && (
                    <div className="text-center text-gray-500 text-xs mt-4 flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
                        Searching...
                    </div>
                )}

                {results.map(result => (
                    <div key={result.file.id} className="flex flex-col">
                        {/* File Header */}
                        <div
                            className="flex items-center gap-2 px-3 py-1 bg-white/5 border-b border-white/5 cursor-pointer hover:bg-white/10 group sticky top-0 z-10"
                            onClick={() => toggleFileExpand(result.file.id)}
                        >
                            <span className="text-gray-400">
                                {expandedFiles[result.file.id] ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                            </span>
                            <FileIcon filename={result.file.name} />
                            <span className="text-xs font-bold text-gray-300 truncate flex-1">{result.file.name}</span>
                            <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 rounded-full">{result.matches.length}</span>
                        </div>

                        {/* Matches */}
                        {expandedFiles[result.file.id] && (
                            <div className="flex flex-col">
                                {result.matches.map((match, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-2 pl-8 pr-2 py-1 hover:bg-white/5 cursor-pointer group border-b border-white/5 last:border-0 relative"
                                        onClick={() => onFileSelect(result.file, { line: match.line })}
                                    >
                                        <span className="text-xs text-gray-500 font-mono w-6 text-right flex-shrink-0">{match.line}:</span>
                                        <span className="text-xs text-gray-400 font-mono truncate flex-1">
                                            {match.content}
                                        </span>

                                        {showReplace && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleReplace(result.file, idx)
                                                }}
                                                className="opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-[#1e1e1e] border border-[#333] rounded hover:bg-accent-blue hover:text-white hover:border-accent-blue transition-all"
                                                title="Replace this occurrence"
                                            >
                                                <Icons.Replace />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
