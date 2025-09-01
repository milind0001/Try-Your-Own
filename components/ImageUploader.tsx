import React, { useState, useCallback } from 'react';
import type { UploadedImage } from '../types';

interface ImageUploaderProps {
  id: string;
  title:string;
  description: string;
  onImagesUpload: (images: UploadedImage[]) => void;
  multiple?: boolean;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const RemoveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, description, onImagesUpload, multiple = false }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isActive, setIsActive] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newImagesPromises = fileList.map(file => {
      return new Promise<UploadedImage>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ file, previewUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
      });
    });

    const newImages = await Promise.all(newImagesPromises);
    const updatedImages = multiple ? [...images, ...newImages] : newImages.slice(0, 1);
    
    setImages(updatedImages);
    onImagesUpload(updatedImages);
  }, [multiple, onImagesUpload, images]);

  const handleRemoveImage = useCallback((index: number) => {
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      onImagesUpload(updatedImages);
  }, [images, onImagesUpload]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsActive(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsActive(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsActive(false);
    handleFiles(event.dataTransfer.files);
  }, [handleFiles]);

  const hasImages = images.length > 0;

  return (
    <div className="w-full">
        <h2 className="text-xl font-semibold mb-2 text-center text-indigo-300">{title}</h2>
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                w-full min-h-[20rem] rounded-lg border-2 border-dashed
                transition-all duration-300 p-2
                bg-gray-800/50
                ${isActive ? 'border-indigo-500 scale-105' : 'border-gray-600'}
                ${!hasImages ? 'hover:border-indigo-500' : ''}
            `}
        >
            <input
                id={id}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                multiple={multiple}
            />
            {!hasImages ? (
                <label htmlFor={id} className="cursor-pointer w-full h-full min-h-[19rem] flex flex-col items-center justify-center p-4">
                    <UploadIcon />
                    <p className="text-gray-400">
                        <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                </label>
            ) : (
                <div className={`grid gap-2 ${multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
                    {images.map((image, index) => (
                        <div key={index} className="relative group aspect-w-1 aspect-h-1 bg-gray-900/50 rounded-md">
                            <img src={image.previewUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-contain rounded-md" />
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRemoveImage(index);
                                }}
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                aria-label="Remove image"
                            >
                                <RemoveIcon />
                            </button>
                        </div>
                    ))}
                    {multiple && (
                        <label htmlFor={id} className="cursor-pointer aspect-w-1 aspect-h-1 flex items-center justify-center rounded-md border-2 border-dashed border-gray-600 hover:border-indigo-500 text-gray-500 hover:text-indigo-400 transition-colors">
                            <div className="text-center">
                                <UploadIcon />
                                <p className="text-xs mt-1">Add more</p>
                            </div>
                        </label>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default ImageUploader;
