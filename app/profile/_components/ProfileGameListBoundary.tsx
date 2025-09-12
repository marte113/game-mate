"use client"

import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

import ProfileGameList from "./ProfileGameList"
import type { ProfileGameListProps } from "@/app/profile/_types/profile.types"

function buildTitlesKey(titles: readonly string[]): string {
  return [...titles]
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join(",")
}

export default function ProfileGameListBoundary(props: ProfileGameListProps) {
  const titles = (props.selectedGames ?? []) as readonly string[]
  const titlesKey = buildTitlesKey(titles)

  if (titles.length === 0) {
    // 쿼리가 비활성화될 경우 굳이 경계를 두지 않고 그대로 렌더
    return <ProfileGameList {...props} />
  }

  return (
    <QuerySectionBoundary keys={queryKeys.category.gameImagesByTitles(titlesKey)}>
      <ProfileGameList {...props} />
    </QuerySectionBoundary>
  )
}
