import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

import ProfilePageContainer from "../_components/ProfilePageContaier"
import ProfileHeader from "../_components/ProfileHeader"
import ProfileMainContent from "../_components/ProfileMainContent"

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params
  const profileId = resolvedParams.id

  return (
    <ProfilePageContainer profileId={profileId}>
      {/* 1. 프로필 헤더 */}
      <QuerySectionBoundary keys={queryKeys.profile.publicById(Number(profileId))}>
        <ProfileHeader profileId={profileId} />
      </QuerySectionBoundary>

      {/* 2. 메인 컨텐츠 (탭 네비게이션 및 컨텐츠 포함) */}
      <QuerySectionBoundary keys={queryKeys.profile.publicById(Number(profileId))}>
        <ProfileMainContent profileId={profileId} />
      </QuerySectionBoundary>
    </ProfilePageContainer>
  )
}
