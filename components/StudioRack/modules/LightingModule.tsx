import React from 'react';
import { StudioState, LightColorTemperature } from '../../../types';
import {
    LIGHTING_STYLES, LIGHTING_MODIFIERS,
    LIGHT_COLOR_TEMPERATURE_OPTIONS, GOBO_OPTIONS
} from '../../../constants';
import SelectInput from '../../SelectInput';
import ToggleSwitch from '../../ToggleSwitch';
import { RackModuleWrapper } from '../components/RackModuleWrapper';

interface LightingModuleProps {
    state: StudioState['lighting'];
    onChange: (updates: Partial<StudioState['lighting']>) => void;
}

export const LightingModule: React.FC<LightingModuleProps> = ({ state, onChange }) => {

    // Setups is string[]
    const currentSetups = new Set(state.presets || []);

    const toggleSetup = (phrase: string) => {
        const next = new Set(currentSetups);
        if (next.has(phrase)) next.delete(phrase);
        else next.add(phrase);
        onChange({ presets: Array.from(next) });
    };

    return (
        <RackModuleWrapper title="LIGHTING CONTROL" icon={<span className="text-yellow-500">⚡</span>} accentColor="amber">

            <div className="mb-6">
                <SelectInput
                    label="Primary Style"
                    value={state.style}
                    onChange={(e) => onChange({ style: e.target.value })}
                    options={LIGHTING_STYLES}
                />
            </div>

            <div className="bg-gray-900/30 p-3 rounded border border-white/5 mb-6">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Active Modifiers</h4>
                <div className="flex flex-wrap gap-2">
                    {LIGHTING_MODIFIERS.map(m => (
                        <button
                            key={m.label}
                            onClick={() => toggleSetup(m.phrase)}
                            className={`text-[10px] px-2 py-1.5 rounded border font-bold transition-all duration-200 ${currentSetups.has(m.phrase)
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                    : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700'
                                }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <SelectInput
                    label="Color Temp"
                    value={state.colorTemp}
                    onChange={(e) => onChange({ colorTemp: e.target.value as LightColorTemperature })}
                    options={LIGHT_COLOR_TEMPERATURE_OPTIONS}
                />
                <SelectInput
                    label="Gobo Pattern"
                    value={state.gobo}
                    onChange={(e) => onChange({ gobo: e.target.value })}
                    options={GOBO_OPTIONS}
                />
            </div>

            <div className="bg-gray-950/50 p-4 rounded-lg border border-white/5 flex items-center justify-between">
                <div>
                    <span className="text-xs text-gray-300 font-bold uppercase block">Visible Equipment</span>
                    <span className="text-[10px] text-gray-500 block">Render light sources in frame</span>
                </div>
                <ToggleSwitch
                    checked={state.visibleEquipment}
                    onChange={(v) => onChange({ visibleEquipment: v })}
                />
            </div>

        </RackModuleWrapper>
    );
};
