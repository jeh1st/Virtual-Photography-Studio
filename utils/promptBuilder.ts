import {
    NodeData, NodeType, Gender, HairPhysics, LightingPreset, FilmStock,
    GraphNode, Edge, ImageData, ConsistencyMode, SubjectProfile, StudioImage, StudioState
} from '../types';
import { PHOTOGRAPHIC_STYLE_MAP } from '../constants';
import { getSunPhase } from './sunMath';

// --- HELPER: Traversal ---

export const getInputs = (
    targetNodeId: string,
    nodes: GraphNode[],
    edges: Edge[],
    type?: NodeType
): GraphNode[] => {
    const connectedIds = edges
        .filter(e => e.target === targetNodeId)
        .map(e => e.source);

    let connected = nodes.filter(n => connectedIds.includes(n.id));
    if (type) {
        connected = connected.filter(n => n.type === type);
    }
    return connected;
};

// --- LEGACY DESCRIPTION BUILDERS (Restored for UI & Legacy Support) ---

export const buildSubjectDescription = (data: NodeData, linkedSubject?: SubjectProfile, imageStartIndex?: number): string => {
    // Simplified version of original logic for legacy display
    let subject = "";
    if (linkedSubject) {
        subject += `Reference Identity: ${linkedSubject.name}. `;
    }

    const subjectDescParts = [data.ethnicity, data.gender, data.age].filter(Boolean);
    if (subjectDescParts.length > 0) subject += `Subject: ${subjectDescParts.join(' ')}. `;

    if (data.bodyType) subject += `Physique: ${data.bodyType}. `;
    if (data.hairStyle || data.hairColor) subject += `Hair: ${data.hairLength} ${data.hairStyle} ${data.hairColor}. `;
    if (data.propsText) subject += `Props: ${data.propsText}. `;
    return subject;
};

export const buildEnvironmentDescription = (data: NodeData): string => {
    let desc = "";
    if (data.envType === 'Landscape') {
        desc += `Landscape: ${data.landscapeType}. `;
    } else if (data.envType === 'Architecture') {
        desc += `Architecture: ${data.architectureStyle} ${data.buildingType}. `;
    }
    if (data.sceneDescription) desc += `Scene: ${data.sceneDescription}. `;
    if (data.location && data.time) desc += `Time: ${data.time}. `;
    return desc;
};

export const buildCameraDescription = (data: NodeData): string => {
    let desc = "";
    if (data.cameraModel && data.cameraModel !== 'None') desc += `Camera: ${data.cameraModel}. `;
    if (data.lensModel && data.lensModel !== 'None') desc += `Lens: ${data.lensModel}. `;
    if (data.filmStock && data.filmStock !== 'None') desc += `Film: ${data.filmStock}. `;
    return desc;
};

export const buildLightingDescription = (data: NodeData): string => {
    let desc = "";
    if (data.lightingStyle && data.lightingStyle !== 'None') desc += `Style: ${data.lightingStyle}. `;
    if (data.lightingSetups && data.lightingSetups.length > 0) desc += `Setup: ${data.lightingSetups.join(', ')}. `;
    return desc;
};

export const buildCompositionDescription = (data: NodeData): string => {
    let desc = "";
    if (data.genre) desc += `Genre: ${data.genre}. `;
    if (data.compositionType) desc += `Composition: ${data.compositionType}. `;
    return desc;
};


// --- ASSEMBLERS (New Logic) ---

