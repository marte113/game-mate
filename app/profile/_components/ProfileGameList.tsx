"use client"

import { useMemo } from "react"

import type { GameInfo, ProfileGameListProps } from "@/app/profile/_types/profile.types"
import { useGamesByTitles } from "@/hooks/api/games/useGamesByTitles"

import GameCard from "./GameCard"

// Next/Image 원격 허용 도메인(placehold.co)을 활용한 기본 이미지
const DEFAULT_IMAGE = "https://placehold.co/96x96?text=Game"

// 선택된 게임 타이틀(한글, description 컬럼) 을 API 응답과 매핑하는 함수
function mapSelectedGames(
  selectedGames: readonly string[] | null,
  dbGames:
    | { id: number; name: string; description: string | null; image_url: string | null }[]
    | undefined,
): GameInfo[] {
  if (!selectedGames || selectedGames.length === 0) return []
  // DB에 한글 타이틀은 description 컬럼에 저장되어 있으므로 description 매핑
  const byDesc = new Map((dbGames ?? []).map((g) => [g.description ?? "", g]))
  return selectedGames.map((koreanTitle) => {
    const row = byDesc.get(koreanTitle)
    return {
      id: row?.id ?? koreanTitle,
      title: koreanTitle,
      image: row?.image_url ?? DEFAULT_IMAGE,
    }
  })
}

export default function ProfileGameList({
  selectedGames,
  isOwner,
  rating,
  reviewCount,
  providerUserId,
}: ProfileGameListProps) {
  // 타이틀 리스트로 게임 이미지 조회
  const titles = useMemo(() => selectedGames ?? [], [selectedGames])
  const { data } = useGamesByTitles(titles)
  const userGames = useMemo(
    () => mapSelectedGames(selectedGames, data?.games),
    [selectedGames, data?.games],
  )

  // 게임 목록 없으면 렌더링 안 함
  if (userGames.length === 0) {
    // 또는 "플레이하는 게임이 없습니다." 메시지 표시 가능
    return null
  }

  // GameCard에 전달할 기본값 또는 실제 값 설정
  const defaultRating = 0 // GameCard에서 필요한 기본값
  const defaultReviewCount = 0 // GameCard에서 필요한 기본값

  return (
    <>
      {/* 로딩 동안에도 Skeleton 없이 즉시 렌더링하며, 이미지/가격 등은 기본값 처리 */}
      {userGames.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          rating={rating ?? defaultRating} // 전달받은 값 또는 기본값 사용
          reviewCount={reviewCount ?? defaultReviewCount} // 전달받은 값 또는 기본값 사용
          isOwner={isOwner}
          providerUserId={providerUserId}
        />
      ))}
    </>
  )
}
