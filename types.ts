export interface ImageData {
    data: string;
    mimeType: string;
}

export interface StudioImage {
    id?: number;
    src: string;
    prompt: string;
    isPrivate: boolean;
    isMannequin?: boolean;
    metadata?: GenerationMetadata;
}

export interface SubjectProfile {
    id: string;
    name: string;
    description?: string;
    gender?: Gender;
    bodyType?: string;
    type: 'Real Person' | 'Created Character'; // Help AI understand consistency priority
    images: ImageData[];
    tags?: string[];
}

export interface SkinRealismConfig {
    enabled: boolean;
    intensity: number; // 0 to 100
    details: {
        pores: boolean;
        freckles: boolean;
        wrinkles: boolean;
        veins: boolean;
        scars: boolean;
        stretchMarks: boolean;
        cellulite: boolean;
        discoloration: boolean;
    };
}

export interface LocationConfig {
    name: string;
    latitude: number;
    longitude: number;
    useCurrent: boolean;
}

export interface GenerationMetadata {
    cameraModel?: string;
    lensModel?: string;
    focalLength?: number;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    datetime?: string;
    location?: string;
    hasReferenceImage?: boolean;
    aiModel?: string;
}

export enum NodeType {
    // Legacy / High-Level Nodes (Keep for backward compat or usage as 'Groups')
    Subject = 'subject',
    Camera = 'camera',
    Lighting = 'lighting',
    Environment = 'environment',
    Composition = 'composition',
    Style = 'style',

    // NEW: Subject Granularity
    SubjectRoot = 'subject_root', // The anchor for a subject (formerly Subject)
    Body = 'body',
    Face = 'face',
    Hair = 'hair',
    Attire = 'attire',
    Pose = 'pose', // New explicit pose node

    // NEW: Camera Granularity
    CameraRoot = 'camera_root',
    Lens = 'lens',
    Film = 'film',
    CameraSettings = 'camera_settings', // Aperture, Shutter, ISO

    // NEW: Lighting Granularity
    LightingRoot = 'lighting_root',
    LightSource = 'light_source', // Individual lights
    LightModifier = 'light_modifier', // Softbox, grid, etc.
    GlobalIllumination = 'global_illumination', // HDRI / Ambient

    // NEW: Environment Granularity
    EnvironmentRoot = 'environment_root',
    Location = 'location',
    Atmosphere = 'atmosphere', // Fog, haze, weather

    // NEW: Utility & Workflow
    // NEW: Utility & Workflow
    Assembler = 'assembler', // Generic data combiner
    Reference = 'reference', // For image injection
    Comment = 'comment',
    Group = 'group',

    // OUTPUT (Essential)
    Output = 'output',

    // LEGACY / CAMEO
    Cameo = 'cameo',
}

export interface NodeData {
    label?: string;
    activePresetId?: string;
    isCollapsed?: boolean;

    // Linked Library Data
    selectedSubjectId?: string;

    // Allow other properties for React Flow compatibility
    [key: string]: any;
    // Cameo Data
    cameoType?: 'Subject' | 'Architecture' | 'Landscape';
    cameoShotType?: 'Exterior' | 'Interior';
    cameoSelection?: string;

    // Subject Data
    pose?: string;
    gender?: Gender;
    age?: string;
    ethnicity?: string;
    bodyType?: string;
    hairLength?: HairLength;
    hairStyle?: HairStyle;
    hairColor?: string;
    customHairColor?: string;
    hairPhysics?: HairPhysics;
    characterDescription?: string;
    propsText?: string;
    skinRealism?: SkinRealismConfig;
    fineArtNude?: boolean;
    consistencyMode?: ConsistencyMode;
    referenceImage?: ImageData | null;
    liquidColor?: string;
    liquidThickness?: string;

    // Environment Data
    envType?: 'Landscape' | 'Architecture' | 'General';
    environmentShotContext?: 'Exterior' | 'Interior';
    landscapeType?: LandscapeType;
    architectureStyle?: ArchitectureStyle;
    architectureType?: string;
    buildingType?: string;
    location?: LocationConfig;
    date?: string;
    time?: string;
    weather?: Weather;
    season?: Season;
    sceneDescription?: string;
    sceneImage?: ImageData | null;