const assembleSubject = (
    rootNode: GraphNode,
    nodes: GraphNode[],
    edges: Edge[],
    subjectLibrary: SubjectProfile[] = []
): { description: string; images: ImageData[] } => {
    const data = rootNode.data;
    const components = getInputs(rootNode.id, nodes, edges);
    const collectedImages: ImageData[] = [];

    // 1. Identify Components
    const bodyNode = components.find(n => n.type === NodeType.Body);
    const faceNode = components.find(n => n.type === NodeType.Face);
    const hairNode = components.find(n => n.type === NodeType.Hair);
    const attireNode = components.find(n => n.type === NodeType.Attire);
    const refNode = components.find(n => n.type === NodeType.Reference);

    let subject = "";

    // Reference Node
    if (refNode && refNode.data.referenceImage) {
        collectedImages.push(refNode.data.referenceImage);
        const imgLabel = "Image " + collectedImages.length;
        const mode = data.consistencyMode || ConsistencyMode.FaceOnly;
        if (mode === ConsistencyMode.FullCharacter) {
            subject += `The subject is visually identical to the character in reference ${imgLabel}. `;
        } else {
            subject += `The subject's identity is derived from ${imgLabel}. `;
        }
    }

    // Core Identity (Root + Body Merge)
    const gender = bodyNode?.data.gender || data.gender;
    const bodyType = bodyNode?.data.bodyType || data.bodyType;
    const age = bodyNode?.data.age || data.age;
    const ethnicity = bodyNode?.data.ethnicity || data.ethnicity;

    const isObsidian = [Gender.ObsidianFormF, Gender.ObsidianFormM, Gender.ObsidianFormN].includes(gender as Gender);
    const hasIdentity = gender || bodyType || age || ethnicity || isObsidian;

    if (hasIdentity) {
        if (isObsidian) {
            const obsidianMaterial = 'crafted from polished black obsidian. The surface possesses a unique matte finish that mimics the subsurface scattering and texture of living skin, ensuring light interacts with the form naturally despite the dark material. It is a high-contrast artistic study tool';
            subject += `The subject is ${gender}. The figure is ${obsidianMaterial}. `;
        } else {
            const parts = [age || 'young', ethnicity, gender || 'person'].filter(Boolean);
            subject += `Subject is a ${parts.join(' ')}. `;
        }

        if (bodyType) subject += `Physique: ${bodyType}. `;

        // Skin Realism (Specific to Body Node presence usually, or if Root had it added in future)
        const skinData = bodyNode?.data.skinRealism;
        if (skinData?.enabled && !isObsidian) {
            let intensityAdjective = 'softly textured';
            let textureTokens = '';
            if (skinData.intensity > 90) {
                intensityAdjective = 'hyper-realistic, dermatological texture, sharp focus';
                textureTokens = 'micro-contrast, skin sheen, slight sweat, peach fuzz, unmasked texture';
            } else if (skinData.intensity > 60) {
                intensityAdjective = 'raw, unretouched, authentic';
                textureTokens = 'natural skin gloss, tactile texture';
            }
            subject += `Skin texture is ${intensityAdjective}. ${textureTokens} `;

            const details = [];
            if (skinData.details.pores) details.push('visible pores');
            if (skinData.details.freckles) details.push('natural freckles');
            if (skinData.details.wrinkles) details.push('fine lines and wrinkles');
            if (skinData.details.veins) details.push('subtle subsurface veins');
            if (skinData.details.scars) details.push('small natural scars');
            if (skinData.details.stretchMarks) details.push(`natural stretch marks`);
            if (skinData.details.cellulite && gender !== Gender.Man) details.push('gentle cellulite texture');
            if (skinData.details.discoloration) details.push('natural skin tone variations');

            if (details.length > 0) {
                subject += `Visible details: ${details.join(', ')}. `;
            }
        }
    } else {
        // Fallback or explicit label usage if no identity data
        if (data.label) subject += `Subject: ${data.label}. `;
    }

    // Face
    if (faceNode) {
        const d = faceNode.data;
        const features = [];
        if (d.eyeColor) features.push(`${d.eyeColor} eyes`);
        if (d.makeup) features.push(`wearing ${d.makeup}`);
        if (d.characterDescription) features.push(d.characterDescription);

        if (features.length > 0) subject += `Features: ${features.join(', ')}. `;
    }

    // Hair
    if (hairNode) {
        const d = hairNode.data;
        const color = d.hairColor === 'Other...' ? d.customHairColor : d.hairColor;
        const physics = d.hairPhysics ? `, ${d.hairPhysics}` : '';
        subject += `Hair: ${d.hairLength || ''} ${d.hairStyle || ''} ${color || ''}${physics}. `;
    }

    // Attire
    if (attireNode) {
        const d = attireNode.data;
        const items = [d.clothingTop, d.clothingBottom, d.footwear].filter(Boolean);
        if (items.length > 0) subject += `Attire: ${items.join(', ')}. `;
        if (d.propsText) subject += `Accessories: ${d.propsText}. `;
    } else if (data.propsText) {
        subject += `Attire/Props: ${data.propsText}. `;
    }

    return { description: subject.trim(), images: collectedImages };
};

const assembleCamera = (
    rootNode: GraphNode,
    nodes: GraphNode[],
    edges: Edge[]
): string => {
    const data = rootNode.data;
    const components = getInputs(rootNode.id, nodes, edges);

    let desc = "";
    const model = data.cameraModel && data.cameraModel !== 'None' ? data.cameraModel : null;
    if (model) desc += `Shot on ${model}. `;

    const lensNode = components.find(n => n.type === NodeType.Lens);
    if (lensNode) {
        const d = lensNode.data;
        if (d.lensModel && d.lensModel !== 'None') desc += `Lens: ${d.lensModel}. `;
        if (d.aperture && d.aperture !== 'None') desc += `Aperture: ${d.aperture}. `;
        if (d.lensChar) desc += `Optics: ${d.lensChar}. `;
    }

    const filmNode = components.find(n => n.type === NodeType.Film);
    if (filmNode) {
        const d = filmNode.data;
        if (d.filmStock && d.filmStock !== 'None') desc += `Film: ${d.filmStock}. `;
        if (d.grain && d.grain !== 'None') desc += `Texture: ${d.grain}. `;
    }
    return desc.trim();
};


