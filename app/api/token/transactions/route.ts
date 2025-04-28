import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
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
    const supabaseServer = createRouteHandlerClient<Database>(
      { cookies },
      { supabaseUrl, supabaseKey: supabaseAnonKey }
    );

    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session) {
      throw new ApiError("인증되지 않은 사용자입니다.", 401);
    }

    const userId = session.user.id;

    const { data: transactions, error: transactionsError } = await supabaseServer
      .from("token_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    console.log(transactions);

    if (transactionsError) {
      throw new ApiError("토큰 거래 조회 중 오류가 발생했습니다.", 500, transactionsError);
    }

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error("토큰 조회 중 오류 발생:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          error: error.data,
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, message: "토큰 거래 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
