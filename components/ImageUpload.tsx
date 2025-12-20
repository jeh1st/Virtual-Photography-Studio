
import React, { useState, useCallback, useRef } from 'react';
import { db } from '../services/idbService';
import { processToMannequin } from '../utils/MannequinProcessor';
import ToggleSwitch from './ToggleSwitch';

interface ImageUploadProps {
    onUploadComplete?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadComplete }) => {
    const [isPrivate, setIsPrivate] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = async (files: FileList | File[]) => {
        setIsUploading(true);
        setUploadError(null);

        try {
            for (const file of Array.from(files)) {
                if (!file.type.startsWith('image/')) continue;

                const reader = new FileReader();
                const imageDataUrl = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                let finalSrc = imageDataUrl;
                let isMannequin = false;

                if (isPrivate) {
                    finalSrc = await processToMannequin(imageDataUrl);
                    isMannequin = true;
                }

                await db.library.add({
                    src: finalSrc,
                    prompt: isPrivate ? "Local Private Asset (Abstraction)" : `Uploaded Asset: ${file.name}`,
                    isPrivate,
                    isMannequin,
                    timestamp: Date.now()
                } as any);
            }
            onUploadComplete?.();
        } catch (error) {
            console.error("Upload failed:", error);
            setUploadError("Failed to process image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = () => {
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
        }
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Import Assets
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Add reference images to your studio library.</p>
                </div>

                <div className="flex items-center gap-4 bg-black/40 p-2 px-3 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2">
                        {isPrivate ? (
                            <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        ) : (
                            <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                        )}
                        <span className={`text-xs font-medium ${isPrivate ? 'text-rose-400' : 'text-teal-400'}`}>
                            {isPrivate ? 'Private Mode' : 'Standard Mode'}
                        </span>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-800"></div>
                    <ToggleSwitch
                        label=""
                        checked={isPrivate}
                        onChange={setIsPrivate}
                    />
                </div>
            </div>

            {isPrivate && (
                <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex gap-3">
                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <div>
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">AI Safety Bridge Active</p>
                        <p className="text-[11px] text-amber-200/80 mt-1">
                            Private images are converted to 18% Grey "Clay Mannequins" before storage.
                            Original pixels never reach the AI. Only anatomical form is preserved.
                        </p>
                    </div>
                </div>
            )}

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4
                    ${isDragActive
                        ? 'border-teal-500 bg-teal-500/5'
                        : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/30'
                    }
                    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    multiple
                />
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-colors
                    ${isPrivate ? 'bg-rose-500/20 text-rose-400' : 'bg-teal-500/20 text-teal-400'}
                `}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-200">
                        {isUploading ? 'Processing...' : 'Click or drag images here'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WEBP</p>
                </div>
            </div>

            {uploadError && (
                <p className="text-xs text-rose-400 mt-4 text-center">{uploadError}</p>
            )}
        </div>
    );
};

export default ImageUpload;
