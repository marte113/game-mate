'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { uploadFileToStorage } from '@/app/dashboard/_api/profileSectionApi';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useFileUpload(onUploadSuccess: (imageUrl: string) => void) {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const { mutate: uploadFile, isPending: isUploading } = useMutation({
    mutationFn: uploadFileToStorage,
    onSuccess: (imageUrl) => {
      onUploadSuccess(imageUrl);
    },
    onError: (error: Error) => {
      toast.error(`이미지 업로드에 실패했습니다: ${error.message}`);
      setFilePreview(null);
    }
  });

  const validateFile = useCallback((file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 크기는 5MB를 초과할 수 없습니다');
      return false;
    }
    
    return true;
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!validateFile(file)) return;
    
    // 파일 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // 파일 업로드
    uploadFile(file);
  }, [uploadFile, validateFile]);

  return { 
    filePreview, 
    setFilePreview, 
    handleFileChange, 
    isUploading 
  };
}