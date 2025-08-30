// 인기 게임 카테고리를 추천하는 API
// recommended_games_latest 뷰에서 상위 게임들을 가져옴

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError, createBadRequestError, createServiceError } from '@/app/apis/base'

import { Database } from "@/types/database.types";
import type { PopularGame } from "@/app/category/_api/CategoryApi";

// Supabase 원본 타입 활용
type RecommendedGamesLatestRow = Database['public']['Views']['recommended_games_latest']['Row'];
type GamesTableRow = Database['public']['Tables']['games']['Row'];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 6; // 기본 6개

  if (isNaN(limit) || limit < 1 || limit > 20) {
    throw createBadRequestError("Invalid limit parameter (1-20)");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    // 1) recommended_games_latest 뷰에서 상위 게임들 조회
    const { data: popularGamesRaw, error: popularError } = await (supabase as any)
      .from("recommended_games_latest")
      .select("game_id, player_count")
      .order("player_count", { ascending: false })
      .limit(limit);

    if (popularError) {
      throw createServiceError('Failed to fetch popular games', popularError);
    }

    const latestGames = (popularGamesRaw as unknown as RecommendedGamesLatestRow[] | null) ?? [];
    const gameIds = latestGames.map((row) => row.game_id).filter((id): id is string => !!id);

    if (gameIds.length === 0) {
      return NextResponse.json({
        games: [],
      });
    }

    // 2) 게임 상세 정보 조회
    const { data: gamesRaw, error: gamesError } = await supabase
      .from("games")
      .select("id, name, description, image_url")
      .in("id", gameIds);

    if (gamesError) {
      throw createServiceError('Failed to fetch game details', gamesError);
    }

    // 3) player_count와 함께 게임 정보 병합, 순서 보장
    const gameIdToCount = new Map<string, number>();
    latestGames.forEach((row) => {
      if (row.game_id && row.player_count) {
        gameIdToCount.set(row.game_id, row.player_count);
      }
    });

    const gameIdToDetails = new Map<string, GamesTableRow>();
    (gamesRaw as GamesTableRow[] | null)?.forEach((game) => {
      gameIdToDetails.set(game.id, game);
    });

    const popularGames: PopularGame[] = gameIds
      .map((gameId) => {
        const gameDetails = gameIdToDetails.get(gameId);
        const playerCount = gameIdToCount.get(gameId);
        
        // null 체크를 통해 완전한 데이터만 포함
        if (!gameDetails || playerCount === undefined) return null;
        
        return {
          id: gameDetails.id,
          name: gameDetails.name,
          description: gameDetails.description,
          image_url: gameDetails.image_url,
          player_count: playerCount,
        } satisfies PopularGame;
      })
      .filter((game): game is PopularGame => game !== null);

    return NextResponse.json({
      games: popularGames,
    });
  } catch (error) {
    return handleApiError(error)
  }
}