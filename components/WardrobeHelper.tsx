
import { FC } from 'react';

interface WardrobeSuggestion {
  name: string;
  description: string;
}

interface WardrobeHelperProps {
  suggestions: WardrobeSuggestion[];
  currentText: string;
  onSelect: (description: string) => void;
}

const WardrobeHelper: FC<WardrobeHelperProps> = ({ suggestions, currentText, onSelect }) => {
  return (
    <div className="w-full mt-3">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Artistic Descriptors</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => {
          const isActive = currentText.includes(suggestion.description);
          return (
            <button
              key={suggestion.name}
              onClick={() => onSelect(suggestion.description)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200
                ${isActive
                  ? 'bg-teal-900/40 border-teal-500/50 text-teal-200 shadow-sm'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-700'
                }
              `}
            >
              {suggestion.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WardrobeHelper;
