
import React from 'react';
import TextAreaInput from './TextAreaInput';
import Button from './Button';

interface GeneratedImage {
  src: string;
  prompt: string;
}

interface IterationWorkspaceProps {
  baseImage: GeneratedImage;
  modificationPrompt: string;
  onModificationPromptChange: (value: string) => void;
  onGenerate: () => void;
  onCancel: () => void;
  isLoading: boolean;
  cooldown: number;
}

const IterationWorkspace: React.FC<IterationWorkspaceProps> = ({
  baseImage,
  modificationPrompt,
  onModificationPromptChange,
  onGenerate,
  onCancel,
  isLoading,
  cooldown,
}) => {
  return (
    <div className="bg-gray-700/50 p-6 rounded-xl shadow-2xl mb-8 border border-cyan-500/50">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-cyan-300">Iterate on Image</h2>
            <button
                onClick={onCancel}
                className="text-sm text-gray-400 hover:text-white transition-colors"
            >
                Cancel Iteration
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <p className="text-sm font-medium text-gray-300 mb-2">Base Image</p>
                <img src={baseImage.src} alt="Base for iteration" className="rounded-lg w-full object-cover" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-4">
                <TextAreaInput
                    label="Modification Instruction"
                    value={modificationPrompt}
                    onChange={(e) => onModificationPromptChange(e.target.value)}
                    placeholder="e.g., 'change the hair color to blonde', 'add a cinematic fog effect', 'make the dress red'"
                />
                 <Button onClick={onGenerate} disabled={isLoading || cooldown > 0 || !modificationPrompt.trim()}>
                    {isLoading ? 'Applying...' : cooldown > 0 ? `Ready in ${cooldown}s` : 'Apply Modification'}
                </Button>
            </div>
        </div>
    </div>
  );
};

export default IterationWorkspace;
