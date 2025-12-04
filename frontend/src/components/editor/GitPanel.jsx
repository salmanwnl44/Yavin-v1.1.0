import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { formatDistanceToNow } from 'date-fns'

import {
    MdCheck, MdRefresh, MdMoreHoriz, MdAdd, MdUndo, MdInsertDriveFile, MdPerson, MdAccessTime, MdAutoAwesome
} from 'react-icons/md'
import {
    SiReact, SiJavascript, SiTypescript, SiCss3, SiHtml5, SiJson, SiPython, SiDocker, SiMarkdown, SiGit, SiGnubash
} from 'react-icons/si'
import { VscChevronRight, VscChevronDown } from 'react-icons/vsc'

const Icons = {
    Check: () => <MdCheck className="w-4 h-4" />,
    Refresh: () => <MdRefresh className="w-4 h-4" />,
    More: () => <MdMoreHoriz className="w-4 h-4" />,
    ChevronRight: () => <VscChevronRight className="w-3 h-3" />,
    ChevronDown: () => <VscChevronDown className="w-3 h-3" />,
    Plus: () => <MdAdd className="w-3.5 h-3.5" />,
    Undo: () => <MdUndo className="w-3.5 h-3.5" />,
    File: () => <MdInsertDriveFile className="w-3.5 h-3.5" />,
    Sparkles: () => <MdAutoAwesome className="w-3.5 h-3.5" />,
    User: () => <MdPerson className="w-3.5 h-3.5" />,
    Clock: () => <MdAccessTime className="w-3.5 h-3.5" />,
}

const getFileIcon = (filename) => {
    const lowerName = filename.toLowerCase()

    if (lowerName.endsWith('.jsx') || lowerName.endsWith('.tsx')) return <SiReact className="w-4 h-4 text-[#61DAFB]" />
    if (lowerName.endsWith('.js')) return <SiJavascript className="w-4 h-4 text-[#F7DF1E]" />
    if (lowerName.endsWith('.ts')) return <SiTypescript className="w-4 h-4 text-[#3178C6]" />
    if (lowerName.endsWith('.css')) return <SiCss3 className="w-4 h-4 text-[#1572B6]" />
    if (lowerName.endsWith('.html')) return <SiHtml5 className="w-4 h-4 text-[#E34F26]" />
    if (lowerName.endsWith('.json')) return <SiJson className="w-4 h-4 text-[#F7DF1E]" />
    if (lowerName.includes('docker')) return <SiDocker className="w-4 h-4 text-[#2496ED]" />
    if (lowerName.endsWith('.py')) return <SiPython className="w-4 h-4 text-[#3776AB]" />
    if (lowerName.endsWith('.md')) return <SiMarkdown className="w-4 h-4 text-[#000000] dark:text-white" />
    if (lowerName.startsWith('.git')) return <SiGit className="w-4 h-4 text-[#F05032]" />
    if (lowerName.endsWith('.sh')) return <SiGnubash className="w-4 h-4 text-[#4EAA25]" />

    return <MdInsertDriveFile className="w-4 h-4 text-gray-500" />
}

const FileIcon = ({ filename, className = "w-4 h-4" }) => {
    return (
        <span className={className}>
            {getFileIcon(filename)}
        </span>
    )
}