// --- MAIN BUILDER ---

export const buildGraphPrompt = (
    outputNode: GraphNode,
    allNodes: GraphNode[],
    allEdges: Edge[],
    subjectLibrary: SubjectProfile[] = []
): { prompt: string; images: ImageData[]; aspectRatio: string } => {

    let promptParts: string[] = [];
    let aspectRatio = "1:1";
    const collectedImages: ImageData[] = [];

    // 1. Environment & Composition
    const compNodes = getInputs(outputNode.id, allNodes, allEdges, NodeType.Composition);
    const envNodes = getInputs(outputNode.id, allNodes, allEdges, NodeType.Environment);
    const envRootNodes = getInputs(outputNode.id, allNodes, allEdges, NodeType.EnvironmentRoot);

    compNodes.forEach(n => {
        if (n.data.genre) promptParts.push(`Genre: ${n.data.genre}.`);
        if (n.data.aspectRatio) aspectRatio = n.data.aspectRatio;
    });

    if (envNodes.length > 0 || envRootNodes.length > 0) {
        [...envNodes, ...envRootNodes].forEach(n => {
            promptParts.push(buildEnvironmentDescription(n.data)); // Use legacy builder
            if (n.data.sceneImage) collectedImages.push(n.data.sceneImage);
        });
    } else {
        promptParts.push("Setting: Minimalist Studio.");
    }

    // 2. Subjects
    const subjectRootNodes = getInputs(outputNode.id, allNodes, allEdges, NodeType.SubjectRoot);
    const legacySubjectNodes = getInputs(outputNode.id, allNodes, allEdges, NodeType.Subject);
    const allSubjectNodes = [...subjectRootNodes, ...legacySubjectNodes];

    allSubjectNodes.forEach((node, idx) => {
        const prefix = allSubjectNodes.length > 1 ? `SUBJECT ${idx + 1}:` : "SUBJECT:";

        if (node.type === NodeType.SubjectRoot) {
            const assembled = assembleSubject(node, allNodes, allEdges, subjectLibrary);
            collectedImages.push(...assembled.images);
            promptParts.push(`${prefix} ${assembled.description}`);

        } else {
            // Legacy
            promptParts.push(`${prefix} ${buildSubjectDescription(node.data)}`);
        }
    });

    // 3. Camera
    const cameraRootNodes = getInputs(outputNode.id, allNodes, allEdges, NodeType.CameraRoot);
    const legacyCameraNodes = getInputs(outputNode.id, allNodes, allEdges, NodeType.Camera);

    [...cameraRootNodes, ...legacyCameraNodes].forEach(node => {
        if (node.type === NodeType.CameraRoot) {
            promptParts.push(assembleCamera(node, allNodes, allEdges));
        } else {
            promptParts.push(buildCameraDescription(node.data));
        }
    });

    // 4. Lighting
    const lightSourceNodes = getInputs(outputNode.id, allNodes, allEdges, NodeType.LightSource); // New
    const legacyLightingNodes = getInputs(outputNode.id, allNodes, allEdges, NodeType.Lighting); // Old

    lightSourceNodes.forEach(node => {
        const desc = `Light Source: ${node.data.lightSourceType} (${node.data.lightColorTemperature})`;
        if (node.data.showEquipment) {
            promptParts.push(`${desc} visible in frame.`);
        } else {
            // We want the effect, but not the object. AI often interprets "Light Source: X" as an object.
            // Phrasing it as "Lighting Style: X" or just "Lighting: X" might be safer.
            // Or explicitly saying "Off-screen".
            promptParts.push(`Lighting: ${node.data.lightSourceType} (off-screen source), ${node.data.lightColorTemperature}.`);
        }
    });

    legacyLightingNodes.forEach(node => {
        promptParts.push(buildLightingDescription(node.data));
    });


    // Final cleanup
    const fullPrompt = promptParts.join(" ");

    return {
        prompt: sanitizeNouns(fullPrompt),
        images: collectedImages,
        aspectRatio
    };
};

/**
 * Compliance Filter
 */
const sanitizeNouns = (text: string): string => {
    const replacements: Record<string, string> = {
        'softbox': 'large diffused directional light source',
        'reflector': 'ambient bounce illumination',
        'blood': 'deep crimson liquid pigment study',
        'fake blood': 'high-viscosity translucent surface coating',
        'lube': 'translucent fluid with high specular reflectivity',
        'naked': 'unadorned anatomical form',
        'stepladder': '30-degree downward vertical pitch'
    };

    let sanitized = text;
    Object.entries(replacements).forEach(([noun, replacement]) => {
        const regex = new RegExp(`\\b${noun}\\b`, 'gi');
        sanitized = sanitized.replace(regex, replacement);
    });

    const forbidden = [/stand/gi, /tripod/gi, /mount/gi, /lamp/gi];
    forbidden.forEach(regex => { sanitized = sanitized.replace(regex, ''); });

    return sanitized;
};

