import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RackItem, RackComponentType } from '../types';

// =============================================================================
// MODULE DEFINITIONS
// =============================================================================

type ModuleType = 'environment' | 'camera' | 'lighting' | 'composition' | 'subject';

interface ModuleConfig {
    id: ModuleType;
    label: string;
    color: string;
    bgGradient: string;
    icon: string;
    bindings: { path: string; label: string; type: 'number' | 'boolean' | 'select'; options?: string[] }[];
}

// Actual bindings pulled from types.ts enums and StudioState
const MODULES: ModuleConfig[] = [
    {
        id: 'environment',
        label: 'Environment',
        color: 'emerald',
        bgGradient: 'from-emerald-950 to-gray-900',
        icon: '🌍',
        bindings: [
            { path: 'environment.type', label: 'Environment Type', type: 'select', options: ['General', 'Landscape', 'Architecture'] },
            { path: 'environment.time', label: 'Time of Day', type: 'select', options: ['Golden Sunrise', 'Harsh High Noon', 'Golden Hour', 'Blue Hour Twilight', 'Starry Night', 'Pitch Black Midnight'] },
            { path: 'environment.weather', label: 'Weather', type: 'select', options: ['Clear Sunny', 'Overcast Clouds', 'Dramatic Thunderstorm', 'Dense Fog', 'Heavy Rain', 'Falling Snow'] },
            { path: 'environment.season', label: 'Season', type: 'select', options: ['Spring', 'Summer', 'Autumn', 'Winter'] },
            { path: 'environment.context', label: 'Shot Context', type: 'select', options: ['Interior', 'Exterior'] },
            { path: 'environment.landscapeType', label: 'Landscape Type', type: 'select', options: ['Mountains', 'Forest', 'Desert', 'Ocean', 'Cityscape', 'Rural', 'Fantasy', 'Arctic', 'Jungle'] },
            { path: 'environment.architectureStyle', label: 'Architecture Style', type: 'select', options: ['Modern Minimalist', 'Brutalist Concrete', 'Gothic Revival', 'Victorian', 'Industrial Loft', 'Mid-Century Modern', 'Neo-Futuristic', 'Rustic Cabin', 'Opulent Baroque', 'Dystopian Cyberpunk', 'Classic Boudoir Studio'] },
            { path: 'environment.sceneDescription', label: 'Scene Description', type: 'select', options: [] },
        ]
    },
    {
        id: 'camera',
        label: 'Camera',
        color: 'blue',
        bgGradient: 'from-blue-950 to-gray-900',
        icon: '📷',
        bindings: [
            { path: 'camera.model', label: 'Camera Model', type: 'select', options: ['Digital SLR', 'Mirrorless', 'Medium Format', '35mm Film', 'Vintage Box Camera'] },
            { path: 'camera.lens', label: 'Lens', type: 'select', options: ['50mm', '85mm', '35mm', '105mm', 'Fisheye', 'Tilt-Shift', 'Telephoto', 'Ultra-Wide'] },
            { path: 'camera.aperture', label: 'Aperture (f-stop)', type: 'number' },
            { path: 'camera.shutter', label: 'Shutter Speed', type: 'select', options: [] },
            { path: 'camera.iso', label: 'ISO', type: 'select', options: [] },
            { path: 'camera.focalLength', label: 'Focal Length', type: 'number' },
            { path: 'camera.film', label: 'Film Stock', type: 'select', options: ['Digital', 'Kodak Portra 400', 'Fuji Pro 400H', 'Ilford HP5', 'Cinestill 800T', 'Kodak Ektar 100', 'Polaroid 600'] },
            { path: 'camera.lensCharacter', label: 'Lens Character', type: 'select', options: ['Swirly Bokeh', 'Anamorphic Flare', 'Vintage Softness', 'Clinical Sharp'] },
            { path: 'camera.filmGrain', label: 'Film Grain', type: 'select', options: ['None', 'Fine', 'Medium', 'Heavy'] },
        ]
    },
    {
        id: 'lighting',
        label: 'Lighting',
        color: 'amber',
        bgGradient: 'from-amber-950 to-gray-900',
        icon: '💡',
        bindings: [
            { path: 'lighting.style', label: 'Lighting Style', type: 'select', options: [] },
            { path: 'lighting.presets', label: 'Lighting Setup', type: 'select', options: ['None', 'Softbox Key', 'Dual Softbox', 'Top Scrim', 'Rim Light', 'Clamshell', 'White Cyc', 'Cross Polarized', 'Gradient Sweep', 'Hard Flash', 'Window Side', 'Underwater', 'Backlit', 'Atmospheric', 'Neon Spill', 'Stadium', 'Ring Light', 'Practical', 'High Contrast'] },
            { path: 'lighting.colorTemp', label: 'Color Temperature', type: 'select', options: ['Neutral White (5500K)', 'Warm Golden (3200K)', 'Cool Blue (7000K)', 'Moonlight (8000K)', 'Candlelight (1800K)', 'Neon Mixed', 'Sunset (2500K)'] },
            { path: 'lighting.gobo', label: 'Gobo Pattern', type: 'select', options: ['None', 'Window', 'Blinds', 'Leaves', 'Abstract'] },
            { path: 'lighting.visibleEquipment', label: 'Show Equipment', type: 'boolean' },
            { path: 'lighting.keyLightIntensity', label: 'Key Light Power', type: 'number' },
            { path: 'lighting.fillLightIntensity', label: 'Fill Light Power', type: 'number' },
            { path: 'lighting.rimLightIntensity', label: 'Rim Light Power', type: 'number' },
            { path: 'lighting.ambientLightIntensity', label: 'Ambient Intensity', type: 'number' },
        ]
    },
    {
        id: 'composition',
        label: 'Composition',
        color: 'purple',
        bgGradient: 'from-purple-950 to-gray-900',
        icon: '🎨',
        bindings: [
            { path: 'composition.genre', label: 'Genre', type: 'select', options: [] },
            { path: 'composition.vibe', label: 'Vibe/Mood', type: 'select', options: [] },
            { path: 'composition.framing', label: 'Framing Rule', type: 'select', options: ['Rule of Thirds', 'Golden Ratio', 'Center Frame', 'Symmetry', 'Leading Lines', 'Fill Frame'] },
            { path: 'composition.aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['1:1 Square', '3:4 Portrait', '4:3 Landscape', '9:16 Vertical', '16:9 Widescreen', '21:9 Panoramic'] },
            { path: 'composition.cameraPerspective', label: 'Camera Angle', type: 'select', options: ['Eye Level', '3/4 Angle', 'Low Angle', 'High Angle', 'Dutch Angle'] },
            { path: 'composition.photographicStyle', label: 'Photographic Style', type: 'select', options: ['Cinematic', 'Vintage Film', 'Fashion Magazine', 'Documentary', 'Black & White', 'Architectural Digest', 'National Geographic'] },
        ]
    },
    {
        id: 'subject',
        label: 'Subject',
        color: 'rose',
        bgGradient: 'from-rose-950 to-gray-900',
        icon: '👤',
        bindings: [
            // Base Subject
            { path: 'subject.gender', label: 'Gender', type: 'select', options: ['Woman', 'Man', 'Non-Binary', 'Obsidian Form (F)', 'Obsidian Form (M)', 'Obsidian Form (N)'] },
            { path: 'subject.age', label: 'Age', type: 'select', options: [] },
            { path: 'subject.ethnicity', label: 'Ethnicity', type: 'select', options: [] },
            { path: 'subject.bodyType', label: 'Body Type', type: 'select', options: ['Full Figured', 'Sculptural', 'Voluptuous', 'Curvy', 'Athletic', 'Slender', 'Average', 'Petite'] },
            { path: 'subject.pose', label: 'Pose', type: 'select', options: ['Prone', 'Supine', 'Standing', 'Walking', 'Full Body Shot', 'Sitting', 'Seated on Stool', 'Leaning Against Wall', 'Reclining on Floor', 'Laying on Side', 'Jumping', 'Dancing', 'Mid-Air'] },
            { path: 'subject.consistencyMode', label: 'Consistency Mode', type: 'select', options: ['Face Only', 'Face & Hair', 'Full Character'] },
            // Hair
            { path: 'subject.hair.length', label: 'Hair Length', type: 'select', options: ['Shaved', 'Short', 'Chin-Length', 'Shoulder-Length', 'Long', 'Waist-Length'] },
            { path: 'subject.hair.style', label: 'Hair Style', type: 'select', options: ['Straight', 'Wavy', 'Curly', 'Tightly Coiled', 'Afro', 'Braided', 'Dreadlocks', 'Buzz Cut', 'Bob', 'Pixie', 'Elegant Updo', 'Pigtails', 'Loose Waves', 'Messy Bun', 'Chignon', 'Pompadour'] },
            { path: 'subject.hair.color', label: 'Hair Color', type: 'select', options: ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Pink', 'Blue', 'Purple', 'Green'] },
            { path: 'subject.hair.physics', label: 'Hair Physics', type: 'select', options: ['Perfectly Still', 'Soft Breeze', 'Windswept', 'Violent Gale', 'Underwater', 'Zero Gravity'] },
            // Face
            { path: 'subject.face.eyeColor', label: 'Eye Color', type: 'select', options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber'] },
            { path: 'subject.face.makeup', label: 'Makeup', type: 'select', options: ['None', 'Natural', 'Glamour', 'Dramatic', 'Editorial', 'Avant-Garde'] },
            // Attire
            { path: 'subject.attire.top', label: 'Top/Upper', type: 'select', options: [] },
            { path: 'subject.attire.bottom', label: 'Bottom/Lower', type: 'select', options: [] },
            { path: 'subject.attire.footwear', label: 'Footwear', type: 'select', options: [] },
            { path: 'subject.attire.accessories', label: 'Accessories', type: 'select', options: [] },
            // Skin Realism
            { path: 'subject.skinRealism.enabled', label: 'Skin Realism', type: 'boolean' },
            { path: 'subject.skinRealism.intensity', label: 'Skin Detail Level', type: 'number' },
        ]
    },
];

// Per-module rack configurations
interface ModuleRackConfig {
    items: RackItem[];
    controlValues: Record<string, number | boolean | string>;
}

type AllModulesConfig = Record<ModuleType, ModuleRackConfig>;

const getEmptyModuleConfig = (): ModuleRackConfig => ({
    items: [],
    controlValues: {}
});

const getDefaultAllModulesConfig = (): AllModulesConfig => ({
    environment: getEmptyModuleConfig(),
    camera: getEmptyModuleConfig(),
    lighting: getEmptyModuleConfig(),
    composition: getEmptyModuleConfig(),
    subject: getEmptyModuleConfig(),
});

// =============================================================================
// SIMPLE CONTROL COMPONENTS
// =============================================================================

interface ControlProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    width: number;
    height: number;
    disabled?: boolean;
}

// Simple Knob
const SimpleKnob: React.FC<ControlProps & { label?: string }> = ({ 
    value, onChange, min = 0, max = 100, width, label, disabled 
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const startValue = useRef(value);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(true);
        startY.current = e.clientY;
        startValue.current = value;
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const delta = startY.current - e.clientY;
            const range = max - min;
            const sensitivity = range / 100;
            const newValue = Math.max(min, Math.min(max, startValue.current + delta * sensitivity));
            onChange(newValue);
        };

        const handleMouseUp = () => setIsDragging(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, min, max, onChange]);

    const percentage = (value - min) / (max - min);
    const rotation = -135 + percentage * 270;

    return (
        <div className="flex flex-col items-center gap-1" style={{ width }}>
            <div
                className={`relative rounded-full bg-gradient-to-b from-gray-600 to-gray-800 shadow-lg border-2 border-gray-700 ${disabled ? 'opacity-50' : 'cursor-ns-resize hover:border-indigo-500'}`}
                style={{ width: width * 0.9, height: width * 0.9 }}
                onMouseDown={handleMouseDown}
            >
                <div 
                    className="absolute inset-1 rounded-full bg-gradient-to-br from-gray-500 to-gray-700"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-white rounded-full shadow" />
                </div>
                <div className="absolute inset-3 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 shadow-inner" />
            </div>
            {label && <span className="text-[9px] text-gray-400 font-medium truncate w-full text-center">{label}</span>}
        </div>
    );
};

// Simple Slider
const SimpleSlider: React.FC<ControlProps & { direction?: 'vert' | 'horz'; label?: string }> = ({
    value, onChange, min = 0, max = 100, width, height, direction = 'vert', label, disabled
}) => {
    const isVertical = direction === 'vert';
    return (
        <div className="flex flex-col items-center gap-1" style={{ width, height }}>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                disabled={disabled}
                className="accent-indigo-500 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                    ...(isVertical ? { writingMode: 'vertical-lr' as const, direction: 'rtl' as const, width: 24, height: height - 20 } 
                                   : { width: width - 10, height: 24 })
                }}
            />
            {label && <span className="text-[9px] text-gray-400 font-medium truncate w-full text-center">{label}</span>}
        </div>
    );
};

