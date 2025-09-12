"use client"

import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

import ProfileAlbumCarousel from "./ProfileAlbumCarousel"

export default function ProfileAlbumBoundary({
  userId,
  profileNickname,
}: {
  userId: string
  profileNickname: string | null
}) {
  return (
    <QuerySectionBoundary keys={queryKeys.profile.albumImagesPublic(userId)}>
      <ProfileAlbumCarousel userId={userId} profileNickname={profileNickname} />
    </QuerySectionBoundary>
  )
}
