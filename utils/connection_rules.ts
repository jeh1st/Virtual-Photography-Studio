import { NodeType } from '../types';

/**
 * Defines valid connection targets for each node type.
 * Key: Source Node Type
 * Value: Array of valid Target Node Types
 */
export const VALID_CONNECTIONS: Record<string, string[]> = {
    // SUBJECT PIPELINE
    [NodeType.Body]: [NodeType.SubjectRoot],
    [NodeType.Face]: [NodeType.SubjectRoot],
    [NodeType.Hair]: [NodeType.SubjectRoot],
    [NodeType.Attire]: [NodeType.SubjectRoot],
    [NodeType.Pose]: [NodeType.SubjectRoot],
    [NodeType.SubjectRoot]: [NodeType.Composition, NodeType.Group, NodeType.Output], // Subject goes into Composition/Scene

    // CAMERA PIPELINE
    [NodeType.Lens]: [NodeType.CameraRoot],
    [NodeType.Film]: [NodeType.CameraRoot],
    [NodeType.CameraSettings]: [NodeType.CameraRoot],
    [NodeType.CameraRoot]: [NodeType.Composition, NodeType.Output], // Camera defines how the scene is viewed

    // LIGHTING PIPELINE
    // [NodeType.LightSource] moved to COMPOSITION group below for consolidation
    [NodeType.LightModifier]: [NodeType.LightSource], // Modifiers attach to sources
    [NodeType.GlobalIllumination]: [NodeType.LightingRoot],
    [NodeType.LightingRoot]: [NodeType.Composition, NodeType.Output],

    // ENVIRONMENT PIPELINE
    [NodeType.Location]: [NodeType.EnvironmentRoot],
    [NodeType.Atmosphere]: [NodeType.EnvironmentRoot],
    [NodeType.EnvironmentRoot]: [NodeType.Composition, NodeType.Output],

    // COMPOSITION / OUTPUT
    [NodeType.Environment]: [NodeType.Output], // Allow simple Environment node to connect to Output
    [NodeType.LightSource]: [NodeType.LightingRoot, NodeType.Output], // Allow direct connection or via Root
    [NodeType.Composition]: [NodeType.Style, NodeType.Output], // Scene setup goes into Style processor
    [NodeType.Style]: [NodeType.Output], // Style leads to Output

    // UTILITIES
    [NodeType.Reference]: [NodeType.SubjectRoot, NodeType.Face, NodeType.Attire, NodeType.Style], // References can influence almost anything
    [NodeType.Assembler]: [NodeType.Composition, NodeType.SubjectRoot, NodeType.CameraRoot, NodeType.LightingRoot, NodeType.EnvironmentRoot], // Assemblers are generic
    [NodeType.Group]: [NodeType.Composition], // Groups act as summarized subjects
};

/**
 * Checks if a connection between two node types is valid.
 */
export const isValidConnection = (sourceType: NodeType | string, targetType: NodeType | string): boolean => {
    // Legacy / Fallback: Allow generic connections if not strictly defined, 
    // but for the new system we want strictness.

    // Allow Assembler to connect to anything generally, or strict?
    // Let's be strict for known types, lenient for others.

    const validTargets = VALID_CONNECTIONS[sourceType];
    if (!validTargets) {
        // If source has no specific rules, we might default to blocking or allowing.
        // For development of new nodes, maybe allow connection to Assembler/Group by default?
        return [NodeType.Assembler, NodeType.Group, NodeType.Comment].includes(targetType as NodeType);
    }

    return validTargets.includes(targetType);
};

/**
 * Returns the color associated with a connection line for a given source type.
 * Useful for UI feedback.
 */
export const getConnectionColor = (sourceType: NodeType | string): string => {
    switch (sourceType) {
        case NodeType.Body:
        case NodeType.Face:
        case NodeType.Hair:
        case NodeType.SubjectRoot:
            return '#fca5a5'; // Red/Pink for Subject
        case NodeType.CameraRoot:
        case NodeType.Lens:
        case NodeType.Film:
            return '#93c5fd'; // Blue for Camera
        case NodeType.LightingRoot:
        case NodeType.LightSource:
            return '#fbbf24'; // Amber for Lighting
        case NodeType.EnvironmentRoot:
        case NodeType.Location:
            return '#86efac'; // Green for Environment
        case NodeType.Composition:
            return '#c084fc'; // Purple for Composition
        default:
            return '#94a3b8'; // Slate for generic
    }
};
