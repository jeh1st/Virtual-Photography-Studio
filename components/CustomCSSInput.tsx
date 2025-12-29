
import { FC } from 'react';
import TextAreaInput from './TextAreaInput';

interface CustomCSSInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomCSSInput: FC<CustomCSSInputProps> = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <TextAreaInput
        label="Custom CSS (Container)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., border: 5px solid gold; filter: sepia(0.5);"
      />
      <p className="text-xs text-gray-500 mt-2">
        Apply inline CSS styles directly to the image container div. Useful for borders, filters, or transforms.
      </p>
    </div>
  );
};

export default CustomCSSInput;