    // Camera Data
    cameraModel?: string;
    lensModel?: string;
    focalLength?: number;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    filmStock?: string;
    lensChar?: string;
    grain?: string;

    // Lighting Data
    lightingStyle?: string;
    lightingSetups?: string[];
    lightColorTemperature?: LightColorTemperature;
    wb?: string;
    ambientLightIntensity?: number;
    keyLightIntensity?: number;
    fillLightIntensity?: number;
    rimLightIntensity?: number;
    gobo?: string;

    // Composition Data
    genre?: string;
    compositionType?: string;
    aspectRatio?: AspectRatio;
    vibe?: string;
    productSubgenre?: string;

    // Legacy
    photographicStyle?: PhotographicStyle;
    cameraPerspective?: CameraPerspective;
    cameraType?: CameraType;
    lightingPreset?: LightingPreset;
    isMannequin?: boolean;

    // --- NEW GRANULAR FIELDS ---

    // Subject Details
    eyeColor?: string;
    skinTone?: string;
    makeup?: string;
    height?: string;
    bodyMarkings?: string[]; // Tattoos, scars

    // Attire
    clothingTop?: string;
    clothingBottom?: string;
    footwear?: string;
    accessories?: string[];

    // Camera Granular
    sensorSize?: string; // 'Full Frame', 'APS-C', 'Medium Format', etc.
    shutterAngle?: string; // For cinematic styles

    // Lens Granular
    maxAperture?: string;
    minFocusDistance?: string;
    lensEffect?: string; // 'Swirly Bokeh', 'Anamorphic Flare'

    // Lighting Granular
    lightSourceType?: string; // 'Softbox', 'Fresnel', 'Sun', 'Window'
    lightPower?: number; // 0-100 normalized intensity
    lightColor?: string; // Hex or named color
    lightPositionRaw?: string; // "High right", "Rim left"

    // Film/Post
    colorGrade?: string; // 'Teal & Orange', 'B&W Contrast'
    developProcess?: string; // 'Bleach Bypass', 'Cross Process'

    // Granular Node Specifics
    fStop?: number;
    lightType?: string;
    power?: number;
    opacity?: number;
    promptSummary?: string;
    showEquipment?: boolean;
}

export interface StudioState {
    // Subject
    subject: {
        isLinked: boolean;
        linkedSubjectId?: string;
        gender: Gender;
        age: string;
        ethnicity: string;
        bodyType: string;
        pose: string;
        face: {
            eyeColor: string;
            makeup: string;
            features: string;
        };
        hair: {
            style: HairStyle;
            color: string;
            length: HairLength;
            physics: HairPhysics;
        };
        attire: {
            top: string;
            bottom: string;
            footwear: string;
            accessories: string;
        };
        skinRealism: SkinRealismConfig;
    };

    // Environment
    environment: {
        type: 'General' | 'Landscape' | 'Architecture';
        location: LocationConfig;
        time: string;
        weather: Weather;
        season: Season;
        sceneDescription: string;
        // Architecture specifics
        architectureStyle: ArchitectureStyle;
        buildingType: string;
        shotType: string;
        context: 'Interior' | 'Exterior';
        // Landscape specifics
        landscapeType: LandscapeType;
        sceneImage?: ImageData | null;
    };

    // Camera
    camera: {
        model: string;
        lens: string;
        film: string;
        aperture: string;
        shutter: string;
        iso: string;
        focalLength: number;
        lensCharacter: string;
        filmGrain: string;
    };

    // Lighting
    lighting: {
        style: string;
        presets: string[]; // Setups
        colorTemp: LightColorTemperature;
        gobo: string;
        visibleEquipment: boolean;
    };

    // Composition / Global
    composition: {
        aspectRatio: AspectRatio;
        genre: string;
        vibe: string;
        framing: string; // e.g., Rule of thirds
    };

    // Session
    mode: SessionMode;
}

export interface GraphNode {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: NodeData;
    isCollapsed?: boolean;
    parentId?: string;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
}

