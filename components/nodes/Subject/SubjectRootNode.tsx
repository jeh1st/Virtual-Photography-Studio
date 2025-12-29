import React, { useCallback } from 'react';
import { BaseNode } from '../BaseNode';
import TextInput from '../../TextInput';
import SelectInput from '../../SelectInput';
import { NodeData, NodeType, ConsistencyMode, GraphNode, Edge } from '../../../types';

interface SubjectRootNodeProps {
    id: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
    onAddConnectedNode?: (parentNodeId: string, type: NodeType) => void;
    nodes?: GraphNode[];
    edges?: Edge[];
}

export const SubjectRootNode: React.FC<SubjectRootNodeProps> = ({
    id, data, selected, collapsed, onToggleCollapse, onDelete, onDataChange, onAddConnectedNode, nodes = [], edges = []
}) => {

    const handleChange = useCallback((key: keyof NodeData, value: any) => {
        if (onDataChange) {
            onDataChange(id, { [key]: value });
        }
    }, [id, onDataChange]);

    const title = data.label || 'New Subject';

    return (
        <BaseNode
            id={id}
            type={NodeType.SubjectRoot}
            title={title}
            data={data}
            selected={selected}
            collapsed={collapsed}
            color="#ec4899" // Pink-500
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
        >
            <div className="space-y-4">
                {/* Thumbnail Preview Placeholder */}
                <div className="w-full aspect-square bg-black/40 rounded-lg border border-white/10 mb-4 flex items-center justify-center relative overflow-hidden group">
                    {data.referenceImage ? (
                        <img src={data.referenceImage.data} alt="Reference" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-white/20">
                            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span className="text-[9px] uppercase tracking-widest">No Preview</span>
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-white/80 font-medium">Assembler Output</span>
                    </div>
                </div>

                <TextInput
                    label="Subject Name"
                    value={data.label || ''}
                    onChange={(e) => handleChange('label', e.target.value)}
                    placeholder="e.g. Hero, Background Extra"
                />

                <SelectInput
                    label="Consistency Priority"
                    value={data.consistencyMode || ConsistencyMode.FaceOnly}
                    onChange={(e) => handleChange('consistencyMode', e.target.value)}
                    options={Object.values(ConsistencyMode)}
                />

                <div className="bg-white/5 rounded p-2 text-[10px] text-white/40">
                    Connect Body, Face, Hair, and Attire nodes to build this subject.
                </div>

                {onAddConnectedNode && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Body */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddConnectedNode(id, NodeType.Body); }}
                            disabled={edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Body))}
                            className={`px-2 py-1.5 text-[9px] uppercase font-bold rounded border transition-colors flex items-center justify-center gap-1 ${edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Body))
                                ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                                : 'bg-pink-500/20 hover:bg-pink-500/40 text-pink-200 border-pink-500/30'
                                }`}
                        >
                            {edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Body)) ? 'Body Linked' : '+ Body'}
                        </button>

                        {/* Face */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddConnectedNode(id, NodeType.Face); }}
                            disabled={edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Face))}
                            className={`px-2 py-1.5 text-[9px] uppercase font-bold rounded border transition-colors flex items-center justify-center gap-1 ${edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Face))
                                ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                                : 'bg-pink-500/20 hover:bg-pink-500/40 text-pink-200 border-pink-500/30'
                                }`}
                        >
                            {edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Face)) ? 'Face Linked' : '+ Face'}
                        </button>

                        {/* Hair */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddConnectedNode(id, NodeType.Hair); }}
                            disabled={edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Hair))}
                            className={`px-2 py-1.5 text-[9px] uppercase font-bold rounded border transition-colors flex items-center justify-center gap-1 ${edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Hair))
                                ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                                : 'bg-pink-500/20 hover:bg-pink-500/40 text-pink-200 border-pink-500/30'
                                }`}
                        >
                            {edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Hair)) ? 'Hair Linked' : '+ Hair'}
                        </button>

                        {/* Attire */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddConnectedNode(id, NodeType.Attire); }}
                            disabled={edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Attire))}
                            className={`px-2 py-1.5 text-[9px] uppercase font-bold rounded border transition-colors flex items-center justify-center gap-1 ${edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Attire))
                                ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                                : 'bg-pink-500/20 hover:bg-pink-500/40 text-pink-200 border-pink-500/30'
                                }`}
                        >
                            {edges?.some(e => e.target === id && nodes?.find(n => n.id === e.source && n.type === NodeType.Attire)) ? 'Attire Linked' : '+ Attire'}
                        </button>
                    </div>
                )}
            </div>
        </BaseNode>
    );
};
