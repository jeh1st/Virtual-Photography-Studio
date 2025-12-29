import React from 'react';
import { StudioState, ArchitectureStyle, Weather, Season, LocationConfig } from '../../../types';
import {
    ARCHITECTURE_STYLE_OPTIONS, ARCHITECTURE_BUILDING_OPTIONS,
    INTERIOR_SHOT_OPTIONS, EXTERIOR_SHOT_OPTIONS
} from '../../../constants';
import SelectInput from '../../SelectInput';
import TextAreaInput from '../../TextAreaInput';
import ImageInput from '../../ImageInput';
import EnvironmentControls from '../../EnvironmentControls';
import { RackModuleWrapper } from '../components/RackModuleWrapper';

interface EnvironmentModuleProps {
    state: StudioState['environment'];
    onChange: (updates: Partial<StudioState['environment']>) => void;
}

export const EnvironmentModule: React.FC<EnvironmentModuleProps> = ({ state, onChange }) => {

    // Derived value for shot options based on context
    const shotOptions = (state.context === 'Interior') ? INTERIOR_SHOT_OPTIONS : EXTERIOR_SHOT_OPTIONS;

    return (
        <RackModuleWrapper title="ENVIRONMENT & ATMOSPHERE" icon={<span className="text-emerald-500">❖</span>} accentColor="green">

            <div className="mb-4">
                <SelectInput
                    label="Environment Type"
                    value={state.type}
                    onChange={(e) => onChange({ type: e.target.value as any })}
                    options={['General', 'Landscape', 'Architecture']}
                />
            </div>

            {state.type === 'Architecture' && (
                <div className="bg-emerald-950/20 p-3 rounded border border-emerald-500/20 mb-4 animate-fade-in">
                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase mb-3">Architectural Specs</h4>
                    <div className="space-y-3">
                        <SelectInput
                            label="Style"
                            value={state.architectureStyle}
                            onChange={(e) => onChange({ architectureStyle: e.target.value as ArchitectureStyle })}
                            options={ARCHITECTURE_STYLE_OPTIONS}
                        />
                        <SelectInput
                            label="Building"
                            value={state.buildingType}
                            onChange={(e) => onChange({ buildingType: e.target.value })}
                            options={ARCHITECTURE_BUILDING_OPTIONS}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <SelectInput
                                label="Context"
                                value={state.context}
                                onChange={(e) => onChange({ context: e.target.value as any })}
                                options={['Interior', 'Exterior']}
                            />
                            <SelectInput
                                label="Shot Type"
                                value={state.shotType}
                                onChange={(e) => onChange({ shotType: e.target.value })}
                                options={shotOptions}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-900/30 p-3 rounded border border-white/5 mb-4">
                <EnvironmentControls
                    location={state.location}
                    date=""
                    time={state.time}
                    weather={state.weather}
                    season={state.season}
                    onLocationChange={(l) => onChange({ location: l })}
                    onDateChange={() => { }}
                    onTimeChange={(t) => onChange({ time: t })}
                    onWeatherChange={(w) => onChange({ weather: w as Weather })}
                    onSeasonChange={(s) => onChange({ season: s as Season })}
                />
            </div>

            <div className="space-y-4">
                <TextAreaInput
                    label="Scene Details"
                    value={state.sceneDescription}
                    onChange={(e) => onChange({ sceneDescription: e.target.value })}
                    placeholder="Describe the background, lighting mood, or specific elements..."
                />
                <ImageInput
                    value={state.sceneImage || null}
                    onImageSelect={(img) => onChange({ sceneImage: img })}
                    label="Environment Reference"
                    helpText="Upload a photo to guide the scene layout."
                />
            </div>

        </RackModuleWrapper>
    );
};
