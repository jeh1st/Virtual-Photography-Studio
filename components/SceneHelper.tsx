
import React from 'react';

interface SceneSuggestion {
  name: string;
  description: string;
}

interface SceneHelperProps {
  suggestions: SceneSuggestion[];
  onSelect: (description: string) => void;
}

const SceneHelper: React.FC<SceneHelperProps> = ({ suggestions, onSelect }) => {
  return (
    <div className="w-full mt-2">
      <p className="text-xs text-gray-400 mb-2">Click a suggestion to add a starting point for your scene:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.name}
            onClick={() => onSelect(suggestion.description)}
            className="px-3 py-1 text-xs font-medium rounded-full text-teal-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-gray-900 transition-colors"
          >
            {suggestion.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SceneHelper;
