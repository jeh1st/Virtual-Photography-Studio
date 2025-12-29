import React from 'react';
import { NodeData, NodeType } from '../../types';
import { BaseNode } from './BaseNode';
import { SubjectRootNode } from './Subject/SubjectRootNode';
import { BodyNode } from './Subject/BodyNode';
import { FaceNode } from './Subject/FaceNode';
import { HairNode } from './Subject/HairNode';
import { AttireNode } from './Subject/AttireNode';
import { CameraRootNode } from './Camera/CameraRootNode';
import { LensNode } from './Camera/LensNode';
import { FilmNode } from './Camera/FilmNode';
import { LightSourceNode } from './Lighting/LightSourceNode';
import { ReferenceNode } from './Utility/ReferenceNode';
import { getNodeSummary } from '../../utils/nodeUtils';
// Actually NodeGraph handles logic. getNodeSummary is currently inside NodeGraph.tsx.
// I should move getNodeSummary or copy logic.
// For legacy nodes, I will rely on a simpler fallback for now or refactor NodeGraph later.

interface NodeContentProps {
    id: string;
    type: NodeType;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
    onAddConnectedNode?: (parentNodeId: string, type: NodeType) => void;
    style?: React.CSSProperties;
    nodes?: any[]; // Avoiding full import cycle for now, or use GraphNode[] if available/exported types allow
    edges?: any[];
}

export const NodeContent: React.FC<NodeContentProps> = (props) => {
    // Extract onAddConnectedNode from data if not passed directly (since it lives in data via ReactNodeGraph)
    const onAddConnectedNode = props.onAddConnectedNode || (props.data as any).onAddConnectedNode;

    // Extract nodes and edges from data (injected in ReactNodeGraph)
    const nodes = props.nodes || (props.data as any).nodes || [];
    const edges = props.edges || (props.data as any).edges || [];

    const propsWithAdd = { ...props, onAddConnectedNode, nodes, edges };

    switch (props.type) {
        // SUBJECT PIPELINE
        case NodeType.SubjectRoot:
            return <SubjectRootNode {...propsWithAdd} />;
        case NodeType.Body:
            return <BodyNode {...props} />;
        case NodeType.Face:
            return <FaceNode {...props} />;
        case NodeType.Hair:
            return <HairNode {...props} />;
        case NodeType.Attire:
            return <AttireNode {...props} />;

        // CAMERA PIPELINE
        case NodeType.CameraRoot:
            return <CameraRootNode {...propsWithAdd} />;
        case NodeType.Lens:
            return <LensNode {...propsWithAdd} />;
        case NodeType.Film:
            return <FilmNode {...propsWithAdd} />;



        // LIGHTING PIPELINE
        case NodeType.LightSource:
            return <LightSourceNode {...props} />;

        // UTILITY
        case NodeType.Reference:
            return <ReferenceNode {...props} />;

        // FUTURE NODES (Placeholders)
        case NodeType.LightingRoot:
        case NodeType.EnvironmentRoot:
        case NodeType.Location:
            return (
                <BaseNode
                    {...props}
                    title={props.type.replace(/_/g, ' ')}
                    color="#94a3b8"
                >
                    <div className="text-white/50 italic text-[10px]">
                        Pipeline Component implemented in next phase.
                    </div>
                </BaseNode>
            );

        // OUTPUT
        case NodeType.Output:
            return (
                <BaseNode
                    {...props}
                    title="Final Render"
                    color="#ffffff"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                >
                    <div className="space-y-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            Live Prompt Preview
                        </div>
                        <div className="bg-black/40 rounded p-2 border border-white/10 max-h-32 overflow-y-auto custom-scrollbar">
                            <p className="text-[10px] text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                                {props.data.promptSummary || "Connect nodes to generate prompt..."}
                            </p>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-gray-500">
                            <span>{props.data.totalTokens ? `${props.data.totalTokens} est. tokens` : ''}</span>
                            <span className="italic">Auto-updates</span>
                        </div>
                    </div>
                </BaseNode>
            );

        // LEGACY / FALLBACK
        default:
            // For legacy nodes (Subject, Camera, etc. from old system), we display a simple card
            // using the props data.
            return (
                <BaseNode
                    {...props}
                    title={props.data.label || props.type}
                    color={getLegacyColor(props.type)}
                >
                    <div className="text-gray-400 text-[10px] leading-relaxed">
                        {/* We don't have access to getNodeSummary here easily without refactoring.
                           For now, display raw label or hint. */}
                        {props.data.customLabel || props.data.label || 'Legacy Node'}
                    </div>
                </BaseNode>
            );
    }
};

const getLegacyColor = (type: NodeType): string => {
    switch (type) {
        case NodeType.Subject: return '#fca5a5';
        case NodeType.Camera: return '#93c5fd';
        case NodeType.Lighting: return '#fbbf24';
        case NodeType.Environment: return '#86efac';
        case NodeType.Composition: return '#c084fc';
        default: return '#cbd5e1';
    }
};
