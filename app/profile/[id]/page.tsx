import { notFound } from 'next/navigation'

import { svcCheckProfileExists } from '@/app/apis/service/profile/profile.service.server'

import ProfileMainContent from '../_components/ProfileMainContent'
import ProfileHeader from '../_components/ProfileHeader'
import ProfilePageContainer from '../_components/ProfilePageContaier'


interface ProfilePageProps {
  params: Promise<{ id: string }>
}

// 서버 컴포넌트에서 초기 데이터 로드 (404 처리용)
async function checkProfileExists(profileId: string): Promise<boolean> {
  return svcCheckProfileExists(profileId)
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
