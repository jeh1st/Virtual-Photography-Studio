
import { FC } from 'react';
import { LightColorTemperature, GenerationMode } from '../types';
import { LIGHT_COLOR_TEMPERATURE_OPTIONS } from '../constants';
import SelectInput from './SelectInput';
import SliderInput from './SliderInput';

interface LightingControlsProps {
    ambientIntensity: number;
    keyIntensity: number;
    fillIntensity: number;
    rimIntensity: number;
    colorTemperature: LightColorTemperature;
    onAmbientChange: (value: number) => void;
    onKeyChange: (value: number) => void;
    onFillChange: (value: number) => void;
    onRimChange: (value: number) => void;
    onColorTemperatureChange: (value: LightColorTemperature) => void;
    mode?: GenerationMode; // Optional mode prop
}

const LightingControls: FC<LightingControlsProps> = ({
    ambientIntensity, keyIntensity, fillIntensity, rimIntensity, colorTemperature,
    onAmbientChange, onKeyChange, onFillChange, onRimChange, onColorTemperatureChange,
    mode = GenerationMode.Portrait
}) => {

    const isPortrait = mode === GenerationMode.Portrait;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                <SelectInput
                    label="Color Temperature"
                    value={colorTemperature}
                    onChange={(e) => onColorTemperatureChange(e.target.value as LightColorTemperature)}
                    options={LIGHT_COLOR_TEMPERATURE_OPTIONS}
                />
            </div>

            <div className="space-y-5">
                <SliderInput
                    label={isPortrait ? "Ambient Light" : "Overall Exposure / Brightness"}
                    value={ambientIntensity}
                    onChange={(e) => onAmbientChange(Number(e.target.value))}
                    min={0} max={100}
                    helpText={isPortrait ? "Overall baseline brightness of the scene." : "Adjusts the general brightness of the environment."}
                />

                {isPortrait && (
                    <>
                        <SliderInput
                            label="Key Light"
                            value={keyIntensity}
                            onChange={(e) => onKeyChange(Number(e.target.value))}
                            min={0} max={100}
                            helpText="Primary light source defining form and highlights."
                        />
                        <SliderInput
                            label="Fill Light"
                            value={fillIntensity}
                            onChange={(e) => onFillChange(Number(e.target.value))}
                            min={0} max={100}
                            helpText="Softens shadows created by the key light."
                        />
                        <SliderInput
                            label="Rim Light"
                            value={rimIntensity}
                            onChange={(e) => onRimChange(Number(e.target.value))}
                            min={0} max={100}
                            helpText="Highlights edges to separate subject from background."
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default LightingControls;
