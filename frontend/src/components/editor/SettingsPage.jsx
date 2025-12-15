import { useState } from 'react'
import { useSettings, terminalThemes, editorThemes } from '../../contexts/SettingsContext'
import {
    VscChevronDown, VscChevronRight, VscSearch, VscEdit, VscTerminal, VscSourceControl,
    VscSymbolColor, VscFiles, VscKey, VscExtensions, VscSettingsGear, VscListFilter
} from 'react-icons/vsc'

const categories = [
    { id: 'commonly-used', label: 'Commonly Used', icon: VscSettingsGear },
    {
        id: 'text-editor', label: 'Text Editor', icon: VscEdit, children: [
            { id: 'cursor', label: 'Cursor' },
            { id: 'find', label: 'Find' },
            { id: 'font', label: 'Font' },
            { id: 'formatting', label: 'Formatting' },
            { id: 'diff-editor', label: 'Diff Editor' },
            { id: 'multi-file-diff', label: 'Multi-File Diff Editor' },
            { id: 'minimap', label: 'Minimap' },
            { id: 'suggestions', label: 'Suggestions' },
            { id: 'files', label: 'Files' }
        ]
    },
    {
        id: 'workbench', label: 'Workbench', icon: VscSymbolColor, children: [
            { id: 'appearance', label: 'Appearance' },
            { id: 'breadcrumbs', label: 'Breadcrumbs' },
            { id: 'editor-management', label: 'Editor Management' },
            { id: 'settings-editor', label: 'Settings Editor' },
            { id: 'zen-mode', label: 'Zen Mode' },
            { id: 'screencast-mode', label: 'Screencast Mode' }
        ]
    },
    { id: 'window', label: 'Window', icon: VscFiles },
    { id: 'terminal', label: 'Terminal', icon: VscTerminal },
    { id: 'features', label: 'Features', icon: VscKey },
    { id: 'application', label: 'Application', icon: VscExtensions },
    { id: 'security', label: 'Security', icon: VscSourceControl },
    { id: 'extensions', label: 'Extensions', icon: VscExtensions }
]

