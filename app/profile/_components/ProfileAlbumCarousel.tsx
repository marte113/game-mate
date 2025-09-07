"use client"

import { useAlbumImagesQuery } from "@/hooks/api/profile/useAlbumQueries"

import MainCarousel from "@/app/(home)/_components/MainCarousel"
import { ProfileAlbumCarouselProps } from "@/app/profile/_types/profile.types"

export default function ProfileAlbumCarousel({
  userId: _userId,
  profileNickname,
}: ProfileAlbumCarouselProps) {
  // 앨범 이미지 데이터 Fetch (중앙 훅 사용)
  const { data, isLoading, error } = useAlbumImagesQuery()

  // 로딩 또는 이미지 없는 경우 렌더링 안 함
  if (isLoading || error || !data?.images || data.images.every((v) => v == null)) {
    // if (isLoading) return <div className="h-48 bg-base-300 rounded animate-pulse"></div>
    return null
  }

  // 포맷된 6슬롯 배열에서 null 제거 후 캐러셀 슬라이드로 변환
  const formatted = data.images as Array<{ id: string; url: string; isThumbnail: boolean } | null>
  const visible = formatted.filter((i): i is { id: string; url: string; isThumbnail: boolean } =>
    Boolean(i),
  )

  const slides = visible.map((item, idx) => ({
    image: item.url,
    alt: `${profileNickname || "사용자"} 앨범 이미지 ${idx + 1}`,
  }))

  // 썸네일이 존재하는 경우, null을 제거한 배열 기준의 올바른 초기 인덱스로 계산
  const thumbIndexInVisible = visible.findIndex((i) => i.isThumbnail)
  const initialSlideIndex = thumbIndexInVisible >= 0 ? thumbIndexInVisible : 0

  return (
    <MainCarousel
      className="h-[350px] max-h-[400px] w-full"
      slides={slides}
      initialSlideIndex={initialSlideIndex}
    />
  )
}
