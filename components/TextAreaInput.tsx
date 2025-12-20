
import React from 'react';

interface TextAreaInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ label, value, onChange, placeholder }) => {
  const handleClear = () => {
    const syntheticEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(syntheticEvent);
  };

  return (
    <div className="w-full group">
      <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1.5 group-hover:text-gray-300 transition-colors">{label}</label>
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className="block w-full bg-gray-900/50 border border-gray-700 rounded-lg shadow-sm py-2.5 pl-3 pr-8 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm resize-none transition-all hover:bg-gray-900"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors focus:outline-none bg-gray-800/50 rounded-full p-0.5"
            title="Clear text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TextAreaInput;
