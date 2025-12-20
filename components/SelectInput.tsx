
import React from 'react';
import { capitalize } from '../constants';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | SelectOption)[];
  labelMap?: Record<string, string>;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options, labelMap }) => {
  return (
    <div className="w-full group">
      {label && <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 group-hover:text-gray-400 transition-colors">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="block w-full bg-gray-950 border border-gray-700/50 rounded-lg shadow-sm py-3 px-4 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none hover:border-gray-600 truncate"
        >
          {options.map((option) => {
             const optValue = typeof option === 'string' ? option : option.value;
             const optLabel = typeof option === 'string' 
                ? (labelMap ? labelMap[option] : capitalize(option))
                : option.label;

             return (
                <option key={optValue} value={optValue}>
                  {optLabel}
                </option>
             );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SelectInput;
