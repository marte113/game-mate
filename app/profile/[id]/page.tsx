import { QueryClient } from '@tanstack/react-query'
import { createServerClientComponent } from '@/libs/supabase/server'
import { notFound } from 'next/navigation'

import { Database } from '@/types/database.types'

import ProfileMainContent from '../_components/ProfileMainContent'
import ProfileHeader from '../_components/ProfileHeader'
import ProfilePageContainer from '../_components/ProfilePageContaier'
import { PrefetchedProfileData } from '../_types/profile.types'


interface ProfilePageProps {
  params: Promise<{ id: string }>
}

// 서버 컴포넌트에서 초기 데이터 로드 (404 처리용)
async function checkProfileExists(profileId: string): Promise<boolean> {
   const queryClient = new QueryClient() // 임시 QueryClient
   const supabase = await createServerClientComponent()
   const numericProfileId = Number(profileId)
   const queryKey = ['profile', profileId] // 컨테이너와 동일한 키 사용

   const data = await queryClient.fetchQuery<PrefetchedProfileData | null>({
     queryKey: queryKey,
     queryFn: async () => {
       if (isNaN(numericProfileId)) return null
       // fetchProfileData 로직 간소화 (존재 여부만 확인)
       const { data: profileInfo, error } = await supabase
         .from('profiles')
         .select('user_id')
         .eq('public_id', numericProfileId)
         .maybeSingle() // single 대신 maybeSingle 사용
       return profileInfo ? ({ user_id: profileInfo.user_id } as any) : null // 임시 반환 타입
     },
     staleTime: 0 // 즉시 refetch 가능하도록
   })
    // console.log(`[Page Pre-check] Profile data for ${profileId}:`, !!data)
   return !!data // 데이터 존재 여부 반환
}


export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params
  const profileId = resolvedParams.id

  // 서버 레벨에서 프로필 존재 유무 확인 후 404 처리
  const profileExists = await checkProfileExists(profileId)
  if (!profileExists) {
    notFound() // 프로필 없으면 404 페이지 표시
  }

  return (
    <ProfilePageContainer profileId={profileId}>
      {/* 1. 프로필 헤더 */}
      <ProfileHeader profileId={profileId} />

      {/* 2. 메인 컨텐츠 (탭 네비게이션 및 컨텐츠 포함) */}
      <ProfileMainContent profileId={profileId} />
    </ProfilePageContainer>
  )
}
