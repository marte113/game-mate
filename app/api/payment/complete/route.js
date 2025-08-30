import { NextResponse } from "next/server";
import { z } from 'zod'

// 포트원 V2 버전 API 호출 예시
// 내부 PG사는 토스페이먼츠 사용
export async function GET(req) {
  try {
    const url = new URL(req.url)
    const { searchParams } = url

    // Zod로 쿼리 검증
    const parsed = z.object({
      paymentId: z.string().min(1, { message: 'paymentId is required' })
    }).safeParse({ paymentId: searchParams.get('paymentId') })

    if (!parsed.success) {
      return NextResponse.redirect(new URL('/dashboard?error=missing-payment-id', url))
    }

    const { paymentId } = parsed.data

    // 포트원 결제내역 단건조회 API 호출
    const paymentResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_V2_API_SECRET}`,
        },
      }
    )

    if (!paymentResponse.ok) {
      // 실패 시 에러 코드로 리다이렉트
      return NextResponse.redirect(new URL('/dashboard?error=payment-verification-failed', url))
    }

    // 성공 페이지로 리다이렉트
    return NextResponse.redirect(new URL(`/dashboard?payment=success&paymentId=${encodeURIComponent(paymentId)}`, url))
  } catch (e) {
    const url = new URL(req.url)
    const message = e && typeof e === 'object' && 'message' in e ? String(e.message) : 'unknown'
    return NextResponse.redirect(new URL(`/dashboard?error=processing-error&message=${encodeURIComponent(message)}`, url))
  }
}

// POST 함수는 일단 주석 처리 (나중에 필요하면 다시 활성화)

// export async function POST(req) {
//   try {
//     // 요청의 body로 paymentId가 오기를 기대합니다.
//     const body = await req.json();
//     const { paymentId, order } = body;

//     // 1. 포트원 결제내역 단건조회 API 호출
//     // (중요) PORTONE_V2_API_SECRET는 포트원 콘솔 > 결제 연동 > API Keys > V2 API에서 발급 후 사용 가능
//     const paymentResponse = await fetch(
//       `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
//       {
//         headers: {
//           Authorization: `PortOne ${process.env.PORTONE_V2_API_SECRET}`,
//         },
//       }
//     );

//     // 결제 호출시 에러 발생 시 예외 처리
//     if (!paymentResponse.ok)
//       throw new Error(`paymentResponse: ${await paymentResponse.json()}`);
//     const payment = await paymentResponse.json();

//     // 결제 내역 콘솔 출력. 처음 테스트 시 결제가 정상적으로 완료되었는지 확인해보세요.
//     // console.log("payment", payment);

//     // 2. 고객사 내부 주문 데이터의 가격과 실제 지불된 금액을 비교합니다.
//     if (order.amount !== payment.amount.total) {
//       console.log("결제 금액이 불일치합니다.");
//       return Response.json({ error: "결제 금액이 불일치합니다." });
//     }

//     // 3. 결제 상태에 따른 처리
//     switch (payment.status) {
//       case "VIRTUAL_ACCOUNT_ISSUED": {
//         const paymentMethod = payment.paymentMethod;
//         // 가상 계좌가 발급된 상태입니다.
//         // 계좌 정보를 이용해 원하는 로직을 구성하세요.
//         break;
//       }
//       case "PAID": {
//         // 결제 확정 처리하는 DB 저장 등의 로직을 여기에다 추가하세요.

//         break;
//       }
//     }

//     return Response.json(data);
//   } catch (error) {
//     return Response.json({ error });
//   }
// }
