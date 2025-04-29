//추천 메이트를 불러오는데 사용할 api
// 검증 필요 없음.
// recommend 

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { Database } from "@/types/database.types";
import { ThemeWithMates, MateData, RecommendedThemeResponse } from "@/app/(home)/_types/homePage.types";

// 페이지당 테마 수
const THEMES_PER_PAGE_INITIAL = 3;
const THEMES_PER_PAGE = 2;

// 테마당 메이트 수
const MATES_PER_THEME = 12;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  
  // 페이지 번호 검증
  if (isNaN(page) || page < 0) {
    return NextResponse.json(
      { error: "Invalid page number" },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookies(),
  });

  try {
    // 1. 메이트가 있는 게임만 조회하기 위한 게임 이름 목록 가져오기
    const { data: gameDescriptions } = await supabase
      .from('profiles')
      .select('selected_games')
      .eq('is_mate', true);
    
    // 배열 형태로 저장된 selected_games에서 모든 게임 이름 추출
    const gameSet = new Set<string>();
    if (gameDescriptions) {
      gameDescriptions.forEach(profile => {
        if (profile.selected_games && Array.isArray(profile.selected_games)) {
          profile.selected_games.forEach(game => gameSet.add(game));
        }
      });
    }
    
    // 메이트가 있는 게임 이름 목록
    const gamesWithMates = Array.from(gameSet);
    
    // 게임 이름 목록이 비어있으면 빈 응답 반환
    if (gamesWithMates.length === 0) {
      return NextResponse.json({
        themes: [],
        nextPage: null
      });
    }

    // 2. 게임 목록 조회 (메이트가 있는 게임만 필터링)
    const themesPerPage = page === 0 ? THEMES_PER_PAGE_INITIAL : THEMES_PER_PAGE;
    const offset = page === 0 ? 0 : THEMES_PER_PAGE_INITIAL + (page - 1) * THEMES_PER_PAGE;
    
    const { data: games, error: gamesError, count: totalGames } = await supabase
      .from("games")
      .select("id, name, description, image_url", { count: "exact" })
      .in('description', gamesWithMates)  // 메이트가 있는 게임만 필터링
      .range(offset, offset + themesPerPage - 1)
      .order("created_at", { ascending: false });

    if (gamesError) {
      console.error("Error fetching games:", gamesError);
      return NextResponse.json(
        { error: "Failed to fetch game themes" },
        { status: 500 }
      );
    }

    // 3. 각 게임별로 추천 메이트 조회
    const themesWithMates: ThemeWithMates[] = await Promise.all(
      games.map(async (game) => {
        // 해당 게임을 선택한 메이트 중 상위 N명 조회
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select(`
            id,
            user_id,
            nickname,
            description,
            rating,
            public_id,
            users (
              is_online,
              profile_thumbnail_img
            )
          `)
          .eq("is_mate", true)
          .contains("selected_games", [game.description])
          .order("rating", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(MATES_PER_THEME);

        if (profilesError) {
          console.error(`Error fetching mates for game ${game.name}:`, profilesError);
          return {
            id: game.id,
            name: game.name,
            description: game.description || "",
            image_url: game.image_url || "",
            mates: []
          };
        }

        // 메이트 데이터 형식 변환
        const mates: MateData[] = profilesData.map((profile) => ({
          id: profile.user_id || "",
          public_id: profile.public_id,
          name: profile.nickname || "Unknown",
          game: game.description || "",
          gameIcon: game.image_url || "/default-game-icon.png",
          price: 800, // 기본 가격 (실제로는 user_games 테이블에서 조회하거나 다른 로직 필요)
          rating: profile.rating || 0,
          description: profile.description || "",
          image: profile.users?.profile_thumbnail_img || "/default-avatar.png",
          isOnline: profile.users?.is_online || false,
          videoLength: "00:00", // 실제 데이터가 없으므로 기본값 설정
        }));

        return {
          id: game.id,
          name: game.name,
          description: game.description || "",
          image_url: game.image_url || "",
          mates
        };
      })
    );

    // 다음 페이지 계산
    const nextPage = 
      offset + themesPerPage < (totalGames || 0) ? page + 1 : null;

    const response: RecommendedThemeResponse = {
      themes: themesWithMates,
      nextPage
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Unexpected error fetching recommended mates:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 