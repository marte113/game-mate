//추천 메이트를 불러오는데 사용할 api
// 검증 필요 없음.
// recommend 

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { Database } from "@/types/database.types";
import { ThemeWithMates, MateData, RecommendedThemeResponse } from "@/app/(home)/_types/homePage.types";
import { buildRecommendedThemes } from "@/app/apis/service/category/recommendService";

type GameRow = { id: string; name: string; description: string | null; image_url: string | null };
type RecommendedGameLatestRow = { game_id: string; player_count: number };
type UserRef = { is_online: boolean | null; profile_thumbnail_img: string | null };
type ProfileCandidate = {
  id: string;
  user_id: string | null;
  nickname: string | null;
  description: string | null;
  rating: number | null;
  public_id: number;
  follower_count: number | null;
  created_at: string | null;
  selected_games: string[] | null;
  is_mate: boolean | null;
  users: UserRef | null;
};
type OrderAggRow = { provider_id: string | null; game: string | null; created_at: string | null; status: string | null };

const THEMES_PER_PAGE_INITIAL = 3;
const THEMES_PER_PAGE = 2;
const MATES_PER_THEME = 12;
const NEWBIE_DAYS = 30;
const NEWBIE_TARGET_MIN = 3;
const NEWBIE_TARGET_MAX = 4;
const COMPLETED_STATUS = "COMPLETED";



export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") ?? "0", 10);

  if (isNaN(page) || page < 0) {
    return NextResponse.json(
      { error: "Invalid page number" },
      { status: 400 }
    );
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
    const { themes, nextPage } = await buildRecommendedThemes(page);
    const response: RecommendedThemeResponse = { themes, nextPage };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Unexpected error fetching recommended mates:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}