
import { FC } from 'react';
import { GraphNode, NodeType } from '../types';
import { buildSubjectDescription, buildEnvironmentDescription, buildCameraDescription, buildLightingDescription, buildCompositionDescription } from '../utils/promptBuilder';

interface MobileNodeListProps {
    nodes: GraphNode[];
    onSelectionChange: (nodeIds: string[]) => void;
    onDeleteNode: (nodeId: string) => void;
    onAddNode: (type: NodeType) => void;
    onClose: () => void;
    selectedNodeIds: string[];
}

const MobileNodeList: FC<MobileNodeListProps> = ({
    nodes, onSelectionChange, onDeleteNode, onAddNode, onClose, selectedNodeIds
}) => {

    const getNodeSummary = (node: GraphNode) => {
        if (node.type === NodeType.Subject) return buildSubjectDescription(node.data).substring(0, 60) + "...";
        if (node.type === NodeType.Environment) return buildEnvironmentDescription(node.data).substring(0, 60) + "...";
        if (node.type === NodeType.Camera) return `${node.data.cameraModel} • ${node.data.lensModel}`;
        if (node.type === NodeType.Lighting) return `${node.data.lightingStyle}`;
        if (node.type === NodeType.Composition) return `${node.data.compositionType} • ${node.data.aspectRatio}`;
        if (node.type === NodeType.Cameo) return node.data.cameoSelection || "Select Cameo";
        if (node.type === NodeType.Output) return "Final Render Settings";
        return "";
    };

    const getNodeIcon = (type: NodeType) => {
        switch (type) {
            case NodeType.Subject: return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
            case NodeType.Environment: return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 011 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case NodeType.Camera: return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
            case NodeType.Lighting: return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
            case NodeType.Composition: return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
            case NodeType.Cameo: return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
            case NodeType.Output: return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
            default: return null;
        }
    };

    const renderNodeItem = (node: GraphNode) => {
        const isSelected = selectedNodeIds.includes(node.id);
        const isActiveColor = isSelected ? 'bg-purple-900/40 border-purple-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-gray-200';

        return (
            <div
                key={node.id}
                onClick={() => { onSelectionChange([node.id]); onClose(); }}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer mb-2 transition-all ${isActiveColor}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-md ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                        {getNodeIcon(node.type)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{node.data.label || node.type}</span>
                        <span className="text-[10px] opacity-70 truncate">{getNodeSummary(node)}</span>
                    </div>
                </div>
                {node.type !== NodeType.Output && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                        className="p-2 text-gray-600 hover:text-red-400 rounded-full"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>
        );
    };

    const outputNode = nodes.find(n => n.type === NodeType.Output);
    const subjectNodes = nodes.filter(n => n.type === NodeType.Subject || (n.type === NodeType.Cameo && n.data.cameoType === 'Subject'));
    const envNodes = nodes.filter(n => n.type === NodeType.Environment || (n.type === NodeType.Cameo && n.data.cameoType !== 'Subject'));
    const techNodes = nodes.filter(n => [NodeType.Camera, NodeType.Lighting, NodeType.Composition].includes(n.type));

    return (
        <div className="w-full h-full bg-gray-950 flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-900">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Scene Graph</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="p-4 bg-gray-900/50 border-b border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Quick Add</p>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => { onAddNode(NodeType.SubjectRoot); onClose(); }} className="px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-[10px] font-bold text-pink-300 hover:text-white hover:border-pink-500 uppercase">+ Subject</button>
                    <button onClick={() => { onAddNode(NodeType.CameraRoot); onClose(); }} className="px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-[10px] font-bold text-blue-300 hover:text-white hover:border-blue-500 uppercase">+ Camera</button>
                    <button onClick={() => { onAddNode(NodeType.Environment); onClose(); }} className="px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-[10px] font-bold text-teal-300 hover:text-white hover:border-teal-500 uppercase">+ Room</button>
                    <button onClick={() => { onAddNode(NodeType.LightSource); onClose(); }} className="px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-[10px] font-bold text-amber-300 hover:text-white hover:border-amber-500 uppercase">+ Light</button>
                    <button onClick={() => { onAddNode(NodeType.Reference); onClose(); }} className="px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-[10px] font-bold text-purple-300 hover:text-white hover:border-purple-500 uppercase">+ Ref Img</button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-6">

                <div>
                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 px-1">Goal</h3>
                    {outputNode && renderNodeItem(outputNode)}
                </div>

                <div>
                    <h3 className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest mb-2 px-1">Subjects</h3>
                    {subjectNodes.map(renderNodeItem)}
                    {subjectNodes.length === 0 && <div className="text-[10px] text-gray-600 italic px-2">No subjects added</div>}
                </div>

                <div>
                    <h3 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2 px-1">Environment</h3>
                    {envNodes.map(renderNodeItem)}
                    {envNodes.length === 0 && <div className="text-[10px] text-gray-600 italic px-2">No environment set</div>}
                </div>

                <div>
                    <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2 px-1">Technical</h3>
                    {techNodes.map(renderNodeItem)}
                    {techNodes.length === 0 && <div className="text-[10px] text-gray-600 italic px-2">Auto settings</div>}
                </div>
            </div>
        </div>
    );
};

export default MobileNodeList;
