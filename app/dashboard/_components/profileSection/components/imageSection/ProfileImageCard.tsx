"use client";

import { memo } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

import { useProfileImage } from "@/app/dashboard/_hooks/useProfileImage";
import { useFileUpload } from "@/app/dashboard/_hooks/useFileUpload";

// UI 컴포넌트 분리
const ProfileImagePlaceholder = memo(() => (
  <div className="w-full h-full flex items-center justify-center">
    <span className="text-4xl text-base-content/30">?</span>
  </div>
));
ProfileImagePlaceholder.displayName = "ProfileImagePlaceholder";

const LoadingCard = memo(() => (
  <div className="card bg-base-100 shadow-xl animate-pulse">
    <div className="card-body">
      <div className="h-6 bg-base-300 rounded w-1/4 mb-6"></div>
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-full bg-base-300"></div>
      </div>
    </div>
  </div>
));
LoadingCard.displayName = "LoadingCard";

const ErrorCard = memo(({ onRetry }: { onRetry: () => void }) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <h3 className="card-title text-error mb-4">오류 발생</h3>
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-full bg-base-200 flex items-center justify-center">
          <span className="text-error text-4xl">!</span>
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <button
          className="btn btn-sm btn-primary"
          onClick={onRetry}
          aria-label="다시 시도"
        >
          다시 시도
        </button>
      </div>
    </div>
  </div>
));
ErrorCard.displayName = "ErrorCard";

// 메인 컴포넌트
function ProfileImageCard() {
  // 프로필 이미지 관련 훅
  const { profileData, isLoading, isError, updateProfileImage, retryFetch } = useProfileImage();

  // 파일 업로드 관련 훅
  const { filePreview, handleFileChange, isUploading } = useFileUpload(updateProfileImage);

  // 로딩 중일 때
  if (isLoading) {
    return <LoadingCard />;
  }

  // 에러 발생 시
  if (isError) {
    return <ErrorCard onRetry={retryFetch} />;
  }

  // 현재 표시할 이미지
  const displayImage = filePreview || profileData?.profileImage;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title mb-4">프로필 이미지</h3>
        <div className="flex justify-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-base-200">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <ProfileImagePlaceholder />
              )}
            </div>
            <label
              className={`
                absolute bottom-0 right-0 p-2 rounded-full 
                bg-primary text-primary-content cursor-pointer 
                hover:bg-primary-focus transition-colors
                ${isUploading ? "opacity-50 pointer-events-none" : ""}
              `}
              aria-label="프로필 이미지 업로드"
            >
              {isUploading ? (
                <span className="loading loading-spinner loading-xs w-5 h-5 flex items-center justify-center"></span>
              ) : (
                <Camera className="w-5 h-5" />
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                aria-label="이미지 파일 선택"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProfileImageCard);
