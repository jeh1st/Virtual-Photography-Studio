
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GraphNode, Edge, NodeType } from '../types';
import { buildSubjectDescription, buildEnvironmentDescription, buildCameraDescription, buildLightingDescription, buildCompositionDescription } from '../utils/promptBuilder';

interface NodeGraphProps {
    nodes: GraphNode[];
    edges: Edge[];
    onNodesChange: (nodes: GraphNode[]) => void;
    onEdgesChange: (edges: Edge[]) => void;
    onSelectionChange: (nodeIds: string[]) => void;
    onDeleteNode: (nodeId: string) => void;
    selectedNodeIds: string[];
}

const NodeGraph: React.FC<NodeGraphProps> = ({ 
    nodes, edges, onNodesChange, onEdgesChange, onSelectionChange, onDeleteNode, selectedNodeIds 
}) => {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanMouse, setLastPanMouse] = useState({ x: 0, y: 0 });
    const [dragState, setDragState] = useState<{ nodeIds: string[], startMouse: { x: number, y: number }, startPositions: { [id: string]: { x: number, y: number } } } | null>(null);
    const [connectState, setConnectState] = useState<{ sourceNodeId: string, mousePos: { x: number, y: number } } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);
    
    const canvasRef = useRef<HTMLDivElement>(null);

    // Close context menu on global click
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const toggleCollapse = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        onNodesChange(nodes.map(n => {
            if(n.id === nodeId) {
                return { ...n, isCollapsed: !n.isCollapsed };
            }
            return n;
        }));
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
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

    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
        if (e.button !== 0) return; // Allow right click to pass through to context menu handler
        if ((e.target as HTMLElement).closest('button')) return;

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

    const handleNodeContextMenu = (e: React.MouseEvent, nodeId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
        // Also select the node if not selected
        if (!selectedNodeIds.includes(nodeId)) {
            onSelectionChange([nodeId]);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
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

            onNodesChange(nodes.map(n => {
                if (dragState.startPositions[n.id]) {
                    return { ...n, position: { x: dragState.startPositions[n.id].x + dx, y: dragState.startPositions[n.id].y + dy } };
                }
                return n;
            }));
        }

        if (connectState) {
            setConnectState({ ...connectState, mousePos: { x: worldMouseX, y: worldMouseY } });
        }
    };

    const handleMouseUp = () => { setIsPanning(false); setDragState(null); setConnectState(null); };

    const handlePortMouseDown = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        if (e.button !== 0) return;
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const worldMouseX = (e.clientX - rect.left - pan.x) / zoom;
        const worldMouseY = (e.clientY - rect.top - pan.y) / zoom;
        setConnectState({ sourceNodeId: nodeId, mousePos: { x: worldMouseX, y: worldMouseY } });
    };

    const handlePortMouseUp = (e: React.MouseEvent, targetNodeId: string) => {
        e.stopPropagation();
        const targetNode = nodes.find(n => n.id === targetNodeId);
        if (targetNode?.type !== NodeType.Output) { setConnectState(null); return; }
        if (connectState && connectState.sourceNodeId !== targetNodeId) {
            const exists = edges.some(edge => 
                (edge.source === connectState.sourceNodeId && edge.target === targetNodeId) ||
                (edge.target === connectState.sourceNodeId && edge.source === targetNodeId)
            );
            if (!exists) {
                onEdgesChange([...edges, { id: `e-${Date.now()}`, source: connectState.sourceNodeId, target: targetNodeId }]);
            }
        }
        setConnectState(null);
    };

    const getNodeStyles = (type: NodeType) => {
        switch (type) {
            case NodeType.Subject:
                return {
                    container: 'border-fuchsia-500 bg-gray-900',
                    header: 'bg-gradient-to-r from-fuchsia-900/80 to-purple-900/80',
                    iconColor: 'text-fuchsia-300',
                    shadow: 'shadow-[0_0_20px_rgba(192,38,211,0.2)]'
                };
            case NodeType.Environment:
                return {
                    container: 'border-emerald-500 bg-gray-900',
                    header: 'bg-gradient-to-r from-emerald-900/80 to-teal-900/80',
                    iconColor: 'text-emerald-300',
                    shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                };
            case NodeType.Camera:
                return {
                    container: 'border-blue-500 bg-gray-900',
                    header: 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80',
                    iconColor: 'text-blue-300',
                    shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                };
            case NodeType.Lighting:
                return {
                    container: 'border-amber-500 bg-gray-900',
                    header: 'bg-gradient-to-r from-amber-900/80 to-yellow-900/80',
                    iconColor: 'text-amber-300',
                    shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                };
            case NodeType.Composition:
                return {
                    container: 'border-rose-500 bg-gray-900',
                    header: 'bg-gradient-to-r from-rose-900/80 to-pink-900/80',
                    iconColor: 'text-rose-300',
                    shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                };
            case NodeType.Cameo:
                return {
                    container: 'border-red-600 bg-gray-900',
                    header: 'bg-gradient-to-r from-red-900/90 to-red-800/80',
                    iconColor: 'text-red-300',
                    shadow: 'shadow-[0_0_20px_rgba(220,38,38,0.25)]'
                };
            case NodeType.Group:
                return {
                    container: 'border-gray-500 border-dashed bg-white/5 backdrop-blur-sm',
                    header: 'bg-transparent',
                    iconColor: 'text-gray-400',
                    shadow: ''
                };
            case NodeType.Output:
                return {
                    container: 'border-white bg-gray-800',
                    header: 'bg-gray-700',
                    iconColor: 'text-white',
                    shadow: 'shadow-[0_0_30px_rgba(255,255,255,0.15)]'
                };
            default:
                return {
                    container: 'border-gray-500 bg-gray-900',
                    header: 'bg-gray-800',
                    iconColor: 'text-gray-400',
                    shadow: ''
                };
        }
    };

    const getNodeIcon = (type: NodeType) => {
        switch (type) {
            case NodeType.Subject:
                return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
            case NodeType.Environment:
                return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 011 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case NodeType.Camera:
                return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
            case NodeType.Lighting:
                return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
            case NodeType.Composition:
                return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
            case NodeType.Cameo:
                return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
            case NodeType.Group:
                return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>;
            case NodeType.Output:
                return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
            default:
                return null;
        }
    };

    const getNodeSummary = (node: GraphNode) => {
        if (node.type === NodeType.Subject) return buildSubjectDescription(node.data);
        if (node.type === NodeType.Environment) return buildEnvironmentDescription(node.data);
        if (node.type === NodeType.Camera) return buildCameraDescription(node.data);
        if (node.type === NodeType.Lighting) return buildLightingDescription(node.data);
        if (node.type === NodeType.Composition) return buildCompositionDescription(node.data);
        if (node.type === NodeType.Cameo) return node.data.cameoSelection ? `${node.data.cameoType}: ${node.data.cameoSelection}` : "Select a Cameo";
        if (node.type === NodeType.Output) return "Combines connected nodes into final image prompt.";
        if (node.type === NodeType.Group) return "Group Container";
        return "";
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

    const renderConnectionLine = (x1: number, y1: number, x2: number, y2: number, active = false, valid = false) => {
        const cX = (x1 + x2) / 2;
        const cY1 = y1;
        const cY2 = y2;
        return (
             <path 
                d={`M ${x1} ${y1} C ${cX} ${cY1}, ${cX} ${cY2}, ${x2} ${y2}`}
                stroke={active ? (valid ? "#4ade80" : "#a855f7") : "#4b5563"}
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
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
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
                                        tPos.x, tPos.y + 24        // Target Anchor at fixed 24px top offset
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
                    const showLabel = node.data.label && node.data.label.trim() !== '';
                    const styles = getNodeStyles(node.type);
                    
                    if (node.parentId) {
                        const parent = nodes.find(p => p.id === node.parentId);
                        if (parent && parent.isCollapsed) return null;
                    }

                    const style = isGroup ? getGroupStyle(node) : {
                        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
                        cursor: 'grab'
                    };

                    return (
                        <div
                            key={node.id}
                            className={`absolute rounded-lg border flex flex-col select-none transition-all duration-200 group
                                ${styles.container}
                                ${isSelected ? `ring-2 ring-white scale-105 ${styles.shadow}` : (isGroup && !isCollapsed ? '' : `hover:shadow-xl`)}
                                ${connectState && !isOutput && node.id !== connectState.sourceNodeId ? 'opacity-40 grayscale' : 'opacity-100'}
                                ${(!isGroup && isCollapsed) ? 'h-auto w-[240px]' : (isGroup && !isCollapsed ? 'py-4' : 'min-h-[120px] w-[240px]')}
                            `}
                            style={style}
                            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                            onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
                        >
                            {/* Input Port (for Output Node) */}
                            {isOutput && (
                                <div 
                                    className={`w-6 h-6 rounded-full border-4 absolute -left-3 top-6 -translate-y-1/2 transition-all duration-300 flex items-center justify-center z-30 pointer-events-auto
                                        ${highlightInput ? 'bg-green-500 border-green-200 scale-125 shadow-[0_0_15px_rgba(74,222,128,0.8)]' : 'bg-gray-800 border-gray-500'}
                                    `}
                                    onMouseUp={(e) => handlePortMouseUp(e, node.id)}
                                >
                                </div>
                            )}
                            
                            {/* Node Header */}
                            <div className={`flex items-center px-3 py-2 border-b border-black/20 ${styles.header} ${(!isGroup && isCollapsed) ? 'rounded-lg' : 'rounded-t-lg'}`}>
                                <div className={`mr-2 ${styles.iconColor}`}>
                                    {getNodeIcon(node.type)}
                                </div>
                                <div className="flex flex-col flex-grow min-w-0">
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-0.5">{node.type}</span>
                                    {showLabel && <span className="text-xs font-bold text-white truncate leading-tight">{node.data.label}</span>}
                                </div>
                                {!isOutput && (
                                    <button 
                                        type="button"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => toggleCollapse(e, node.id)}
                                        className="w-5 h-5 text-white/50 hover:text-white flex items-center justify-center pointer-events-auto -mr-1"
                                    >
                                        <svg className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                )}
                            </div>
                            
                            {/* Node Body */}
                            {(!isCollapsed && !isGroup) && (
                                <div className="p-3 text-[10px] text-gray-300 font-medium leading-relaxed flex-grow overflow-hidden text-ellipsis">
                                    {getNodeSummary(node)}
                                </div>
                            )}

                            {/* Output Port */}
                            {(!isOutput && !isGroup) && (
                                <div 
                                    className="w-4 h-4 rounded-full bg-gray-400 border-2 border-gray-700 absolute -right-2 top-6 -translate-y-1/2 cursor-crosshair hover:bg-white hover:border-purple-500 hover:scale-125 transition-all shadow-md z-30 pointer-events-auto"
                                    onMouseDown={(e) => handlePortMouseDown(e, node.id)}
                                ></div>
                            )}

                        </div>
                    );
                })}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div 
                    className="absolute z-[100] bg-gray-800 border border-gray-600 rounded-lg shadow-2xl py-1 min-w-[150px] animate-fade-in"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-2 border-b border-gray-700">
                        <span className="text-xs font-bold text-gray-400 uppercase">Node Actions</span>
                    </div>
                    {nodes.find(n => n.id === contextMenu.nodeId)?.type !== NodeType.Output && (
                        <button 
                            onClick={() => { onDeleteNode(contextMenu.nodeId); setContextMenu(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete
                        </button>
                    )}
                    <button 
                        onClick={() => { setContextMenu(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                        Close
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
                 <button onClick={() => { setZoom(1); setPan({x:0, y:0}); }} className="bg-gray-800 hover:bg-gray-700 text-white px-2 h-8 rounded flex items-center justify-center border border-gray-600 text-xs shadow-lg">Reset</button>
            </div>
            
            <style>{`
                .animate-fade-in { animation: fadeIn 0.1s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default NodeGraph;
