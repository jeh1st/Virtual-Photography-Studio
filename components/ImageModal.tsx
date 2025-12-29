
import { useState, useEffect, FC, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import Spinner from './Spinner';

interface ImageModalProps {
  image: { src: string; prompt: string; };
  onClose: () => void;
  onUpscale: (image: { src: string; prompt: string; }) => void;
  onEdit?: (image: { src: string; prompt: string; }) => void; // Added onEdit prop
  isUpscaling: boolean;
}

const ImageModal: FC<ImageModalProps> = ({ image, onClose, onUpscale, onEdit, isUpscaling }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCopyPrompt = async () => {
    if (!navigator.clipboard) {
      console.error('Clipboard API not available');
      return;
    }
    try {
      await navigator.clipboard.writeText(image.prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt: ', err);
    }
  };

  const handleUpscaleClick = () => {
    if (!isUpscaling) {
      onUpscale(image);
    }
  };

  const toggleZoom = (e: ReactMouseEvent) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  const getDownloadFilename = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    let zzz = '';
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(now);
      const tzName = parts.find(p => p.type === 'timeZoneName')?.value || '';
      zzz = tzName.replace(/[^a-zA-Z0-9+\-]/g, '');
    } catch (e) {
      zzz = 'Local';
    }

    return `vps-${yyyy}${mm}${dd}_${hh}${min}${ss}${zzz}.jpg`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div
        className="bg-gray-900 border border-white/5 rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col gap-4 p-4 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <h2 id="image-modal-title" className="text-lg sm:text-xl font-bold text-gray-200 tracking-wide">Generated Image</h2>
            <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-700">
              {isZoomed ? '100% Actual' : 'Fit'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleZoom}
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              {isZoomed ? 'Zoom Out' : 'Zoom In'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close image viewer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`flex-grow bg-gray-950 rounded-xl border border-white/5 overflow-auto flex ${isZoomed ? 'items-start justify-start' : 'items-center justify-center'} cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
          onClick={toggleZoom}
        >
          <img
            src={image.src}
            alt="Full size generated portrait"
            className={`transition-all duration-200 ${isZoomed ? 'max-w-none' : 'max-w-full max-h-full'} h-auto w-auto object-contain shadow-lg`}
            style={isZoomed ? { minWidth: '100%' } : {}}
          />
        </div>

        <div className="flex-shrink-0 flex flex-col gap-3 pt-2">
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prompt Data</h3>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-purple-300 hover:text-purple-200 bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-md transition-all duration-200 disabled:opacity-75"
                disabled={isCopied}
                aria-live="polite"
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-400 font-mono max-h-24 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">{image.prompt}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(image)}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit / Compose
              </button>
            )}
            <button
              onClick={handleUpscaleClick}
              disabled={isUpscaling}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-gray-900 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              {isUpscaling ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span>Enhancing...</span>
                </div>
              ) : 'Upscale (AI)'}
            </button>
            <a
              href={image.src}
              download={getDownloadFilename()}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 transition-colors"
            >
              Download
            </a>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fadeIn 0.2s ease-out forwards;
        }
        .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
        }
    `}</style>
    </div>
  );
};

export default ImageModal;