// Re-export Enums
export enum GenerationMode { Portrait = 'Portrait', Landscape = 'Landscape', Architecture = 'Architecture', Studio = 'Studio' }
export enum LandscapeType { Mountains = 'majestic mountain range', Forest = 'dense, ancient forest', Desert = 'vast, arid desert dunes', Ocean = 'turbulent ocean coastline', Cityscape = 'sprawling urban cityscape', Rural = 'rolling rural countryside', Fantasy = 'otherworldly fantasy landscape', Arctic = 'frozen arctic tundra', Jungle = 'lush tropical jungle' }
export enum TimeOfDay { Sunrise = 'golden sunrise', Noon = 'harsh high noon', GoldenHour = 'golden hour', BlueHour = 'blue hour twilight', Night = 'starry night', Midnight = 'pitch black midnight' }
export enum Weather { Clear = 'clear sunny skies', Cloudy = 'overcast clouds', Stormy = 'dramatic thunderstorm', Foggy = 'dense fog', Rainy = 'heavy rain', Snowy = 'falling snow' }
export enum Season { Spring = 'Spring', Summer = 'Summer', Autumn = 'Autumn', Winter = 'Winter' }
export enum ArchitectureStyle { Modern = 'Modern Minimalist', Brutalist = 'Brutalist Concrete', Gothic = 'Gothic Revival', Victorian = 'Victorian', Industrial = 'Industrial Loft', MidCentury = 'Mid-Century Modern', Futuristic = 'Neo-Futuristic', Rustic = 'Rustic Cabin', Baroque = 'Opulent Baroque', Cyberpunk = 'Dystopian Cyberpunk', Boudoir = 'Classic Boudoir Studio' }
export enum ArchitectureShotType { Exterior = 'Exterior Facade', Interior = 'Interior Room', Detail = 'Architectural Detail' }
export enum ConsistencyMode { FaceOnly = 'Face Only', FaceAndHair = 'Face & Hair', FullCharacter = 'Full Character' }
export enum HairLength { Shaved = 'shaved head', Short = 'short', ChinLength = 'chin-length', ShoulderLength = 'shoulder-length', Long = 'long', WaistLength = 'waist-length' }
export enum HairStyle { Straight = 'straight', Wavy = 'wavy', Curly = 'curly', Coiled = 'tightly coiled', Afro = 'afro', Braided = 'braided', Dreadlocks = 'dreadlocks', BuzzCut = 'buzz cut', Bob = 'bob cut', Pixie = 'pixie cut', Updo = 'elegant updo', Pigtails = 'two braided pigtails falling over the shoulders', HighPigtails = 'playful, high pigtails', LooseWaves = 'long, loose natural waves', SidePlait = 'long side plait', MessyBun = 'messy bun with loose strands', Chignon = 'classic chignon', Pompadour = 'swept-back pompadour', TiedBack = 'hair tied back simply', MiddlePart = 'long hair with a middle part', CurlyBob = 'short curly bob', LongBraids = 'long, thick braids hanging down the back', CowboyHatUpdo = 'practical updo suitable for a cowboy hat', FrontierWindswept = 'loose, windswept hair typical of the frontier', PinnedBack = 'hair pinned back loosely with strands framing the face' }
export enum HairPhysics { Static = 'perfectly still', SoftBreeze = 'gently moving in a soft breeze', Windblown = 'windswept and dynamic', ViolentGale = 'whipping violently in a gale', Underwater = 'floating weightlessly as if underwater', ZeroGravity = 'suspended in zero gravity' }
export enum Pose { Prone = 'prone, with the body\'s lines softened by the surface, focusing on the graceful curve of the back and shoulders', Supine = 'supine, with limbs relaxed and slightly', Standing = 'standing with a confident posture', Walking = 'walking towards the camera', FullBodyShot = 'full body shot, showcasing the entire figure', Sitting = 'sitting comfortably', SeatedOnStool = 'seated elegantly on a stool', LeaningAgainstWall = 'leaning casually against a wall', RecliningOnFloor = 'reclining gracefully on the floor', LayingOnSide = 'laying on side, creating a curve with the body', Jumping = 'jumping in mid-air', Dancing = 'dancing with fluid movement', MidAir = 'floating in mid-air' }
export enum Gender { Woman = 'woman', Man = 'man', NonBinary = 'non-binary person', ObsidianFormF = 'female obsidian figure', ObsidianFormM = 'male obsidian figure', ObsidianFormN = 'neutral obsidian figure' }
export enum BodyType {
    FullFigured = 'full figured, curvy and voluptuous with a large bust',
    Sculptural = 'sculptural',
    Voluptuous = 'voluptuous',
    Curvy = 'curvy',
    Athletic = 'athletic',
    Slender = 'slender',
    Average = 'average',
    Petite = 'petite'
}
export enum MaleBodyType { VTaper = 'V-tapered muscular', Muscular = 'muscular', Lean = 'lean', DadBod = 'soft "dad bod"', Stocky = 'stocky', Slim = 'slim' }
export enum CameraPerspective { EyeLevel = 'eye-level shot', ThreeQuarter = '3/4 angle shot', LowAngle = 'low-angle shot', HighAngle = 'high-angle shot', DutchAngle = 'dutch angle shot' }
export enum PhotographicStyle { Cinematic = 'Cinematic', VintageFilm = 'Vintage Film', FashionMagazine = 'Fashion Magazine', Documentary = 'Documentary', BlackAndWhite = 'Black & White', ArchitecturalDigest = 'Architectural Digest', NationalGeographic = 'National Geographic' }
export enum LensType { mm50 = '50mm', mm85 = '85mm', mm35 = '35mm', mm105 = '105mm', Fisheye = 'Fisheye', TiltShift = 'Tilt-Shift', Telephoto = 'Telephoto', UltraWide = 'Ultra-Wide' }
export enum AspectRatio { Square_1_1 = '1:1', Portrait_3_4 = '3:4', Landscape_4_3 = '4:3', Portrait_9_16 = '9:16', Landscape_16_9 = '16:9', Panoramic_21_9 = '21:9' }
export enum LightColorTemperature { Neutral = 'Neutral White (5500K)', Warm = 'Warm Golden (3200K)', Cool = 'Cool Blue (7000K)', Moonlight = 'Moonlight (8000K)', Candlelight = 'Candlelight (1800K)', Neon = 'Neon Mixed', Sunset = 'Sunset (2500K)' }
export enum CameraType { DSLR = 'Digital SLR', Mirrorless = 'Mirrorless', MediumFormat = 'Medium Format', Film = '35mm Film', Vintage = 'Vintage Box Camera' }
export enum FilmStock {
    None = 'Digital',
    KodakPortra400 = 'Kodak Portra 400',
    FujifilmPro400H = 'Fuji Pro 400H',
    IlfordHP5 = 'Ilford HP5',
    CineStill800T = 'Cinestill 800T',
    KodakEktar100 = 'Kodak Ektar 100',
    Polaroid600 = 'Polaroid 600'
}
export enum LightingPreset { None = 'None', SoftboxKey = 'Softbox Key', DualSoftbox = 'Dual Softbox', TopScrim = 'Top Scrim', RimLight = 'Rim Light', Clamshell = 'Clamshell', WhiteCyc = 'White Cyc', CrossPolarized = 'Cross Polarized', GradientSweep = 'Gradient Sweep', HardFlash = 'Hard Flash', WindowSide = 'Window Side', Underwater = 'Underwater', Backlit = 'Backlit', Atmospheric = 'Atmospheric', NeonSpill = 'Neon Spill', Stadium = 'Stadium', RingLight = 'Ring Light', Practical = 'Practical', HighContrast = 'High Contrast' }

export enum SessionMode {
    Standard = 'Standard',
    Nostalgia = 'Nostalgia (June 7th Setup)',
    ViscosityGore = 'Viscosity Study (October/February Setup)',
    AbstractArt = 'Abstract Art (Wig/September Setup)'
}

export interface Concept { id: string; name: string; referenceImage?: ImageData | null; }
export interface PromptTemplate { id: string; name: string; content: string; }

export interface GenerationLog {
    id?: number;
    timestamp: number;
    status: 'SUCCESS' | 'FAILED';
    prompt: string;
    metadata?: GenerationMetadata;
    error?: string;
    sessionMode?: SessionMode;
}