const CommitTooltip = ({ commit, details, position, remoteUrl, onMouseEnter, onMouseLeave }) => {
    if (!commit || !position) return null;

    const handleProfileClick = () => {
        // Assuming GitHub profile URL structure if remote is GitHub
        // If remoteUrl is like https://github.com/user/repo, profile is https://github.com/author
        // This is a best-effort guess.
        if (remoteUrl && remoteUrl.includes('github.com')) {
            // Try to extract base URL
            const baseUrl = 'https://github.com';
            // We don't have the author's username, just name.
            // But we can try to search or just open the commits by this author in the repo
            // Better: Open the commit on GitHub, user can click profile there.
            // Or if we want to be fancy, we can try to construct it.
            // For now, let's just open the commit URL which contains the author info.
        }
    }

    const handleOpenOnGitHub = () => {
        if (remoteUrl) {
            // Convert git@github.com:user/repo.git to https://github.com/user/repo
            let url = remoteUrl.replace('git@github.com:', 'https://github.com/').replace('.git', '');
            // Append commit hash
            url = `${url}/commit/${commit.id}`;
            window.electron.shell.openExternal(url);
        }
    }

    return createPortal(
        <div
            className="fixed z-[9999] bg-[#1e1e1e]/20 backdrop-blur-md border border-[#333] rounded-lg shadow-2xl p-3 w-80 text-gray-300 text-xs"
            style={{ top: position.y, left: position.x }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="flex items-center gap-2 mb-2 text-gray-400">
                <div className="flex items-center gap-1 cursor-pointer text-red-400 hover:text-red-300 transition-colors" title="Author">
                    <Icons.User />
                    <span className="font-medium">{commit.author}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                    <Icons.Clock />
                    <span>{formatDistanceToNow(new Date(commit.date), { addSuffix: true })}</span>
                </div>
            </div>

            <div className="mb-3 font-medium text-gray-200 whitespace-pre-wrap select-text">
                {commit.msg}
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-1">
                {!details ? (
                    <div className="text-gray-500 italic">Loading stats...</div>
                ) : details.error ? (
                    <div className="text-red-400">Failed to load stats</div>
                ) : (
                    <>
                        {details.stats && (
                            <div className="flex flex-wrap gap-1">
                                {details.stats.split(', ').map((part, i, arr) => {
                                    let className = "text-gray-400";
                                    if (part.includes('changed')) className = "text-yellow-400";
                                    if (part.includes('insertion')) className = "text-green-400";
                                    if (part.includes('deletion')) className = "text-red-400";

                                    return (
                                        <span key={i} className={className}>
                                            {part}{i < arr.length - 1 ? ', ' : ''}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                            <span
                                className="font-mono text-blue-400 bg-blue-400/10 px-1 rounded cursor-pointer hover:bg-blue-400/20 transition-colors"
                                title="Copy Hash"
                                onClick={() => navigator.clipboard.writeText(commit.id)}
                            >
                                {commit.id.substring(0, 7)}
                            </span>
                            {remoteUrl && (
                                <span
                                    className="text-blue-400 cursor-pointer hover:underline"
                                    onClick={handleOpenOnGitHub}
                                >
                                    Open on GitHub
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    )
}

export default function GitPanel({ rootPath }) {
    const [message, setMessage] = useState('')
    const [expanded, setExpanded] = useState(true)
    const [changes, setChanges] = useState([])
    const [commits, setCommits] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [remoteUrl, setRemoteUrl] = useState(null)

    // Tooltip state
    const [hoveredCommit, setHoveredCommit] = useState(null)
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
    const [commitDetails, setCommitDetails] = useState({}) // Cache details by hash
    const hoverTimeoutRef = useRef(null)

    const fetchData = async () => {
        if (!rootPath || !window.electron?.git) return

        setIsLoading(true)
        setError(null)
        try {
            const status = await window.electron.git.status(rootPath)
            if (status.isRepo) {
                const formattedChanges = status.files.map((f, i) => ({
                    id: i,
                    file: f.path.split('/').pop(),
                    path: f.path,
                    status: f.working_dir === '?' ? 'U' : f.working_dir || f.index
                }))
                setChanges(formattedChanges)

                const log = await window.electron.git.log(rootPath)
                setCommits(log.map((c, i) => ({
                    id: c.hash,
                    msg: c.message,
                    author: c.author_name,
                    date: c.date,
                    active: i === 0 // Assume first is HEAD
                })))

                // Fetch remote URL
                const remote = await window.electron.git.getRemote(rootPath)
                setRemoteUrl(remote)
            } else {
                setError("Not a git repository")
                setChanges([])
                setCommits([])
            }
        } catch (err) {
            console.error("Git fetch error:", err)
            setError(`Failed to load git data: ${err.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 10000) // Auto refresh every 10s
        return () => clearInterval(interval)
    }, [rootPath])

    const handleCommit = async () => {
        if (!message.trim() || !rootPath) return

        try {
            await window.electron.git.commit(rootPath, message)
            setMessage('')
            fetchData()
        } catch (err) {
            console.error("Commit error:", err)
            alert("Failed to commit")
        }
    }

    const handleMouseEnter = async (e, commit) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }

        const rect = e.currentTarget.getBoundingClientRect()
        setTooltipPosition({ x: rect.right + 10, y: rect.top })
        setHoveredCommit(commit)

        if (!commitDetails[commit.id]) {
            try {
                const details = await window.electron.git.getCommitDetails(rootPath, commit.id)
                setCommitDetails(prev => ({ ...prev, [commit.id]: details }))
            } catch (err) {
                console.error("Failed to fetch commit details:", err)
            }
        }
    }

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredCommit(null)
        }, 300) // 300ms delay to allow moving to tooltip
    }

    const handleTooltipMouseEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
    }

    const handleTooltipMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredCommit(null)
        }, 300)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'M': return 'text-orange-400'
            case 'U': return 'text-green-400'
            case 'D': return 'text-red-400'
            case 'A': return 'text-green-400'
            default: return 'text-gray-400'
        }
    }

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#0a0e14] text-gray-500 p-4 text-center">
                <p className="mb-2">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0e14] text-gray-300 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Source Control</span>
                <div className="flex items-center gap-1">
                    <button
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                        title="Refresh"
                        onClick={fetchData}
                    >
                        <Icons.Refresh />
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="View as Tree">
                        <Icons.More />
                    </button>
                </div>
            </div>

            {/* Commit Section */}
            <div className="p-4 flex flex-col gap-3">
                <div className="relative">
                    <input
                        type="text"
                        className="w-full bg-[#1e1e1e] text-gray-300 border border-[#333] rounded-md py-1.5 pl-3 pr-24 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder-gray-600"
                        placeholder="Message (Ctrl+Enter to commit)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleCommit()}
                    />
                    <button className="absolute right-1 top-1 bottom-1 px-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded flex items-center gap-1 transition-colors">
                        Generate <Icons.Sparkles />
                    </button>
                </div>

                <button
                    onClick={handleCommit}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                >
                    <Icons.Check /> Commit
                </button>
            </div>

            {/* Changes List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div
                    className="flex items-center justify-between px-2 py-1 hover:bg-white/5 cursor-pointer group"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500">
                            {expanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Changes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 rounded-full">{changes.length}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-white/10 rounded" title="Discard All Changes">
                                <Icons.Undo />
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded" title="Stage All Changes">
                                <Icons.Plus />
                            </button>
                        </div>
                    </div>
                </div>

                {expanded && (
                    <div className="flex flex-col mt-1">
                        {changes.map(change => (
                            <div key={change.id} className="flex items-center gap-2 px-4 py-1 hover:bg-white/5 cursor-pointer group relative">
                                <FileIcon filename={change.file} />
                                <div className="flex-1 min-w-0 flex items-baseline gap-2">
                                    <span className={`text-sm truncate ${change.status === 'M' ? 'text-orange-300' : 'text-green-300'}`}>{change.file}</span>
                                    <span className="text-[10px] text-gray-600 truncate opacity-50">{change.path}</span>
                                </div>
                                <span className={`text-[10px] font-bold w-4 text-center ${getStatusColor(change.status)}`}>
                                    {change.status}
                                </span>

                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 bg-[#0a0e14] pl-2">
                                    <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                        <Icons.Undo />
                                    </button>
                                    <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                        <Icons.Plus />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {changes.length === 0 && (
                            <div className="px-8 py-2 text-xs text-gray-600 italic">No changes</div>
                        )}
                    </div>
                )}
            </div>

            {/* Graph Section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-white/5 mt-2">
                <div className="flex items-center justify-between px-2 py-1 bg-[#0a0e14] sticky top-0 z-10">
                    <div className="flex items-center gap-1">
                        <Icons.ChevronDown />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Graph</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-[10px] hover:text-white cursor-pointer">Auto</span>
                        <Icons.More />
                    </div>
                </div>

                <div className="flex flex-col px-4 py-2 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[21px] top-4 bottom-4 w-[1px] bg-blue-500/30"></div>

                    {/* Commits */}
                    {commits.map((commit, idx) => (
                        <div
                            key={commit.id}
                            className="flex items-center gap-3 py-1 relative z-0 group cursor-pointer"
                            onMouseEnter={(e) => handleMouseEnter(e, commit)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {/* Dot */}
                            <div className={`w-2.5 h-2.5 rounded-full border-2 ${commit.active ? 'bg-[#0a0e14] border-blue-500 w-3 h-3 -ml-[1px]' : 'bg-blue-500 border-blue-500'} z-10`}></div>

                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                <span className={`text-xs truncate ${commit.active ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                    {commit.msg}
                                </span>
                                {commit.author && (
                                    <span className="text-[10px] text-gray-600 truncate">{commit.author}</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {commits.length === 0 && (
                        <div className="px-4 py-2 text-xs text-gray-600 italic">No commits found</div>
                    )}
                </div>
            </div>

            {/* Tooltip Portal */}
            {hoveredCommit && (
                <CommitTooltip
                    commit={hoveredCommit}
                    details={commitDetails[hoveredCommit.id]}
                    position={tooltipPosition}
                    remoteUrl={remoteUrl}
                    onMouseEnter={handleTooltipMouseEnter}
                    onMouseLeave={handleTooltipMouseLeave}
                />
            )}
        </div>
    )
}
