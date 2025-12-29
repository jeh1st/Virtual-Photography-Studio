import React, { useState } from 'react';
import { NodeType, NodeData } from '../../types';
import { HelpModal } from '../HelpModal';

interface BaseNodeProps {
    id: string;
    type: NodeType;
    title: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    children?: React.ReactNode;
    color?: string; // Hex color for the header accent
    icon?: React.ReactNode; // Icon component
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    style?: React.CSSProperties; // For positioning from parent
}

export const BaseNode: React.FC<BaseNodeProps> = ({
    id,
    type,
    title,
    data,
    selected,
    collapsed,
    children,
    color = '#64748b', // Slate-500 default
    icon,
    onToggleCollapse,
    onDelete,
    style
}) => {
    const [showHelp, setShowHelp] = useState(false);

    // Glassmorphism classes
    // REMOVED overflow-hidden to allow dropdowns to pop out.
    // We maintain border radius relative to content.
    const containerClasses = `
        backdrop-blur-xl bg-gray-900/60 border shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
        rounded-xl transition-all duration-300
    `;

    // Dynamic Selection Color
    const borderStyle = selected
        ? { borderColor: color, boxShadow: `0 0 20px ${color}50` }
        : { borderColor: 'rgba(255,255,255,0.1)' };

    // Header gradient based on color
    const headerStyle = {
        background: `linear-gradient(90deg, ${color}33 0%, transparent 100%)`, // 33 = 20% opacity hex
        borderBottom: '1px solid rgba(255,255,255,0.05)'
    };

    return (
        <div
            className={`
                flex flex-col select-none group relative
                ${containerClasses}
                ${selected ? 'scale-[1.02]' : 'hover:border-white/20'}
                ${collapsed ? 'w-[240px]' : 'min-w-[280px] w-auto max-w-[320px]'}
                cursor-grab active:cursor-grabbing pointer-events-auto
            `}
            style={{ ...style, ...borderStyle }}
        >
            {/* Header */}
            <div
                className="flex items-center px-4 py-3 rounded-t-xl"
                style={headerStyle}
            >
                {/* Icon */}
                <div className="mr-3 text-white/80 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                    {icon}
                </div>

                {/* Title & Type */}
                <div className="flex flex-col flex-grow min-w-0">
                    <span
                        className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 opacity-50 mix-blend-screen"
                        style={{ color: color }}
                    >
                        {type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-bold text-white/90 truncate leading-tight tracking-wide font-sans">
                        {title}
                    </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Placeholder for actions */}
                </div>

                <div className="flex items-center">
                    {/* Help Button */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowHelp(true); }}
                        className="w-5 h-5 text-white/30 hover:text-white/80 mr-1 flex items-center justify-center transition-colors"
                        title="View Documentation"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>

                    {/* Delete Button (Only if onDelete provided AND not Output) */}
                    {onDelete && type !== NodeType.Output && (
                        <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="w-5 h-5 text-red-400/50 hover:text-red-400 flex items-center justify-center transition-colors mr-1"
                            title="Delete Node"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}

                    {!onToggleCollapse && (
                        <div className="w-5" /> // Spacer if no collapse button
                    )}

                    {onToggleCollapse && (
                        <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={onToggleCollapse}
                            className="w-5 h-5 text-white/50 hover:text-white flex items-center justify-center pointer-events-auto"
                        >
                            <svg className={`w-3 h-3 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Body Content */}
            <div
                className={`
                    transition-all duration-300 ease-in-out flex flex-col
                    ${collapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[800px] opacity-100'}
                `}
            >
                <div className="p-3 text-[10px] text-gray-200 font-medium space-y-3 relative z-10">
                    {children}
                </div>
            </div>

            {/* Context Helper / Status Bar (optional) */}
            {!collapsed && data.activePresetId && (
                <div className="px-4 py-2 bg-black/20 text-[10px] text-white/40 flex items-center gap-2 rounded-b-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
                    <span>{data.activePresetId}</span>
                </div>
            )}

            <HelpModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
                title={title}
                nodeType={type}
            />
        </div>
    );
};
