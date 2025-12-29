import React, { useCallback } from 'react';
import { BaseNode } from '../BaseNode';
import SelectInput from '../../SelectInput';
import { NodeData, NodeType, GraphNode, Edge } from '../../../types';
import { CAMERAS } from '../../../constants_fstop';
import { getDescription } from '../../../utils/descriptions';

interface CameraRootNodeProps {
    id: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    nodes?: GraphNode[];
    edges?: Edge[];
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
    onAddConnectedNode?: (parentNodeId: string, type: NodeType) => void;
}

export const CameraRootNode: React.FC<CameraRootNodeProps> = ({
    id, data, selected, collapsed, onToggleCollapse, onDelete, onDataChange, nodes = [], edges = [], onAddConnectedNode
}) => {

    const handleChange = useCallback((key: keyof NodeData, value: any) => {
        if (onDataChange) {
            onDataChange(id, { [key]: value });
        }
    }, [id, onDataChange]);

    const title = data.cameraModel && data.cameraModel !== 'None' ? data.cameraModel : 'Camera Body';

    return (
        <BaseNode
            id={id}
            type={NodeType.CameraRoot}
            title={title}
            data={data}
            selected={selected}
            collapsed={collapsed}
            color="#60a5fa" // Blue-400
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
        >
            <div className="space-y-4">
                {/* Sensor / Viewfinder Visualization */}
                <div className="w-full h-24 bg-gray-900 rounded border border-white/20 relative mb-4 flex flex-col items-center justify-center overflow-hidden group">
                    {/* Sensor Grid (Three Thirds) */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-10 pointer-events-none">
                        <div className="border-r border-b border-white"></div>
                        <div className="border-r border-b border-white"></div>
                        <div className="border-b border-white"></div>
                        <div className="border-r border-b border-white"></div>
                        <div className="border-r border-b border-white"></div>
                        <div className="border-b border-white"></div>
                        <div className="border-r border-white"></div>
                        <div className="border-r border-white"></div>
                        <div></div>
                    </div>

                    {/* Center Marker */}
                    <div className="w-3 h-3 border border-red-500/50 rounded-full z-10 flex items-center justify-center">
                        <div className="w-0.5 h-0.5 bg-red-500 rounded-full"></div>
                    </div>

                    <span className="text-[9px] text-white/30 font-mono mt-2 z-10 tracking-widest group-hover:text-blue-400 transition-colors">
                        {data.cameraModel && data.cameraModel !== 'None' ? 'ACTIVE SENSOR' : 'NO BODY'}
                    </span>
                </div>

                <SelectInput
                    label="Camera Body"
                    value={data.cameraModel || 'None'}
                    onChange={(e) => handleChange('cameraModel', e.target.value)}
                    options={CAMERAS.map(val => ({ value: val, label: val, description: getDescription(val) }))}
                />

                {/* Connectivity Status */}
                <div className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Optics</span>
                    <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${edges.some(e => e.target === id && nodes.find(n => n.id === e.source && n.type === NodeType.Lens && n.data.lensModel && n.data.lensModel !== 'None')) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-900/50'}`}></div>
                        <span className="text-[9px] text-gray-300 font-mono">
                            {edges.some(e => e.target === id && nodes.find(n => n.id === e.source && n.type === NodeType.Lens && n.data.lensModel && n.data.lensModel !== 'None'))
                                ? 'LENS LINKED'
                                : 'MISSING LENS'}
                        </span>
                    </div>
                </div>

                {/* Visual Hint for Lens Connection */}
                {!edges.some(e => e.target === id && nodes.find(n => n.id === e.source && n.type === NodeType.Lens && n.data.lensModel && n.data.lensModel !== 'None')) && (
                    <div className="text-[9px] text-blue-300/40 italic text-center animate-pulse mt-2">
                        {edges.some(e => e.target === id && nodes.find(n => n.id === e.source && n.type === NodeType.Lens))
                            ? "Select a Lens Model..."
                            : "Connect a Lens Node to enable optics."}
                    </div>
                )}

                {/* Quick Add Buttons - Always visible availability */}
                {onAddConnectedNode && (
                    <div className="flex gap-2 justify-center mt-3 border-t border-white/5 pt-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddConnectedNode(id, NodeType.Lens); }}
                            disabled={edges.some(e => e.target === id && nodes.find(n => n.id === e.source && n.type === NodeType.Lens))}
                            className={`px-2 py-1 text-[9px] uppercase font-bold rounded border transition-colors ${edges.some(e => e.target === id && nodes.find(n => n.id === e.source && n.type === NodeType.Lens))
                                ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                                : 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 border-blue-500/30'
                                }`}
                        >
                            {edges.some(e => e.target === id && nodes.find(n => n.id === e.source && n.type === NodeType.Lens)) ? 'Lens Linked' : '+ Add Lens'}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddConnectedNode(id, NodeType.Film); }}
                            disabled={edges.some(e => e.target === id && nodes.find(n => n.id === e.source && n.type === NodeType.Film))}
                            className={`px-2 py-1 text-[9px] uppercase font-bold rounded border transition-colors ${edges.some(e => e.target === id && nodes.find(n => n.id === e.source && n.type === NodeType.Film))
                                ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                                : 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 border-amber-500/30'
                                }`}
                        >
                            {edges.some(e => e.target === id && nodes.find(n => n.id === e.source && n.type === NodeType.Film)) ? 'Film Linked' : '+ Add Film'}
                        </button>
                    </div>
                )}
            </div>
        </BaseNode>
    );
};
