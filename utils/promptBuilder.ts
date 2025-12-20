import {
    NodeData, NodeType, Gender, HairPhysics, LightingPreset, FilmStock,
    GraphNode, Edge, ImageData, ConsistencyMode, SubjectProfile, StudioImage
} from '../types';
import { PHOTOGRAPHIC_STYLE_MAP } from '../constants';
import { getSunPhase } from './sunMath';

// Helper to get connected nodes of a specific type
const getConnectedNodes = (
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

export const buildSubjectDescription = (data: NodeData, linkedSubject?: SubjectProfile, imageStartIndex?: number): string => {
    const isObsidian = [Gender.ObsidianFormF, Gender.ObsidianFormM, Gender.ObsidianFormN].includes(data.gender as Gender);
    const isMale = data.gender === Gender.Man || data.gender === Gender.ObsidianFormM;

    // Priority check for Linked Identity
    const hasLinkedSubject = !!linkedSubject;
    const hasManualRef = !!data.referenceImage;
    const mode = data.consistencyMode || ConsistencyMode.FaceOnly;

    let subject = "";

    // 1. IDENTITY BLOCK
    if (hasLinkedSubject) {
        const typeLabel = linkedSubject.type === 'Real Person' ? "actual individual" : "recurring character";
        subject = `The subject is the specific ${typeLabel} named "${linkedSubject.name}". `;
        if (linkedSubject.description) subject += `${linkedSubject.description} `;

        if (data.isMannequin) {
            subject = `Interpret this grey clay sculptural guide into a fine art photography study of the human form. The guide defines the silhouette, pose, and muscle structure. Re-materialize this form into a living subject with realistic skin. `;
        }

        const refCount = linkedSubject.images.length;
        if (refCount > 0 && imageStartIndex !== undefined) {
            const indices = Array.from({ length: refCount }, (_, i) => `Image ${imageStartIndex + i + 1}`).join(', ');
            subject += `CRITICAL CHARACTER CONSISTENCY: The attached set of ${refCount} images (${indices}) are official source references for "${linkedSubject.name}". You MUST analyze these specific numbered images to replicate the exact facial structure, eye shape, nose bridge, lip contour, and unique skin details. The final output must be an undeniable match to the person shown in these references. Do not hallucinate a generic face; use the visual data provided in these specific images. `;
        }
    } else if (hasManualRef && imageStartIndex !== undefined) {
        if (mode === ConsistencyMode.FullCharacter) {
            subject = `The subject is visually identical in every way to the character in reference Image ${imageStartIndex + 1}. Ignore specific text descriptions of age or ethnicity if they conflict with that image. `;
        } else {
            subject = `The subject's identity is based on reference Image ${imageStartIndex + 1}. `;
        }
    }

    // 2. PHYSICAL TRAITS (Only if not already fully described by identity)
    if (!hasLinkedSubject) {
        if (isObsidian) {
            const obsidianMaterial = 'crafted from polished black obsidian. The surface possesses a unique matte finish that mimics the subsurface scattering and texture of living skin, ensuring light interacts with the form naturally despite the dark material. It is a high-contrast artistic study tool';
            subject += `The subject is ${data.gender}. The figure is ${obsidianMaterial}.`;
        } else if (!(hasManualRef && mode === ConsistencyMode.FullCharacter)) {
            const subjectDescParts = [data.ethnicity, data.gender, data.age].filter(Boolean);
            subject += `The subject is a ${subjectDescParts.join(' ')}.`;
        }
    }

    // Physique
    let bodyDesc = (hasLinkedSubject ? linkedSubject.bodyType : data.bodyType) || "";
    if (bodyDesc.includes(" - ")) {
        bodyDesc = bodyDesc.split(" - ")[1].toLowerCase();
    }
    if (bodyDesc) subject += ` Physique: ${bodyDesc}.`;

    // Hair
    const finalHairColor = data.hairColor === 'Other...' ? data.customHairColor : data.hairColor;
    let hairDescription;
    let physicsDesc = '';
    if (data.hairPhysics && data.hairPhysics !== HairPhysics.Static) {
        physicsDesc = `, ${data.hairPhysics} `;
    }

    if (isObsidian && data.hairStyle) {
        hairDescription = `hair sculpted from obsidian in a ${data.hairStyle} style${physicsDesc ? ', depicted with dynamic movement' : ', rendered with static precision'} `;
    } else {
        const hairParts = [data.hairLength, data.hairStyle, finalHairColor && `${finalHairColor} hair`].filter(Boolean);
        hairDescription = hairParts.join(', ') + physicsDesc;
    }

    const appearanceParts = [hairDescription, data.characterDescription].filter(Boolean);
    const finalAppearanceDescription = appearanceParts.join(' and ');

    if (finalAppearanceDescription) {
        subject += ` Features: ${finalAppearanceDescription}.`;
    }

    // 3. SKIN REALISM
    if (data.skinRealism?.enabled && !isObsidian && !(hasManualRef && mode === ConsistencyMode.FullCharacter)) {
        let realismDesc = '';
        let intensityAdjective = 'softly textured';
        let textureTokens = '';

        if (data.skinRealism.intensity > 90) {
            intensityAdjective = 'hyper-realistic, dermatological texture, sharp focus';
            textureTokens = 'micro-contrast, skin sheen, slight sweat, peach fuzz, unmasked texture';
        } else if (data.skinRealism.intensity > 60) {
            intensityAdjective = 'raw, unretouched, authentic';
            textureTokens = 'natural skin gloss, tactile texture';
        }

        realismDesc += `Skin texture is ${intensityAdjective}. ${textureTokens} `;

        const details = [];
        if (data.skinRealism.details.pores) details.push('visible pores');
        if (data.skinRealism.details.freckles) details.push('natural freckles');
        if (data.skinRealism.details.wrinkles) details.push('fine lines and wrinkles');
        if (data.skinRealism.details.veins) details.push('subtle subsurface veins');
        if (data.skinRealism.details.scars) details.push('small natural scars');
        if (data.skinRealism.details.stretchMarks) details.push(`natural stretch marks`);
        if (data.skinRealism.details.cellulite && !isMale) details.push('gentle cellulite texture');
        if (data.skinRealism.details.discoloration) details.push('natural skin tone variations');

        if (details.length > 0) {
            realismDesc += `Visible details: ${details.join(', ')}.`;
        }
        subject += ` ${realismDesc} `;
    }

    if (data.pose) subject += ` Pose: ${data.pose}.`;

    // Wardrobe / Props logic
    if (!data.propsText?.trim()) {
        if (isObsidian) {
            subject += ` The obsidian form is presented without adornment.`;
        } else if (data.fineArtNude) {
            subject += ` The subject's form is artistically obscured by deep shadows and dramatic lighting, leaving details to the imagination. The composition focuses on silhouette and form.`;
        }
    } else {
        if (isObsidian) {
            subject += ` The obsidian form is styled with: ${data.propsText.trim()}.`;
        } else if (data.fineArtNude) {
            subject += ` The composition uses elements for artistic concealment, described as: ${data.propsText.trim()}. The focus remains on form and silhouette.`;
        } else {
            subject += ` Attire/Props: ${data.propsText.trim()}.`;
        }
    }

    // Noun Sanitizer for Subject Props (to avoid furniture/equipment)
    subject = sanitizeNouns(subject);

    // Explicit Consistency Instructions for Manual Reference
    if (!hasLinkedSubject && hasManualRef && mode !== ConsistencyMode.FullCharacter) {
        const imgLabel = imageStartIndex !== undefined ? `Image ${imageStartIndex + 1}` : "the provided reference image";
        if (mode === ConsistencyMode.FaceOnly) {
            subject += ` CRITICAL INSTRUCTION: Replicate ONLY the facial features from ${imgLabel}. Ignore its hair, clothing, and pose; follow the text prompt for those.`;
        } else if (mode === ConsistencyMode.FaceAndHair) {
            subject += ` CRITICAL INSTRUCTION: Replicate the facial features AND hairstyle from ${imgLabel}. Ignore its clothing and pose.`;
        }
    }

    return subject;
};

export const buildEnvironmentDescription = (data: NodeData, imageIndex?: number): string => {
    let desc = "";

    if (data.envType === 'Landscape') {
        desc += `The scene depicts a ${data.landscapeType}. `;
    } else if (data.envType === 'Architecture') {
        desc += `The image is an ${data.architectureType} shot of a ${data.architectureStyle} ${data.buildingType || 'space'}. `;
    }

    if (imageIndex !== undefined) {
        desc += `ENVIRONMENT VISUAL REFERENCE: Use Image ${imageIndex + 1} as the primary source for the visual style, architecture, and spatial layout of this environment. Analyze its colors, textures, and geometry to recreate a matching setting. `;
    }

    if (data.sceneDescription) desc += `Scene Description: ${data.sceneDescription}. `;


    if (data.location && data.date && data.time) {
        const sunPhase = getSunPhase(data.location.latitude, data.location.longitude, data.date, data.time);
        let weather = data.weather || '';
        const isNight = sunPhase.toLowerCase().includes('night') || sunPhase.toLowerCase().includes('midnight');
        if (isNight && weather.includes('sunny')) {
            weather = weather.replace('sunny', 'starry');
        }

        let envDescription = `Location: ${data.location.name}. Date: ${data.date}. Time: ${data.time} (${sunPhase}). Season: ${data.season}. `;
        const sceneLower = (data.sceneDescription || '').toLowerCase();
        const hasWindow = sceneLower.includes('window') || sceneLower.includes('glass');
        const isOutdoor = data.envType === 'Landscape' || data.architectureType === 'Exterior Facade' || sceneLower.includes('outdoor');

        if (isOutdoor || hasWindow) {
            envDescription += `Weather: ${weather}. Lighting reflects the natural sun/moon position for ${sunPhase}. `;
        }
        desc += envDescription;
    }
    return desc;
};

export const buildCameraDescription = (data: NodeData): string => {
    let desc = "";
    if (data.cameraModel && data.cameraModel !== 'None') desc += `Camera: ${data.cameraModel}. `;
    if (data.lensModel && data.lensModel !== 'None') desc += `Lens: ${data.lensModel}. `;

    let settings = [];
    if (data.aperture && data.aperture !== 'None') settings.push(`Aperture ${data.aperture.split(' - ')[0]}`);
    if (data.shutterSpeed && data.shutterSpeed !== 'None') settings.push(`Shutter ${data.shutterSpeed.split(' - ')[0]}`);
    if (data.iso && data.iso !== 'None') settings.push(`ISO ${data.iso.split(' - ')[0]}`);

    if (settings.length > 0) desc += `Settings: ${settings.join(', ')}. `;
    if (data.filmStock && data.filmStock !== 'None') desc += `Film Emulation: ${data.filmStock}. `;
    if (data.lensChar && data.lensChar !== 'None') desc += `Optics: ${data.lensChar}. `;
    if (data.grain && data.grain !== 'None') desc += `Texture: ${data.grain}. `;
    return desc;
};

export const buildLightingDescription = (data: NodeData): string => {
    let desc = "";
    if (data.lightingStyle && data.lightingStyle !== 'None') desc += `Lighting Style: ${data.lightingStyle}. `;
    if (data.lightingSetups && data.lightingSetups.length > 0) {
        desc += `Setup Configuration: ${data.lightingSetups.join(', ')}. `;
    }
    if (data.wb && data.wb !== 'None') desc += `White Balance: ${data.wb}. `;
    if (data.gobo && data.gobo !== 'None') {
        desc += `Atmospheric lighting pattern: high-contrast shadows created by a ${data.gobo} gobo pattern projected across the subject and the room. `;
    }

    return sanitizeNouns(desc);
};

export const buildCompositionDescription = (data: NodeData): string => {
    let desc = "";
    if (data.genre) desc += `Genre: ${data.genre}. `;
    if (data.compositionType && data.compositionType !== 'None') desc += `Composition Rule: ${data.compositionType}. `;
    if (data.vibe) desc += `Mood/Vibe: ${data.vibe} `;
    return desc;
};

export const buildStyleDescription = (data: NodeData): string => {
    const styleInfo = PHOTOGRAPHIC_STYLE_MAP[data.photographicStyle || 'Cinematic'];
    return `${styleInfo.description}. Perspective: ${data.cameraPerspective || 'Eye Level'}.`;
};

export const buildGraphPrompt = (
    outputNode: GraphNode,
    allNodes: GraphNode[],
    allEdges: Edge[],
    subjectLibrary: SubjectProfile[] = []
): { prompt: string; images: ImageData[]; aspectRatio: string } => {

    let prompt = "";
    let aspectRatio = "1:1";
    const collectedImages: ImageData[] = [];

    // 1. Composition
    const compNodes = getConnectedNodes(outputNode.id, allNodes, allEdges, NodeType.Composition);
    if (compNodes.length > 0) {
        compNodes.forEach(n => {
            prompt += buildCompositionDescription(n.data);
            if (n.data.aspectRatio) aspectRatio = n.data.aspectRatio;
        });
    }

    // 2. Environment
    const envNodes = getConnectedNodes(outputNode.id, allNodes, allEdges, NodeType.Environment);
    if (envNodes.length > 0) {
        envNodes.forEach(node => {
            const hasImg = !!node.data.sceneImage;
            prompt += ` ${buildEnvironmentDescription(node.data, hasImg ? collectedImages.length : undefined)}`;
            if (node.data.sceneImage) collectedImages.push(node.data.sceneImage);
        });
    } else {
        prompt += " The scene is a simple, neutral studio environment.";
    }

    // 3. Subjects
    const subjectNodes = getConnectedNodes(outputNode.id, allNodes, allEdges, NodeType.Subject);
    const cameoNodes = getConnectedNodes(outputNode.id, allNodes, allEdges, NodeType.Cameo);
    const subjectCameos = cameoNodes.filter(n => n.data.cameoType === 'Subject');
    const allSubjects = [...subjectNodes, ...subjectCameos];

    if (allSubjects.length > 0) {
        allSubjects.forEach((node, idx) => {
            if (allSubjects.length > 1) prompt += ` SUBJECT ${idx + 1}: `;

            if (node.type === NodeType.Subject) {
                const linkedId = node.data.selectedSubjectId;
                const subjectProfile = linkedId ? subjectLibrary.find(s => s.id === linkedId) : undefined;

                let imageStartIndex: number | undefined = undefined;
                if (subjectProfile && subjectProfile.images.length > 0) {
                    imageStartIndex = collectedImages.length;
                    collectedImages.push(...subjectProfile.images);
                } else if (node.data.referenceImage) {
                    imageStartIndex = collectedImages.length;
                    collectedImages.push(node.data.referenceImage);
                }

                prompt += ` ${buildSubjectDescription(node.data, subjectProfile, imageStartIndex)}`;
            } else if ((node.type as string) === NodeType.Cameo && node.data.cameoSelection) {
                prompt += ` The subject is the character ${node.data.cameoSelection}.`;
            }
        });
    }


    // 4. Lighting
    const lightNodes = getConnectedNodes(outputNode.id, allNodes, allEdges, NodeType.Lighting);
    lightNodes.forEach(n => {
        let lightDesc = buildLightingDescription(n.data);
        prompt += ` ${lightDesc}`;
        prompt += ` (CRITICAL: The light source is off-camera. The image must NOT contain lighting stands, tripods, softboxes, or lamps).`;
    });

    // 5. Camera
    const camNodes = getConnectedNodes(outputNode.id, allNodes, allEdges, NodeType.Camera);
    camNodes.forEach(n => {
        prompt += ` ${buildCameraDescription(n.data)}`;
    });

    // 6. Stylistic Suffix (The "Final Coat of Paint")
    let styleSuffix = "";
    const primarySubject = allSubjects[0]?.data;
    if (primarySubject?.skinRealism?.enabled && primarySubject.skinRealism.intensity > 90) {
        styleSuffix += " Style Overlays: fine-grain micro-contrast, natural skin sheen, velvet-like peach fuzz on the skin, raw unretouched masterwork. ";
    }

    prompt += styleSuffix;

    return {
        prompt: prompt.trim(),
        images: collectedImages,
        aspectRatio
    };
};

/**
 * Noun Sanitizer: Converts equipment nouns into lighting physics descriptions.
 * Case-insensitive and handles plurals.
 */
const sanitizeNouns = (text: string): string => {
    const replacements: Record<string, string> = {
        'softbox': 'large diffused directional light source',
        'softboxes': 'large diffused directional light sources',
        'strobe': 'high-speed flash illumination',
        'strobes': 'high-speed flash illuminations',
        'scrim': 'large light-diffusing panel',
        'scrims': 'large light-diffusing panels',
        'tripod': 'static camera position',
        'tripods': 'static camera positions',
        'light stand': 'source of illumination',
        'light stands': 'sources of illumination',
        'ring light': 'frontal axis lighting',
        'ring lights': 'frontal axis lighting sources',
        'reflector': 'ambient bounce illumination',
        'reflectors': 'ambient bounce illumination sources'
    };

    let sanitized = text;
    Object.entries(replacements).forEach(([noun, replacement]) => {
        const regex = new RegExp(`\\b${noun}\\b`, 'gi');
        sanitized = sanitized.replace(regex, replacement);
    });

    // Remove forbidden furniture/equipment
    const forbidden = [/stand/gi, /tripod/gi, /mount/gi, /lamp/gi, /bulb/gi];
    forbidden.forEach(regex => {
        sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
};
