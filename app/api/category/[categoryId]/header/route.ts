import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { Database } from "@/types/database.types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params; // 예: "League_of_legend"

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
    // categoryId(games.name)로 games 테이블에서 description(한글 이름), image_url(이미지), genre(장르) 조회
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select(`description, image_url, genre`) // 한글 이름, 이미지, 장르
      .eq("name", categoryId) // 영문 이름으로 조회
      .single(); // 단일 결과 예상

    if (gameError || !gameData?.description) {
      console.error(
        "Error fetching game description or game not found:",
        gameError
      );
      // 게임을 찾을 수 없으면 빈 결과를 반환하거나 에러 처리
      return NextResponse.json(
        { error: "Game category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(gameData);
  } catch (err) {
    console.error("Unexpected error fetching mates:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
