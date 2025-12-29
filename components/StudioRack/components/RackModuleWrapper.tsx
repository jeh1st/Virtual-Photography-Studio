import React, { useState } from 'react';

interface RackModuleWrapperProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
    accentColor?: string;
}

export const RackModuleWrapper: React.FC<RackModuleWrapperProps> = ({
    title, icon, children, defaultOpen = true, onToggle, accentColor = "indigo"
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (onToggle) onToggle(newState);
    };

    const getBorderColor = () => {
        switch (accentColor) {
            case 'red': return 'border-red-500/30 hover:border-red-500/50';
            case 'blue': return 'border-blue-500/30 hover:border-blue-500/50';
            case 'green': return 'border-emerald-500/30 hover:border-emerald-500/50';
            case 'amber': return 'border-amber-500/30 hover:border-amber-500/50';
            case 'purple': return 'border-purple-500/30 hover:border-purple-500/50';
            default: return 'border-indigo-500/30 hover:border-indigo-500/50';
        }
    };

    const getBgColor = () => {
        switch (accentColor) {
            case 'red': return 'bg-red-950/20';
            case 'blue': return 'bg-blue-950/20';
            case 'green': return 'bg-emerald-950/20';
            case 'amber': return 'bg-amber-950/20';
            case 'purple': return 'bg-purple-950/20';
            default: return 'bg-indigo-950/20';
        }
    }

    return (
        <div className={`rounded-lg border ${getBorderColor()} overflow-hidden transition-all duration-300 mb-4 shadow-lg backdrop-blur-sm`}>
            {/* Module Header */}
            <button
                onClick={handleToggle}
                className={`w-full flex items-center justify-between p-3 ${getBgColor()} border-b border-white/5 cursor-pointer select-none group`}
            >
                <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-colors ${isOpen ? `bg-${accentColor}-400 shadow-${accentColor}-500/50` : 'bg-gray-600 shadow-none'}`}></span>
                    {icon && <span className="text-gray-400 group-hover:text-white transition-colors">{icon}</span>}
                    <h3 className="font-bold text-sm tracking-wider uppercase text-gray-200 group-hover:text-white transition-colors">{title}</h3>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Module Content */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-4 bg-gray-950/40">
                    {children}
                </div>
            </div>
        </div>
    );
};
