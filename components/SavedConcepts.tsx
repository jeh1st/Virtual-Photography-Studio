import React from 'react';
import { Concept } from '../types';

interface SavedConceptsProps {
  concepts: Concept[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

const SavedConcepts: React.FC<SavedConceptsProps> = ({ concepts, onLoad, onDelete }) => {
  if (concepts.length === 0) {
    return null;
  }

  return (
    <div className="w-full pt-4 mt-4 border-t border-gray-700">
      <h3 className="text-lg font-bold text-gray-300 mb-3">Saved Concepts</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {concepts.map((concept) => (
          <div key={concept.id} className="bg-gray-900 p-3 rounded-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
                {concept.referenceImage ? (
                     <img src={concept.referenceImage.data} alt="Concept thumbnail" className="h-10 w-10 rounded-md object-cover flex-shrink-0" />
                ) : (
                    <div className="h-10 w-10 rounded-md bg-gray-700 flex-shrink-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <p className="text-sm text-gray-400 truncate" title={concept.name}>{concept.name}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onLoad(concept.id)}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-2 rounded-md transition-colors"
                aria-label={`Load ${concept.name}`}
              >
                Load
              </button>
              <button
                onClick={() => onDelete(concept.id)}
                className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded-md transition-colors"
                 aria-label={`Delete ${concept.name}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedConcepts;
