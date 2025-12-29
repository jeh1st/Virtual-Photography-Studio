import React from 'react';
import { GraphNode, NodeType } from '../types';
import {
    buildSubjectDescription,
    buildEnvironmentDescription,
    buildCameraDescription,
    buildLightingDescription,
    buildCompositionDescription
} from './promptBuilder';

export const getNodeStyles = (type: NodeType) => {
    switch (type) {
        case NodeType.SubjectRoot:
        case NodeType.Subject: // Legacy
            return {
                container: 'border-pink-500 bg-gray-900',
                header: 'bg-gradient-to-r from-pink-900/80 to-purple-900/80',
                iconColor: 'text-pink-300',
                shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]'
            };
        case NodeType.Body:
        case NodeType.Face:
        case NodeType.Hair:
        case NodeType.Attire:
            return {
                container: 'border-pink-300/50 bg-gray-900/80',
                header: 'bg-pink-900/30',
                iconColor: 'text-pink-200',
                shadow: ''
            };

        case NodeType.EnvironmentRoot:
        case NodeType.Environment: // Legacy
            return {
                container: 'border-emerald-500 bg-gray-900',
                header: 'bg-gradient-to-r from-emerald-900/80 to-green-900/80',
                iconColor: 'text-emerald-300',
                shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]'
            };

        case NodeType.CameraRoot:
        case NodeType.Camera: // Legacy
            return {
                container: 'border-blue-500 bg-gray-900',
                header: 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80',
                iconColor: 'text-blue-300',
                shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]'
            };
        case NodeType.Lens:
        case NodeType.Film:
            return {
                container: 'border-blue-300/50 bg-gray-900/80',
                header: 'bg-blue-900/30',
                iconColor: 'text-blue-200',
                shadow: ''
            };

        case NodeType.Lighting: // Legacy
        case NodeType.LightSource:
            return {
                container: 'border-amber-500 bg-gray-900',
                header: 'bg-gradient-to-r from-amber-900/80 to-yellow-900/80',
                iconColor: 'text-amber-300',
                shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
            };

        case NodeType.Reference:
            return {
                container: 'border-purple-500 bg-gray-900',
                header: 'bg-gradient-to-r from-purple-900/80 to-violet-900/80',
                iconColor: 'text-purple-300',
                shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]'
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

export const getNodeIcon = (type: NodeType) => {
    switch (type) {
        case NodeType.SubjectRoot:
        case NodeType.Subject:
            return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
        case NodeType.EnvironmentRoot:
        case NodeType.Environment:
            return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 011 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case NodeType.CameraRoot:
        case NodeType.Camera:
            return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
        case NodeType.LightSource:
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
            return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
    }
};

export const getNodeSummary = (node: GraphNode): string => {
    // Only used for Legacy rendering in NodeGraph if NodeContent isn't using it.
    // Actually NodeContent might use it for generic fallback?
    if (node.type === NodeType.Subject) return buildSubjectDescription(node.data);
    if (node.type === NodeType.Environment) return buildEnvironmentDescription(node.data);
    if (node.type === NodeType.Camera) return buildCameraDescription(node.data);
    if (node.type === NodeType.Lighting) return buildLightingDescription(node.data);
    if (node.type === NodeType.Composition) return buildCompositionDescription(node.data);

    // Fallback for new nodes if they are rendered via legacy path (unlikely)
    if (node.data.label) return node.data.label;
    return '';
};

export const getEdgeColor = (type: NodeType): string => {
    switch (type) {
        case NodeType.SubjectRoot:
        case NodeType.Subject:
        case NodeType.Body:
        case NodeType.Face:
        case NodeType.Hair:
        case NodeType.Attire:
            return '#f06292'; // Pinkish-Red
        case NodeType.CameraRoot:
        case NodeType.Camera:
        case NodeType.Lens:
        case NodeType.Film:
            return '#3b82f6'; // Blue
        case NodeType.EnvironmentRoot:
        case NodeType.Environment:
            return '#10b981'; // Emerald
        case NodeType.Lighting:
        case NodeType.LightSource:
            return '#f59e0b'; // Amber
        case NodeType.Reference:
            return '#a855f7'; // Purple
        case NodeType.Composition:
            return '#f43f5e'; // Rose
        default:
            return '#4b5563'; // Gray
    }
};
