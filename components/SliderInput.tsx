import { FC, ChangeEvent } from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  helpText?: string;
}

const SliderInput: FC<SliderInputProps> = ({ label, value, onChange, min, max, helpText }) => {
  const getStrengthLabel = (val: number) => {
    if (val > 66) return 'Artistic';
    if (val > 33) return 'Balanced';
    return 'Literal';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-semibold text-purple-300">{getStrengthLabel(value)}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
      {helpText && <p className="text-xs text-gray-500 mt-2">{helpText}</p>}
    </div>
  );
};

export default SliderInput;