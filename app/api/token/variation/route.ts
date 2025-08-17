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
      throw new ApiError("Failed to create supabase server client", 500);
    }

    const { data: sessionData, error: sessionError } =
      await supabaseServer.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      throw new ApiError("Session Unauthorized", 401);
    }

    const userId = sessionData.session.user.id;

    // 현재 시각을 기준으로 날짜 범위 계산
    const current_ts = new Date().toISOString();

    // RPC 호출: get_monthly_token_usage
    const { data: usageData, error } = await supabaseServer.rpc(
      "get_monthly_token_usage",
      {
        user_id_param: userId,
        current_ts,
      }
    );

    if (error) {
      throw new ApiError("토큰 사용량 집계 실패", 500, error);
    }

    console.log("usageData :", usageData);

    const result = Array.isArray(usageData) ? usageData[0] : usageData;
    //[ { usage_this_month: 0, usage_last_month: 0, diff: 0 } ]와 같은 배열이 반환되기 때문에 배열의 0번째 요소를 꺼내서 사용.

    return NextResponse.json({
      success: true,
      usageThisMonth: result?.usage_this_month,
      usageLastMonth: result?.usage_last_month,
      diff: result?.diff,
    });
    
  } catch (error) {
    console.error("Error fetching token variation:", error);
    return NextResponse.json(
      { success: false, message: "토큰 사용량 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
