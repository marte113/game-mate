"use client"

import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

import ProfileHeader from "./ProfileHeader"

export default function ProfileHeaderBoundary({ profileId }: { profileId: string }) {
  const numericId = Number(profileId)
  return (
    <QuerySectionBoundary keys={queryKeys.profile.publicById(numericId)}>
      <ProfileHeader profileId={profileId} />
    </QuerySectionBoundary>
  )
}
