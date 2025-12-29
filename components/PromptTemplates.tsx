import { useState, FC } from 'react';
import { PromptTemplate } from '../types';

interface PromptTemplatesProps {
  templates: PromptTemplate[];
  currentPrompt: string;
  onSave: (name: string, content: string) => void;
  onApply: (content: string) => void;
  onDelete: (id: string) => void;
}

const PromptTemplates: FC<PromptTemplatesProps> = ({ templates, currentPrompt, onSave, onApply, onDelete }) => {
  const [templateName, setTemplateName] = useState('');

  const handleSaveClick = () => {
    if (templateName.trim() && currentPrompt.trim()) {
      onSave(templateName, currentPrompt);
      setTemplateName('');
    } else {
      // Maybe provide user feedback here
      console.warn("Template name or content is empty. Cannot save.");
    }
  };

  return (
    <div className="w-full pt-4 border-t border-gray-700">
      <h3 className="text-lg font-bold text-gray-300 mb-3">Prompt Templates</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="New template name..."
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        />
        <button
          onClick={handleSaveClick}
          className="px-4 py-2 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={!templateName.trim()}
        >
          Save
        </button>
      </div>

      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
        {templates.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No templates saved yet.</p>
        )}
        {templates.map((template) => (
          <div key={template.id} className="bg-gray-900 p-3 rounded-lg flex items-center justify-between gap-3">
            <p className="text-sm text-gray-400 truncate flex-grow" title={template.name}>
              {template.name}
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onApply(template.content)}
                className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-md transition-colors"
                aria-label={`Apply ${template.name}`}
              >
                Apply
              </button>
              <button
                onClick={() => onDelete(template.id)}
                className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md transition-colors"
                aria-label={`Delete ${template.name}`}
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

export default PromptTemplates;