"use client"

import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

import ProfileMainContent from "./ProfileMainContent"

export default function ProfileMainBoundary({ profileId }: { profileId: string }) {
  const numericId = Number(profileId)
  return (
    <QuerySectionBoundary keys={queryKeys.profile.publicById(numericId)}>
      <ProfileMainContent profileId={profileId} />
    </QuerySectionBoundary>
  )
}
