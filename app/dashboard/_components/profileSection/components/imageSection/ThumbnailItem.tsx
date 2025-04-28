'use client';

import Image from 'next/image';
import { Plus, X, Star, Loader2 } from 'lucide-react';

import { AlbumImage } from './AlbumGalleryCard';

interface ThumbnailItemProps {
  image: AlbumImage | null;
  index: number;
  isUploading: boolean;
  isProcessing: boolean;
  handleAlbumUpload: (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSetAsThumbnail: (imageUrl: string) => Promise<void>;
  handleRemoveImage: (imageId: string) => Promise<void>;
}

export default function ThumbnailItem({
  image,
  index,
  isUploading,
  isProcessing,
  handleAlbumUpload,
  handleSetAsThumbnail,
  handleRemoveImage,
}: ThumbnailItemProps) {
  const isDisabled = isUploading || isProcessing;

  if (image) {
    return (
      <div className={`group relative w-full h-full ${image.isThumbnail ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
        <Image
          src={image.url}
          alt={`Thumbnail ${index + 1}`}
          fill
          sizes="(max-width: 768px) 33vw, 20vw"
          className={`object-cover transition-opacity ${isDisabled ? 'opacity-50' : ''}`}
          priority={index < 3}
        />
        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 ${isDisabled ? 'opacity-100 bg-black/50' : ''}`}>
          {isDisabled && <Loader2 className="w-5 h-5 text-white animate-spin" />}
          
          {!image.isThumbnail && !isDisabled && (
            <button
              onClick={() => handleSetAsThumbnail(image.url)}
              className="btn btn-xs btn-primary disabled:opacity-50"
              disabled={isDisabled}
              aria-label="썸네일로 설정"
            >
              <Star className="w-3 h-3 mr-1" /> 썸네일
            </button>
          )}
          
          {!isDisabled && (
            <button
              onClick={() => handleRemoveImage(image.id)}
              className="btn btn-xs btn-error disabled:opacity-50"
              disabled={isDisabled}
              aria-label="이미지 삭제"
            >
              <X className="w-3 h-3" />
            </button>
           )}
        </div>
        {image.isThumbnail && (
          <div className="absolute top-1 left-1 bg-primary text-primary-content rounded-full p-1 shadow-md">
            <Star className="w-3 h-3 fill-current" />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <label className={`w-full h-full flex items-center justify-center bg-base-200 cursor-pointer hover:bg-base-300 transition-colors border-2 border-dashed border-base-content/20 hover:border-base-content/40 rounded-lg ${isUploading ? 'opacity-50 pointer-events-none animate-pulse' : ''}`}>
      {isUploading ? (
        <Loader2 className="w-5 h-5 text-base-content/50 animate-spin" />
      ) : (
        <Plus className="w-5 h-5 text-base-content/50" />
      )}
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleAlbumUpload(index)}
        disabled={isUploading || isProcessing}
        aria-label={`앨범 슬롯 ${index + 1}에 이미지 추가`}
      />
    </label>
  );
} 