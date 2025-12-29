
import { FC } from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
}

const ToggleSwitch: FC<ToggleSwitchProps> = ({ label, checked, onChange, helpText }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <button
          type="button"
          className={`${checked ? 'bg-purple-600' : 'bg-gray-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
          role="switch"
          aria-checked={checked}
          onClick={handleToggle}
        >
          <span
            aria-hidden="true"
            className={`${checked ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
          />
        </button>
      </div>
      {helpText && <p className="text-xs text-gray-500 mt-2">{helpText}</p>}
    </div>
  );
};

export default ToggleSwitch;
