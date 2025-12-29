
import { FC, CSSProperties } from 'react';
import LoadingPlaceholder from './LoadingPlaceholder';

interface GeneratedImage {
  src: string;
  prompt: string;
}

interface ImageDisplayProps {
  images: GeneratedImage[];
  isLoading: boolean;
  onImageClick: (image: GeneratedImage) => void;
  onIterateClick: (image: GeneratedImage) => void;
  customCSS?: string;
}

const ImageDisplay: FC<ImageDisplayProps> = ({ images, isLoading, onImageClick, onIterateClick, customCSS }) => {
  // Safe CSS parsing
  let styleObj: CSSProperties = {};
  if (customCSS) {
      // Very basic parser for inline style string to object
      // e.g. "border: 1px solid red; filter: blur(5px)" -> { border: "1px solid red", filter: "blur(5px)" }
      customCSS.split(';').forEach(rule => {
          const [key, value] = rule.split(':');
          if (key && value) {
              const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
              (styleObj as any)[camelKey] = value.trim();
          }
      });
  }

  if (images.length === 0 && !isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 p-8 min-h-[300px]">
        <p className="text-gray-500 text-center">Your generated images will appear here. <br/> Start by creating your first concept!</p>
      </div>
    );
  }

  return (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {images.map((image, index) => (
        <div 
            key={index} 
            className="bg-gray-800 p-2 rounded-lg shadow-lg group flex flex-col"
            style={styleObj}
        >
          <div
            className="cursor-pointer relative"
            onClick={() => onImageClick(image)}
            role="button"
            aria-label={`View generated image ${index + 1} in full screen`}
          >
             <img 
                src={image.src} 
                alt={`Generated boudoir concept ${index + 1}`} 
                className="rounded-md w-full h-auto object-cover transition-transform transform group-hover:scale-105" 
             />
             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex justify-center items-center rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
             </div>
          </div>
          <button
              onClick={() => onIterateClick(image)}
              className="mt-2 w-full text-center px-3 py-1.5 text-sm font-medium rounded-md text-cyan-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800 transition-colors"
          >
              Iterate on This Image
          </button>
        </div>
      ))}
      {isLoading && <LoadingPlaceholder />}
    </div>
  );
};

export default ImageDisplay;