// Simple Toggle Switch
const SimpleSwitch: React.FC<{ 
    value: boolean; onChange: (value: boolean) => void; width: number; height?: number;
    direction?: 'horz' | 'vert'; label?: string; disabled?: boolean 
}> = ({ value, onChange, width, height, direction = 'horz', label, disabled }) => {
    const isVertical = direction === 'vert';
    return (
        <div className="flex items-center justify-center gap-1" style={{ width, height, flexDirection: isVertical ? 'column' : 'row' }}>
            <button
                onClick={() => !disabled && onChange(!value)}
                className={`relative rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-gray-600'} ${disabled ? 'opacity-50' : 'cursor-pointer hover:opacity-80'}`}
                style={{ width: isVertical ? 24 : 48, height: isVertical ? 48 : 24 }}
            >
                <div
                    className="absolute rounded-full bg-white shadow transition-transform"
                    style={{ width: 16, height: 16, ...(isVertical ? { left: 4, top: value ? 4 : 28 } : { top: 4, left: value ? 28 : 4 }) }}
                />
            </button>
            {label && <span className="text-[9px] text-gray-400 font-medium">{label}</span>}
        </div>
    );
};

// Simple Button
const SimpleButton: React.FC<{ onClick: () => void; width: number; height: number; label?: string; disabled?: boolean }> = ({
    onClick, width, height, label, disabled
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`bg-gradient-to-b from-gray-600 to-gray-700 border border-gray-500 rounded-lg text-xs font-bold text-gray-200 shadow-lg active:from-gray-700 active:to-gray-800 ${disabled ? 'opacity-50' : 'hover:from-gray-500 hover:to-gray-600 cursor-pointer'}`}
        style={{ width, height }}
    >
        {label || 'BTN'}
    </button>
);

