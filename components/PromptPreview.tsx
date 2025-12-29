import { useState, FC, ChangeEvent } from 'react';

interface PromptPreviewProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

const PromptPreview: FC<PromptPreviewProps> = ({ label, value, onChange }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = async () => {
    if (!navigator.clipboard) {
      // Fallback for older browsers
      console.error('Clipboard API not available');
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset the copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="w-full pt-4 border-t border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="prompt-preview" className="block text-sm font-bold text-gray-300">{label}</label>
        <button
          onClick={handleCopyClick}
          className="flex items-center gap-1.5 text-xs font-medium text-purple-300 hover:text-purple-200 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-md transition-all duration-200 disabled:opacity-75"
          disabled={isCopied}
          aria-live="polite"
        >
          {isCopied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <textarea
        id="prompt-preview"
        value={value}
        onChange={onChange}
        rows={12}
        className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-300 font-mono text-xs focus:outline-none focus:ring-purple-500 focus:border-purple-500 resize-y"
        aria-label="Full AI Prompt Preview"
      />
      <p className="text-xs text-gray-500 mt-2">You can review and edit the final prompt sent to the AI here for precise control.</p>
    </div>
  );
};

export default PromptPreview;