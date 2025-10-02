"use server"

import {
  getGamesByIds,
  getRecommendedLatest,
} from "@/app/apis/repository/category/recommendRepository"
import { createServiceError } from "@/app/apis/base"
import type { PopularGamesResponse, PopularGame } from "@/app/category/_api/CategoryApi"

/**
 * 인기 게임 목록을 조회하여 player_count를 포함해 반환
 * - recommended_games_latest 뷰 상위 N개를 조회
 * - games 테이블에서 상세 정보를 병합
 * - 입력한 limit 순서(추천 순위)를 보존
 */
export async function svcListPopularGames(limit: number = 6): Promise<PopularGamesResponse> {
  try {
    const { latest } = await getRecommendedLatest(0, limit)
    const gameIds = latest
      .map((r) => r.game_id)
      .filter((id): id is string => typeof id === "string")
    if (gameIds.length === 0) return { games: [] }

    const gamesRaw = await getGamesByIds(gameIds)

    const idToDetails = new Map(gamesRaw.map((g) => [g.id, g]))
    const idToCount = new Map<string, number>()
    latest.forEach((row) => {
      if (row.game_id && typeof row.player_count === "number") {
        idToCount.set(row.game_id, row.player_count)
      }
    })

    const games: PopularGame[] = gameIds
      .map((id) => {
        const d = idToDetails.get(id)
        const c = idToCount.get(id)
        if (!d || c == null) return null
        return {
          id: d.id,
          name: d.name,
          description: d.description,
          image_url: d.image_url,
          player_count: c,
        }
      })
      .filter((g): g is PopularGame => g !== null)

    return { games }
  } catch (err) {
    throw createServiceError("Failed to list popular games", err)
  }
}
