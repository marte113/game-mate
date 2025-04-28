'use client';

import React, { useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFormContext, Controller } from 'react-hook-form';
import { ProfileDataSchema } from '@/libs/schemas/profile.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// YouTube URL 유효성 검사 함수
const isValidYoutubeUrl = (url: string): boolean => {
  // 간단한 YouTube URL 검증 (더 정교한 검증이 필요할 수 있음)
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

// Define props including the 'name'
interface YouTubeUrlsCardProps {
  name: keyof ProfileDataSchema;
}

const YouTubeUrlsCard = React.memo(({ name }: YouTubeUrlsCardProps) => {
  // Get RHF methods. We need setValue and getValues to manage the array manually.
  const { control, setValue, getValues, formState: { errors } } = useFormContext<ProfileDataSchema>();
  const youtubeUrlsRef = useRef<HTMLInputElement>(null);
  const fieldError = errors[name]?.message; // Get potential error message for the array itself

  // YouTube URL 추가 함수 (wrapped with useCallback)
  const handleYoutubeUrlAdd = useCallback(() => {
    const newUrl = youtubeUrlsRef.current?.value || '';
    const currentUrls = (getValues(name) as string[] | undefined) ?? [];

    if (!newUrl.trim()) {
      toast.error('URL을 입력해주세요');
      return;
    }

    if (!isValidYoutubeUrl(newUrl)) {
      toast.error('유효한 YouTube URL을 입력해주세요');
      return;
    }

    if (currentUrls.length >= 4) {
      toast.error('YouTube URL은 최대 4개까지만 등록 가능합니다');
      return;
    }

    if (currentUrls.includes(newUrl)) {
      toast.error('이미 등록된 URL입니다.');
      return;
    }

    const newUrls = [...currentUrls, newUrl];
    // Update RHF state for this field
    setValue(name, newUrls, { shouldValidate: true, shouldDirty: true });

    if (youtubeUrlsRef.current) {
      youtubeUrlsRef.current.value = '';
    }

    toast.success('YouTube URL이 추가되었습니다');
  }, [getValues, setValue, name]); // Add dependencies

  // YouTube URL 제거 함수 (wrapped with useCallback)
  const handleYoutubeUrlRemove = useCallback((index: number) => {
    const currentUrls = (getValues(name) as string[] | undefined) ?? [];
    const newUrls = currentUrls.filter((_, i) => i !== index);
    // Update RHF state for this field
    setValue(name, newUrls, { shouldValidate: true, shouldDirty: true });
    toast.success('YouTube URL이 삭제되었습니다');
  }, [getValues, setValue, name]); // Add dependencies

  return (
    <div className="form-control mt-4">
      {/* Controller wraps the entire UI that depends on the 'youtubeUrls' field state */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const youtubeUrlsValue = (field.value as string[] | undefined) ?? []; // Get array from RHF state

          return (
            <>
              <label className="label">
                <span className="label-text">유튜브 URL 등록하기</span>
                <span className="label-text-alt">
                  {youtubeUrlsValue.length}/4 등록됨 {/* Display count from RHF state */}
                </span>
              </label>
              <div className="flex gap-2">
                <Input
                  ref={youtubeUrlsRef} // Keep ref for clearing input
                  type="text"
                  placeholder="유튜브 URL을 입력하세요"
                  className={`input input-bordered flex-grow ${fieldError ? 'input-error' : ''}`} // Add flex-grow
                  disabled={youtubeUrlsValue.length >= 4} // Disable based on RHF state
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleYoutubeUrlAdd(); }}} // Uses memoized handleYoutubeUrlAdd
                />
                <Button
                  type="button" // Prevent form submission
                  onClick={handleYoutubeUrlAdd} // Uses memoized handleYoutubeUrlAdd
                  disabled={youtubeUrlsValue.length >= 4} // Disable based on RHF state
                >
                  등록하기
                </Button>
              </div>
              {/* Display general error for the array field */}
              {fieldError && <p className="text-error text-sm mt-1">{fieldError}</p>}

              <div className="mt-2 space-y-2"> {/* Added space-y for better spacing */}
                {youtubeUrlsValue.map((url: string, index: number) => (
                  <div key={index} className="flex gap-2 items-center justify-between p-2 bg-base-200 rounded"> {/* Added background and padding */}
                    <span className="text-xs truncate flex-1" title={url}>{url}</span>
                    <button
                      type="button" // Prevent form submission
                      className="btn btn-xs btn-ghost" // Use ghost button style
                      onClick={() => handleYoutubeUrlRemove(index)} // Uses memoized handleYoutubeUrlRemove
                      aria-label={`Remove URL ${url}`} // Accessibility improvement
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          );
        }}
      />
    </div>
  );
});

YouTubeUrlsCard.displayName = 'YouTubeUrlsCard';

export default YouTubeUrlsCard; 