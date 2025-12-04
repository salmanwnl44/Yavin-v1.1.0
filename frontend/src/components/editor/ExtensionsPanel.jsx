import { useState, useEffect } from 'react'
import { MdSearch, MdCloudDownload, MdStar, MdVerified, MdDelete, MdCheckCircle, MdError } from 'react-icons/md'
import { VscExtensions } from 'react-icons/vsc'

export default function ExtensionsPanel() {
    const [activeTab, setActiveTab] = useState('marketplace') // 'marketplace' | 'installed'
    const [query, setQuery] = useState('')
    const [extensions, setExtensions] = useState([])
    const [installedExtensions, setInstalledExtensions] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [installing, setInstalling] = useState({}) // { extensionId: boolean }
    const [notification, setNotification] = useState(null) // { type: 'success' | 'error', message: string }
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, extensionId: null, extensionName: '' })
    const [installModal, setInstallModal] = useState({ isOpen: false, status: 'idle', extensionName: '', message: '' }) // status: 'installing' | 'success' | 'error'

    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }

    const fetchInstalledExtensions = async () => {
        if (window.electron?.extensions) {
            try {
                const installed = await window.electron.extensions.list()
                setInstalledExtensions(installed)
            } catch (err) {
                console.error('Failed to fetch installed extensions:', err)
            }
        }
    }

    const searchExtensions = async (searchQuery) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`https://open-vsx.org/api/-/search?query=${encodeURIComponent(searchQuery)}&size=20`)
            if (!response.ok) throw new Error('Failed to fetch extensions')
            const data = await response.json()
            setExtensions(data.extensions || [])
        } catch (err) {
            console.error('Extension search error:', err)
            setError('Failed to search extensions. Please check your connection.')
        } finally {
            setIsLoading(false)
        }
    }

    // Initial load
    useEffect(() => {
        searchExtensions('python')
        fetchInstalledExtensions()
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (activeTab === 'marketplace') {
            searchExtensions(query)
        }
    }

    const handleInstall = async (ext) => {
        if (!window.electron?.extensions) {
            showNotification('error', 'Extension installation is only available in the desktop app.')
            return;
        }

        const vsixUrl = ext.files?.download;
        if (!vsixUrl) {
            showNotification('error', 'Download URL not found for this extension.')
            return;
        }

        const extName = ext.displayName || ext.name;
        setInstallModal({ isOpen: true, status: 'installing', extensionName: extName, message: 'Downloading and installing...' });

        try {
            const result = await window.electron.extensions.install(vsixUrl);
            if (result.success) {
                setInstallModal({ isOpen: true, status: 'success', extensionName: extName, message: 'Extension installed successfully!' });
                fetchInstalledExtensions() // Refresh installed list

                // Auto close success modal after 2 seconds
                setTimeout(() => {
                    setInstallModal(prev => prev.status === 'success' ? { ...prev, isOpen: false } : prev);
                }, 2000);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Install failed:', err);
            setInstallModal({ isOpen: true, status: 'error', extensionName: extName, message: err.message || 'Failed to install extension.' });
        }
    }

    const initiateUninstall = (ext) => {
        setConfirmModal({
            isOpen: true,
            extensionId: ext.id,
            extensionName: ext.manifest.displayName || ext.manifest.name
        })
    }

    const confirmUninstall = async () => {
        const id = confirmModal.extensionId;
        setConfirmModal({ isOpen: false, extensionId: null, extensionName: '' });

        if (!window.electron?.extensions) return

        try {
            const success = await window.electron.extensions.uninstall(id)
            if (success) {
                showNotification('success', 'Extension uninstalled successfully.')
                fetchInstalledExtensions()
            } else {
                showNotification('error', 'Failed to uninstall extension.')
            }
        } catch (err) {
            showNotification('error', `Error uninstalling: ${err.message}`)
        }
    }

    const closeInstallModal = () => {
        if (installModal.status === 'installing') return; // Prevent closing while installing
        setInstallModal({ isOpen: false, status: 'idle', extensionName: '', message: '' });
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0e14] text-gray-300 relative">
            {/* Notification Toast */}
            {notification && (
                <div className={`absolute top-4 left-4 right-4 z-50 p-3 rounded-lg shadow-xl border flex items-center gap-2 text-xs animate-fade-in ${notification.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {notification.type === 'success' ? <MdCheckCircle className="w-4 h-4" /> : <MdError className="w-4 h-4" />}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Confirmation Modal (Uninstall) */}
            {confirmModal.isOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl p-5 w-64 transform scale-100 animate-scale-in">
                        <h3 className="text-sm font-semibold text-white mb-2">Uninstall Extension</h3>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                            Are you sure you want to uninstall <span className="text-blue-400 font-medium">{confirmModal.extensionName}</span>?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, extensionId: null, extensionName: '' })}
                                className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmUninstall}
                                className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded transition-all shadow-sm"
                            >
                                Uninstall
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Installation Modal */}
            {installModal.isOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl p-6 w-72 transform scale-100 animate-scale-in flex flex-col items-center text-center">

                        {installModal.status === 'installing' && (
                            <>
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <h3 className="text-sm font-semibold text-white mb-1">Installing...</h3>
                                <p className="text-xs text-gray-400">{installModal.extensionName}</p>
                            </>
                        )}

                        {installModal.status === 'success' && (
                            <>
                                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4 animate-scale-in">
                                    <MdCheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-1">Installed!</h3>
                                <p className="text-xs text-gray-400">{installModal.extensionName} is ready to use.</p>
                            </>
                        )}

                        {installModal.status === 'error' && (
                            <>
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-scale-in">
                                    <MdError className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-1">Installation Failed</h3>
                                <p className="text-xs text-red-400 mb-4">{installModal.message}</p>
                                <button
                                    onClick={closeInstallModal}
                                    className="px-4 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 text-white rounded transition-colors"
                                >
                                    Close
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    <VscExtensions className="w-4 h-4" />
                    <span>Extensions</span>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-3 bg-[#1e1e1e] p-1 rounded-md">
                    <button
                        className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${activeTab === 'marketplace' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => setActiveTab('marketplace')}
                    >
                        Marketplace
                    </button>
                    <button
                        className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${activeTab === 'installed' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => setActiveTab('installed')}
                    >
                        Installed
                    </button>
                </div>

                {activeTab === 'marketplace' && (
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            className="w-full bg-[#1e1e1e] text-gray-300 border border-[#333] rounded-md py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600"
                            placeholder="Search extensions..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <MdSearch className="absolute left-2.5 top-2 text-gray-500 w-4 h-4" />
                    </form>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {activeTab === 'marketplace' ? (
                    isLoading ? (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-500 gap-2">
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs">Searching Open VSX...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-xs text-center p-4">{error}</div>
                    ) : extensions.length === 0 ? (
                        <div className="text-gray-500 text-xs text-center p-4">No extensions found.</div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {extensions.map(ext => {
                                const extId = `${ext.namespace}.${ext.name}`;
                                const isInstalling = installing[extId];
                                const isInstalled = installedExtensions.some(e => e.id.includes(ext.name)); // Simple check

                                return (
                                    <div key={extId} className="flex gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors">
                                        {/* Icon */}
                                        <div className="w-10 h-10 min-w-[40px] bg-[#1e1e1e] rounded flex items-center justify-center overflow-hidden border border-white/5">
                                            {ext.files?.icon ? (
                                                <img src={ext.files.icon} alt={ext.displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                <VscExtensions className="w-6 h-6 text-gray-600" />
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm text-gray-200 truncate pr-2" title={ext.displayName}>
                                                    {ext.displayName || ext.name}
                                                </span>
                                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                                                    {ext.version}
                                                </span>
                                            </div>

                                            <p className="text-[11px] text-gray-500 truncate" title={ext.description}>
                                                {ext.description}
                                            </p>

                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-600">
                                                <span className="flex items-center gap-1 hover:text-gray-400">
                                                    <MdVerified className="text-blue-400" /> {ext.namespace}
                                                </span>
                                                <span className="flex items-center gap-0.5">
                                                    <MdCloudDownload /> {formatDownloads(ext.downloadCount)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Install Button (Hover) */}
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isInstalled ? (
                                                <span className="text-xs text-green-400 font-medium px-2">Installed</span>
                                            ) : (
                                                <button
                                                    className={`p-1.5 rounded shadow-lg transition-colors ${isInstalling ? 'bg-gray-600 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                                                    title="Install Extension"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!isInstalling) handleInstall(ext);
                                                    }}
                                                    disabled={isInstalling}
                                                >
                                                    {isInstalling ? (
                                                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                                    ) : (
                                                        <MdCloudDownload className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                ) : (
                    // Installed Tab
                    installedExtensions.length === 0 ? (
                        <div className="text-gray-500 text-xs text-center p-4">No extensions installed.</div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {installedExtensions.map(ext => (
                                <div key={ext.id} className="flex gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors">
                                    {/* Icon Placeholder */}
                                    <div className="w-10 h-10 min-w-[40px] bg-[#1e1e1e] rounded flex items-center justify-center overflow-hidden border border-white/5">
                                        <VscExtensions className="w-6 h-6 text-gray-600" />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm text-gray-200 truncate pr-2" title={ext.manifest.displayName}>
                                                {ext.manifest.displayName || ext.manifest.name}
                                            </span>
                                            <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600">
                                                {ext.manifest.version}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-gray-500 truncate" title={ext.manifest.description}>
                                            {ext.manifest.description}
                                        </p>

                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600">
                                            <span>{ext.manifest.publisher}</span>
                                        </div>
                                    </div>

                                    {/* Uninstall Button (Hover) */}
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="p-1.5 bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 rounded shadow-lg transition-colors"
                                            title="Uninstall Extension"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                initiateUninstall(ext);
                                            }}
                                        >
                                            <MdDelete className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            <div className="px-4 py-2 border-t border-white/5 text-[10px] text-gray-600 text-center">
                Powered by <a href="https://open-vsx.org" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Open VSX Registry</a>
            </div>
        </div>
    )
}

function formatDownloads(count) {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
}
