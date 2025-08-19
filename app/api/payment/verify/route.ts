import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const portOneSecret = process.env.PORTONE_V2_API_SECRET!;

class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabaseServer = createServerClient(
      supabaseUrl,
      supabaseServiceKey,
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

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      throw new ApiError("결제 ID가 없습니다", 400);
    }

    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
    if (userError || !user?.id) {
      throw new ApiError("인증 세션이 유효하지 않습니다", 401, userError);
    }

    const userId = user.id;

    const portOneResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${portOneSecret}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!portOneResponse.ok) {
      const errorData = await portOneResponse.json().catch(() => null);
      throw new ApiError("결제 정보 조회에 실패했습니다", 500, errorData);
    }

    const payment = await portOneResponse.json();

    if (payment.status !== "PAID") {
      throw new ApiError(
        `결제가 완료되지 않았습니다 (상태: ${payment.status})`,
        400,
        {
          paymentStatus: payment.status,
        }
      );
    }

    const tokenAmount = payment.orderName?.startsWith("token-")
      ? parseInt(payment.orderName.split("-")[1])
      : 0;

    const { data: existingPayment } = await supabaseServer
      .from("payments")
      .select("payment_id, status")
      .eq("external_payment_id", payment.id)
      .single();

    if (existingPayment && existingPayment.status === "PAID") {
      // 이미 처리된 결제임
      console.log("이미 처리된 결제입니다.");
      throw new ApiError("이미 처리된 결제입니다.", 409);
    }

    const { data: paymentData, error: paymentError } = await supabaseServer
      .from("payments")
      .upsert(
        {
          external_payment_id: payment.id,
          transaction_id: payment.transactionId,
          provider: payment.channel?.pgProvider || "UNKNOWN",
          method_type: payment.method?.type || "UNKNOWN",
          method_detail: payment.method,
          channel_name: payment.channel?.name || "UNKNOWN",
          order_name: payment.orderName,
          amount_total: payment.amount?.total || 0,
          amount_paid: payment.amount?.paid || 0,
          currency: payment.currency,
          status: payment.status,
          raw_response: payment,
          receipt_url: payment.receiptUrl,
          requested_at: payment.requestedAt,
          paid_at: payment.paidAt,
        },
        { onConflict: "external_payment_id" }
      )
      .select()
      .single();

    if (paymentError || !paymentData) {
      throw new ApiError("결제 정보 저장에 실패했습니다", 500, paymentError);
    }

    const { error: transactionError } = await supabaseServer
      .from("token_transactions")
      .insert({
        user_id: userId,
        amount: tokenAmount,
        transaction_type: "CHARGE",
        payment_id: paymentData.payment_id,
        description: `토큰 ${tokenAmount}개 충전 (결제 ID: ${payment.id})`,
      });

    if (transactionError) {
      throw new ApiError(
        "토큰 거래 기록에 실패했습니다",
        500,
        transactionError
      );
    }

    const { data: currentTokenData, error: tokenQueryError } =
      await supabaseServer
        .from("user_tokens")
        .select("balance")
        .eq("user_id", userId)
        .single();

    if (tokenQueryError && !tokenQueryError.message.includes("not found")) {
      throw new ApiError("토큰 잔액 조회에 실패했습니다", 500, tokenQueryError);
    }

    const newBalance = (currentTokenData?.balance || 0) + tokenAmount;

    const { data: userTokenData, error: userTokenError } = await supabaseServer
      .from("user_tokens")
      .upsert(
        {
          user_id: userId,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (userTokenError) {
      throw new ApiError(
        "토큰 잔액 업데이트에 실패했습니다",
        500,
        userTokenError
      );
    }

    return NextResponse.json({
      success: true,
      message: "결제가 완료되었습니다",
      paymentInfo: {
        id: payment.id,
        orderName: payment.orderName,
        status: payment.status,
        amount: payment.amount?.total || 0,
        paidAt: payment.paidAt,
      },
      tokenAmount,
      currentBalance: userTokenData.balance,
    });
  } catch (error) {
    console.error("API 오류 발생:", error);

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
      { success: false, message: "알 수 없는 서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
