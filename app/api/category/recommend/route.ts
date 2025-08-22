//추천 메이트를 불러오는데 사용할 api
// 검증 필요 없음.
// recommend 

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { Database } from "@/types/database.types";
import { ThemeWithMates, MateData, RecommendedThemeResponse } from "@/app/(home)/_types/homePage.types";
import { createDailyGameRandom, pickNewbieCount } from "@/utils/recommendation";

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

  const themesPerPage = page === 0 ? THEMES_PER_PAGE_INITIAL : THEMES_PER_PAGE;
  const offset = page === 0 ? 0 : THEMES_PER_PAGE_INITIAL + (page - 1) * THEMES_PER_PAGE;

  try {
    const { data: latestRaw, error: recError, count: totalGames } = await (supabase as any)
      .from("recommended_games_latest")
      .select("game_id, player_count", { count: "exact" })
      .order("player_count", { ascending: false })
      .range(offset, offset + themesPerPage - 1);

    if (recError) {
      console.error("Error fetching recommended_games:", recError);
      return NextResponse.json(
        { error: "Failed to fetch recommended games" },
        { status: 500 }
      );
    }

    const latest = (latestRaw as unknown as RecommendedGameLatestRow[] | null) ?? [];
    const gameIds = latest.map((r) => r.game_id);

    if (gameIds.length === 0) {
      return NextResponse.json({
        themes: [],
        nextPage: null,
      });
    }

    const { data: gamesRaw, error: gamesErr } = await supabase
      .from("games")
      .select("id, name, description, image_url")
      .in("id", gameIds);

    if (gamesErr) {
      console.error("Error fetching games by ids:", gamesErr);
      return NextResponse.json(
        { error: "Failed to fetch game themes" },
        { status: 500 }
      );
    }

    const idToGame = new Map<string, GameRow>();
    (gamesRaw as GameRow[] | null)?.forEach((g) => idToGame.set(g.id, g));
    const pageGames: GameRow[] = gameIds
      .map((id) => idToGame.get(id))
      .filter((g): g is GameRow => !!g);

    if (pageGames.length === 0) {
      return NextResponse.json({
        themes: [],
        nextPage: null
      });
    }

    const gameDescs: string[] = pageGames
      .map((g) => g.description)
      .filter((d): d is string => !!d);
    const gameNames: string[] = pageGames
      .map((g) => g.name)
      .filter((n): n is string => !!n);

    const descToName = new Map<string, string>();
    pageGames.forEach((g) => {
      if (g.description && g.name) descToName.set(g.description, g.name);
    });

    const { data: candidatesRaw, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        user_id,
        nickname,
        description,
        rating,
        public_id,
        follower_count,
        created_at,
        selected_games,
        is_mate,
        users (
          is_online,
          profile_thumbnail_img
        )
      `)
      .eq("is_mate", true)
      .overlaps("selected_games", gameDescs);

    if (profilesError) {
      console.error("Error fetching candidates:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch mates" },
        { status: 500 }
      );
    }
    const candidates: ProfileCandidate[] = (candidatesRaw as unknown as ProfileCandidate[]) ?? [];

    const ninetyDaysAgoIso = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();

    const { data: orderAggRaw, error: ordersError } = await supabase
      .from("requests")
      .select("provider_id, game, created_at, status")
      .in("game", gameNames)
      .gte("created_at", ninetyDaysAgoIso)
      .eq("status", COMPLETED_STATUS);

    if (ordersError) {
      console.error("Error aggregating orders:", ordersError);
    }

    const ordersMap = new Map<string, number>();
    const orderAgg: OrderAggRow[] = (orderAggRaw as unknown as OrderAggRow[]) ?? [];
    orderAgg.forEach((r) => {
      const k = `${r.provider_id ?? ""}::${r.game ?? ""}`;
      ordersMap.set(k, (ordersMap.get(k) ?? 0) + 1);
    });

    const now = new Date();

    const scoreFor = (profile: ProfileCandidate, desc: string): number => {
      const rating = typeof profile.rating === "number" ? profile.rating : 0;
      const followers = typeof profile.follower_count === "number" ? profile.follower_count : 0;
      const followersNorm = Math.min(Math.log10(1 + followers) / 3, 1);
      const onlineBonus = profile.users?.is_online ? 0.2 : 0;

      const gameName = descToName.get(desc) ?? desc;
      const ordersRecent = ordersMap.get(`${profile.user_id ?? ""}::${gameName}`) ?? 0;
      const ordersNorm = Math.min(Math.log1p(ordersRecent) / 3, 1);

      return rating / 5 + followersNorm + onlineBonus + ordersNorm;
    };

    const isNewbie = (profile: ProfileCandidate): boolean => {
      const createdAt = profile.created_at ? new Date(profile.created_at) : null;
      const recent = createdAt ? (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24) <= NEWBIE_DAYS : false;
      const lowFollower = (profile.follower_count ?? 0) < 10;
      return recent || lowFollower;
    };

    const themesWithMates: ThemeWithMates[] = pageGames.map((game) => {
      const desc = game.description || "";
      const gameCandidates = (candidates ?? []).filter(
        (p) => Array.isArray(p.selected_games) && (p.selected_games as string[]).includes(desc)
      );

      const rng = createDailyGameRandom(game.id);

      const newbies = gameCandidates.filter(isNewbie);
      const veterans = gameCandidates.filter((p) => !isNewbie(p));

      const jitter = 0.5;
      const sortByWeightedRandom = (arr: ProfileCandidate[]) =>
        arr
          .map((p) => ({ p, w: scoreFor(p, desc) + rng() * jitter }))
          .sort((a, b) => b.w - a.w)
          .map((x) => x.p);

      const newbiesSorted = sortByWeightedRandom(newbies);
      const veteransSorted = sortByWeightedRandom(veterans);

      const newbieCount = Math.min(pickNewbieCount(rng, NEWBIE_TARGET_MIN, NEWBIE_TARGET_MAX), MATES_PER_THEME);
      const pickedNewbies = newbiesSorted.slice(0, newbieCount);
      const remaining = MATES_PER_THEME - pickedNewbies.length;
      const pickedVeterans = veteransSorted.slice(0, remaining);

      // 만약 베테랑 수가 부족하면, 남은 자리를 추가 신규로 채워 총 MATES_PER_THEME를 최대한 맞춘다
      let picked = [...pickedNewbies, ...pickedVeterans];
      if (picked.length < MATES_PER_THEME) {
        const extraNeed = MATES_PER_THEME - picked.length;
        const extraNewbies = newbiesSorted.slice(pickedNewbies.length, pickedNewbies.length + extraNeed);
        picked = [...picked, ...extraNewbies];
      }
      picked = picked.slice(0, MATES_PER_THEME);

      const mates: MateData[] = picked.map((profile) => ({
        id: profile.user_id || "",
        public_id: profile.public_id,
        name: profile.nickname || "Unknown",
        game: desc,
        gameIcon: game.image_url || "/default-game-icon.png",
        price: 800,
        rating: profile.rating || 0,
        description: profile.description || "",
        image: profile.users?.profile_thumbnail_img || "/default-avatar.png",
        isOnline: profile.users?.is_online || false,
        videoLength: "00:00",
      }));

      return {
        id: game.id,
        name: game.name,
        description: desc,
        image_url: game.image_url || "",
        mates,
      };
    });

    const nextPage = offset + themesPerPage < (totalGames || 0) ? page + 1 : null;

    const response: RecommendedThemeResponse = {
      themes: themesWithMates,
      nextPage,
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