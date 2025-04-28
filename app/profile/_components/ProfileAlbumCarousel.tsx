'use client'

import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import MainCarousel from '@/components/MainCarousel' // 경로 확인
import { Database } from '@/types/database.types'
import { AlbumImage, ProfileAlbumCarouselProps } from '@/app/profile/_types/profile.types'

// 앨범 이미지 가져오는 함수
async function fetchAlbumImages(supabase: ReturnType<typeof createClientComponentClient<Database>>, userId: string): Promise<AlbumImage[]> {
  const { data: albumImages, error } = await supabase
    .from('album_images')
    .select('id, image_url, order_num')
    .eq('user_id', userId)
    .order('order_num', { ascending: true })

  if (error) {
    console.error('앨범 이미지 로드 오류:', error)
    return [] // 에러 시 빈 배열 반환
  }
  // alt 텍스트 추가
  return (albumImages || []).map(img => ({ ...img, alt: `앨범 이미지 ${img.order_num}`}))
}

export default function ProfileAlbumCarousel({ userId, profileNickname }: ProfileAlbumCarouselProps) {
  const supabase = createClientComponentClient<Database>()

  // 앨범 이미지 데이터 Fetch (클라이언트 사이드)
  const queryKey = ['albumImages', userId]
  const { data: albumImages, isLoading, error } = useQuery<AlbumImage[]>({
    queryKey: queryKey,
    queryFn: () => fetchAlbumImages(supabase, userId),
    enabled: !!userId, // userId가 있을 때만 실행
    staleTime: 10 * 60 * 1000, // 10분 캐시
  })

  // 로딩 또는 이미지 없는 경우 렌더링 안 함
  if (isLoading || error || !albumImages || albumImages.length === 0) {
    // 로딩 스켈레톤 표시 가능
    // if (isLoading) return <div className="h-48 bg-base-300 rounded animate-pulse"></div>
    return null
  }

  // MainCarousel에 맞게 데이터 포맷팅
  const slides = albumImages.map((image) => ({
    image: image.image_url,
    alt: `${profileNickname || '사용자'} 앨범 이미지 ${image.order_num}`, // alt 텍스트 개선
  }))

  return <MainCarousel className='h-[350px] max-h-[400px] w-full' slides={slides} />
}
