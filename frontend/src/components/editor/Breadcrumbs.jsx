import React from 'react'

const Icons = {
    ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
    Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
}

export default function Breadcrumbs({ path = [] }) {
    return (
        <div className="flex items-center px-4 py-1 bg-[#0a0e14] border-b border-white/5 text-xs text-gray-500 font-sans select-none">
            <div className="flex items-center hover:text-gray-300 cursor-pointer transition-colors">
                <span className="mr-1"><Icons.Home /></span>
                <span>codudu-0.2</span>
            </div>

            {path.map((item, index) => (
                <div key={index} className="flex items-center">
                    <span className="mx-1 opacity-50"><Icons.ChevronRight /></span>
                    <div className={`flex items-center hover:text-gray-300 cursor-pointer transition-colors ${index === path.length - 1 ? 'text-gray-300 font-medium' : ''}`}>
                        {item.icon && <span className="mr-1.5">{item.icon}</span>}
                        <span>{item.name}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
