
import { useState, FC } from 'react';

const PromptTips: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800/40 border border-white/5 rounded-xl overflow-hidden mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
      >
        <span>Prompt Building Tips</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 text-sm text-gray-300 space-y-3 bg-gray-900/30">
          <div>
            <h4 className="font-semibold text-purple-300 mb-1">Lighting is Key</h4>
            <p className="text-xs text-gray-400">
              Don't just rely on default lighting. Use 'Rim Light' to separate the subject from the background and 'Key Light' for drama.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-teal-300 mb-1">Combine Styles</h4>
            <p className="text-xs text-gray-400">
              Try mixing "Cinematic" style with "Vintage" lenses for unique looks.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-orange-300 mb-1">Avoid Safety Filters</h4>
            <p className="text-xs text-gray-400">
              If using "Fine Art Nude", avoid specific anatomical words. Focus on "form", "shadow", and "silhouette". When using "Realistic Skin", ensure the setting implies a professional artistic study.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-300 mb-1">Hair Descriptions</h4>
            <p className="text-xs text-gray-400">
              Specific hairstyles like "messy bun with loose strands" give more character than just "bun". Physics settings like "Windblown" add life.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptTips;