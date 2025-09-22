import React, { useRef } from "react";
import { CameraIcon } from "@heroicons/react/24/outline";

interface ImageUploaderProps {
  label: string;
  currentImage?: File | null;
  currentImageUrl?: string | null;
  onImageUpload: (file: File) => void;
  accept?: string;
  className?: string;
  previewClassName?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  currentImage,
  currentImageUrl,
  onImageUpload,
  accept = "image/*",
  className = "",
  previewClassName = "w-64 h-32 object-cover rounded-lg border-2 border-accent/30",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const getImageUrl = () => {
    if (currentImage) {
      return URL.createObjectURL(currentImage);
    }
    return currentImageUrl;
  };

  const hasImage = currentImage || currentImageUrl;
  const imageUrl = getImageUrl();

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center space-x-2 px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 transition-colors"
        >
          <CameraIcon className="w-4 h-4" />
          <span>Chọn ảnh</span>
        </button>
        {hasImage && (
          <span className="text-sm text-green-600">Đã chọn ảnh</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`${label} preview`}
          className={`mt-2 ${previewClassName}`}
        />
      )}
    </div>
  );
};

export default ImageUploader;
