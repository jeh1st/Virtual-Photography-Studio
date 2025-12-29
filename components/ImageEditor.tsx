
import { useState, useRef, useEffect, FC, ChangeEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent } from 'react';
// Changed import to wildcard to handle "default" export wrapping by CDNs
import imglyRemoveBackground from '@imgly/background-removal';
import Button from './Button';
import Spinner from './Spinner';
import SliderInput from './SliderInput';

interface ImageEditorProps {
    baseImageSrc: string;
    onClose: () => void;
    onBlend: (compositeImage: string, prompt: string) => void;
    isProcessing: boolean;
}

const ImageEditor: FC<ImageEditorProps> = ({ baseImageSrc, onClose, onBlend, isProcessing }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const assetCanvasRef = useRef<HTMLCanvasElement>(null);

    // Asset State
    const [assetImage, setAssetImage] = useState<HTMLImageElement | null>(null);
    const [assetPos, setAssetPos] = useState({ x: 50, y: 50, scale: 0.5, rotation: 0 });

    // Tool State
    const [activeTool, setActiveTool] = useState<'move' | 'eraser' | 'wand' | 'detect'>('move');
    const [brushSize, setBrushSize] = useState(20);
    const [wandTolerance, setWandTolerance] = useState(30);
    const [wandMode, setWandMode] = useState<'keep' | 'remove'>('keep'); // Keep clicked area (isolate) or remove it

    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Prompts
    const [blendPrompt, setBlendPrompt] = useState('');
    const [generalEditPrompt, setGeneralEditPrompt] = useState('');

    // Processing States
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // History State
    const historyRef = useRef<ImageData[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Reset editor state when base image updates (e.g. after a generation cycle)
    useEffect(() => {
        setAssetImage(null);
        setBlendPrompt('');
        setGeneralEditPrompt('');
        historyRef.current = [];
        setHistoryIndex(-1);
        setActiveTool('move');
        // No need to clear canvas as removing assetImage unmounts it
    }, [baseImageSrc]);

    // Load initial asset image onto canvas for manipulation
    useEffect(() => {
        if (assetImage && assetCanvasRef.current) {
            const canvas = assetCanvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = assetImage.width;
                canvas.height = assetImage.height;
                ctx.drawImage(assetImage, 0, 0);

                // Clear history on new image load
                historyRef.current = [];
                saveToHistory();
            }
        }
    }, [assetImage]);

    // Keyboard Shortcuts for Undo/Redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                if (e.shiftKey) handleRedo();
                else handleUndo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [historyIndex]); // Re-bind when index changes to ensure latest state access if needed

    const saveToHistory = () => {
        const canvas = assetCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // If we are in the middle of history (undid some steps), truncate the future
        if (historyIndex < historyRef.current.length - 1) {
            historyRef.current = historyRef.current.slice(0, historyIndex + 1);
        }

        historyRef.current.push(snapshot);

        // Limit history size to 20
        if (historyRef.current.length > 20) {
            historyRef.current.shift();
        } else {
            setHistoryIndex(historyRef.current.length - 1);
        }
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            restoreHistory(newIndex);
            setHistoryIndex(newIndex);
        }
    };

    const handleRedo = () => {
        if (historyIndex < historyRef.current.length - 1) {
            const newIndex = historyIndex + 1;
            restoreHistory(newIndex);
            setHistoryIndex(newIndex);
        }
    };

    const restoreHistory = (index: number) => {
        const canvas = assetCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = historyRef.current[index];
        if (imageData) {
            ctx.putImageData(imageData, 0, 0);
        }
    };

    const handleAssetUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setAssetImage(img);
                    setAssetPos({ x: 100, y: 100, scale: 0.5, rotation: 0 });
                    // Default to move
                    setActiveTool('move');
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    // --- FLOOD FILL / MAGIC WAND LOGIC ---
    const performMagicWand = (startX: number, startY: number) => {
        const canvas = assetCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Get click color
        const startPos = (Math.floor(startY) * w + Math.floor(startX)) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];

        if (startA === 0) return; // Don't select transparent areas

        const visited = new Uint8Array(w * h); // 0 = unvisited, 1 = visited
        const queue = [startPos];
        visited[startPos / 4] = 1;

        // Tolerance squared for faster comparison
        // Tolerance is 0-100. Map to 0-255 range approximately.
        const maxDist = (wandTolerance / 100) * 442;

        // Identify selected pixels
        const selectedPixels = new Uint8Array(w * h); // 1 = selected

        while (queue.length > 0) {
            const pos = queue.pop()!;
            const x = (pos / 4) % w;
            const y = Math.floor((pos / 4) / w);

            selectedPixels[pos / 4] = 1;

            // Check neighbors (4-connectivity)
            const neighbors = [
                pos - 4,     // Left
                pos + 4,     // Right
                pos - w * 4, // Up
                pos + w * 4  // Down
            ];

            for (let i = 0; i < neighbors.length; i++) {
                const nPos = neighbors[i];
                const nx = (nPos / 4) % w;
                const ny = Math.floor((nPos / 4) / w);

                // Boundary checks
                if (nPos >= 0 && nPos < data.length && visited[nPos / 4] === 0) {
                    // Valid neighbor, check bounds wrapping
                    if (Math.abs(nx - x) + Math.abs(ny - y) === 1) {

                        const r = data[nPos];
                        const g = data[nPos + 1];
                        const b = data[nPos + 2];
                        const a = data[nPos + 3];

                        if (a > 0) {
                            const dist = Math.sqrt(
                                Math.pow(r - startR, 2) +
                                Math.pow(g - startG, 2) +
                                Math.pow(b - startB, 2)
                            );

                            if (dist <= maxDist) {
                                visited[nPos / 4] = 1;
                                queue.push(nPos);
                            }
                        }
                    }
                }
            }
        }

        // Apply Mask based on mode
        for (let i = 0; i < w * h; i++) {
            const isSelected = selectedPixels[i] === 1;

            if (wandMode === 'keep') {
                // Keep selected, erase everything else
                if (!isSelected) {
                    data[i * 4 + 3] = 0; // Set Alpha to 0
                }
            } else {
                // Remove selected (Standard Eraser)
                if (isSelected) {
                    data[i * 4 + 3] = 0; // Set Alpha to 0
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
        saveToHistory();
    };

    // --- UPGRADED AI REMOVAL (Using @imgly/background-removal) ---
    const handleDetectPerson = async () => {
        if (!assetImage) return;
        if (!assetCanvasRef.current) return;

        setIsAnalyzing(true);

        try {
            // Point to jsdelivr for assets as esm.sh might not serve the .wasm/.onnx files correctly in relative path
            const config = {
                publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.0.6/dist/"
            };

            // @ts-ignore
            const removeBackground = imglyRemoveBackground;

            if (typeof removeBackground !== 'function') {
                throw new Error("Could not load background removal function from library.");
            }

            const imageBlob = await removeBackground(assetImage.src, config);
            const url = URL.createObjectURL(imageBlob);

            const img = new Image();
            img.onload = () => {
                const canvas = assetCanvasRef.current;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                        saveToHistory();
                        setActiveTool('move');
                        URL.revokeObjectURL(url);
                    }
                }
            };
            img.src = url;

        } catch (e: any) {
            console.error("AI Removal failed", e);
            alert(`Background removal failed: ${e.message || 'Unknown error'}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleMouseDown = (e: ReactMouseEvent) => {
        if (!assetImage || !activeTool) return;

        // Calculate canvas coordinates
        if (activeTool === 'wand' || activeTool === 'eraser') {
            if (!assetCanvasRef.current) return;
            const canvas = assetCanvasRef.current;
            const rect = canvas.getBoundingClientRect();

            // Scale factors
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                if (activeTool === 'wand') {
                    performMagicWand(x, y);
                    return; // Wand is single click action
                }
            }
        }

        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });

        if (activeTool === 'eraser') {
            erase(e);
        }
    };

    const handleMouseMove = (e: ReactMouseEvent) => {
        if (!assetImage) return;

        if (activeTool === 'move' && isDragging) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setAssetPos(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        } else if (activeTool === 'eraser' && isDragging) {
            erase(e);
            setLastMousePos({ x: e.clientX, y: e.clientY }); // Track for smooth lines if needed
        }
    };

    const handleMouseUp = () => {
        if (isDragging && activeTool === 'eraser') {
            saveToHistory();
        }
        setIsDragging(false);
    };

    const handleWheel = (e: ReactWheelEvent) => {
        if (activeTool === 'move' && assetImage) {
            e.preventDefault();
            const scaleDelta = e.deltaY * -0.001;
            setAssetPos(prev => ({ ...prev, scale: Math.max(0.1, Math.min(prev.scale + scaleDelta, 3)) }));
        }
    };

    const erase = (e: ReactMouseEvent) => {
        if (!assetCanvasRef.current) return;
        const canvas = assetCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, brushSize * (1 / assetPos.scale), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    };

    const handleComposite = () => {
        // Create a temporary canvas to merge base + asset
        const finalCanvas = document.createElement('canvas');
        const baseImg = new Image();
        baseImg.crossOrigin = "anonymous";
        baseImg.src = baseImageSrc;

        baseImg.onload = () => {
            finalCanvas.width = baseImg.width;
            finalCanvas.height = baseImg.height;
            const ctx = finalCanvas.getContext('2d');
            if (!ctx) return;

            // 1. Draw Base
            ctx.drawImage(baseImg, 0, 0);

            // 2. Draw Asset if exists
            if (assetImage && assetCanvasRef.current && containerRef.current) {
                // Get visual ratio
                const containerRect = containerRef.current.getBoundingClientRect();

                // Calculate ratio between rendered base image and actual base image
                // Assuming object-contain behavior in CSS
                const imgRatio = baseImg.width / baseImg.height;
                const containerRatio = containerRect.width / containerRect.height;

                let renderedWidth, renderedHeight, offsetX, offsetY;

                if (containerRatio > imgRatio) {
                    renderedHeight = containerRect.height;
                    renderedWidth = renderedHeight * imgRatio;
                    offsetX = (containerRect.width - renderedWidth) / 2;
                    offsetY = 0;
                } else {
                    renderedWidth = containerRect.width;
                    renderedHeight = renderedWidth / imgRatio;
                    offsetX = 0;
                    offsetY = (containerRect.height - renderedHeight) / 2;
                }

                // Visual position relative to the rendered image
                const visualX = assetPos.x - offsetX;
                const visualY = assetPos.y - offsetY;

                // Scale factor from visual pixels to actual image pixels
                const domToImgScale = baseImg.width / renderedWidth;

                const targetX = visualX * domToImgScale;
                const targetY = visualY * domToImgScale;
                const targetWidth = (assetImage.width * assetPos.scale) * domToImgScale;
                const targetHeight = (assetImage.height * assetPos.scale) * domToImgScale;

                ctx.drawImage(assetCanvasRef.current, targetX, targetY, targetWidth, targetHeight);
            }

            const compositeDataUrl = finalCanvas.toDataURL('image/jpeg', 0.95);

            // Create a temporary link to download the image immediately
            const link = document.createElement('a');
            link.download = `composite-blend-${Date.now()}.jpg`;
            link.href = compositeDataUrl;
            link.click();

            let instructions = "A photorealistic image.";

            // Add General Edits
            if (generalEditPrompt.trim()) {
                instructions += ` INSTRUCTION: ${generalEditPrompt.trim()}.`;
            }

            // Add Blending instructions if asset present
            if (assetImage) {
                instructions += ` INSTRUCTION: Seamlessly blend the added overlay elements into the scene. Fix lighting, shadows, and color temperature to make it look like a single cohesive photograph.`;
                if (blendPrompt.trim()) {
                    instructions += ` ${blendPrompt.trim()}`;
                }
            }

            //onBlend(compositeDataUrl, instructions);
        };
    };

    return (
        <div className="fixed inset-0 bg-gray-950 z-[60] flex flex-col md:flex-row animate-fade-in">
            {/* Toolbar */}
            <div className="w-full md:w-80 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto flex-shrink-0 shadow-xl z-10">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Composition Editor
                    </h2>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-400">Modify & Compose</p>
                        <div className="flex gap-1">
                            <button
                                onClick={handleUndo}
                                disabled={historyIndex <= 0}
                                className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white transition-colors"
                                title="Undo (Ctrl+Z)"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={historyIndex >= historyRef.current.length - 1}
                                className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white transition-colors"
                                title="Redo (Ctrl+Shift+Z)"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t border-gray-800 pt-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">1. Add Asset (Optional)</h3>
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAssetUpload}
                            className="hidden"
                            id="asset-upload"
                        />
                        <label
                            htmlFor="asset-upload"
                            className="w-full flex justify-center items-center px-4 py-3 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-gray-800 transition-all text-sm text-gray-300"
                        >
                            {assetImage ? "Replace Asset Image" : "+ Upload Object / Image"}
                        </label>
                    </div>
                </div>

                {assetImage && (
                    <div className="space-y-4 border-t border-gray-800 pt-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">2. Tools</h3>
                            {isAnalyzing && <span className="text-[10px] text-yellow-400 animate-pulse">Removing Background...</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setActiveTool('move')}
                                className={`py-2 rounded-md text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 ${activeTool === 'move' ? 'bg-blue-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                title="Move & Scale"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                Move
                            </button>

                            <button
                                onClick={handleDetectPerson}
                                className={`py-2 rounded-md text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow relative overflow-hidden`}
                                title="Remove Background (AI)"
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        Remove BG
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTool('wand')}
                                className={`py-2 rounded-md text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 ${activeTool === 'wand' ? 'bg-teal-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                title="Smart Select (Magic Wand)"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Wand
                            </button>
                            <button
                                onClick={() => setActiveTool('eraser')}
                                className={`py-2 rounded-md text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 ${activeTool === 'eraser' ? 'bg-red-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                title="Manual Eraser"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Eraser
                            </button>
                        </div>

                        {activeTool === 'eraser' && (
                            <SliderInput
                                label="Eraser Size"
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                min={5} max={100}
                            />
                        )}

                        {activeTool === 'wand' && (
                            <div className="space-y-3 bg-gray-800/50 p-3 rounded border border-gray-700">
                                <p className="text-[10px] text-teal-300 font-bold uppercase mb-1">Magic Wand Settings</p>
                                <SliderInput
                                    label="Color Tolerance"
                                    value={wandTolerance}
                                    onChange={(e) => setWandTolerance(Number(e.target.value))}
                                    min={5} max={100}
                                    helpText="Higher = Selects broader color range"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setWandMode('keep')}
                                        className={`flex-1 text-[10px] py-1.5 rounded border font-bold transition-colors ${wandMode === 'keep' ? 'bg-teal-700 border-teal-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400'}`}
                                    >
                                        Keep Object
                                    </button>
                                    <button
                                        onClick={() => setWandMode('remove')}
                                        className={`flex-1 text-[10px] py-1.5 rounded border font-bold transition-colors ${wandMode === 'remove' ? 'bg-red-900 border-red-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400'}`}
                                    >
                                        Remove Area
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 italic">
                                    {wandMode === 'keep' ? "Click on the object to outline & isolate it." : "Click on background to delete it."}
                                </p>
                            </div>
                        )}

                        {activeTool === 'move' && (
                            <div className="bg-blue-900/20 p-3 rounded text-xs text-blue-200 border border-blue-500/20">
                                💡 Use Mouse Wheel to Scale. Drag to Move.
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-auto space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">3. General Edits (Optional)</label>
                        <textarea
                            value={generalEditPrompt}
                            onChange={(e) => setGeneralEditPrompt(e.target.value)}
                            placeholder="e.g. Change background to starry night, make hair red, add rain..."
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white resize-none h-20 focus:border-purple-500 outline-none"
                        />
                    </div>

                    {assetImage && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">4. Blend Adjustments (Optional)</label>
                            <textarea
                                value={blendPrompt}
                                onChange={(e) => setBlendPrompt(e.target.value)}
                                placeholder="e.g. Match shadows, soften edges..."
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white resize-none h-16 focus:border-purple-500 outline-none"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={onClose} disabled={isProcessing} variant="secondary">Cancel</Button>
                        <Button onClick={handleComposite} disabled={isProcessing || (!assetImage && !generalEditPrompt.trim())}>
                            {isProcessing ? 'Processing...' : (assetImage ? 'Generate Blend' : 'Generate Edit')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Canvas Workspace */}
            <div className="flex-grow bg-gray-950 relative overflow-hidden flex items-center justify-center p-8 select-none" ref={containerRef}>
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {/* Base Image (The Stage) */}
                <div className="relative shadow-2xl shadow-black">
                    <img
                        src={baseImageSrc}
                        alt="Base"
                        className="max-w-full max-h-[85vh] object-contain pointer-events-none"
                        style={{ opacity: isProcessing ? 0.5 : 1 }}
                    />

                    {/* Asset Layer (Overlay) */}
                    {assetImage && (
                        <div
                            className="absolute inset-0 overflow-hidden"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onWheel={handleWheel}
                            style={{ cursor: activeTool === 'move' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair' }}
                        >
                            <canvas
                                ref={assetCanvasRef}
                                className="absolute origin-center"
                                style={{
                                    transform: `translate(${assetPos.x}px, ${assetPos.y}px) scale(${assetPos.scale}) rotate(${assetPos.rotation}deg)`,
                                    transformOrigin: 'top left', // Important: Position is top-left based
                                    pointerEvents: 'none' // Events handled by parent div
                                }}
                            />
                        </div>
                    )}
                </div>

                {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
                        <div className="text-center">
                            <Spinner />
                            <p className="text-white font-bold mt-4 animate-pulse">AI is processing your request...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageEditor;
