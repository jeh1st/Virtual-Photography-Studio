
import React from 'react';
import { SkinRealismConfig } from '../types';
import ToggleSwitch from './ToggleSwitch';
import SliderInput from './SliderInput';

interface SkinRealismControlsProps {
  config: SkinRealismConfig;
  onChange: (newConfig: SkinRealismConfig) => void;
  disabled?: boolean;
}

const SkinRealismControls: React.FC<SkinRealismControlsProps> = ({ config, onChange, disabled }) => {

  const handleToggleEnabled = (enabled: boolean) => {
    onChange({ ...config, enabled });
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, intensity: Number(e.target.value) });
  };

  const handleDetailToggle = (key: keyof SkinRealismConfig['details']) => {
    onChange({
      ...config,
      details: {
        ...config.details,
        [key]: !config.details[key]
      }
    });
  };

  const detailLabels: Record<keyof SkinRealismConfig['details'], string> = {
    pores: 'Visible Pores',
    freckles: 'Freckles',
    wrinkles: 'Fine Lines',
    veins: 'Subsurface Veins',
    scars: 'Small Scars',
    stretchMarks: 'Stretch Marks',
    cellulite: 'Cellulite',
    discoloration: 'Skin Variation',
  };

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <ToggleSwitch
        label="Realistic Skin Details"
        checked={config.enabled}
        onChange={handleToggleEnabled}
        helpText="Enable granular control over skin texture and imperfections."
      />

      {config.enabled && (
        <div className="pl-4 border-l-2 border-gray-800 space-y-4 animate-fade-in">
          <div className="relative">
            <SliderInput
              label="Imperfection Intensity"
              value={config.intensity}
              onChange={handleIntensityChange}
              min={0}
              max={100}
              helpText="0 = Subtle/Soft, 100 = Raw/Unretouched"
            />
            {config.intensity > 90 && (
              <div className="absolute top-0 right-0 animate-pulse">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-200 text-[10px] uppercase tracking-wider font-bold">
                  Dermatological Accuracy Active
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(config.details) as Array<keyof SkinRealismConfig['details']>).map((key) => (
              <button
                key={key}
                onClick={() => handleDetailToggle(key)}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all border
                  ${config.details[key]
                    ? 'bg-teal-900/40 border-teal-500/50 text-teal-200'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-700'
                  }
                `}
              >
                <span>{detailLabels[key]}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${config.details[key] ? 'bg-teal-400' : 'bg-gray-700'}`}></div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinRealismControls;
