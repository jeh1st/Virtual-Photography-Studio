import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    NodeChange,
    EdgeChange,
    Node,
    BackgroundVariant,
    ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomNodeWrapper } from './nodes/CustomNodeWrapper';
import { GraphNode, NodeType } from '../types';
import { SubjectProfile } from '../types';
import { buildGraphPrompt } from '../utils/promptBuilder';
import { getEdgeColor } from '../utils/nodeUtils';
import { isValidConnection } from '../utils/connection_rules';

// Node Types definition
const nodeTypes = {
    custom: CustomNodeWrapper,
};

interface ReactNodeGraphProps {
    nodes: Node[];
    edges: Edge[];
    subjects: SubjectProfile[];
    onNodesChange: (changes: NodeChange[]) => void; // React Flow signature
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection | Edge) => void;
    onAddNode: (type: NodeType, position?: { x: number, y: number }) => void;
    onDeleteNode: (nodeId: string) => void;
    onToggleCollapse: (e: React.MouseEvent, nodeId: string) => void;
    onSelectionChange?: (nodeIds: string[]) => void;
    onAddConnectedNode: (parentNodeId: string, type: NodeType) => void;
    onDataChange: (nodeId: string, data: any) => void;
    key?: React.Key;
}

const ReactNodeGraphInner: React.FC<ReactNodeGraphProps> = ({
    nodes,
    edges,
    subjects,
    onNodesChange,
    onEdgesChange,
    onConnect: onConnectProp,
    onDeleteNode,
    onToggleCollapse,
    onAddConnectedNode,
    onDataChange,
    onSelectionChange
}) => {

    // Transformation Layer:
    const rfNodes: Node[] = useMemo(() => nodes.map(node => {
        let promptSummary = '';
        if (node.type === NodeType.Output) {
            try {
                // Cast to internal types for prompt builder
                const { prompt } = buildGraphPrompt(node as any, nodes as any, edges as any, subjects);
                promptSummary = prompt;
            } catch (e) {
                console.error("Error building prompt preview:", e);
            }
        }

        return {
            ...node,
            type: 'custom', // Force custom wrapper
            data: {
                ...node.data,
                type: node.type, // Pass real type in data
                isCollapsed: node.data.isCollapsed, // Use data.isCollapsed safely
                onDelete: onDeleteNode,
                onToggleCollapse: onToggleCollapse,
                onAddConnectedNode: onAddConnectedNode,
                onDataChange: onDataChange,
                nodes: nodes, // Inject full graph state for connectivity checks
                edges: edges,
                promptSummary: promptSummary || node.data.promptSummary // Inject calculated prompt
            }
        };
    }), [nodes, edges, subjects, onDeleteNode, onToggleCollapse, onAddConnectedNode, onDataChange]);

    const handleSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
        if (onSelectionChange) {
            onSelectionChange(selectedNodes.map(n => n.id));
        }
    }, [onSelectionChange]);

    const onConnect = useCallback(
        (params: Connection) => {
            // Find source node to determine color
            const sourceNode = nodes.find(n => n.id === params.source);
            const targetNode = nodes.find(n => n.id === params.target);

            if (sourceNode && targetNode) {
                if (!isValidConnection(sourceNode.type, targetNode.type)) {
                    return; // blocked
                }

                const color = getEdgeColor(sourceNode.type);
                const newEdge = {
                    ...params,
                    id: `e-${params.source}-${params.target}-${Date.now()}`,
                    style: { stroke: color, strokeWidth: 2 }
                };
                onConnectProp(newEdge);
            }
        },
        [nodes, onConnectProp]
    );

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={rfNodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={handleSelectionChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
                deleteKeyCode={null} // Disable internal delete to respect app-level safeguards (Output Protection)
                className="bg-gray-950"
                minZoom={0.1}
                maxZoom={4}
            >
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#334155" />
                <Controls className="bg-gray-800 border-gray-700 fill-gray-100" />
                <MiniMap
                    nodeStrokeColor="#0f172a"
                    nodeColor="#1e293b"
                    maskColor="rgba(0,0,0, 0.5)"
                    className="bg-gray-900 border border-gray-800"
                />
            </ReactFlow>
        </div>
    );
};

export const ReactNodeGraph = (props: ReactNodeGraphProps) => (
    <ReactFlowProvider>
        <ReactNodeGraphInner {...props} />
    </ReactFlowProvider>
);