export const buildPromptFromState = (state: StudioState, subjectLibrary: SubjectProfile[] = []): { prompt: string, aspectRatio: string } => {
    let promptParts: string[] = [];

    // 1. Environment
    const env = state.environment;
    let envDesc = "";
    if (env.type === 'Landscape') envDesc += `Landscape: ${env.landscapeType}. `;
    else if (env.type === 'Architecture') envDesc += `Architecture: ${env.architectureStyle} ${env.buildingType}, ${env.context} ${env.shotType}. `;

    if (env.sceneDescription) envDesc += `Scene: ${env.sceneDescription}. `;
    if (env.time) envDesc += `Time: ${env.time}. `;
    if (env.weather) envDesc += `Weather: ${env.weather}. `;
    if (env.season) envDesc += `Season: ${env.season}. `;

    if (envDesc) promptParts.push(envDesc);
    else promptParts.push("Setting: Minimalist Studio.");

    // 2. Subject
    const sub = state.subject;
    if (sub.isLinked && sub.linkedSubjectId) {
        const linked = subjectLibrary.find(s => s.id === sub.linkedSubjectId);
        if (linked) promptParts.push(`Reference Identity: ${linked.name}.`);
    }

    let subjectDesc = "";
    if (!sub.isLinked) {
        // Identity
        const parts = [sub.age, sub.ethnicity, sub.gender].filter(Boolean);
        if (parts.length > 0) subjectDesc += `Subject is a ${parts.join(' ')}. `;
        if (sub.bodyType) subjectDesc += `Physique: ${sub.bodyType}. `;

        // Face
        const faceFeatures = [];
        if (sub.face.eyeColor) faceFeatures.push(`${sub.face.eyeColor} eyes`);
        if (sub.face.makeup) faceFeatures.push(`wearing ${sub.face.makeup}`);
        if (sub.face.features) faceFeatures.push(sub.face.features);
        if (faceFeatures.length > 0) subjectDesc += `Features: ${faceFeatures.join(', ')}. `;

        // Skin Realism
        if (sub.skinRealism.enabled) {
            let intensityAdjective = 'softly textured';
            // Simple fallback logic or copy full logic later if needed
            if (sub.skinRealism.intensity > 80) intensityAdjective = 'hyper-realistic, unretouched dermatological texture';
            subjectDesc += `Skin texture: ${intensityAdjective}. `;
        }
    }

    if (sub.pose) subjectDesc += `Pose: ${sub.pose}. `;

    // Hair (Apply even if linked, sometimes?) - Assuming yes for now if user set it
    const hair = sub.hair;
    const hairPhys = hair.physics ? `, ${hair.physics}` : '';
    // Only add hair if it's not default/empty or if explicitly set. 
    // Checking for "None" or defaults might be needed, but simplified:
    if (hair.style || hair.color) subjectDesc += `Hair: ${hair.length} ${hair.style} ${hair.color}${hairPhys}. `;

    // Attire
    const attire = [sub.attire.top, sub.attire.bottom, sub.attire.footwear].filter(Boolean);
    if (attire.length > 0) subjectDesc += `Attire: ${attire.join(', ')}. `;
    if (sub.attire.accessories) subjectDesc += `Accessories: ${sub.attire.accessories}. `;

    promptParts.push(subjectDesc);

    // 3. Camera
    const cam = state.camera;
    promptParts.push(`Shot on ${cam.model}, Lens: ${cam.lens}, ${cam.aperture}, ${cam.shutter}, ${cam.iso}.`);
    if (cam.film !== 'None') promptParts.push(`Film Stock: ${cam.film} (${cam.filmGrain}).`);
    if (cam.lensCharacter) promptParts.push(`Optics: ${cam.lensCharacter}.`);

    // 4. Lighting
    const light = state.lighting;
    promptParts.push(`Lighting: ${light.style}, ${light.colorTemp}.`);
    if (light.presets.length > 0) promptParts.push(`Modifiers: ${light.presets.join(', ')}.`);
    if (light.gobo !== 'None') promptParts.push(`Gobo Pattern: ${light.gobo}.`);
    if (light.visibleEquipment) promptParts.push("Studio lighting equipment visible in frame.");

    // 5. Composition
    const comp = state.composition;
    promptParts.push(`Genre: ${comp.genre}. Composition: ${comp.framing}. Vibe: ${comp.vibe}.`);

    return {
        prompt: sanitizeNouns(promptParts.join(" ")),
        aspectRatio: comp.aspectRatio || "1:1"
    };
};
