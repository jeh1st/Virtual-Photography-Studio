import React from 'react';
import { StudioState } from '../../../types';
import {
    CAMERA_MODELS, ALL_LENS_OPTIONS, APERTURE_OPTIONS_EXTENDED,
    SHUTTER_SPEED_OPTIONS_EXTENDED, ISO_OPTIONS_EXTENDED,
    FILM_STOCK_VALUES, LENS_CHARACTERISTICS, GRAIN_OPTIONS
} from '../../../constants';
import { getDescription } from '../../../utils/descriptions';
import SelectInput from '../../SelectInput';
import { RackModuleWrapper } from '../components/RackModuleWrapper';

interface CameraModuleProps {
    state: StudioState['camera'];
    onChange: (updates: Partial<StudioState['camera']>) => void;
}

export const CameraModule: React.FC<CameraModuleProps> = ({ state, onChange }) => {
    return (
        <RackModuleWrapper title="CAMERA & OPTICS" icon={<span className="text-blue-500">📷</span>} accentColor="blue">

            <div className="space-y-4 mb-6">
                <SelectInput
                    label="Camera Body"
                    value={state.model}
                    onChange={(e) => onChange({ model: e.target.value })}
                    options={CAMERA_MODELS.map(val => ({ value: val, label: val, description: getDescription(val) }))}
                />
                <SelectInput
                    label="Lens Model"
                    value={state.lens}
                    onChange={(e) => onChange({ lens: e.target.value })}
                    options={["None", ...ALL_LENS_OPTIONS]}
                />
            </div>

            <div className="bg-gray-900/30 p-3 rounded border border-white/5 mb-6">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Exposure Settings</h4>
                <div className="grid grid-cols-3 gap-2">
                    <SelectInput
                        label="Aperture"
                        value={state.aperture}
                        onChange={(e) => onChange({ aperture: e.target.value })}
                        options={APERTURE_OPTIONS_EXTENDED}
                    />
                    <SelectInput
                        label="Shutter"
                        value={state.shutter}
                        onChange={(e) => onChange({ shutter: e.target.value })}
                        options={SHUTTER_SPEED_OPTIONS_EXTENDED}
                    />
                    <SelectInput
                        label="ISO"
                        value={state.iso}
                        onChange={(e) => onChange({ iso: e.target.value })}
                        options={ISO_OPTIONS_EXTENDED}
                    />
                </div>
            </div>

            <div className="bg-amber-950/10 p-3 rounded border border-amber-500/10">
                <h4 className="text-[10px] font-bold text-amber-500/70 uppercase mb-3">Character & Media</h4>
                <div className="space-y-3">
                    <SelectInput
                        label="Film Stock"
                        value={state.film}
                        onChange={(e) => onChange({ film: e.target.value })}
                        options={FILM_STOCK_VALUES}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <SelectInput
                            label="Lens Character"
                            value={state.lensCharacter}
                            onChange={(e) => onChange({ lensCharacter: e.target.value })}
                            options={LENS_CHARACTERISTICS}
                        />
                        <SelectInput
                            label="Grain"
                            value={state.filmGrain}
                            onChange={(e) => onChange({ filmGrain: e.target.value })}
                            options={GRAIN_OPTIONS}
                        />
                    </div>
                </div>
            </div>

        </RackModuleWrapper>
    );
};
