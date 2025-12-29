import React, { useEffect } from 'react';
import { NodeType } from '../types';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    nodeType: NodeType;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, title, nodeType }) => {
    if (!isOpen) return null;

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const getContent = (type: NodeType) => {
        switch (type) {
            case NodeType.SubjectRoot:
            case NodeType.Subject:
                return `### Subject Node
This node defines the core identity of a person or character in your scene.

• Linked Identity: Select a saved profile to enforce consistency.
• Consistency Mode:
  - Face Only: Ideal for changing outfits/hair.
  - Face & Hair: Detailed identity preservation.
  - Full Character: Copies attire and physique strictly.`;

            case NodeType.Body:
                return `### Body Node
Defines physical characteristics.

• Skin Realism: Enable 'High Fidelity' for dermatological textures.
• Obsidian Form: Select specific Gender options for stylized Obsidian material study.`;

            case NodeType.CameraRoot:
                return `### Camera Body
Simulates the sensor and color science.

• Digital: Sharp, clean, commercial look.
• Analog: Introduces color shifts and organic imperfections.`;

            case NodeType.Lens:
                return `### Lens Optics
Controls field of view and optical character.

• Aperture: Lower values (f/1.2) = shallower depth of field.
• Character: Select 'Swirly Bokeh' or 'Vintage Softness' for artistic effect.`;

            case NodeType.Film:
                return `### Film Stock
Simulates chemical color response.

• Color: Portra, Ektar, etc.
• B&W: Tri-X, Ilford HP5.`;

            default:
                return `### ${type}
Contextual help for ${type} is currently being authored.`;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-6 w-[500px] max-w-full m-4 relative animate-fade-in"
                onClick={e => e.stopPropagation()}
                style={{ animation: 'fadeIn 0.2s ease-out' }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                    {title} Help
                </h2>

                <div className="prose prose-invert prose-sm whitespace-pre-wrap font-sans text-gray-300">
                    {getContent(nodeType)}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};
