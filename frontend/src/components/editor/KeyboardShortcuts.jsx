import { useState } from 'react'
import { VscSearch, VscKey, VscEdit } from 'react-icons/vsc'

const defaultKeybindings = [
    { command: 'Copy', keybinding: ['Ctrl', '+', 'C'], when: 'editorTextFocus', source: 'System' },
    { command: 'Cut', keybinding: ['Ctrl', '+', 'X'], when: 'editorTextFocus', source: 'System' },
    { command: 'Paste', keybinding: ['Ctrl', '+', 'V'], when: 'editorTextFocus', source: 'System' },
    { command: 'Undo', keybinding: ['Ctrl', '+', 'Z'], when: 'editorTextFocus', source: 'System' },
    { command: 'Redo', keybinding: ['Ctrl', '+', 'Y'], when: 'editorTextFocus', source: 'System' },
    { command: 'Save', keybinding: ['Ctrl', '+', 'S'], when: 'editorTextFocus', source: 'System' },
    { command: 'Save All', keybinding: ['Ctrl', '+', 'K', 'S'], when: '-', source: 'System' },
    { command: 'Find', keybinding: ['Ctrl', '+', 'F'], when: 'editorTextFocus', source: 'System' },
    { command: 'Replace', keybinding: ['Ctrl', '+', 'H'], when: 'editorTextFocus', source: 'System' },
    { command: 'Go to File...', keybinding: ['Ctrl', '+', 'P'], when: '-', source: 'System' },
    { command: 'Go to Line/Column...', keybinding: ['Ctrl', '+', 'G'], when: '-', source: 'System' },
    { command: 'Show All Commands', keybinding: ['Ctrl', '+', 'Shift', '+', 'P'], when: '-', source: 'System' },
    { command: 'Toggle Terminal', keybinding: ['Ctrl', '+', '`'], when: '-', source: 'System' },
    { command: 'New Terminal', keybinding: ['Ctrl', '+', 'Shift', '+', '`'], when: '-', source: 'System' },
    { command: 'Toggle Sidebar', keybinding: ['Ctrl', '+', 'B'], when: '-', source: 'System' },
    { command: 'Toggle Panel', keybinding: ['Ctrl', '+', 'J'], when: '-', source: 'System' },
    { command: 'Format Document', keybinding: ['Shift', '+', 'Alt', '+', 'F'], when: 'editorHasDocumentFormattingProvider', source: 'System' },
    { command: 'Format Selection', keybinding: ['Ctrl', '+', 'K', 'Ctrl', '+', 'F'], when: 'editorHasDocumentSelectionFormattingProvider', source: 'System' },
    { command: 'Go to Definition', keybinding: ['F12'], when: 'editorHasDefinitionProvider', source: 'System' },
    { command: 'Go to Definition', keybinding: ['Ctrl', '+', 'F12'], when: 'editorHasDefinitionProvider', source: 'System' },
    { command: 'Go to Bracket', keybinding: ['Ctrl', '+', 'Shift', '+', '\\'], when: 'editorTextFocus', source: 'System' },
    { command: 'Go Back', keybinding: ['Alt', '+', 'LeftArrow'], when: 'canNavigateBack', source: 'System' },
    { command: 'Go Forward', keybinding: ['Alt', '+', 'RightArrow'], when: 'canNavigateForward', source: 'System' },
    { command: 'Fold Level 5', keybinding: ['Ctrl', '+', 'K', 'Ctrl', '+', '5'], when: 'editorTextFocus && foldingEnabled', source: 'System' },
    { command: 'Fold Level 6', keybinding: ['Ctrl', '+', 'K', 'Ctrl', '+', '6'], when: 'editorTextFocus && foldingEnabled', source: 'System' },
    { command: 'Fold Level 7', keybinding: ['Ctrl', '+', 'K', 'Ctrl', '+', '7'], when: 'editorTextFocus && foldingEnabled', source: 'System' },
    { command: 'Fold Recursively', keybinding: ['Ctrl', '+', 'K', 'Ctrl', '+', '['], when: 'editorTextFocus && foldingEnabled', source: 'System' },
    { command: 'Git: Revert Selected Ranges', keybinding: ['Ctrl', '+', 'K', 'Ctrl', '+', 'R'], when: 'editorTextFocus && !editorReadonly', source: 'Git' },
    { command: 'Git: Stage Selected Ranges', keybinding: ['Ctrl', '+', 'K', 'Ctrl', '+', 'Alt', '+', 'S'], when: 'editorTextFocus && !editorReadonly', source: 'Git' },
    { command: 'Git: Unstage Selected Ranges', keybinding: ['Ctrl', '+', 'K', 'Ctrl', '+', 'N'], when: 'editorTextFocus && isInDiffEditor', source: 'Git' },
]

export default function KeyboardShortcuts({ onClose }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [keybindings] = useState(defaultKeybindings)

    const filteredKeybindings = keybindings.filter(kb =>
        kb.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kb.keybinding.join('').toLowerCase().includes(searchQuery.toLowerCase())
    )

    const KeybindingBadge = ({ keys }) => (
        <div className="flex items-center gap-1">
            {keys.map((key, idx) => (
                <span key={idx}>
                    {key === '+' ? (
                        <span className="text-gray-500 mx-0.5">+</span>
                    ) : (
                        <kbd className="px-2 py-0.5 bg-[#2a2d2e] border border-white/20 rounded text-xs font-mono text-gray-200">
                            {key}
                        </kbd>
                    )}
                </span>
            ))}
        </div>
    )

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e]">
            {/* Search Bar */}
            <div className="p-4 border-b border-white/10">
                <div className="relative">
                    <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Type to search in keybindings"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#2a2d2e] border border-blue-500/50 rounded pl-10 pr-4 py-2 text-sm text-gray-100 
                            placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button className="p-1 hover:bg-white/10 rounded transition-colors">
                            <VscKey className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-white/10 rounded transition-colors">
                            <VscEdit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-white/10 rounded transition-colors">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#252526] border-b border-white/10">
                        <tr>
                            <th className="text-left px-4 py-2 font-semibold text-gray-300">Command</th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-300">Keybinding</th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-300">When</th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-300">Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredKeybindings.map((kb, idx) => (
                            <tr
                                key={idx}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <td className="px-4 py-3 text-gray-200">{kb.command}</td>
                                <td className="px-4 py-3">
                                    <KeybindingBadge keys={kb.keybinding} />
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-xs font-mono">{kb.when}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs ${kb.source === 'Git' ? 'text-blue-400' : 'text-gray-400'}`}>
                                        {kb.source}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-white/10 text-xs text-gray-500 text-center">
                {filteredKeybindings.length} keybindings
            </div>
        </div>
    )
}
