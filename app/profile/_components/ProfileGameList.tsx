'use client'

import GameCard from '@/components/GameCard' // 경로 확인
import { GameInfo, ProfileGameListProps } from '@/app/profile/_types/profile.types'

// 게임 목록 데이터 (임시 - 실제로는 API나 DB 연동 필요)
const allGamesData: GameInfo[] = [
   { id: 1, title: '리그 오브 레전드', image: '/images/lol2.webp' },
   { id: 2, title: '오버워치', image: '/images/overwatch.jpg' },
   { id: 3, title: '발로란트', image: '/images/valrorant.webp' },
   { id: 4, title: '이터널리턴', image: '/images/eternalreturn.jpg' },
   { id: 5, title: '피파온라인4', image: '/images/fifaonline4.webp' },
   { id: 6, title: 'TFT', image: '/images/teamfight.avif' },
]

// 선택된 게임 타이틀을 전체 게임 데이터와 매핑하는 함수
function mapSelectedGames(selectedGames: readonly string[] | null): GameInfo[] {
    if (!selectedGames) return []

    return selectedGames.map((gameTitle) => {
        const gameInfo = allGamesData.find((g) => g.title === gameTitle)
        return (
          gameInfo || {
            id: gameTitle, // ID를 타이틀로 사용 (임시)
            title: gameTitle,
            image: '/images/default-game.webp', // 기본 이미지 지정
          }
        )
     }).filter(game => game !== null) as GameInfo[] // null 제거 및 타입 단언
}

export default function ProfileGameList({
    selectedGames,
    isOwner,
    rating, // props 추가
    reviewCount // props 추가
}: ProfileGameListProps) {
  const userGames = mapSelectedGames(selectedGames)

  // 게임 목록 없으면 렌더링 안 함
  if (userGames.length === 0) {
      // 또는 "플레이하는 게임이 없습니다." 메시지 표시 가능
     return null
  }

  // GameCard에 전달할 기본값 또는 실제 값 설정
  const defaultRating = 0; // GameCard에서 필요한 기본값
  const defaultReviewCount = 0; // GameCard에서 필요한 기본값


  return (
    <>
      {userGames.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          rating={rating ?? defaultRating} // 전달받은 값 또는 기본값 사용
          reviewCount={reviewCount ?? defaultReviewCount} // 전달받은 값 또는 기본값 사용
          isOwner={isOwner}
        />
      ))}
    </>
  )
}
