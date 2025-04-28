import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import type {
  MatesApiResponse,
  MateCardData,
} from "@/app/category/_types/categoryPage.types";
import type { ProfilesRow } from "@/types/database.table.types"; // ProfilesRow 타입 임포트
import { Database } from "@/types/database.types";

const PAGE_SIZE_INITIAL = 20;
const PAGE_SIZE_DEFAULT = 10;

// Supabase 쿼리 결과 타입 정의 (쿼리에 맞게 users, games 관계 포함)
// 실제 쿼리 결과 구조에 따라 조정 필요
type MateQueryResult = Pick<
  ProfilesRow,
  "user_id" | "nickname" | "rating" | "description" | "created_at"
> & {
  users: {
    is_online: boolean | null;
    profile_thumbnail_img: string | null;
  } | null; // users 테이블에서 선택된 필드
  // games 테이블 조인은 제거되었으므로 이 부분은 필요 없음
};

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const { categoryId } = params; // 예: "League_of_legend"
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") ?? "0", 10);

  if (!categoryId || isNaN(page) || page < 0) {
    return NextResponse.json(
      { error: "Invalid category ID or page number" },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookies(),
  });

  try {
    // 1. categoryId(games.name)로 games 테이블에서 description(한글 이름) 조회
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select(`description, image_url`) // 한글 이름 컬럼
      .eq("name", categoryId) // 영문 이름으로 조회
      .single(); // 단일 결과 예상

    if (gameError || !gameData?.description) {
      console.error(
        "Error fetching game description or game not found:",
        gameError
      );
      // 게임을 찾을 수 없으면 빈 결과를 반환하거나 에러 처리
      return NextResponse.json({ mates: [], nextPage: undefined });
      // 또는 return NextResponse.json({ error: 'Game category not found' }, { status: 404 })
    }

    const koreanGameName = gameData.description; // 예: "리그 오브 레전드"
    const gameIconUrl = gameData.image_url || "/default-game-icon.png"; // gameIcon은 여기서 가져오지 않음 (추후 필요 시 별도 조회 또는 다른 방식 고려)

    // 2. 한글 게임 이름으로 profiles 필터링 및 users 조인
    const limit = page === 0 ? PAGE_SIZE_INITIAL : PAGE_SIZE_DEFAULT;
    const offset =
      page === 0 ? 0 : PAGE_SIZE_INITIAL + (page - 1) * PAGE_SIZE_DEFAULT;

    const {
      data: mates,
      error: matesError,
      count,
    } = await supabase
      .from("profiles")
      .select(
        `
        user_id,
        nickname,
        rating,
        description,
        created_at,
        users (
          is_online,
          profile_thumbnail_img
        )
      `,
        { count: "exact" }
      )
      .eq("is_mate", true)
      .contains("selected_games", [koreanGameName])
      .order("is_online", {
        referencedTable: "users",
        ascending: false,
        nullsFirst: false,
      })
      .order("rating", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (matesError) {
      console.error("Error fetching mates:", matesError);
      return NextResponse.json(
        { error: "Failed to fetch mates" },
        { status: 500 }
      );
    }

    // 데이터 형식 변환 (MateCardData 형태로)
    const formattedMates: MateCardData[] = mates
      ?.filter((mate): mate is MateQueryResult & { user_id: string } => mate.user_id !== null)
      .map((mate) => {
        const user = mate.users;

        return {
          id: mate.user_id,
          name: mate.nickname ?? "Unknown",
          game: koreanGameName,
          gameIcon: gameIconUrl,
          price: 800,
          rating: mate.rating ?? 0,
          description: mate.description ?? "",
          image: user?.profile_thumbnail_img ?? "/default-avatar.png",
          isOnline: user?.is_online ?? false,
          videoLength: "00:00",
        };
      }) ?? [];

    // 다음 페이지 계산
    const totalMates = count ?? 0;
    const nextPage = offset + limit < totalMates ? page + 1 : undefined;

    const response: MatesApiResponse = { mates: formattedMates, nextPage };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Unexpected error fetching mates:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

