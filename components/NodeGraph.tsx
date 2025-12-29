import { useState, useRef, useEffect, useMemo, FC, MouseEvent } from 'react';
import { GraphNode, Edge, NodeType, NodeData, ConsistencyMode } from '../types';
import { NodeContent } from './nodes/NodeContent';
import { getNodeStyles, getNodeIcon, getNodeSummary, getEdgeColor } from '../utils/nodeUtils';
import { buildSubjectDescription, buildEnvironmentDescription, buildCameraDescription, buildLightingDescription, buildCompositionDescription } from '../utils/promptBuilder';
import { isValidConnection } from '../utils/connection_rules';

interface NodeGraphProps {
    nodes: GraphNode[];
    edges: Edge[];
    onNodesChange: (nodes: GraphNode[]) => void;
    onEdgesChange: (edges: Edge[]) => void;
    onSelectionChange: (nodeIds: string[]) => void;
    onDeleteNode: (nodeId: string) => void;
    onAddNode: (type: NodeType, position?: { x: number, y: number }) => void;
    selectedNodeIds: string[];
}

const NodeGraph: FC<NodeGraphProps> = ({
    nodes, edges, onNodesChange, onEdgesChange, onSelectionChange, onDeleteNode, selectedNodeIds, onAddNode
}) => {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanMouse, setLastPanMouse] = useState({ x: 0, y: 0 });
    const [dragState, setDragState] = useState<{ nodeIds: string[], startMouse: { x: number, y: number }, startPositions: { [id: string]: { x: number, y: number } }, currentMouse?: { x: number, y: number } } | null>(null);
    const [connectState, setConnectState] = useState<{ sourceNodeId: string, mousePos: { x: number, y: number } } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);
    const [localPositions, setLocalPositions] = useState<{ [id: string]: { x: number, y: number } }>({});

    const canvasRef = useRef<HTMLDivElement>(null);

    // Close context menu on global click
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const toggleCollapse = (e: MouseEvent, nodeId: string) => {
        e.stopPropagation();
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const isExpanding = node.isCollapsed;
        const nextCollapsed = !node.isCollapsed;

        const updatedNodes = nodes.map(n => {
            if (n.id === nodeId) {
                return { ...n, isCollapsed: nextCollapsed };
            }
            return n;
        });

        if (isExpanding) {
            // Check for collision after expansion
            const expandedRect = getNodeRect(nodeId, node.position, false);
            let changed = false;

            const resolve = (movedId: string, rect: any, depth: number) => {
                if (depth > 5) return;
                updatedNodes.forEach((other, idx) => {
                    if (other.id === movedId || other.type === NodeType.Group) return;
                    const otherRect = getNodeRect(other.id, other.position, other.isCollapsed);
                    if (isOverlapping(rect, otherRect)) {
                        const pushX = rect.x + rect.w + 20 - otherRect.x;
                        const newPos = { ...other.position, x: other.position.x + pushX };
                        updatedNodes[idx] = { ...other, position: newPos };
                        changed = true;
                        resolve(other.id, getNodeRect(other.id, newPos, other.isCollapsed), depth + 1);
                    }
                });
            };
            resolve(nodeId, expandedRect, 0);
        }

        onNodesChange(updatedNodes);
    };

    const handleDataChange = (nodeId: string, newData: Partial<NodeData>) => {
        onNodesChange(nodes.map(n => {
            if (n.id === nodeId) {
                return { ...n, data: { ...n.data, ...newData } };
            }
            return n;
        }));
    };

    const handleCanvasMouseDown = (e: MouseEvent) => {
        if (e.shiftKey) return;
        if (e.button !== 0) return; // Only left click pans
        setIsPanning(true);
        setLastPanMouse({ x: e.clientX, y: e.clientY });
        onSelectionChange([]);
        setContextMenu(null);
    };

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (!canvasRef.current) return;
            e.preventDefault();
            const isPinch = e.ctrlKey;
            const delta = -e.deltaY;
            const factor = isPinch ? 0.05 : 0.001;
            const zoomChange = delta * factor * zoom;
            const newZoom = Math.min(Math.max(zoom + zoomChange, 0.1), 5);
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const worldX = (mouseX - pan.x) / zoom;
            const worldY = (mouseY - pan.y) / zoom;
            const newPanX = mouseX - (worldX * newZoom);
            const newPanY = mouseY - (worldY * newZoom);
            setZoom(newZoom);
            setPan({ x: newPanX, y: newPanY });
        };
        const canvasEl = canvasRef.current;
        if (canvasEl) canvasEl.addEventListener('wheel', handleWheel, { passive: false });
        return () => { if (canvasEl) canvasEl.removeEventListener('wheel', handleWheel); };
    }, [zoom, pan]);

    const handleNodeMouseDown = (e: MouseEvent, nodeId: string) => {
        if (e.button !== 0) return; // Allow right click to pass through to context menu handler
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select') || (e.target as HTMLElement).closest('textarea')) return;

        e.stopPropagation();

        let newSelection = [...selectedNodeIds];
        if (e.shiftKey) {
            if (newSelection.includes(nodeId)) {
                newSelection = newSelection.filter(id => id !== nodeId);
            } else {
                newSelection.push(nodeId);
            }
        } else {
            if (!newSelection.includes(nodeId)) {
                newSelection = [nodeId];
            }
        }
        onSelectionChange(newSelection);

        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const worldMouseX = (e.clientX - rect.left - pan.x) / zoom;
            const worldMouseY = (e.clientY - rect.top - pan.y) / zoom;

            const idsToDrag = new Set(newSelection);

            // Drag children if group is selected
            nodes.forEach(n => {
                if (n.parentId && idsToDrag.has(n.parentId)) {
                    idsToDrag.add(n.id);
                }
            });

            const startPositions: { [id: string]: { x: number, y: number } } = {};
            nodes.forEach(n => {
                if (idsToDrag.has(n.id)) {
                    startPositions[n.id] = { ...n.position };
                }
            });

            setDragState({
                nodeIds: Array.from(idsToDrag),
                startMouse: { x: worldMouseX, y: worldMouseY },
                startPositions
            });
        }
    };

    const handleNodeContextMenu = (e: MouseEvent, nodeId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
        // Also select the node if not selected
        if (!selectedNodeIds.includes(nodeId)) {
            onSelectionChange([nodeId]);
        }
    };

    const handleCanvasContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, nodeId: '' });
    }

    const handleAddNodeFromContext = (type: NodeType) => {
        if (!canvasRef.current || !contextMenu) return;

        // Calculate position based on context menu location (approximate)
        const rect = canvasRef.current.getBoundingClientRect();
        const worldX = (contextMenu.x - rect.left - pan.x) / zoom;
        const worldY = (contextMenu.y - rect.top - pan.y) / zoom;

        // Call parent handler
        onAddNode(type, { x: worldX, y: worldY });
        setContextMenu(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!canvasRef.current) return;

        if (isPanning) {
            const dx = e.clientX - lastPanMouse.x;
            const dy = e.clientY - lastPanMouse.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastPanMouse({ x: e.clientX, y: e.clientY });
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const worldMouseX = (e.clientX - rect.left - pan.x) / zoom;
        const worldMouseY = (e.clientY - rect.top - pan.y) / zoom;

        if (dragState) {
            const dx = worldMouseX - dragState.startMouse.x;
            const dy = worldMouseY - dragState.startMouse.y;

            setDragState(prev => prev ? { ...prev, currentMouse: { x: worldMouseX, y: worldMouseY } } : null);

            // COLLISION AVOIDANCE (Local Only)
            if (dragState.nodeIds.length > 0) {
                const tempPositions: { [id: string]: { x: number, y: number } } = {};

                // Initialize/Update temp positions for all nodes based on drag and current state
                nodes.forEach(n => {
                    if (dragState.nodeIds.includes(n.id)) {
                        tempPositions[n.id] = {
                            x: dragState.startPositions[n.id].x + dx,
                            y: dragState.startPositions[n.id].y + dy
                        };
                    } else {
                        tempPositions[n.id] = { ...n.position };
                    }
                });

                const resolveRecursive = (movedId: string, depth: number) => {
                    if (depth > 5) return;

                    const movedPos = tempPositions[movedId];
                    const movedNode = nodes.find(n => n.id === movedId);
                    if (!movedNode) return;

                    const movedRect = getNodeRect(movedId, movedPos, movedNode.isCollapsed);

                    nodes.forEach((other) => {
                        if (dragState.nodeIds.includes(other.id)) return;
                        if (other.id === movedId || other.type === NodeType.Group) return;

                        const otherRect = getNodeRect(other.id, tempPositions[other.id], other.isCollapsed);

                        if (isOverlapping(movedRect, otherRect)) {
                            const pushX = movedRect.x + movedRect.w + 20 - otherRect.x;
                            tempPositions[other.id] = { ...tempPositions[other.id], x: tempPositions[other.id].x + pushX };
                            resolveRecursive(other.id, depth + 1);
                        }
                    });
                };

                dragState.nodeIds.forEach(id => resolveRecursive(id, 0));
                setLocalPositions(tempPositions);
            }
            return;
        }

        if (connectState) {
            setConnectState({ ...connectState, mousePos: { x: worldMouseX, y: worldMouseY } });
        }
    };

    const handleMouseUp = () => {
        if (dragState && dragState.currentMouse) {
            // Commit local positions (including pushed ones) to global state
            const updatedNodes = nodes.map(n => {
                const lp = localPositions[n.id];
                if (lp) {
                    return { ...n, position: lp };
                }
                return n;
            });
            onNodesChange(updatedNodes);
        }
        setIsPanning(false);
        setDragState(null);
        setConnectState(null);
        setLocalPositions({});
    };

    const handlePortMouseDown = (e: MouseEvent, nodeId: string) => {
        e.stopPropagation();
        if (e.button !== 0) return;
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const worldMouseX = (e.clientX - rect.left - pan.x) / zoom;
        const worldMouseY = (e.clientY - rect.top - pan.y) / zoom;
        setConnectState({ sourceNodeId: nodeId, mousePos: { x: worldMouseX, y: worldMouseY } });
    };

    const handlePortMouseUp = (e: MouseEvent, targetNodeId: string) => {
        e.stopPropagation();
        if (!connectState) return;

        const sourceNode = nodes.find(n => n.id === connectState.sourceNodeId);
        const targetNode = nodes.find(n => n.id === targetNodeId);

        if (!sourceNode || !targetNode) { setConnectState(null); return; }

        // Use connection rules logic
        if (sourceNode.id !== targetNode.id && isValidConnection(sourceNode.type, targetNode.type)) {
            const exists = edges.some(edge =>
                (edge.source === connectState.sourceNodeId && edge.target === targetNodeId)
            );
            if (!exists) {
                onEdgesChange([...edges, { id: `e-${Date.now()}`, source: connectState.sourceNodeId, target: targetNodeId }]);
            }
        }
        setConnectState(null);
    };
    const getNodeRect = (id: string, pos: { x: number, y: number }, isCollapsed: boolean) => {
        const w = 240;
        const h = isCollapsed ? 50 : 180; // Estimated height
        return { x: pos.x, y: pos.y, w, h };
    };

    const isOverlapping = (r1: any, r2: any) => {
        return !(r1.x + r1.w < r2.x || r2.x + r2.w < r1.x || r1.y + r1.h < r2.y || r2.y + r2.h < r1.y);
    };



    const getGroupStyle = (groupNode: GraphNode) => {
        if (groupNode.isCollapsed) {
            return {
                transform: `translate(${groupNode.position.x}px, ${groupNode.position.y}px)`,
                width: 240,
                zIndex: 20
            };
        }

        const children = nodes.filter(n => n.parentId === groupNode.id);
        if (children.length === 0) {
            return {
                transform: `translate(${groupNode.position.x}px, ${groupNode.position.y}px)`,
                width: 240,
                height: 100,
                zIndex: 5
            };
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        children.forEach(c => {
            const w = 240;
            const h = c.isCollapsed ? 50 : 120;
            minX = Math.min(minX, c.position.x);
            minY = Math.min(minY, c.position.y);
            maxX = Math.max(maxX, c.position.x + w);
            maxY = Math.max(maxY, c.position.y + h);
        });

        const padding = 20;
        return {
            transform: `translate(${minX - padding}px, ${minY - padding - 30}px)`,
            width: (maxX - minX) + (padding * 2),
            height: (maxY - minY) + (padding * 2) + 30,
            zIndex: 5
        };
    };

    const renderConnectionLine = (x1: number, y1: number, x2: number, y2: number, active = false, valid = false, color = "#4b5563") => {
        const cX = (x1 + x2) / 2;
        const cY1 = y1;
        const cY2 = y2;
        return (
            <path
                d={`M ${x1} ${y1} C ${cX} ${cY1}, ${cX} ${cY2}, ${x2} ${y2}`}
                stroke={active ? (valid ? "#4ade80" : "#a855f7") : color}
                strokeWidth={active ? 3 : 2}
                fill="none"
                strokeDasharray={active ? "5,5" : "none"}
                className="transition-all duration-300 pointer-events-none"
            />
        );
    };

    const sortedNodes = useMemo(() => {
        return [...nodes].sort((a, b) => {
            if (a.type === NodeType.Group && b.type !== NodeType.Group) return -1;
            if (a.type !== NodeType.Group && b.type === NodeType.Group) return 1;
            return 0;
        });
    }, [nodes]);

    return (
        <div
            ref={canvasRef}
            className={`w-full h-full relative bg-gray-950 overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={handleCanvasContextMenu}
        >
            <div
                className="absolute inset-0 w-full h-full origin-top-left"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
            >
                {/* Grid Background */}
                <div
                    className="absolute inset-[-4000px] w-[8000px] h-[8000px] pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                {/* Edges Layer */}
                <svg className="absolute -top-[4000px] -left-[4000px] w-[8000px] h-[8000px] pointer-events-none overflow-visible">
                    <g transform={`translate(4000, 4000)`}>
                        {edges.map(edge => {
                            const source = nodes.find(n => n.id === edge.source);
                            const target = nodes.find(n => n.id === edge.target);
                            if (!source || !target) return null;

                            const getPos = (n: GraphNode) => {
                                // Use local drag position if available
                                if (localPositions[n.id]) {
                                    return localPositions[n.id];
                                }

                                if (n.parentId) {
                                    const parent = nodes.find(p => p.id === n.parentId);
                                    if (parent && parent.isCollapsed) return parent.position;
                                }
                                return n.position;
                            }

                            const sPos = getPos(source);
                            const tPos = getPos(target);

                            return (
                                <g key={edge.id}>
                                    {renderConnectionLine(
                                        sPos.x + 240, sPos.y + 24, // Source Anchor at fixed 24px top offset
                                        tPos.x, tPos.y + 24,       // Target Anchor at fixed 24px top offset
                                        false,
                                        false,
                                        getEdgeColor(source.type)
                                    )}
                                </g>
                            );
                        })}
                        {connectState && (() => {
                            const source = nodes.find(n => n.id === connectState.sourceNodeId);
                            if (!source) return null;
                            return renderConnectionLine(
                                source.position.x + 240, source.position.y + 24,
                                connectState.mousePos.x, connectState.mousePos.y,
                                true,
                                false
                            );
                        })()}
                    </g>
                </svg>

                {/* Nodes Layer */}
                {sortedNodes.map(node => {
                    const isSelected = selectedNodeIds.includes(node.id);
                    const isOutput = node.type === NodeType.Output;
                    const isGroup = node.type === NodeType.Group;
                    const highlightInput = connectState && isOutput;
                    const isCollapsed = node.isCollapsed ?? true;

                    if (node.parentId) {
                        const parent = nodes.find(p => p.id === node.parentId);
                        if (parent && parent.isCollapsed) return null;
                    }


                    // Calculate visual position (prioritize local drag state)
                    let displayPos = localPositions[node.id] || node.position;
                    let displayStyle: any = null;

                    // For groups, we need to recalculate bounds if children are being dragged? 
                    // No, existing logic calculates based on children's stored positions. 
                    // If we only visually move children, group box won't update until drop.
                    // That's acceptable for performance, OR we pass the modified node list to getGroupStyle.

                    if (isGroup) {
                        // Simple optimization: render group at original position during drag, 
                        // or ideally re-calculate. For now, let's just stick to standard render 
                        // because groups aren't usually dragged *with* children in this specific logic 
                        // (though they can be).
                        displayStyle = getGroupStyle(node);
                    } else {
                        displayStyle = {
                            transform: `translate(${displayPos.x}px, ${displayPos.y}px)`,
                        };
                    }

                    // Specialized render for edges needs to know about temporary positions too.
                    // We need to update the edges map loop above as well.

                    const sourceNode = connectState ? nodes.find(n => n.id === connectState.sourceNodeId) : null;
                    const isPotentiallyValid = connectState && sourceNode && isValidConnection(sourceNode.type, node.type);

                    return (
                        <div
                            key={node.id}
                            className={`absolute flex flex-col transition-all duration-200 group
                                        ${connectState && node.id !== connectState.sourceNodeId && !isPotentiallyValid ? 'opacity-40 grayscale' : 'opacity-100'}
                                        ${isGroup ? '' : 'pointer-events-none'} 
                                    `}
                            style={displayStyle}
                        >
                            {/* Wrapper for interaction (Drag / Context Menu) */}
                            {/* Pointer events need to be auto for the inner content, but we want the wrapper to handle drag?
                                Actually, existing logic used onMouseDown on the wrapper.
                                BaseNode has its own header for drag. 
                                We should wrap NodeContent in a div that handles positioning but let BaseNode handle visuals.
                            */}

                            <div
                                className="pointer-events-auto"
                                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
                            >
                                {/* Input Port (for Output Node) */}
                                {isOutput && (
                                    <div
                                        className="absolute -left-3 top-6 -translate-y-1/2 w-10 h-10 flex items-center justify-center z-50 pointer-events-auto group/input"
                                        onMouseUp={(e) => handlePortMouseUp(e, node.id)}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full border-4 transition-all duration-300 flex items-center justify-center
                                                ${highlightInput ? 'bg-green-500 border-green-200 scale-125 shadow-[0_0_15px_rgba(74,222,128,0.8)]' : 'bg-gray-800 border-gray-500 group-hover/input:scale-110'}
                                            `}
                                        >
                                        </div>
                                    </div>
                                )}

                                {/* Input Port (for Container Nodes: SubjectRoot, CameraRoot, Body, etc.) */}
                                {(!isOutput && !isGroup && node.type !== NodeType.Composition && node.type !== NodeType.Lighting && node.type !== NodeType.Environment) && (
                                    <div
                                        className="absolute -left-3 top-6 -translate-y-1/2 w-10 h-10 flex items-center justify-center z-50 pointer-events-auto group/input"
                                        onMouseUp={(e) => handlePortMouseUp(e, node.id)}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300
                                                ${connectState ? 'bg-blue-500 border-white scale-125 animate-pulse cursor-copy' : 'bg-gray-700 border-gray-900 group-hover/input:scale-125 group-hover/input:border-blue-400'}
                                            `}
                                        >
                                        </div>
                                    </div>
                                )}

                                <NodeContent
                                    id={node.id}
                                    type={node.type}
                                    data={node.data}
                                    selected={isSelected}
                                    collapsed={isCollapsed}
                                    onToggleCollapse={(e) => toggleCollapse(e, node.id)}
                                    onDelete={() => onDeleteNode(node.id)}
                                    onDataChange={handleDataChange}
                                    nodes={nodes}
                                    edges={edges}
                                />

                                {/* Output Port */}
                                {(!isOutput && !isGroup) && (
                                    <div className="absolute -right-3 top-6 -translate-y-1/2 w-10 h-10 flex items-center justify-center group/port z-50 pointer-events-auto cursor-crosshair" onMouseDown={(e) => handlePortMouseDown(e, node.id)}>
                                        <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-gray-700 group-hover/port:bg-white group-hover/port:border-purple-500 group-hover/port:scale-125 transition-all shadow-md"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="absolute z-[100] bg-gray-900 border border-gray-700/50 rounded-lg shadow-2xl py-1 min-w-[180px] animate-fade-in backdrop-blur-md"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.nodeId ? (
                        // Node Specific Actions
                        <>
                            <div className="px-3 py-2 border-b border-white/5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Node Actions</span>
                            </div>
                            {nodes.find(n => n.id === contextMenu.nodeId)?.type !== NodeType.Output && (
                                <button
                                    onClick={() => { onDeleteNode(contextMenu.nodeId!); setContextMenu(null); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Delete Node
                                </button>
                            )}
                        </>
                    ) : (
                        // Canvas Actions (Add Node)
                        <>
                            <div className="px-3 py-2 border-b border-white/5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add Node</span>
                            </div>

                            {/* Subject Category */}
                            <div className="group relative">
                                <button className="w-full text-left px-4 py-2 text-xs text-fuchsia-300 hover:bg-white/5 flex items-center justify-between">
                                    <span>Subject</span>
                                    <svg className="w-3 h-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                                <div className="absolute left-full top-0 ml-1 bg-gray-900 border border-gray-700/50 rounded shadow-xl py-1 min-w-[140px] hidden group-hover:block">
                                    <button onClick={() => handleAddNodeFromContext(NodeType.SubjectRoot)} className="w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:bg-fuchsia-500/20 hover:text-fuchsia-200">Subject Root</button>
                                    <div className="border-t border-white/5 my-1"></div>
                                    <button onClick={() => handleAddNodeFromContext(NodeType.Body)} className="w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:bg-fuchsia-500/20 hover:text-fuchsia-200">Body</button>
                                    <button onClick={() => handleAddNodeFromContext(NodeType.Face)} className="w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:bg-fuchsia-500/20 hover:text-fuchsia-200">Face</button>
                                    <button onClick={() => handleAddNodeFromContext(NodeType.Hair)} className="w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:bg-fuchsia-500/20 hover:text-fuchsia-200">Hair</button>
                                    <button onClick={() => handleAddNodeFromContext(NodeType.Attire)} className="w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:bg-fuchsia-500/20 hover:text-fuchsia-200">Attire</button>
                                </div>
                            </div>

                            {/* Camera Category */}
                            <div className="group relative">
                                <button className="w-full text-left px-4 py-2 text-xs text-blue-300 hover:bg-white/5 flex items-center justify-between">
                                    <span>Camera</span>
                                    <svg className="w-3 h-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                                <div className="absolute left-full top-0 ml-1 bg-gray-900 border border-gray-700/50 rounded shadow-xl py-1 min-w-[140px] hidden group-hover:block">
                                    <button onClick={() => handleAddNodeFromContext(NodeType.CameraRoot)} className="w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:bg-blue-500/20 hover:text-blue-200">Camera Root</button>
                                    <div className="border-t border-white/5 my-1"></div>
                                    <button onClick={() => handleAddNodeFromContext(NodeType.Lens)} className="w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:bg-blue-500/20 hover:text-blue-200">Lens</button>
                                    <button onClick={() => handleAddNodeFromContext(NodeType.Film)} className="w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:bg-blue-500/20 hover:text-blue-200">Film Stock</button>
                                </div>
                            </div>

                            {/* Lighting Category */}
                            <div className="group relative">
                                <button className="w-full text-left px-4 py-2 text-xs text-amber-300 hover:bg-white/5 flex items-center justify-between">
                                    <span>Lighting</span>
                                    <svg className="w-3 h-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                                <div className="absolute left-full top-0 ml-1 bg-gray-900 border border-gray-700/50 rounded shadow-xl py-1 min-w-[140px] hidden group-hover:block">
                                    <button onClick={() => handleAddNodeFromContext(NodeType.LightSource)} className="w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:bg-amber-500/20 hover:text-amber-200">Light Source</button>
                                </div>
                            </div>

                            {/* Utility Category */}
                            <div className="group relative">
                                <button className="w-full text-left px-4 py-2 text-xs text-emerald-300 hover:bg-white/5 flex items-center justify-between">
                                    <span>Utility</span>
                                    <svg className="w-3 h-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                                <div className="absolute left-full top-0 ml-1 bg-gray-900 border border-gray-700/50 rounded shadow-xl py-1 min-w-[140px] hidden group-hover:block">
                                    <button onClick={() => handleAddNodeFromContext(NodeType.Reference)} className="w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-200">Reference Image</button>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="border-t border-white/5 my-1"></div>
                    <button
                        onClick={() => { setContextMenu(null); }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        Close Menu
                    </button>
                </div>
            )}

            <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none z-50">
                <div className="bg-gray-900/80 backdrop-blur text-gray-400 text-[10px] px-3 py-1 rounded border border-white/5 shadow-lg">
                    Right-Click for Menu • Shift+Click Multi-Select • Scroll to Zoom
                </div>
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2 z-50">
                <button onClick={() => setZoom(z => Math.min(z + 0.1, 5))} className="bg-gray-800 hover:bg-gray-700 text-white w-8 h-8 rounded flex items-center justify-center border border-gray-600 shadow-lg">+</button>
                <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.1))} className="bg-gray-800 hover:bg-gray-700 text-white w-8 h-8 rounded flex items-center justify-center border border-gray-600 shadow-lg">-</button>
                <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="bg-gray-800 hover:bg-gray-700 text-white px-2 h-8 rounded flex items-center justify-center border border-gray-600 text-xs shadow-lg">Reset</button>
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.1s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default NodeGraph;
