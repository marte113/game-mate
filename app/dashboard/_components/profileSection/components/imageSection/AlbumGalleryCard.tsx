"use client"

import { queryKeys } from "@/constants/queryKeys"
import { useAlbumImagesQuery } from "@/hooks/api/profile/useAlbumQueries"
import MainCarousel from "@/app/(home)/_components/MainCarousel"

import ThumbnailGrid from "./ThumbnailGrid"
import LoadingState from "./LoadingState"
import ErrorState from "./ErrorState"
import EmptyState from "./EmptyState"

// AlbumImage 타입 정의 (ThumbnailGrid에서도 사용 가능하도록 export)
export interface AlbumImage {
  id: string
  url: string
  isThumbnail: boolean
}

const QUERY_KEY = queryKeys.profile.albumImages()

export default function AlbumGalleryCard() {
  const { data: albumData, isLoading, isError, error, refetch } = useAlbumImagesQuery()

  // 로딩 상태 처리
  if (isLoading) {
    return <LoadingState sectionTitle="앨범 관리" />
  }

  // 에러 상태 처리
  if (isError) {
    return <ErrorState sectionTitle="앨범 관리" errorMessage={error?.message} onRetry={refetch} />
  }

  // 데이터가 없는 경우 또는 배열이 아닌 경우 (API 응답 형식 오류 등)
  if (!albumData || !Array.isArray(albumData.images)) {
    return <EmptyState sectionTitle="앨범 관리" message="앨범 데이터를 불러올 수 없습니다." />
  }

  console.log("albumdata", albumData)
  const { images: albumImages, thumbnailIndex } = albumData

  // 유효한 이미지만 필터링하여 캐러셀 슬라이드 생성
  const validImages = albumImages.filter((img): img is AlbumImage => img !== null)
  const slides = validImages.map((image) => ({
    image: image.url,
    alt: image.isThumbnail ? "썸네일 이미지" : "앨범 이미지",
    // 캐러셀에 텍스트 표시가 필요하다면 추가
    // text: image.isThumbnail ? '프로필 썸네일로 사용 중' : undefined
  }))

  // 삭제 등으로 인덱스가 범위를 벗어나는 경우 안전 인덱스로 보정
  const safeInitialIndex = Math.min(
    Math.max(0, thumbnailIndex ?? 0),
    Math.max(0, slides.length - 1),
  )

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title mb-4">앨범 관리</h3>

        {/* 이미지가 있을 때만 캐러셀 표시 */}
        {slides.length > 0 ? (
          <MainCarousel
            slides={slides}
            initialSlideIndex={safeInitialIndex}
            className="w-full max-w-[400px] aspect-square"
            loop={false}
            autoplay={false}
            align="start"
          />
        ) : (
          <EmptyState message="등록된 이미지가 없습니다" height="h-[310px]" />
        )}

        {/* ThumbnailGrid에 필요한 데이터와 쿼리 키 전달 */}
        <ThumbnailGrid albumImages={albumImages} queryKey={QUERY_KEY} />
      </div>
    </div>
  )
}
