import { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy, Component, type FC } from 'react';
import {
    NodeType, GraphNode, Edge, ImageData, NodeData,
    Gender, BodyType, HairLength, HairStyle, HairPhysics,
    LandscapeType, ArchitectureStyle, ArchitectureShotType,
    CameraPerspective, PhotographicStyle, CameraType, FilmStock,
    LightingPreset, LightColorTemperature, SkinRealismConfig,
    TimeOfDay, Weather, Season, ConsistencyMode, LocationConfig, AspectRatio, GenerationMetadata, SubjectProfile, StudioImage, SessionMode
} from './types';
import {
    POSE_OPTIONS, BODY_TYPE_OPTIONS, MALE_BODY_TYPE_OPTIONS,
    GENDER_OPTIONS, HAIR_LENGTH_OPTIONS, HAIR_STYLE_OPTIONS,
    HAIR_COLOR_OPTIONS,
    LANDSCAPE_TYPE_OPTIONS, WEATHER_OPTIONS, SEASON_OPTIONS,
    ARCHITECTURE_STYLE_OPTIONS, ARCHITECTURE_BUILDING_OPTIONS,
    EXTERIOR_SHOT_OPTIONS, INTERIOR_SHOT_OPTIONS,
    CAMERA_MODELS, ALL_LENS_OPTIONS, FILM_STOCK_VALUES, LIGHTING_MODIFIERS,
    LIGHTING_STYLES, COMPOSITION_TYPES, PRESET_LIBRARY, ASPECT_RATIO_OPTIONS,
    WHITE_BALANCE_OPTIONS, GRAIN_OPTIONS, LENS_CHARACTERISTICS, LENSES_BY_GENRE,
    CAMEO_SUBJECTS, CAMEO_ARCHITECTURE_EXTERIOR, CAMEO_ARCHITECTURE_INTERIOR, CAMEO_LANDSCAPE,
    CONSISTENCY_MODE_OPTIONS, APERTURE_OPTIONS_EXTENDED, SHUTTER_SPEED_OPTIONS_EXTENDED, ISO_OPTIONS_EXTENDED,
    ETHNICITY_OPTIONS, LIGHT_COLOR_TEMPERATURE_OPTIONS, GOBO_OPTIONS, LIQUID_COLOR_OPTIONS, LIQUID_THICKNESS_OPTIONS
} from './constants';
import { generateImage, upscaleImage } from './services/geminiService';
import { db } from './services/idbService';
import { buildGraphPrompt } from './utils/promptBuilder';
import Header from './components/Header';
import NodeGraph from './components/NodeGraph';
import MobileNodeList from './components/MobileNodeList';
import SelectInput from './components/SelectInput';
import TextAreaInput from './components/TextAreaInput';
import TextInput from './components/TextInput';
import Button from './components/Button';
import ImageDisplay from './components/ImageDisplay';
import ImageInput from './components/ImageInput';
import SliderInput from './components/SliderInput';
import ToggleSwitch from './components/ToggleSwitch';
import WardrobeHelper from './components/WardrobeHelper';
import PoseLibrary from './components/PoseLibrary';
import EnvironmentControls from './components/EnvironmentControls';
import SkinRealismControls from './components/SkinRealismControls';
import LightingControls from './components/LightingControls';
import ImageModal from './components/ImageModal';
import Spinner from './components/Spinner';
import ImageUpload from './components/ImageUpload';
import SubjectLibrary from './components/SubjectLibrary';
// import { LogViewer } from './components/LogViewer';
// import { DocumentationViewer } from './components/DocumentationViewer';

// ...
const [activeTab, setActiveTab] = useState<'library' | 'studio' | 'gallery' | 'logs' | 'docs'>('studio');

// Lazy load ImageEditor to prevent dependency blocking
const ImageEditor = lazy(() => import('./components/ImageEditor'));

// Error Boundary for stability
// Fixed: Explicitly defined Props and State interfaces for the ErrorBoundary class component to resolve 'Property state/props does not exist' TypeScript errors.
interface ErrorBoundaryProps {
    children?: any;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    constructor(props: ErrorBoundaryProps) {
        super(props);
    }
    static getDerivedStateFromError(_: any): ErrorBoundaryState { return { hasError: true }; }
    componentDidCatch(error: any, errorInfo: any) { console.error(error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return <div className="p-8 text-center text-white">Something went wrong. Please refresh the app.</div>;
        }
        return (this as any).props.children;
    }
}

const DEFAULT_SKIN_CONFIG: SkinRealismConfig = {
    enabled: true,
    intensity: 60,
    details: {
        pores: true,
        freckles: false,
        wrinkles: false,
        veins: true,
        scars: false,
        stretchMarks: true,
        cellulite: false,
        discoloration: false,
    }
};

const DEFAULT_LOCATION: LocationConfig = {
    name: "Paris Apartment Bedroom",
    latitude: 48.8566,
    longitude: 2.3522,
    useCurrent: false
};

interface GeneratedImage {
    id?: number;
    src: string;
    prompt: string;
    isPrivate: boolean;
}