// Simple Dropdown
const SimpleDropdown: React.FC<{ 
    value: string; onChange: (value: string) => void; options: { value: string; label: string }[];
    width: number; height: number; label?: string; disabled?: boolean 
}> = ({ value, onChange, options, width, height, label, disabled }) => (
    <div className="flex flex-col gap-1" style={{ width }}>
        {label && <span className="text-[9px] text-gray-400 font-medium truncate">{label}</span>}
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`bg-gray-800 border border-gray-600 rounded px-2 text-xs text-gray-200 focus:border-indigo-500 focus:outline-none ${disabled ? 'opacity-50' : 'cursor-pointer hover:border-gray-500'}`}
            style={{ width: '100%', height: height - (label ? 16 : 0) }}
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

// =============================================================================
// COMPONENT TEMPLATES
// =============================================================================

const COMPONENT_TEMPLATES = [
    { type: RackComponentType.Knob, label: 'Knob', defaultWidth: 64, defaultHeight: 64 },
    { type: RackComponentType.Slider, label: 'V-Slider', defaultWidth: 40, defaultHeight: 120, config: { direction: 'vert' as const } },
    { type: RackComponentType.Slider, label: 'H-Slider', defaultWidth: 120, defaultHeight: 40, config: { direction: 'horz' as const } },
    { type: RackComponentType.Switch, label: 'H-Switch', defaultWidth: 60, defaultHeight: 36, config: { direction: 'horz' as const } },
    { type: RackComponentType.Switch, label: 'V-Switch', defaultWidth: 36, defaultHeight: 60, config: { direction: 'vert' as const } },
    { type: RackComponentType.Button, label: 'Button', defaultWidth: 80, defaultHeight: 32 },
    { type: RackComponentType.Dropdown, label: 'Dropdown', defaultWidth: 140, defaultHeight: 36, config: { options: [{ value: 'opt1', label: 'Option 1' }, { value: 'opt2', label: 'Option 2' }] } },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const RackPlayground: React.FC = () => {
    // Current module being edited
    const [activeModule, setActiveModule] = useState<ModuleType>('camera');
    
    // All module configurations
    const [allModulesConfig, setAllModulesConfig] = useState<AllModulesConfig>(getDefaultAllModulesConfig);
    
    // UI State
    const [mode, setMode] = useState<'edit' | 'play'>('edit');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Current module's config (derived)
    const currentModuleConfig = allModulesConfig[activeModule];
    const currentModule = MODULES.find(m => m.id === activeModule)!;
    const items = currentModuleConfig.items;
    const controlValues = currentModuleConfig.controlValues;

    // Update items for current module
    const setItems = useCallback((updater: RackItem[] | ((prev: RackItem[]) => RackItem[])) => {
        setAllModulesConfig(prev => ({
            ...prev,
            [activeModule]: {
                ...prev[activeModule],
                items: typeof updater === 'function' ? updater(prev[activeModule].items) : updater
            }
        }));
        setHasUnsavedChanges(true);
    }, [activeModule]);

    // Update control values for current module
    const setControlValues = useCallback((updater: Record<string, number | boolean | string> | ((prev: Record<string, number | boolean | string>) => Record<string, number | boolean | string>)) => {
        setAllModulesConfig(prev => ({
            ...prev,
            [activeModule]: {
                ...prev[activeModule],
                controlValues: typeof updater === 'function' ? updater(prev[activeModule].controlValues) : updater
            }
        }));
    }, [activeModule]);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('rack_modules_v3');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setAllModulesConfig({ ...getDefaultAllModulesConfig(), ...parsed });
            } catch (e) {
                console.error("Failed to parse saved rack config", e);
            }
        }
    }, []);

    // Save function
    const handleSave = () => {
        localStorage.setItem('rack_modules_v3', JSON.stringify(allModulesConfig));
        setHasUnsavedChanges(false);
        console.log('Rack configuration saved!');
    };

    // Drag state
    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        item: RackItem | null;
        offsetX: number;
        offsetY: number;
        clientX: number;
        clientY: number;
        source: 'toolbar' | 'canvas';
    }>({ isDragging: false, item: null, offsetX: 0, offsetY: 0, clientX: 0, clientY: 0, source: 'canvas' });

    const canvasRef = useRef<HTMLDivElement>(null);

    const handleDragStart = (e: React.MouseEvent, item: RackItem, source: 'toolbar' | 'canvas') => {
        e.preventDefault();
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setDragState({
            isDragging: true,
            item: source === 'toolbar' ? { ...item, id: `item_${Date.now()}` } : item,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            clientX: e.clientX,
            clientY: e.clientY,
            source
        });
        if (source === 'canvas') setSelectedItemId(item.id);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragState.isDragging || !dragState.item) return;
        setDragState(prev => ({ ...prev, clientX: e.clientX, clientY: e.clientY }));

        if (canvasRef.current && dragState.source === 'canvas') {
            const rect = canvasRef.current.getBoundingClientRect();
            let x = Math.round((e.clientX - rect.left - dragState.offsetX) / 10) * 10;
            let y = Math.round((e.clientY - rect.top - dragState.offsetY) / 10) * 10;
            x = Math.max(0, Math.min(rect.width - dragState.item.width, x));
            y = Math.max(0, Math.min(rect.height - dragState.item.height, y));
            setItems(prev => prev.map(it => it.id === dragState.item!.id ? { ...it, x, y } : it));
        }
    }, [dragState, setItems]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (!dragState.isDragging || !canvasRef.current || !dragState.item) return;

        if (dragState.source === 'toolbar') {
            const rect = canvasRef.current.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                let x = Math.round((e.clientX - rect.left - dragState.offsetX) / 10) * 10;
                let y = Math.round((e.clientY - rect.top - dragState.offsetY) / 10) * 10;
                x = Math.max(0, Math.min(rect.width - dragState.item.width, x));
                y = Math.max(0, Math.min(rect.height - dragState.item.height, y));
                const newItem = { ...dragState.item, x, y };
                setItems(prev => [...prev, newItem]);
                setSelectedItemId(newItem.id);
                setControlValues(prev => ({ ...prev, [newItem.id]: newItem.type === RackComponentType.Switch ? false : 50 }));
            }
        }
        setDragState({ isDragging: false, item: null, offsetX: 0, offsetY: 0, clientX: 0, clientY: 0, source: 'canvas' });
    }, [dragState, setItems, setControlValues]);

    useEffect(() => {
        if (dragState.isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

    const handleDelete = () => {
        if (selectedItemId) {
            setItems(prev => prev.filter(i => i.id !== selectedItemId));
            setSelectedItemId(null);
        }
    };

    const handleClearModule = () => {
        setItems([]);
        setControlValues({});
        setSelectedItemId(null);
    };

    const updateSelectedItem = (key: keyof RackItem, value: any) => {
        if (!selectedItemId) return;
        setItems(prev => prev.map(item => item.id === selectedItemId ? { ...item, [key]: value } : item));
    };

    const updateControlValue = (itemId: string, value: number | boolean | string) => {
        setControlValues(prev => ({ ...prev, [itemId]: value }));
    };

    const selectedItem = items.find(i => i.id === selectedItemId);

    // Get bindings for current module
    const availableBindings = currentModule.bindings;

    return (
        <div className="min-h-screen bg-gray-950 flex text-gray-200 font-sans">

            {/* === LEFT: MODULE SELECTOR + TOOLBAR === */}
            <div className="w-64 bg-gray-900 border-r border-white/5 flex flex-col">
                
                {/* Module Selector */}
                <div className="p-3 border-b border-white/10 bg-gray-800">
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Active Module</label>
                    <select
                        value={activeModule}
                        onChange={(e) => {
                            setActiveModule(e.target.value as ModuleType);
                            setSelectedItemId(null);
                        }}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-bold focus:border-indigo-500 focus:outline-none"
                    >
                        {MODULES.map(m => (
                            <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
                        ))}
                    </select>
                </div>

                {/* Module Info */}
                <div className={`p-3 bg-gradient-to-r ${currentModule.bgGradient} border-b border-white/10`}>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{currentModule.icon}</span>
                        <div>
                            <h3 className="font-bold text-white">{currentModule.label} Module</h3>
                            <p className="text-xs text-gray-400">{items.length} controls placed</p>
                        </div>
                    </div>
                </div>

                {/* Component Toolbar */}
                <div className="p-3 border-b border-white/10">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Components</h4>
                    <div className="space-y-1">
                        {COMPONENT_TEMPLATES.map((template, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 p-2 bg-black/30 rounded border border-white/5 hover:border-indigo-500 cursor-grab text-xs"
                                onMouseDown={(e) => handleDragStart(e, {
                                    id: '', type: template.type, assetId: '', x: 0, y: 0,
                                    width: template.defaultWidth, height: template.defaultHeight,
                                    label: template.label, config: template.config || {}
                                }, 'toolbar')}
                            >
                                <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-[10px]">
                                    {template.type === RackComponentType.Knob && '◉'}
                                    {template.type === RackComponentType.Slider && '▮'}
                                    {template.type === RackComponentType.Switch && '⬤'}
                                    {template.type === RackComponentType.Button && '▢'}
                                    {template.type === RackComponentType.Dropdown && '▼'}
                                </div>
                                <span>{template.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available Bindings for this Module */}
                <div className="flex-1 overflow-y-auto p-3">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Available Bindings</h4>
                    <div className="space-y-1">
                        {availableBindings.map(b => (
                            <div key={b.path} className="text-xs p-2 bg-black/20 rounded border border-white/5">
                                <div className="font-medium text-gray-300">{b.label}</div>
                                <div className="text-gray-500 text-[10px] font-mono">{b.path}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* === CENTER: WORKSPACE === */}
            <div className="flex-1 bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">

                {/* Top Bar */}
                <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                        <div className="flex bg-gray-900 rounded-lg p-1 border border-white/10">
                            <button onClick={() => setMode('edit')} className={`px-4 py-1.5 text-xs font-bold uppercase rounded ${mode === 'edit' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Edit</button>
                            <button onClick={() => setMode('play')} className={`px-4 py-1.5 text-xs font-bold uppercase rounded ${mode === 'play' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Play</button>
                        </div>
                        <button onClick={handleClearModule} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded text-xs font-bold uppercase">Clear Module</button>
                    </div>
                    <div className="flex gap-3 items-center">
                        {hasUnsavedChanges && <span className="text-xs text-amber-400">● Unsaved changes</span>}
                        <button 
                            onClick={handleSave} 
                            className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-colors ${hasUnsavedChanges ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                        >
                            💾 Save
                        </button>
                    </div>
                </div>

                {/* Module Title Badge */}
                <div className={`absolute top-16 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r ${currentModule.bgGradient} border border-white/20 text-sm font-bold`}>
                    {currentModule.icon} {currentModule.label} Rack
                </div>

                {/* RACK CHASSIS */}
                <div
                    ref={canvasRef}
                    className={`relative w-[800px] h-[400px] bg-gradient-to-b ${currentModule.bgGradient} rounded-lg shadow-2xl border border-white/10 overflow-hidden select-none`}
                    onClick={() => mode === 'edit' && setSelectedItemId(null)}
                >
                    {/* Grid */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }} />

                    {/* Items */}
                    {items.map(item => {
                        const ctrlVal = controlValues[item.id] ?? (item.type === RackComponentType.Switch ? false : 50);
                        return (
                            <div
                                key={item.id}
                                style={{ position: 'absolute', left: item.x, top: item.y, width: item.width, height: item.height, zIndex: selectedItemId === item.id ? 30 : 20 }}
                                className={`${mode === 'edit' ? 'cursor-move' : ''} ${selectedItemId === item.id && mode === 'edit' ? 'ring-2 ring-yellow-400' : ''}`}
                                onClick={(e) => { e.stopPropagation(); if (mode === 'edit') setSelectedItemId(item.id); }}
                                onMouseDown={(e) => mode === 'edit' && handleDragStart(e, item, 'canvas')}
                            >
                                {item.type === RackComponentType.Knob && <SimpleKnob value={ctrlVal as number} onChange={(v) => updateControlValue(item.id, v)} width={item.width} height={item.height} label={item.label} disabled={mode === 'edit'} />}
                                {item.type === RackComponentType.Slider && <SimpleSlider value={ctrlVal as number} onChange={(v) => updateControlValue(item.id, v)} width={item.width} height={item.height} direction={item.config?.direction as 'vert' | 'horz'} label={item.label} disabled={mode === 'edit'} />}
                                {item.type === RackComponentType.Switch && <SimpleSwitch value={ctrlVal as boolean} onChange={(v) => updateControlValue(item.id, v)} width={item.width} height={item.height} direction={item.config?.direction as 'horz' | 'vert'} label={item.label} disabled={mode === 'edit'} />}
                                {item.type === RackComponentType.Button && <SimpleButton onClick={() => console.log('Button:', item.id)} width={item.width} height={item.height} label={item.label} disabled={mode === 'edit'} />}
                                {item.type === RackComponentType.Dropdown && <SimpleDropdown value={(ctrlVal as string) || 'opt1'} onChange={(v) => updateControlValue(item.id, v)} options={item.config?.options || []} width={item.width} height={item.height} label={item.label} disabled={mode === 'edit'} />}
                            </div>
                        );
                    })}

                    {/* Drag Ghost */}
                    {dragState.isDragging && dragState.item && (
                        <div className="fixed pointer-events-none z-[100] bg-indigo-500/20 border-2 border-indigo-400 rounded-lg flex items-center justify-center" style={{ left: dragState.clientX - dragState.offsetX, top: dragState.clientY - dragState.offsetY, width: dragState.item.width, height: dragState.item.height }}>
                            <span className="text-xs font-bold text-indigo-300">{dragState.item.label}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 text-xs text-gray-500 font-mono">
                    {mode === 'edit' ? 'EDIT MODE: Drag controls • Click to select • Bind to module parameters' : 'PLAY MODE: Interact with controls'}
                </div>
            </div>

            {/* === RIGHT: INSPECTOR === */}
            {mode === 'edit' && (
                <div className="w-72 bg-gray-900 border-l border-white/5 p-4 flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Inspector</h3>

                    {selectedItem ? (
                        <div className="space-y-4 flex-1 overflow-y-auto">
                            <div className="px-3 py-2 bg-gray-800 rounded text-xs font-mono text-gray-400">
                                {selectedItem.type} • {selectedItem.id.slice(-8)}
                            </div>

                            {/* Label */}
                            <div>
                                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Label</label>
                                <input type="text" className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={selectedItem.label || ''} onChange={(e) => updateSelectedItem('label', e.target.value)} placeholder="Control label..." />
                            </div>

                            {/* Binding - Module Specific */}
                            <div>
                                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Data Binding ({currentModule.label})</label>
                                <select className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={selectedItem.binding || ''} onChange={(e) => updateSelectedItem('binding', e.target.value)}>
                                    <option value="">-- Unbound --</option>
                                    {availableBindings.map(b => <option key={b.path} value={b.path}>{b.label}</option>)}
                                </select>
                            </div>

                            {/* Position */}
                            <div>
                                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Position</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">X</span>
                                        <input type="number" className="flex-1 bg-black border border-gray-700 rounded px-2 py-1 text-sm" value={selectedItem.x} onChange={(e) => updateSelectedItem('x', parseInt(e.target.value) || 0)} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Y</span>
                                        <input type="number" className="flex-1 bg-black border border-gray-700 rounded px-2 py-1 text-sm" value={selectedItem.y} onChange={(e) => updateSelectedItem('y', parseInt(e.target.value) || 0)} />
                                    </div>
                                </div>
                            </div>

                            {/* Size */}
                            <div>
                                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Size</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">W</span>
                                        <input type="number" className="flex-1 bg-black border border-gray-700 rounded px-2 py-1 text-sm" value={selectedItem.width} onChange={(e) => updateSelectedItem('width', Math.max(20, parseInt(e.target.value) || 64))} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">H</span>
                                        <input type="number" className="flex-1 bg-black border border-gray-700 rounded px-2 py-1 text-sm" value={selectedItem.height} onChange={(e) => updateSelectedItem('height', Math.max(20, parseInt(e.target.value) || 64))} />
                                    </div>
                                </div>
                            </div>

                            {/* Delete */}
                            <div className="pt-4 border-t border-white/5">
                                <button onClick={handleDelete} className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 rounded px-4 py-2 text-xs font-bold uppercase">Delete Component</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-center text-gray-600 text-sm">Select a component to edit</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
