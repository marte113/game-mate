import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabaseServer = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
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
    if (!supabaseServer) {
      throw new ApiError(
        "Supabase 클라이언트 생성 중 오류가 발생했습니다.",
        500
      );
    }

    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();

    if (userError || !user) {
      throw new ApiError("Unauthorized", 401);
    }

    const {
      data: balance,
    } = await supabaseServer
      .from("user_tokens")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({ balance });
  } catch (error) {
    console.error("토큰 조회 중 오류 발생:", error);
    return NextResponse.json(
      { success: false, message: "토큰 거래 조회 중 오류가 발생했습니다." },
      { status: error instanceof ApiError ? error.status : 500 }
    );
  }
}
