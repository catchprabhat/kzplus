import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, User, Check } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  loading?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  loading = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);

      // Simulate upload delay (replace with actual upload logic)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would upload to a service like AWS S3, Cloudinary, etc.
      // For demo purposes, we'll use the local preview
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl);

      console.log('Image uploaded successfully:', file.name);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  }, [currentImage, onImageChange]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Current Image Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-700 border-4 border-white dark:border-dark-600 shadow-lg">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          
          {/* Upload Status Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          )}
          
          {/* Remove Button */}
          {preview && !uploading && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300
          ${dragActive 
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-dark-600 hover:border-gray-400 dark:hover:border-dark-500'
          }
          ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading || loading}
        />

        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="flex justify-center">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-colors
              ${dragActive 
                ? 'bg-blue-100 dark:bg-blue-900/30' 
                : 'bg-gray-100 dark:bg-dark-700'
              }
            `}>
              {uploading ? (
                <LoadingSpinner size="sm" />
              ) : dragActive ? (
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <Camera className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </div>

          {/* Upload Text */}
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {uploading ? 'Uploading...' : dragActive ? 'Drop image here' : 'Upload Profile Picture'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {uploading 
                ? 'Please wait while we upload your image'
                : 'Drag and drop an image here, or click to select'
              }
            </p>
          </div>

          {/* Upload Guidelines */}
          {!uploading && (
            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
              <p>• Supported formats: JPG, PNG, GIF, WebP</p>
              <p>• Maximum file size: 5MB</p>
              <p>• Recommended: Square images (1:1 ratio)</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Actions */}
      <div className="flex justify-center space-x-3">
        <button
          onClick={openFileDialog}
          disabled={uploading || loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-dark-600 text-white disabled:text-gray-500 rounded-lg font-medium transition-colors flex items-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose File
        </button>
        
        {preview && (
          <button
            onClick={handleRemoveImage}
            disabled={uploading || loading}
            className="px-4 py-2 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
};