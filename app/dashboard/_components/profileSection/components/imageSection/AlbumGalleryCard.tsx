'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAlbumImages } from '@/app/dashboard/_api/profileSectionApi';
import MainCarousel from '@/components/MainCarousel';
import ThumbnailGrid from './ThumbnailGrid';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

// AlbumImage 타입 정의 (ThumbnailGrid에서도 사용 가능하도록 export)
export interface AlbumImage {
  id: string;
  url: string;
  isThumbnail: boolean;
}

const ALBUM_IMAGES_QUERY_KEY = ['albumImages'];

export default function AlbumGalleryCard() {
  const {
    data: albumData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ALBUM_IMAGES_QUERY_KEY,
    queryFn: fetchAlbumImages,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선하게 유지
    refetchOnWindowFocus: false, // 창 포커스 시 자동 리페치 비활성화
  });

  // 로딩 상태 처리
  if (isLoading) {
    return <LoadingState sectionTitle="앨범 관리" />;
  }

  // 에러 상태 처리
  if (isError) {
    return <ErrorState sectionTitle="앨범 관리" errorMessage={error?.message} onRetry={refetch} />;
  }

  // 데이터가 없는 경우 또는 배열이 아닌 경우 (API 응답 형식 오류 등)
  if (!albumData || !Array.isArray(albumData.images)) {
     return <EmptyState sectionTitle="앨범 관리" message="앨범 데이터를 불러올 수 없습니다." />;
  }


  console.log("albumdata", albumData);
  const { images: albumImages, thumbnailIndex } = albumData;

  // 유효한 이미지만 필터링하여 캐러셀 슬라이드 생성
  const validImages = albumImages.filter((img): img is AlbumImage => img !== null);
  const slides = validImages.map(image => ({
    image: image.url,
    alt: image.isThumbnail ? '썸네일 이미지' : '앨범 이미지',
    // 캐러셀에 텍스트 표시가 필요하다면 추가
    // text: image.isThumbnail ? '프로필 썸네일로 사용 중' : undefined
  }));

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title mb-4">앨범 관리</h3>

        {/* 이미지가 있을 때만 캐러셀 표시 */}
        {slides.length > 0 ? (
          <MainCarousel 
            slides={slides} 
            initialSlideIndex={thumbnailIndex ?? 0} 
            className="max-h-[400px] max-w-[400px] aspect-square"
          />
        ) : (
          <EmptyState message="등록된 이미지가 없습니다" height="h-[310px]" />
        )}

        {/* ThumbnailGrid에 필요한 데이터와 쿼리 키 전달 */}
        <ThumbnailGrid albumImages={albumImages} queryKey={ALBUM_IMAGES_QUERY_KEY} />
      </div>
    </div>
  );
} 