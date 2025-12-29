import { useRef, ChangeEvent, FC } from 'react';
import { ImageData } from '../types';

interface ImageInputProps {
  value: ImageData | null;
  onImageSelect: (fileData: ImageData | null) => void;
  label?: string;
  helpText?: string;
}

const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Use JPEG for better compression of photographic images
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};


const ImageInput: FC<ImageInputProps> = ({ value, onImageSelect, label = 'Reference Image (Optional)', helpText }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const resizedDataUrl = await resizeImage(file, 1024, 1024);
        onImageSelect({ data: resizedDataUrl, mimeType: 'image/jpeg' });
      } catch (error) {
        console.error("Error resizing image:", error);
        onImageSelect(null);
        // Optionally, display an error message to the user
      }
    } else {
      onImageSelect(null);
    }
  };

  const handleRemoveImage = () => {
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {helpText && <p className="text-xs text-gray-500 mb-2">{helpText}</p>}
      <div
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-purple-500 transition-colors"
        onClick={triggerFileSelect}
      >
        <div className="space-y-1 text-center">
          {value ? (
            <div className="relative group">
              <img src={value.data} alt="Reference preview" className="mx-auto h-24 w-24 object-cover rounded-md" />
            </div>
          ) : (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-400">
                <p className="pl-1">Upload an image</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, etc.</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} id={`file-upload-${label}`} name={`file-upload-${label}`} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
      </div>
      {value && (
        <button
          onClick={handleRemoveImage}
          className="text-xs text-red-400 hover:text-red-300 mt-2 w-full text-center"
        >
          Remove Image
        </button>
      )}
    </div>
  );
};

export default ImageInput;