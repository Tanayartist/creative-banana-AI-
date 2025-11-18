import React, { useState, useCallback } from 'react';
import { ImageFile } from '../types';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  label: string;
  onImageUpload: (file: ImageFile | null) => void;
  id: string;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onImageUpload, id }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(async (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await fileToBase64(file);
        const imageFile: ImageFile = { base64, mimeType: file.type };
        setImageSrc(URL.createObjectURL(file));
        onImageUpload(imageFile);
      } catch (error) {
        console.error("Error converting file to base64", error);
        onImageUpload(null);
        setImageSrc(null);
      }
    } else {
        onImageUpload(null);
        setImageSrc(null);
    }
  }, [onImageUpload]);

  const onDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };


  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <label
        htmlFor={id}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-colors duration-200
        ${isDragging ? 'border-red-500 bg-gray-800' : 'border-gray-600 hover:border-gray-500'}
        ${imageSrc ? 'p-0 border-solid' : ''}`}
        style={{ minHeight: '150px' }}
      >
        {imageSrc ? (
          <img src={imageSrc} alt="Preview" className="w-full h-auto object-contain rounded-md max-h-48" />
        ) : (
          <div className="space-y-1 text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
            <div className="flex text-sm text-gray-500">
              <span className="relative font-medium text-red-400 hover:text-red-300">
                Upload a file
              </span>
              <input 
                id={id} 
                name={id} 
                type="file" 
                className="sr-only" 
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
              />
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-600">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </label>
    </div>
  );
};