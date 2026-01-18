import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import * as React from 'react';

// Types & Constants
import {
    StudioState, Gender, BodyType, HairLength, HairStyle, HairPhysics,
    LandscapeType, ArchitectureStyle, LightColorTemperature, SkinRealismConfig,
    Weather, Season, LocationConfig, AspectRatio, SubjectProfile, StudioImage, SessionMode, GenerationMetadata,
    ConsistencyMode
} from './types';
import { generateImage, upscaleImage } from './services/geminiService';
import { db } from './services/idbService';
import { buildPromptFromState } from './utils/promptBuilder';
import Header from './components/Header';
import { StudioRack } from './components/StudioRack/StudioRack';
import ImageDisplay from './components/ImageDisplay';
import ImageModal from './components/ImageModal';
import Spinner from './components/Spinner';
import SubjectLibrary from './components/SubjectLibrary';
import { LogViewer } from './components/LogViewer';
import { DocumentationViewer } from './components/DocumentationViewer';
import { RackPlayground } from './components/RackPlayground';

// Lazy load
const ImageEditor = lazy(() => import('./components/ImageEditor'));

// Default Configs
const DEFAULT_SKIN_CONFIG: SkinRealismConfig = {
    enabled: true,
    intensity: 60,
    details: {
        pores: true, freckles: false, wrinkles: false, veins: true,
        scars: false, stretchMarks: true, cellulite: false, discoloration: false,
    }
};

const DEFAULT_LOCATION: LocationConfig = {
    name: "Paris Apartment Bedroom",
    latitude: 48.8566, longitude: 2.3522, useCurrent: false
};

const INITIAL_STATE: StudioState = {
    subject: {
        isLinked: false,
        gender: Gender.Woman,
        age: '20s',
        ethnicity: '',
        bodyType: BodyType.Average,
        pose: 'Standing',
        face: { eyeColor: '', makeup: '', features: '' },
        hair: { style: HairStyle.Straight, color: 'Brown', length: HairLength.Long, physics: HairPhysics.Static },
        attire: { top: '', bottom: '', footwear: '', accessories: '' },
        skinRealism: DEFAULT_SKIN_CONFIG,
        consistencyMode: ConsistencyMode.FaceOnly
    },
    environment: {
        type: 'General',
        location: DEFAULT_LOCATION,
        time: 'Golden Hour',
        weather: Weather.Clear,
        season: Season.Summer,
        sceneDescription: '',
        architectureStyle: ArchitectureStyle.Modern,
        buildingType: 'Studio',
        shotType: 'Interior',
        context: 'Interior',
        landscapeType: LandscapeType.Forest,
        sceneImage: null
    },
    camera: {
        model: 'None',
        lens: 'None',
        film: 'None',
        aperture: 'None',
        shutter: 'None',
        iso: 'None',
        focalLength: 50,
        lensCharacter: 'None',
        filmGrain: 'None'
    },
    lighting: {
        style: 'None',
        presets: [],
        colorTemp: LightColorTemperature.Neutral,
        gobo: 'None',
        visibleEquipment: false
    },
    composition: {
        aspectRatio: AspectRatio.Square_1_1,
        genre: 'portrait',
        vibe: '',
        framing: 'None'
    },
    mode: SessionMode.Standard
};

interface GeneratedImage {
    id?: number;
    src: string;
    prompt: string;
    isPrivate: boolean;
    metadata?: GenerationMetadata;
}