export default function SettingsPage({ onClose }) {
    const { settings, updateSettings, resetCategory } = useSettings()
    const [activeTab, setActiveTab] = useState('user')
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedCategories, setExpandedCategories] = useState(['text-editor'])
    const [selectedCategory, setSelectedCategory] = useState('text-editor')

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        )
    }

    const SettingRow = ({ label, description, children, isCheckbox = false }) => (
        <div className="py-4 border-b border-[#2b2b2b] last:border-0">
            <div className="flex items-start justify-between gap-8">
                <div className="flex-1">
                    <div className="text-sm text-gray-200 mb-1">{label}</div>
                    {description && <div className="text-xs text-gray-500 leading-relaxed">{description}</div>}
                </div>
                <div className="flex-shrink-0">
                    {children}
                </div>
            </div>
            {isCheckbox && (
                <div className="mt-2 flex items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    )

    const Input = ({ type = "text", value, onChange, className = "", placeholder = "", ...props }) => (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`bg-[#3c3c3c] border border-[#3c3c3c] rounded px-2 py-1 text-sm text-gray-200 
                focus:outline-none focus:border-[#007acc] transition-colors min-w-[80px] ${className}`}
            {...props}
        />
    )

    const Select = ({ value, onChange, children, className = "" }) => (
        <select
            value={value}
            onChange={onChange}
            className={`bg-[#3c3c3c] border border-[#3c3c3c] rounded px-2 py-1 text-sm text-gray-200 
                focus:outline-none focus:border-[#007acc] transition-colors cursor-pointer ${className}`}
        >
            {children}
        </select>
    )

    const Checkbox = ({ checked, onChange, label }) => (
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 rounded border-gray-600 bg-[#3c3c3c] text-[#007acc] focus:ring-[#007acc] focus:ring-offset-0 cursor-pointer"
            />
            {label && <span className="text-sm text-gray-300">{label}</span>}
        </label>
    )

    const CommonlyUsedPanel = () => (
        <div className="space-y-0">
            <SettingRow
                label="Font Family"
                description="The font family used in the editor"
            >
                <Input
                    value={settings.editor.fontFamily}
                    onChange={(e) => updateSettings('editor', 'fontFamily', e.target.value)}
                    className="w-80"
                />
            </SettingRow>

            <SettingRow
                label="Font Size"
                description="Controls the font size in pixels"
            >
                <Input
                    type="number"
                    value={settings.editor.fontSize}
                    onChange={(e) => updateSettings('editor', 'fontSize', parseInt(e.target.value))}
                    className="w-20"
                />
            </SettingRow>

            <SettingRow
                label="Tab Size"
                description="The number of spaces a tab is equal to"
            >
                <Input
                    type="number"
                    value={settings.editor.tabSize}
                    onChange={(e) => updateSettings('editor', 'tabSize', parseInt(e.target.value))}
                    className="w-20"
                />
            </SettingRow>

            <SettingRow
                label="Word Wrap"
                description="Controls how lines should wrap"
            >
                <Select
                    value={settings.editor.wordWrap}
                    onChange={(e) => updateSettings('editor', 'wordWrap', e.target.value)}
                    className="w-48"
                >
                    <option value="off">off</option>
                    <option value="on">on</option>
                    <option value="wordWrapColumn">wordWrapColumn</option>
                    <option value="bounded">bounded</option>
                </Select>
            </SettingRow>

            <SettingRow
                label="Auto Save"
                description="Controls auto save of dirty files"
            >
                <Select
                    value={settings.files.autoSave}
                    onChange={(e) => updateSettings('files', 'autoSave', e.target.value)}
                    className="w-48"
                >
                    <option value="off">off</option>
                    <option value="afterDelay">afterDelay</option>
                    <option value="onFocusChange">onFocusChange</option>
                    <option value="onWindowChange">onWindowChange</option>
                </Select>
            </SettingRow>

            <SettingRow
                label="Format On Save"
                description="Format a file on save"
            >
                <Checkbox
                    checked={settings.editor.formatOnSave}
                    onChange={(e) => updateSettings('editor', 'formatOnSave', e.target.checked)}
                />
            </SettingRow>
        </div>
    )

    const TextEditorPanel = () => (
        <div className="space-y-0">
            <SettingRow
                label="Editor Theme"
                description="Controls the color theme of the editor."
            >
                <Select
                    value={settings.editor.theme}
                    onChange={(e) => updateSettings('editor', 'theme', e.target.value)}
                    className="w-48"
                >
                    {Object.entries(editorThemes).map(([key, theme]) => (
                        <option key={key} value={key}>{theme.name}</option>
                    ))}
                </Select>
            </SettingRow>

            <SettingRow
                label="Italic Comments"
                description="Controls whether comments should be displayed in italics."
            >
                <Checkbox
                    checked={settings.editor.italicComments}
                    onChange={(e) => updateSettings('editor', 'italicComments', e.target.checked)}
                />
            </SettingRow>

            <SettingRow
                label="Accessibility Page Size"
                description="Controls the number of lines in the editor that can be read out by a screen reader at once. When we detect a screen reader we automatically set the default to be 500. Warning: this has a performance implication for numbers larger than the default."
            >
                <Input
                    type="number"
                    value={500}
                    className="w-20"
                />
            </SettingRow>

            <SettingRow
                label="Accessibility Support"
                description="Controls if the UI should run in a mode where it is optimized for screen readers."
            >
                <Select
                    className="w-48"
                    value={settings.editor.accessibilitySupport || 'auto'}
                    onChange={(e) => updateSettings('editor', 'accessibilitySupport', e.target.value)}
                >
                    <option value="auto">auto</option>
                    <option value="on">on</option>
                    <option value="off">off</option>
                </Select>
            </SettingRow>

            <SettingRow
                label="Allow Variable Fonts"
                description="Controls whether to allow using variable fonts in the editor."
            >
                <Checkbox
                    checked={settings.editor.variableFonts !== false}
                    onChange={(e) => updateSettings('editor', 'variableFonts', e.target.checked)}
                />
            </SettingRow>

            <SettingRow
                label="Allow Variable Fonts In Accessibility Mode"
                description="Controls whether to allow using variable fonts in the editor in the accessibility mode."
            >
                <Checkbox
                    checked={settings.editor.variableFontsInAccessibility || false}
                    onChange={(e) => updateSettings('editor', 'variableFontsInAccessibility', e.target.checked)}
                />
            </SettingRow>

            <SettingRow
                label="Allow Variable Line Heights"
                description="Controls whether to allow using variable line heights in the editor."
            >
                <Checkbox
                    checked={settings.editor.variableLineHeights !== false}
                    onChange={(e) => updateSettings('editor', 'variableLineHeights', e.target.checked)}
                />
            </SettingRow>

            <SettingRow
                label="Font Family"
                description="The font family used in the editor"
            >
                <Input
                    value={settings.editor.fontFamily}
                    onChange={(e) => updateSettings('editor', 'fontFamily', e.target.value)}
                    className="w-80"
                />
            </SettingRow>

            <SettingRow
                label="Font Size"
                description="Controls the font size in pixels"
            >
                <Input
                    type="number"
                    value={settings.editor.fontSize}
                    onChange={(e) => updateSettings('editor', 'fontSize', parseInt(e.target.value))}
                    className="w-20"
                />
            </SettingRow>

            <SettingRow
                label="Line Numbers"
                description="Controls the display of line numbers"
            >
                <Select
                    value={settings.editor.lineNumbers ? 'on' : 'off'}
                    onChange={(e) => updateSettings('editor', 'lineNumbers', e.target.value === 'on')}
                    className="w-48"
                >
                    <option value="on">on</option>
                    <option value="off">off</option>
                    <option value="relative">relative</option>
                    <option value="interval">interval</option>
                </Select>
            </SettingRow>

            <SettingRow
                label="Minimap Enabled"
                description="Controls whether the minimap is shown"
            >
                <Checkbox
                    checked={settings.editor.minimap}
                    onChange={(e) => updateSettings('editor', 'minimap', e.target.checked)}
                />
            </SettingRow>

            <SettingRow
                label="Tab Size"
                description="The number of spaces a tab is equal to"
            >
                <Input
                    type="number"
                    value={settings.editor.tabSize}
                    onChange={(e) => updateSettings('editor', 'tabSize', parseInt(e.target.value))}
                    className="w-20"
                />
            </SettingRow>

            <SettingRow
                label="Word Wrap"
                description="Controls how lines should wrap"
            >
                <Select
                    value={settings.editor.wordWrap}
                    onChange={(e) => updateSettings('editor', 'wordWrap', e.target.value)}
                    className="w-48"
                >
                    <option value="off">off</option>
                    <option value="on">on</option>
                    <option value="wordWrapColumn">wordWrapColumn</option>
                    <option value="bounded">bounded</option>
                </Select>
            </SettingRow>
        </div>
    )

    const TerminalPanel = () => (
        <div className="space-y-0">
            <SettingRow
                label="Terminal Theme"
                description="Controls the color theme of the terminal."
            >
                <Select
                    value={settings.terminal.theme || 'default'}
                    onChange={(e) => updateSettings('terminal', 'theme', e.target.value)}
                    className="w-48"
                >
                    {Object.entries(terminalThemes).map(([key, theme]) => (
                        <option key={key} value={key}>{theme.name}</option>
                    ))}
                </Select>
            </SettingRow>

            <SettingRow
                label="Font Family"
                description="Controls the font family of the terminal."
            >
                <Input
                    value={settings.terminal.fontFamily}
                    onChange={(e) => updateSettings('terminal', 'fontFamily', e.target.value)}
                    className="w-80"
                />
            </SettingRow>

            <SettingRow
                label="Font Size"
                description="Controls the font size in pixels of the terminal."
            >
                <Input
                    type="number"
                    value={settings.terminal.fontSize}
                    onChange={(e) => updateSettings('terminal', 'fontSize', parseInt(e.target.value))}
                    className="w-20"
                />
            </SettingRow>

            <SettingRow
                label="Cursor Style"
                description="Controls the cursor style of the terminal."
            >
                <Select
                    value={settings.terminal.cursorStyle}
                    onChange={(e) => updateSettings('terminal', 'cursorStyle', e.target.value)}
                    className="w-48"
                >
                    <option value="block">block</option>
                    <option value="underline">underline</option>
                    <option value="bar">bar</option>
                </Select>
            </SettingRow>

            <SettingRow
                label="Cursor Blinking"
                description="Controls whether the cursor blinks."
            >
                <Checkbox
                    checked={settings.terminal.cursorBlink}
                    onChange={(e) => updateSettings('terminal', 'cursorBlink', e.target.checked)}
                />
            </SettingRow>
        </div>
    )

    const renderPanel = () => {
        if (selectedCategory === 'commonly-used') {
            return <CommonlyUsedPanel />
        } else if (selectedCategory === 'text-editor') {
            return <TextEditorPanel />
        } else if (selectedCategory === 'terminal') {
            return <TerminalPanel />
        }
        return <CommonlyUsedPanel />
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0e14]">
            {/* Header with Search */}
            <div className="border-b border-[#2b2b2b]">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2b2b2b]">
                    <div className="flex items-center gap-2 mr-4">
                        <VscSettingsGear className="text-gray-400 text-lg" />
                        <span className="text-sm font-medium text-gray-300">Settings</span>
                    </div>
                    <VscSearch className="text-gray-500 text-lg" />
                    <input
                        type="text"
                        placeholder="Search settings"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none"
                    />
                    <VscListFilter className="text-gray-500 text-lg cursor-pointer hover:text-gray-300" />
                </div>

                {/* Tabs */}
                <div className="flex gap-4 px-4">
                    <button
                        onClick={() => setActiveTab('user')}
                        className={`px-1 py-2 text-sm transition-colors border-b-2 ${activeTab === 'user'
                            ? 'text-white border-[#007acc]'
                            : 'text-gray-400 border-transparent hover:text-gray-200'
                            }`}
                    >
                        User
                    </button>
                    <button
                        onClick={() => setActiveTab('workspace')}
                        className={`px-1 py-2 text-sm transition-colors border-b-2 ${activeTab === 'workspace'
                            ? 'text-white border-[#007acc]'
                            : 'text-gray-400 border-transparent hover:text-gray-200'
                            }`}
                    >
                        Workspace
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-[#0a0e14] border-r border-[#2b2b2b] overflow-y-auto">
                    <div className="py-2">
                        {categories.map(cat => {
                            const Icon = cat.icon
                            const isExpanded = expandedCategories.includes(cat.id)
                            const hasChildren = cat.children && cat.children.length > 0

                            return (
                                <div key={cat.id}>
                                    <button
                                        onClick={() => {
                                            if (hasChildren) {
                                                toggleCategory(cat.id)
                                            }
                                            setSelectedCategory(cat.id)
                                        }}
                                        className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${selectedCategory === cat.id
                                            ? 'bg-[#37373d] text-white'
                                            : 'text-gray-400 hover:bg-[#2a2d2e]'
                                            }`}
                                    >
                                        {hasChildren && (
                                            isExpanded ?
                                                <VscChevronDown className="w-3 h-3" /> :
                                                <VscChevronRight className="w-3 h-3" />
                                        )}
                                        {!hasChildren && <span className="w-3" />}
                                        <span className="flex-1 text-left">{cat.label}</span>
                                    </button>

                                    {hasChildren && isExpanded && (
                                        <div className="ml-4">
                                            {cat.children.map(child => (
                                                <button
                                                    key={child.id}
                                                    onClick={() => setSelectedCategory(child.id)}
                                                    className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${selectedCategory === child.id
                                                        ? 'bg-[#37373d] text-white'
                                                        : 'text-gray-400 hover:bg-[#2a2d2e]'
                                                        }`}
                                                >
                                                    <span className="w-3" />
                                                    <span className="flex-1 text-left">{child.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Main Panel */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl p-8">
                        {/* Section Header */}
                        <div className="mb-6">
                            <h1 className="text-xl font-normal text-white mb-1">
                                {selectedCategory === 'commonly-used' ? 'Commonly Used' : 'Text Editor'}
                            </h1>
                        </div>

                        {/* Settings Content */}
                        <div>
                            {renderPanel()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
