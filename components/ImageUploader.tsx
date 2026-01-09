import React, { useRef, useCallback } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
  takePhotoText: string;
  uploadDeviceText: string;
  imagePreviewText: string;
  clearSelectionText: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelect, 
  selectedImage,
  takePhotoText,
  uploadDeviceText,
  imagePreviewText,
  clearSelectionText
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onImageSelect(file || null);
    // Reset the other input so the user can switch methods
    const otherInput = event.target === fileInputRef.current ? cameraInputRef.current : fileInputRef.current;
    if(otherInput) {
      otherInput.value = '';
    }
  }, [onImageSelect]);

  const handleClearSelection = useCallback(() => {
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  }, [onImageSelect]);

  const previewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        {/* Primary Action */}
        <label className="cursor-pointer w-full group" aria-label="Take a photo with your camera">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            ref={cameraInputRef}
          />
          <span className="flex items-center justify-center gap-x-3 w-full px-6 py-4 bg-brand-emerald text-white font-bold uppercase tracking-wider rounded-lg shadow-lg hover:bg-brand-emerald/90 hover:shadow-xl group-hover:shadow-brand-amber/30 transition-all duration-300 transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {takePhotoText}
          </span>
        </label>
        {/* Secondary Action */}
        <label className="cursor-pointer w-full group" aria-label="Upload an image from your device">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <span className="flex items-center justify-center gap-x-3 w-full px-6 py-3 bg-brand-jade text-brand-emerald font-bold uppercase tracking-wider rounded-lg shadow-md hover:bg-brand-jade/90 hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {uploadDeviceText}
          </span>
        </label>
      </div>

      {selectedImage && (
        <div className="mt-6 p-4 border border-white/30 dark:border-white/20 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm flex flex-col items-center animate-fade-in-up opacity-0">
          <p className="text-brand-emerald dark:text-brand-jade font-semibold mb-3">{imagePreviewText}</p>
          <img
            src={previewUrl!}
            alt="Selected Plant or Soil"
            className="max-w-full h-48 md:h-64 object-contain rounded-lg shadow-lg mb-3 border-2 border-white/50"
            onLoad={() => { if(previewUrl) URL.revokeObjectURL(previewUrl) }}
          />
          <p className="text-sm text-brand-charcoal dark:text-brand-off-white font-medium truncate max-w-full px-4">{selectedImage.name}</p>
          <button
            onClick={handleClearSelection}
            className="mt-3 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-bold transition duration-200"
            aria-label="Clear selected image"
          >
            {clearSelectionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;