const App: React.FC = () => {
    // --- STUDIO STATE ---
    const [studioState, setStudioState] = useState<StudioState>(INITIAL_STATE);

    // UI State
    const [activeTab, setActiveTab] = useState<'studio' | 'gallery' | 'logs' | 'docs' | 'rack-editor'>('studio');
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    // Generation State
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [previewPrompt, setPreviewPrompt] = useState<string>('');

    // Resources
    const [subjects, setSubjects] = useState<SubjectProfile[]>([]);
    const [libraryImages, setLibraryImages] = useState<StudioImage[]>([]);

    // Load Data
    useEffect(() => {
        db.gallery.toArray().then(images => setGeneratedImages(images.reverse()));
        db.subjects.toArray().then(items => setSubjects(items));
        db.library.toArray().then(items => setLibraryImages(items.reverse()));
    }, []);

    // Helper to update specific sections of state
    const updateStudioState = (section: keyof StudioState, data: Partial<any>) => {
        setStudioState(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                ...data
            }
        }));
    };

    // Live Prompt Update
    useEffect(() => {
        const { prompt } = buildPromptFromState(studioState, subjects);
        setPreviewPrompt(prompt);
    }, [studioState, subjects]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { prompt, aspectRatio } = buildPromptFromState(studioState, subjects);

            console.log("Generating with prompt:", prompt);

            // Mock or Real Generation
            // generateImage(prompt, images, aspectRatio)
            const resultData = await generateImage(prompt, [], aspectRatio);

            if (!resultData) throw new Error("Generation failed (no data returned)");

            const newImage: GeneratedImage = {
                src: resultData,
                prompt: prompt,
                isPrivate: false,
                metadata: {
                    cameraModel: studioState.camera.model,
                    lensModel: studioState.camera.lens,
                    aiModel: 'Gemini 2.0 Flash' // Placeholder
                }
            };

            const id = await db.gallery.add(newImage);
            const savedImage = { ...newImage, id: id as number };
            setGeneratedImages(prev => [savedImage, ...prev]);

            // Switch to gallery view automatically? Or just show in preview?
            // For now, let's keep user in Studio but maybe highlight the new image?

        } catch (err: any) {
            console.error("Generaton Error:", err);
            setError(err.message || 'Unknown generation error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpscale = async (image: GeneratedImage) => {
        if (!image.id) return;
        setIsUpscaling(true);
        try {
            const upscaledData = await upscaleImage(image.src, image.prompt);
            // Save logic similar to above or replace existing?
            // Simplified for now
            alert("Upscale simulated");
            console.log("Upscaled data:", upscaledData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpscaling(false);
        }
    };

    const clearGallery = () => {
        if (window.confirm(`Delete all ${generatedImages.length} images?`)) {
            db.gallery.clear().then(() => setGeneratedImages([]));
        }
    };

    const handleCopyPrompt = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleDownload = (image: GeneratedImage) => {
        const link = document.createElement('a');
        link.href = image.src;
        link.download = `v-studio-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                currentMode={studioState.mode}
                onModeChange={(m) => updateStudioState('mode', m)}
            />

            {/* MAIN CONTENT AREA via Flexbox Split */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* LEFT: STUDIO RACK (Only visible in Studio tab) */}
                {activeTab === 'studio' && (
                    <StudioRack
                        state={studioState}
                        onUpdate={updateStudioState}
                        onGenerate={handleGenerate}
                        isGenerating={isLoading}
                        subjects={subjects}
                        onManageLibrary={() => setIsLibraryOpen(true)}
                    />
                )}

                {/* RIGHT: WORKSPACE / PREVIEW */}
                <div className="flex-1 bg-gray-900/50 relative overflow-hidden flex flex-col">

                    {/* STUDIO TAB: Large Preview & Prompt HUD */}
                    {activeTab === 'studio' && (
                        <div className="flex-1 flex flex-col p-6 items-center justify-center relative bg-[url('/grid-pattern.png')] bg-repeat opacity-100">
                            {/* Background Grid Hint */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            </div>

                            {/* Main Preview */}
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4 animate-pulse">
                                    <Spinner />
                                    <p className="text-indigo-400 font-mono text-sm tracking-widest uppercase">Rendering...</p>
                                </div>
                            ) : generatedImages.length > 0 ? (
                                <div className="relative group max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden border border-white/10">
                                    <img
                                        src={generatedImages[0].src}
                                        alt="Latest Generation"
                                        className="max-h-[80vh] object-contain"
                                    />

                                    {/* CONTROLS */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCopyPrompt(generatedImages[0].prompt); }}
                                            className="bg-black/60 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-white/10 hover:bg-indigo-600 hover:border-indigo-400 transition-all shadow-lg flex items-center gap-2"
                                            title="Copy Prompt"
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider">Copy Prompt</span>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownload(generatedImages[0]); }}
                                            className="bg-black/60 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-white/10 hover:bg-emerald-600 hover:border-emerald-400 transition-all shadow-lg flex items-center gap-2"
                                            title="Save Image"
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider">Save</span>
                                        </button>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-xs text-gray-300 line-clamp-2 font-mono">{generatedImages[0].prompt}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-600">
                                    <div className="text-6xl mb-4 opacity-20">📷</div>
                                    <p className="uppercase tracking-widest text-sm font-bold">Ready to Capture</p>
                                    <p className="text-xs mt-2">Configure modules in the rack and press Generate.</p>
                                </div>
                            )}

                            {/* Floating Prompt Preview (HUD) */}
                            <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 pointer-events-none">
                                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Live Prompt Signal</h4>
                                <p className="text-xs text-gray-300 font-mono leading-relaxed opacity-80">{previewPrompt}</p>
                            </div>
                        </div>
                    )}

                    {/* GALLERY TAB */}
                    {activeTab === 'gallery' && (
                        <div className="p-8 overflow-y-auto h-full custom-scrollbar">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Session Gallery</h2>
                                <button onClick={clearGallery} className="text-red-500 text-xs font-bold uppercase hover:text-red-400">Clear All</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {generatedImages.map(img => (
                                    <div key={img.id} onClick={() => setSelectedImage(img)} className="cursor-pointer group relative aspect-square bg-gray-800 rounded-lg overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all">
                                        <img src={img.src} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LOGS TAB */}
                    {activeTab === 'logs' && <LogViewer />}

                    {/* DOCS TAB */}
                    {/* DOCS TAB */}
                    {activeTab === 'docs' && <DocumentationViewer />}

                    {/* RACK EDITOR TAB */}
                    {activeTab === 'rack-editor' && <RackPlayground />}

                </div>
            </div>

            {/* MODALS */}
            {selectedImage && (
                <ImageModal
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onUpscale={() => handleUpscale(selectedImage)}
                    isUpscaling={isUpscaling}
                />
            )}

            {isLibraryOpen && (
                <SubjectLibrary
                    isOpen={isLibraryOpen}
                    onClose={() => setIsLibraryOpen(false)}
                    onSelectSubject={(subj) => {
                        // Link subject to state
                        updateStudioState('subject', {
                            isLinked: true,
                            linkedSubjectId: subj.id,
                            // Optionally overwrite other fields with subject data
                        });
                        setIsLibraryOpen(false);
                    }}
                />
            )}

        </div>
    );
};

export default App;
