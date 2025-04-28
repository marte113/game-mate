'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AlbumImage } from './AlbumGalleryCard';
import ThumbnailItem from './ThumbnailItem';
import { 
  uploadAlbumImage, 
  deleteAlbumImage, 
  setAlbumImageAsThumbnail 
} from '@/app/dashboard/_api/profileSectionApi';

interface ThumbnailGridProps {
  albumImages: (AlbumImage | null)[];
  queryKey: string[];
}

export default function ThumbnailGrid({ albumImages, queryKey }: ThumbnailGridProps) {
  const queryClient = useQueryClient();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // 이미지 업로드 뮤테이션
  const uploadMutation = useMutation({
    mutationFn: ({ file, index }: { file: File, index: number }) => uploadAlbumImage(file, index),
    onMutate: (variables) => {
      setUploadingIndex(variables.index);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`이미지 ${variables.index + 1}이(가) 업로드되었습니다.`);
    },
    onError: (error: any, variables) => {
      toast.error(`이미지 ${variables.index + 1} 업로드 실패: ${error.message}`);
    },
    onSettled: () => {
      setUploadingIndex(null);
    },
  });

  // 이미지 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => deleteAlbumImage(imageId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('이미지가 삭제되었습니다.');
    },
    onError: (error: any) => {
      toast.error(`이미지 삭제 실패: ${error.message}`);
    },
  });

  // 썸네일 설정 뮤테이션
  const setThumbnailMutation = useMutation({
    mutationFn: (imageUrl: string) => setAlbumImageAsThumbnail(imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('썸네일 이미지가 변경되었습니다.');
    },
    onError: (error: any) => {
      toast.error(`썸네일 설정 실패: ${error.message}`);
    },
  });

  // 이미지 업로드 핸들러
  const handleAlbumUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ file, index });
  };

  // 이미지 삭제 핸들러 (async 추가)
  const handleRemoveImage = async (imageId: string): Promise<void> => {
    if (window.confirm('정말 이미지를 삭제하시겠습니까?')) {
      await deleteMutation.mutateAsync(imageId); // mutateAsync 사용
    }
  };

  // 썸네일 설정 핸들러 (async 추가)
  const handleSetAsThumbnail = async (imageUrl: string): Promise<void> => {
    await setThumbnailMutation.mutateAsync(imageUrl); // mutateAsync 사용
  };

  const isProcessingAny = uploadMutation.isPending || deleteMutation.isPending || setThumbnailMutation.isPending;

  return (
    <div className="grid grid-cols-3 gap-2">
      {albumImages.map((image, index) => (
        <div
          key={image?.id ?? `placeholder-${index}`}
          className="aspect-square rounded-lg overflow-hidden relative bg-base-200"
        >
          <ThumbnailItem
            image={image}
            index={index}
            isUploading={uploadingIndex === index}
            isProcessing={isProcessingAny}
            handleAlbumUpload={handleAlbumUpload}
            handleSetAsThumbnail={handleSetAsThumbnail}
            handleRemoveImage={handleRemoveImage}
          />
        </div>
      ))}
    </div>
  );
} 