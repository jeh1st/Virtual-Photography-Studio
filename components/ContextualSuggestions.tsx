
import { useEffect, useState, FC } from 'react';
import { PhotographicStyle, LightColorTemperature, HairPhysics, Pose } from '../types';

interface Suggestion {
    category: string;
    text: string;
}

interface ContextualSuggestionsProps {
    activeTab: 'subject' | 'scene' | 'style';
    photographicStyle: PhotographicStyle;
    lightTemp: LightColorTemperature;
    hairPhysics: HairPhysics | undefined;
    pose: string;
    onSelect: (text: string, category: string) => void;
}

const ContextualSuggestions: FC<ContextualSuggestionsProps> = ({ activeTab, photographicStyle, lightTemp, hairPhysics, pose, onSelect }) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        const newSuggestions: Suggestion[] = [];

        if (activeTab === 'style') {
            if (photographicStyle === 'Cinematic') {
                newSuggestions.push({ category: 'style', text: 'teal and orange color grading' });
                newSuggestions.push({ category: 'style', text: 'anamorphic lens flares' });
            }
            if (photographicStyle === 'Vintage Film') {
                newSuggestions.push({ category: 'style', text: 'sepia tone' });
                newSuggestions.push({ category: 'style', text: 'Polaroid border' });
                newSuggestions.push({ category: 'style', text: 'light leaks' });
            }
            if (photographicStyle === 'Black & White') {
                newSuggestions.push({ category: 'style', text: 'high contrast noir' });
                newSuggestions.push({ category: 'style', text: 'silver gelatin print' });
            }
        }

        if (activeTab === 'scene') {
            if (lightTemp.includes('neon')) {
                newSuggestions.push({ category: 'scene', text: 'cyberpunk city background' });
                newSuggestions.push({ category: 'scene', text: 'wet pavement reflections' });
            }
            if (lightTemp.includes('sunset')) {
                newSuggestions.push({ category: 'scene', text: 'golden hour silhouette' });
                newSuggestions.push({ category: 'scene', text: 'lens flare peaking through' });
            }
        }

        if (activeTab === 'subject') {
            if (hairPhysics && hairPhysics !== 'perfectly still') {
                newSuggestions.push({ category: 'subject', text: 'hair glowing in backlight' });
                newSuggestions.push({ category: 'subject', text: 'detailed stray hairs' });
            }
            if (pose.includes('mid-air') || pose.includes('jumping')) {
                newSuggestions.push({ category: 'subject', text: 'dynamic fabric motion' });
            }
        }

        // General polish suggestions
        if (newSuggestions.length < 3) {
            newSuggestions.push({ category: 'general', text: 'volumetric lighting' });
            newSuggestions.push({ category: 'general', text: 'detailed skin texture' });
            newSuggestions.push({ category: 'general', text: 'soft focus background' });
        }

        setSuggestions(newSuggestions);
    }, [activeTab, photographicStyle, lightTemp, hairPhysics, pose]);

    if (suggestions.length === 0) return null;

    return (
        <div className="bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-lg mt-4">
            <h4 className="text-xs font-bold text-indigo-300 uppercase mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Ideas for your Prompt
            </h4>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(s.text, s.category)}
                        className="text-xs bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-100 px-2 py-1 rounded transition-colors"
                    >
                        + {s.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ContextualSuggestions;