import React from 'react';
import { StudioState, AspectRatio } from '../../../types';
import {
    LENSES_BY_GENRE, COMPOSITION_TYPES, ASPECT_RATIO_OPTIONS
} from '../../../constants';
import SelectInput from '../../SelectInput';
import TextAreaInput from '../../TextAreaInput';
import { RackModuleWrapper } from '../components/RackModuleWrapper';

interface CompositionModuleProps {
    state: StudioState['composition'];
    onChange: (updates: Partial<StudioState['composition']>) => void;
}

export const CompositionModule: React.FC<CompositionModuleProps> = ({ state, onChange }) => {
    return (
        <RackModuleWrapper title="COMPOSITION & FRAMING" icon={<span className="text-gray-400">▣</span>} accentColor="blue">
            <div className="space-y-4">
                <SelectInput
                    label="Genre"
                    value={state.genre}
                    onChange={(e) => onChange({ genre: e.target.value })}
                    options={Object.keys(LENSES_BY_GENRE)}
                />
                <div className="grid grid-cols-2 gap-3">
                    <SelectInput
                        label="Framing Rule"
                        value={state.framing}
                        onChange={(e) => onChange({ framing: e.target.value })}
                        options={COMPOSITION_TYPES}
                    />
                    <SelectInput
                        label="Aspect Ratio"
                        value={state.aspectRatio}
                        onChange={(e) => onChange({ aspectRatio: e.target.value as AspectRatio })}
                        options={ASPECT_RATIO_OPTIONS}
                    />
                </div>
                <TextAreaInput
                    label="Artistic Vibe"
                    value={state.vibe}
                    onChange={(e) => onChange({ vibe: e.target.value })}
                    placeholder="Mood, atmosphere, artistic references..."
                />
            </div>
        </RackModuleWrapper>
    );
};