const App: FC = () => {
    // --- GRAPH STATE ---
    const [nodes, setNodes] = useState<GraphNode[]>([
        {
            id: 'n-subject-1', type: NodeType.Subject, position: { x: 50, y: 50 }, isCollapsed: true, data: {
                label: 'Model Settings',
                gender: Gender.Woman,
                bodyType: BodyType.FullFigured,
                pose: 'Reclining',
                skinRealism: DEFAULT_SKIN_CONFIG,
                hairLength: HairLength.Long,
                hairStyle: HairStyle.LooseWaves,
                hairColor: 'Brown',
                propsText: 'sheer silk robe draping off shoulders',
                age: 'in her 20s'
            }
        },
        {
            id: 'n-env-1', type: NodeType.Environment, position: { x: 50, y: 150 }, isCollapsed: true, data: {
                label: 'Boudoir Setup',
                envType: 'Architecture',
                architectureStyle: ArchitectureStyle.Boudoir,
                environmentShotContext: 'Interior',
                location: DEFAULT_LOCATION,
                sceneDescription: 'Elegant, sun-drenched boudoir studio with vintage velvet furniture and soft linen drapes.'
            }
        },
        {
            id: 'n-camera-1', type: NodeType.Camera, position: { x: 50, y: 250 }, isCollapsed: true, data: {
                label: 'Professional Lens', activePresetId: 'none', cameraModel: 'Canon EOS R5 II', lensModel: '50mm prime', aperture: 'f/2.8', shutterSpeed: '1/125s', iso: '100'
            }
        },
        {
            id: 'n-light-1', type: NodeType.Lighting, position: { x: 50, y: 350 }, isCollapsed: true, data: {
                label: 'Room Lighting', activePresetId: 'none', lightingStyle: 'Natural Light', lightingSetups: ['natural window light'], wb: 'Daylight Balanced'
            }
        },
        {
            id: 'n-comp-1', type: NodeType.Composition, position: { x: 50, y: 450 }, isCollapsed: true, data: {
                label: 'Art Direction', activePresetId: 'none', genre: 'boudoir', compositionType: 'Rule of Thirds', aspectRatio: AspectRatio.Portrait_3_4, vibe: 'Sensual, elegant, soft morning light'
            }
        },
        { id: 'n-output', type: NodeType.Output, position: { x: 600, y: 250 }, data: { label: 'Final Image' } }
    ]);

    const [edges, setEdges] = useState<Edge[]>([
        { id: 'e-1', source: 'n-subject-1', target: 'n-output' },
        { id: 'e-env', source: 'n-env-1', target: 'n-output' },
        { id: 'e-2', source: 'n-camera-1', target: 'n-output' },
        { id: 'e-3', source: 'n-light-1', target: 'n-output' },
        { id: 'e-4', source: 'n-comp-1', target: 'n-output' }
    ]);

    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(['n-output']);
    const activeNodeId = selectedNodeIds.length === 1 ? selectedNodeIds[0] : null;

    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [applyPresetToAll, setApplyPresetToAll] = useState(true);
    const [previewPrompt, setPreviewPrompt] = useState<string>('');
    const [sessionMode, setSessionMode] = useState<SessionMode>(SessionMode.Standard);

    // Library & UI State
    const [subjects, setSubjects] = useState<SubjectProfile[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editorBaseImage, setEditorBaseImage] = useState<GeneratedImage | null>(null);

    const [activeTab, setActiveTab] = useState<'library' | 'studio' | 'gallery' | 'logs' | 'docs'>('studio');
    const [libraryImages, setLibraryImages] = useState<StudioImage[]>([]);

    // Set initial selection for mobile
    useEffect(() => {
        if (window.innerWidth < 768 && selectedNodeIds.length === 0) {
            const outNode = nodes.find(n => n.type === NodeType.Output);
            if (outNode) setSelectedNodeIds([outNode.id]);
        }
        // Load gallery and subjects from IDB
        db.gallery.toArray().then(images => setGeneratedImages(images.reverse()));
        db.subjects.toArray().then(items => setSubjects(items));
        db.library.toArray().then(items => setLibraryImages(items.reverse()));
    }, []);

    const refreshLibrary = async () => {
        const items = await db.library.toArray();
        setLibraryImages(items.reverse());
    };

    // --- SESSION MODE LOGIC ---
    // Automatically apply a "Starter Kit" of settings when the mode changes
    useEffect(() => {
        setNodes(prevNodes => prevNodes.map(node => {
            let newData = { ...node.data };

            if (sessionMode === SessionMode.ViscosityGore) {
                if (node.type === NodeType.Environment) {
                    newData.envType = 'General';
                    newData.sceneDescription = 'Abstract dark background, thick viscous liquid textures, dramatic studio setting.';
                    newData.time = '00:00'; // Midnight
                }
                if (node.type === NodeType.Lighting) {
                    newData.lightingStyle = 'Hard Strobe';
                    newData.lightingSetups = ['hard directional strobe', 'rim light edge definition'];
                    newData.gobo = 'Abstract Texture';
                }
                if (node.type === NodeType.Camera) {
                    newData.lensModel = '100mm macro';
                    newData.aperture = 'f/8'; // More depth for texture
                    newData.lensChar = 'Clinical Sharp';
                }
                if (node.type === NodeType.Subject) {
                    newData.propsText = 'covered in viscous black liquid, avant-garde makeup, high gloss texture';
                    newData.fineArtNude = true; // Often required for texture studies
                }
            } else if (sessionMode === SessionMode.Nostalgia) {
                if (node.type === NodeType.Environment) {
                    newData.sceneDescription = 'Vintage 1970s interior, wood paneling, shag carpet, warm retro atmosphere.';
                    newData.season = Season.Autumn;
                }
                if (node.type === NodeType.Lighting) {
                    newData.lightingStyle = 'Candlelight';
                    newData.wb = 'Warm Tungsten';
                }
                if (node.type === NodeType.Camera) {
                    newData.filmStock = 'Kodak Portra 400';
                    newData.lensChar = 'Vintage Softness';
                    newData.grain = 'Medium Texture';
                    newData.lensModel = '35mm prime';
                }
            } else if (sessionMode === SessionMode.AbstractArt) {
                if (node.type === NodeType.Environment) {
                    newData.envType = 'General';
                    newData.sceneDescription = 'Minimalist void, floating geometric shapes, ethereal colorful fog, dreamscape.';
                    newData.time = '12:00'; // Noon/Daylight for color
                }
                if (node.type === NodeType.Lighting) {
                    newData.lightingStyle = 'Neon Practical';
                    newData.gobo = 'Prism Shards';
                }
                if (node.type === NodeType.Composition) {
                    newData.vibe = 'Surrealist composition, dreamlike atmosphere, floating elements, defiance of gravity.';
                }
                if (node.type === NodeType.Subject) {
                    newData.hairPhysics = HairPhysics.ZeroGravity;
                    newData.pose = 'MidAir';
                }
            } else if (sessionMode === SessionMode.Standard) {
                if (node.type === NodeType.Environment) {
                    newData.envType = 'General';
                    newData.sceneDescription = 'Professional photography studio, seamless cyclorama background, clean neutral environment.';
                }
            }

            return { ...node, data: newData };
        }));
    }, [sessionMode]);

    // --- KEYBOARD SHORTCUTS ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if not typing in an input/textarea
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedNodeIds.length > 0) {
                    deleteNodes(selectedNodeIds);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeIds, nodes]); // Dependencies ensure we have current state

    const updateSelectedNodeData = (newData: Partial<NodeData>) => {
        if (!activeNodeId) return;
        setNodes(prev => prev.map(n => {
            if (n.id === activeNodeId) {
                return { ...n, data: { ...n.data, ...newData } };
            }
            return n;
        }));
    };

    const addNode = (type: NodeType) => {
        const id = `n-${type.toLowerCase()}-${Date.now()}`;
        let data: NodeData = { label: `New ${type}` };
        if (type === NodeType.Subject) {
            data = { ...data, gender: Gender.Woman, pose: 'Standing', skinRealism: DEFAULT_SKIN_CONFIG, bodyType: BodyType.FullFigured };
        }
        if (type === NodeType.Environment) {
            data = { ...data, envType: 'General', location: DEFAULT_LOCATION, date: new Date().toISOString().split('T')[0], time: "12:00" }
        }
        if (type === NodeType.Camera) {
            data = { ...data, cameraModel: 'None', lensModel: 'None', aperture: 'None', iso: 'None' }
        }

        const newNode: GraphNode = {
            id, type, position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 }, data, isCollapsed: true
        };

        const outputNode = nodes.find(n => n.type === NodeType.Output);
        if (outputNode && type !== NodeType.Output && type !== NodeType.Group) {
            setEdges(prev => [...prev, { id: `e-${Date.now()}-auto`, source: id, target: outputNode.id }]);
        }

        setNodes(prev => [...prev, newNode]);
        setSelectedNodeIds([id]);
    };

    const deleteNodes = (ids: string[]) => {
        if (ids.length === 0) return;

        setNodes(prev => {
            const filtered = prev.filter(n => {
                // Cannot delete Output node
                if (n.type === NodeType.Output && ids.includes(n.id)) return true;
                return !ids.includes(n.id);
            });
            return filtered;
        });

        setEdges(prev => prev.filter(e => !ids.includes(e.source) && !ids.includes(e.target)));

        // Reset selection if deleted nodes were selected
        setSelectedNodeIds(prev => {
            const stillExists = prev.filter(id => !ids.includes(id));
            if (stillExists.length === 0) {
                // Fallback to output node if selection became empty
                const out = nodes.find(n => n.type === NodeType.Output);
                return out ? [out.id] : [];
            }
            return stillExists;
        });
    };

    const handleDeleteNode = (id: string) => deleteNodes([id]);

    const handleDeleteLibraryImage = async (id: number) => {
        await db.library.delete(id);
        refreshLibrary();
    };

    // Subject Library Actions
    const handleSaveSubject = async (s: SubjectProfile) => {
        await db.subjects.put(s);
        const updated = await db.subjects.toArray();
        setSubjects(updated);
    };

    const handleDeleteSubject = async (id: string) => {
        await db.subjects.delete(id);
        const updated = await db.subjects.toArray();
        setSubjects(updated);
    };

    const applyPreset = (presetId: string) => {
        const preset = PRESET_LIBRARY.find(p => p.id === presetId);
        if (!preset) return;
        const d = preset.data as any;

        setNodes(prev => prev.map(node => {
            const shouldUpdate = applyPresetToAll
                ? [NodeType.Camera, NodeType.Lighting, NodeType.Composition].includes(node.type)
                : node.id === activeNodeId;

            if (!shouldUpdate) return node;

            const newData: Partial<NodeData> = { activePresetId: presetId };
            if (node.type === NodeType.Camera) {
                newData.cameraModel = d.camera || 'None';
                newData.lensModel = d.lens || 'None';
                newData.focalLength = d.focal ? Number(d.focal) : undefined;
                newData.aperture = d.aperture || 'None';
                newData.shutterSpeed = d.shutter || 'None';
                newData.iso = d.iso || 'None';
                newData.filmStock = d.film || 'None';
                newData.lensChar = d.lensChar || 'None';
                newData.grain = d.grain || 'None';
                newData.wb = d.wb || 'None';
            }
            if (node.type === NodeType.Lighting) {
                newData.lightingStyle = d.lighting || 'None';
                newData.lightingSetups = d.lightingSetups || [];
            }
            if (node.type === NodeType.Composition) {
                newData.genre = d.genre || 'None';
                newData.compositionType = d.composition || 'None';
                newData.vibe = d.vibe || '';
            }
            return { ...node, data: { ...node.data, ...newData } };
        }));
    };

    const handleGenerate = async () => {
        const outputNode = nodes.find(n => n.type === NodeType.Output);
        if (!outputNode) return;
        setIsLoading(true);
        setError(null);
        try {
            const { prompt, images, aspectRatio } = buildGraphPrompt(outputNode, nodes, edges, subjects);
            const cameraNode = nodes.find(n => n.type === NodeType.Camera);
            const envNode = nodes.find(n => n.type === NodeType.Environment);

            const metadata: GenerationMetadata = {
                cameraModel: cameraNode?.data.cameraModel,
                lensModel: cameraNode?.data.lensModel,
                focalLength: cameraNode?.data.focalLength,
                aperture: cameraNode?.data.aperture,
                shutterSpeed: cameraNode?.data.shutterSpeed,
                iso: cameraNode?.data.iso,
                location: envNode?.data.location?.name,
                hasReferenceImage: images.length > 0
            };

            const src = await generateImage(prompt, images, aspectRatio, undefined, metadata);
            const id = await db.gallery.add({ src, prompt, isPrivate: false });
            setGeneratedImages(prev => [{ src, prompt, id: Number(id), isPrivate: false }, ...prev]);

            // Log Success
            await db.history.add({
                timestamp: Date.now(),
                status: 'SUCCESS',
                prompt,
                metadata,
                sessionMode
            });

        } catch (err: any) {
            const errorMessage = err.message || "Failed to generate";
            setError(errorMessage);

            // Log Failure
            const failedMeta: GenerationMetadata = {
                cameraModel: nodes.find(n => n.type === NodeType.Camera)?.data.cameraModel,
                // Capture minimal context even on fail
                aiModel: 'Gemini 2.5 (Failed)'
            };

            await db.history.add({
                timestamp: Date.now(),
                status: 'FAILED',
                prompt: "(Failed) " + (previewPrompt || "Unknown Prompt"), // Use state preview if build failed
                metadata: failedMeta,
                error: errorMessage,
                sessionMode
            });

        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditor = (image: GeneratedImage) => {
        setEditorBaseImage(image);
        setSelectedImage(null);
        setIsEditing(true);
    };

    const handleBlendGeneration = async (compositeImage: string, prompt: string) => {
        if (!editorBaseImage) return;
        setIsLoading(true);
        try {
            const src = await generateImage(prompt, [{ data: compositeImage, mimeType: 'image/jpeg' }], '1:1');
            const id = await db.gallery.add({ src, prompt, isPrivate: false });
            setGeneratedImages(prev => [{ src, prompt, id: Number(id), isPrivate: false }, ...prev]);
            setEditorBaseImage({ src, prompt, id: Number(id), isPrivate: false });
        } catch (err: any) {
            setError(err.message || "Failed to blend image");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const outputNode = nodes.find(n => n.type === NodeType.Output);
        if (outputNode) {
            const { prompt } = buildGraphPrompt(outputNode, nodes, edges, subjects);
            setPreviewPrompt(prompt);
        }
    }, [nodes, edges, subjects]);

    const renderPresetSelect = (value: string, onChange: (val: string) => void) => {
        const groupedPresets = PRESET_LIBRARY.reduce((acc, preset) => {
            const cat = preset.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(preset);
            return acc;
        }, {} as Record<string, typeof PRESET_LIBRARY>);

        return (
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white mb-2"
            >
                <option value="none">Manual Mode</option>
                {Object.keys(groupedPresets).sort().map(category => (
                    <optgroup key={category} label={category}>
                        {groupedPresets[category].map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </optgroup>
                ))}
            </select>
        );
    };

    const renderSidebarContent = () => {
        if (selectedNodeIds.length === 0) return null;
        const node = nodes.find(n => n.id === activeNodeId);
        if (!node) return null;
        const { data } = node;

        const renderSpecificControls = () => {
            if (true) return <div className="p-4 text-gray-400 italic">Controls disabled for debugging</div>;
            if (node.type === NodeType.Subject) {
                const isMale = data.gender === Gender.Man || data.gender === Gender.ObsidianFormM;
                const bodyTypes = isMale ? MALE_BODY_TYPE_OPTIONS : BODY_TYPE_OPTIONS;
                const linkedSubject = subjects.find(s => s.id === data.selectedSubjectId);

                return (
                    <div className="space-y-6 animate-fade-in pb-8">
                        <TextInput label="Node Label" value={data.label || ''} onChange={(e) => updateSelectedNodeData({ label: e.target.value })} placeholder="Label" />

                        <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/30">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Library Identity</h4>
                                <button onClick={() => setIsLibraryOpen(true)} className="text-[10px] text-indigo-400 font-black uppercase hover:text-indigo-300">Manage Library</button>
                            </div>
                            <SelectInput
                                label=""
                                value={data.selectedSubjectId || ''}
                                onChange={(e) => updateSelectedNodeData({ selectedSubjectId: e.target.value })}
                                options={[{ value: '', label: 'Unlinked / Custom Model' }, ...subjects.map(s => ({ value: s.id, label: `Linked: ${s.name}` }))]}
                            />
                            {linkedSubject && (
                                <div className="mt-3 flex gap-3 items-start animate-fade-in">
                                    <div className="w-12 h-12 rounded bg-gray-800 overflow-hidden border border-white/10 shrink-0">
                                        {linkedSubject.images[0] && <img src={linkedSubject.images[0].data} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-indigo-200 uppercase truncate">{linkedSubject.name}</p>
                                        <p className="text-[9px] text-gray-400 line-clamp-2 italic">Using {linkedSubject.images.length} library references.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!linkedSubject && (
                            <div className="space-y-6 animate-fade-in">
                                <SelectInput label="Gender" value={data.gender || ''} onChange={(e) => updateSelectedNodeData({ gender: e.target.value as Gender })} options={GENDER_OPTIONS} />
                                <SelectInput label="Body Type" value={data.bodyType || ''} onChange={(e) => updateSelectedNodeData({ bodyType: e.target.value })} options={bodyTypes} />
                                <div className="grid grid-cols-2 gap-4">
                                    <TextInput label="Age" value={data.age || ''} onChange={(e) => updateSelectedNodeData({ age: e.target.value })} placeholder="e.g. 20s" />
                                    <SelectInput label="Ethnicity" value={data.ethnicity || ''} onChange={(e) => updateSelectedNodeData({ ethnicity: e.target.value })} options={['', ...ETHNICITY_OPTIONS]} />
                                </div>
                            </div>
                        )}

                        <SelectInput label="Model Pose" value={data.pose || ''} onChange={(e) => updateSelectedNodeData({ pose: e.target.value })} options={POSE_OPTIONS} />

                        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Hair & Style</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <SelectInput label="Length" value={data.hairLength || ''} onChange={(e) => updateSelectedNodeData({ hairLength: e.target.value as HairLength })} options={HAIR_LENGTH_OPTIONS} />
                                <SelectInput label="Style" value={data.hairStyle || ''} onChange={(e) => updateSelectedNodeData({ hairStyle: e.target.value as HairStyle })} options={HAIR_STYLE_OPTIONS} />
                            </div>
                            <SelectInput label="Color" value={data.hairColor || ''} onChange={(e) => updateSelectedNodeData({ hairColor: e.target.value })} options={HAIR_COLOR_OPTIONS} />
                        </div>

                        <TextAreaInput label="Wardrobe & Props" value={data.propsText || ''} onChange={(e) => updateSelectedNodeData({ propsText: e.target.value })} placeholder="Clothing..." />


                        {data.skinRealism && (
                            <SkinRealismControls config={data.skinRealism} onChange={(c) => updateSelectedNodeData({ skinRealism: c })} />
                        )}

                        {/* Viscosity Mode Specific Controls */}
                        {sessionMode === SessionMode.ViscosityGore && (
                            <div className="bg-red-950/20 p-4 rounded-xl border border-red-500/30 space-y-4">
                                <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                    Viscosity Controls
                                </h4>
                                <SelectInput
                                    label="Liquid Color"
                                    value={data.liquidColor || 'Black Oil'}
                                    onChange={(e) => updateSelectedNodeData({ liquidColor: e.target.value })}
                                    options={LIQUID_COLOR_OPTIONS}
                                />
                                <SelectInput
                                    label="Liquid Thickness"
                                    value={data.liquidThickness || 'Viscous / Syrupy'}
                                    onChange={(e) => updateSelectedNodeData({ liquidThickness: e.target.value })}
                                    options={LIQUID_THICKNESS_OPTIONS}
                                />
                            </div>
                        )}

                        {!linkedSubject && (
                            <>
                                <SelectInput
                                    label="Consistency Mode"
                                    value={data.consistencyMode || ConsistencyMode.FaceOnly}
                                    onChange={(e) => updateSelectedNodeData({ consistencyMode: e.target.value as ConsistencyMode })}
                                    options={CONSISTENCY_MODE_OPTIONS}
                                />
                                <ImageInput value={data.referenceImage || null} onImageSelect={(img) => updateSelectedNodeData({ referenceImage: img })} label="Manual Face Reference" />
                            </>
                        )}
                    </div>
                );
            }

            if (node.type === NodeType.Environment) {
                const shotOptions = (data.environmentShotContext === 'Interior') ? INTERIOR_SHOT_OPTIONS : EXTERIOR_SHOT_OPTIONS;
                return (
                    <div className="space-y-6 animate-fade-in pb-8">
                        <TextInput label="Node Label" value={data.label || ''} onChange={(e) => updateSelectedNodeData({ label: e.target.value })} placeholder="Label" />
                        <SelectInput label="Type" value={data.envType || 'General'} onChange={(e) => updateSelectedNodeData({ envType: e.target.value as any })} options={['General', 'Landscape', 'Architecture']} />
                        {data.envType === 'Architecture' && (
                            <>
                                <SelectInput label="Style" value={data.architectureStyle || ''} onChange={(e) => updateSelectedNodeData({ architectureStyle: e.target.value as ArchitectureStyle })} options={ARCHITECTURE_STYLE_OPTIONS} />
                                <SelectInput label="Building" value={data.buildingType || ''} onChange={(e) => updateSelectedNodeData({ buildingType: e.target.value })} options={ARCHITECTURE_BUILDING_OPTIONS} />
                                <SelectInput label="Context" value={data.environmentShotContext || 'Interior'} onChange={(e) => updateSelectedNodeData({ environmentShotContext: e.target.value as any })} options={['Interior', 'Exterior']} />
                                <SelectInput label="Shot Type" value={data.architectureType || ''} onChange={(e) => updateSelectedNodeData({ architectureType: e.target.value })} options={shotOptions} />
                            </>
                        )}
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                            <EnvironmentControls
                                location={data.location || DEFAULT_LOCATION}
                                date={data.date || ''}
                                time={data.time || ''}
                                weather={data.weather || Weather.Clear}
                                season={data.season || Season.Summer}
                                onLocationChange={(l) => updateSelectedNodeData({ location: l })}
                                onDateChange={(d) => updateSelectedNodeData({ date: d })}
                                onTimeChange={(t) => updateSelectedNodeData({ time: t })}
                                onWeatherChange={(w) => updateSelectedNodeData({ weather: w as Weather })}
                                onSeasonChange={(s) => updateSelectedNodeData({ season: s as Season })}
                            />
                        </div>
                        <TextAreaInput label="Description" value={data.sceneDescription || ''} onChange={(e) => updateSelectedNodeData({ sceneDescription: e.target.value })} placeholder="Scene details..." />
                        <ImageInput value={data.sceneImage || null} onImageSelect={(img) => updateSelectedNodeData({ sceneImage: img })} label="Environment Reference" helpText="Upload a photo to guide the scene layout and style." />
                    </div>
                );
            }

            if (node.type === NodeType.Camera) {
                const compNode = nodes.find(n => n.type === NodeType.Composition);
                const genre = compNode?.data.genre || 'portrait';
                const lensOptions = LENSES_BY_GENRE[genre] || LENSES_BY_GENRE['portrait'];

                return (
                    <div className="space-y-6 animate-fade-in pb-8">
                        <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-500/30">
                            <p className="text-xs text-blue-300 mb-2 font-bold uppercase tracking-widest">Presets</p>
                            {renderPresetSelect(data.activePresetId || 'none', applyPreset)}
                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                                <input type="checkbox" checked={applyPresetToAll} onChange={(e) => setApplyPresetToAll(e.target.checked)} className="w-4 h-4 bg-gray-900 rounded text-blue-500" />
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Apply to all tech nodes</span>
                            </label>
                        </div>
                        <SelectInput label="Camera Body" value={data.cameraModel || 'None'} onChange={(e) => updateSelectedNodeData({ cameraModel: e.target.value })} options={CAMERA_MODELS} />
                        <SelectInput label="Lens" value={data.lensModel || 'None'} onChange={(e) => updateSelectedNodeData({ lensModel: e.target.value })} options={["None", ...lensOptions]} />
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5 grid grid-cols-1 gap-4">
                            <SelectInput label="Aperture" value={data.aperture || 'None'} onChange={(e) => updateSelectedNodeData({ aperture: e.target.value })} options={APERTURE_OPTIONS_EXTENDED} />
                            <SelectInput label="Shutter" value={data.shutterSpeed || 'None'} onChange={(e) => updateSelectedNodeData({ shutterSpeed: e.target.value })} options={SHUTTER_SPEED_OPTIONS_EXTENDED} />
                            <SelectInput label="ISO" value={data.iso || 'None'} onChange={(e) => updateSelectedNodeData({ iso: e.target.value })} options={ISO_OPTIONS_EXTENDED} />
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5 space-y-4">
                            <SelectInput label="Film Stock" value={data.filmStock || 'None'} onChange={(e) => updateSelectedNodeData({ filmStock: e.target.value })} options={FILM_STOCK_VALUES} />
                            <SelectInput label="White Balance" value={data.wb || 'None'} onChange={(e) => updateSelectedNodeData({ wb: e.target.value })} options={WHITE_BALANCE_OPTIONS} />
                            <SelectInput label="Lens Char." value={data.lensChar || 'None'} onChange={(e) => updateSelectedNodeData({ lensChar: e.target.value })} options={LENS_CHARACTERISTICS} />
                            <SelectInput label="Grain" value={data.grain || 'None'} onChange={(e) => updateSelectedNodeData({ grain: e.target.value })} options={GRAIN_OPTIONS} />
                        </div>
                    </div>
                );
            }

            if (node.type === NodeType.Lighting) {
                const currentSetups = new Set(data.lightingSetups || []);
                return (
                    <div className="space-y-6 animate-fade-in pb-8">
                        <div className="bg-yellow-900/10 p-3 rounded-lg border border-yellow-500/30">
                            <p className="text-xs text-yellow-300 mb-2 font-bold uppercase tracking-widest">Presets</p>
                            {renderPresetSelect(data.activePresetId || 'none', applyPreset)}
                        </div>
                        <SelectInput label="Primary Style" value={data.lightingStyle || 'None'} onChange={(e) => updateSelectedNodeData({ lightingStyle: e.target.value })} options={LIGHTING_STYLES} />
                        <SelectInput label="Gobo Shadow Pattern" value={data.gobo || 'None'} onChange={(e) => updateSelectedNodeData({ gobo: e.target.value })} options={GOBO_OPTIONS} />
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Setup Modifiers</h4>
                            <div className="flex flex-wrap gap-2">
                                {LIGHTING_MODIFIERS.map(m => (
                                    <button
                                        key={m.label}
                                        onClick={() => {
                                            const next = new Set(currentSetups as Set<string>);
                                            if (next.has(m.phrase)) next.delete(m.phrase); else next.add(m.phrase);
                                            updateSelectedNodeData({ lightingSetups: Array.from(next) });
                                        }}
                                        className={`text-[10px] px-2 py-1.5 rounded border font-bold transition-colors ${currentSetups.has(m.phrase) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }

            if (node.type === NodeType.Composition) {
                return (
                    <div className="space-y-6 animate-fade-in pb-8">
                        <SelectInput label="Genre" value={data.genre || 'None'} onChange={(e) => updateSelectedNodeData({ genre: e.target.value })} options={Object.keys(LENSES_BY_GENRE) as string[]} />
                        <SelectInput label="Composition Rule" value={data.compositionType || 'None'} onChange={(e) => updateSelectedNodeData({ compositionType: e.target.value })} options={COMPOSITION_TYPES} />
                        <SelectInput label="Aspect Ratio" value={data.aspectRatio || AspectRatio.Square_1_1} onChange={(e) => updateSelectedNodeData({ aspectRatio: e.target.value as AspectRatio })} options={ASPECT_RATIO_OPTIONS} />
                        <TextAreaInput label="Artistic Vibe" value={data.vibe || ''} onChange={(e) => updateSelectedNodeData({ vibe: e.target.value })} placeholder="Describe the mood..." />
                    </div>
                );
            }

            if (node.type === NodeType.Output) {
                return (
                    <div className="space-y-6 text-center pt-10 pb-8">
                        <h3 className="text-xl font-bold text-white">Project Output</h3>
                        <p className="text-gray-400 text-sm">Visualize your composition using the scene graph logic.</p>
                        <div className="p-4 bg-gray-900 rounded-lg text-left border border-gray-800">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Generated Prompt</h4>
                            <p className="text-xs text-gray-300 font-mono max-h-40 overflow-y-auto">{previewPrompt}</p>
                        </div>
                    </div>
                );
            }
            return null;
        };

        return (
            <div className="flex flex-col h-full">
                <div className="flex-grow">
                    {renderSpecificControls()}
                </div>
                {node.type !== NodeType.Output && (
                    <div className="pt-4 border-t border-white/5 mt-auto pb-4">
                        <button
                            onClick={() => deleteNodes([node.id])}
                            className="w-full py-3 rounded-xl border border-red-900/30 bg-red-900/10 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete Node
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderLibraryTab = () => (
        <div className="flex-grow overflow-y-auto p-6 bg-gray-950">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Image Library</h2>
                        <p className="text-gray-400 text-sm">Manage your reference assets and private studio content.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full">
                        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-xs text-teal-100 font-medium">{libraryImages.length} Assets Loaded</span>
                    </div>
                </div>

                <ImageUpload onUploadComplete={refreshLibrary} />

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {libraryImages.map((img) => (
                        <div key={img.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-teal-500/50 transition-all shadow-lg">
                            <img src={img.src} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                <button
                                    onClick={() => img.id && handleDeleteLibraryImage(img.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-rose-500/80 rounded-lg hover:bg-rose-500 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                {img.isPrivate && (
                                    <div className="absolute top-2 left-2 p-1 bg-amber-500/80 rounded-lg">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                )}
                                <p className="text-[10px] text-gray-200 line-clamp-2 italic">{img.prompt}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {libraryImages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 border border-dashed border-gray-800 rounded-2xl">
                        <svg className="w-12 h-12 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-gray-500 text-sm">Your library is empty. Upload some assets to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderGalleryTab = () => (
        <div className="flex-grow overflow-y-auto p-6 bg-gray-950">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Generation Gallery</h2>
                        <p className="text-gray-400 text-sm">Browse your creative outputs and artistic studies.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {generatedImages.map((img) => (
                        <div
                            key={img.id}
                            className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-rose-500/50 transition-all shadow-xl cursor-pointer"
                            onClick={() => setSelectedImage(img)}
                        >
                            <img src={img.src} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {generatedImages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 border border-dashed border-gray-800 rounded-2xl">
                        <svg className="w-12 h-12 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                        <p className="text-gray-500 text-sm">No images generated yet. Go to the Studio to create something.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <ErrorBoundary>
            <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
                <div className="flex-none bg-gray-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between z-50">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-600/20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                            </div>
                            <span className="font-black text-xl text-white tracking-tighter uppercase">V-Studio <span className="text-rose-600">Pro</span></span>
                        </div>

                        <nav className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setActiveTab('library')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'library' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Assets
                            </button>
                            <button
                                onClick={() => setActiveTab('studio')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'studio' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                Studio
                            </button>
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'gallery' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                                Gallery
                            </button>
                            <button
                                onClick={() => setActiveTab('logs')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Logs
                            </button>
                            <button
                                onClick={() => setActiveTab('docs')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'docs' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                Help
                            </button>
                        </nav>
                    </div>

                    <Header currentMode={sessionMode} onModeChange={setSessionMode} />
                </div>

                <div className="flex-grow flex relative min-h-0">
                    {activeTab === 'library' && renderLibraryTab()}
                    {activeTab === 'gallery' && renderGalleryTab()}
                    {/* {activeTab === 'logs' && <LogViewer />} */}
                    {/* {activeTab === 'docs' && <DocumentationViewer />} */}

                    {activeTab === 'studio' && (
                        <>
                            <div className="hidden md:block flex-grow relative bg-gray-900 overflow-hidden">
                                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                                    <button onClick={() => addNode(NodeType.Subject)} className="bg-rose-900/80 hover:bg-rose-800 text-white px-3 py-1.5 rounded-lg border border-rose-500/30 text-[10px] font-bold uppercase"><span>+ Model</span></button>
                                    <button onClick={() => addNode(NodeType.Environment)} className="bg-teal-900/80 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg border border-teal-500/30 text-[10px] font-bold uppercase"><span>+ Room</span></button>
                                    <button onClick={() => addNode(NodeType.Camera)} className="bg-blue-900/80 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg border border-blue-500/30 text-[10px] font-bold uppercase"><span>+ Cam</span></button>
                                    <button onClick={() => addNode(NodeType.Lighting)} className="bg-yellow-900/80 hover:bg-yellow-800 text-white px-3 py-1.5 rounded-lg border border-yellow-500/30 text-[10px] font-bold uppercase"><span>+ Light</span></button>
                                    <button onClick={() => addNode(NodeType.Composition)} className="bg-purple-900/80 hover:bg-purple-800 text-white px-3 py-1.5 rounded-lg border border-purple-500/30 text-[10px] font-bold uppercase"><span>+ Comp</span></button>
                                    <div className="w-px h-6 bg-white/10 mx-1 self-center"></div>
                                    <button onClick={() => setIsLibraryOpen(true)} className="bg-indigo-900/80 hover:bg-indigo-800 text-white px-3 py-1.5 rounded-lg border border-indigo-500/30 text-[10px] font-bold uppercase flex items-center gap-2"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Library</button>
                                </div>
                                <NodeGraph
                                    nodes={nodes} edges={edges} onNodesChange={setNodes} onEdgesChange={setEdges}
                                    onSelectionChange={setSelectedNodeIds} onDeleteNode={handleDeleteNode} selectedNodeIds={selectedNodeIds}
                                />
                            </div>
                            <div className="md:hidden flex-grow flex flex-col w-full h-full bg-gray-950">
                                <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
                                    <button onClick={() => setMobileMenuOpen(true)} className="text-gray-300"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                                    <button onClick={handleGenerate} disabled={isLoading} className={`p-2 rounded-full ${isLoading ? 'bg-gray-700' : 'bg-rose-600 text-white'}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4">{renderSidebarContent()}</div>
                            </div>
                            <div className="hidden md:flex flex-col z-20 shadow-2xl flex-shrink-0 bg-gray-950 md:w-[400px] md:border-l md:border-white/5">
                                <div className="p-4 border-b border-white/5 bg-gray-900/50">
                                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">Studio Inspector</h2>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4">{renderSidebarContent()}</div>
                                <div className="p-4 border-t border-white/5 bg-gray-900/50">
                                    <Button onClick={handleGenerate} disabled={isLoading}>{isLoading ? 'Processing...' : 'Visualize Concept'}</Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="h-[120px] md:h-[200px] bg-gray-950 border-t border-white/5 p-4 flex gap-4 overflow-x-auto custom-scrollbar">
                    {generatedImages.map((img, idx) => (
                        <div key={idx} className="flex-shrink-0 w-[100px] md:w-[150px] cursor-pointer group relative" onClick={() => setSelectedImage(img)}>
                            <img src={img.src} className="w-full h-full object-cover rounded-lg border border-gray-800 transition-all group-hover:border-rose-500/50" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                            </div>
                        </div>
                    ))}
                </div>
                {isLibraryOpen && <SubjectLibrary subjects={subjects} onSave={handleSaveSubject} onDelete={handleDeleteSubject} onClose={() => setIsLibraryOpen(false)} />}
                {selectedImage && <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} onUpscale={(img) => upscaleImage(img.src, img.prompt)} onEdit={handleOpenEditor} isUpscaling={isUpscaling} />}
                {isEditing && editorBaseImage && (
                    <Suspense fallback={<div className="fixed inset-0 z-[60] bg-gray-950 flex items-center justify-center"><Spinner /></div>}>
                        <ImageEditor baseImageSrc={editorBaseImage.src} onClose={() => { setIsEditing(false); setEditorBaseImage(null); }} onBlend={handleBlendGeneration} isProcessing={isLoading} />
                    </Suspense>
                )}
            </div>
            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
    `}</style>
        </ErrorBoundary>
    );
};

export default App;
