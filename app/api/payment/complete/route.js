'use client'

import { NextResponse } from "next/server";
import config from "@/config";
import { P } from "storybook/internal/components";

// 포트원 V2 버전 API 호출 예시
// 내부 PG사는 토스페이먼츠 사용
export async function GET(req) {
  // 서버 로그에 명확하게 표시
  console.log("=== 결제 리다이렉트 수신 (GET 함수 실행) ===");
  console.log("요청 URL:", req.url);
  console.log("요청 메서드:", req.method);

  try {
    // URL에서 paymentId 쿼리 파라미터 추출

    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");

    console.log("리다이렉트 수신: paymentId =", paymentId);

    if (!paymentId) {
      console.log("paymentId가 없습니다.");
      return NextResponse.redirect(
        `${url.origin}/dashboard?error=missing-payment-id`
      );
    }

 
    // 1. 포트원 결제내역 단건조회 API 호출
    // (중요) PORTONE_V2_API_SECRET는 포트원 콘솔 > 결제 연동 > API Keys > V2 API에서 발급 후 사용 가능
    console.log("포트원 API 호출 시작...");
    const paymentResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_V2_API_SECRET}`,
        },
      }
    );

    // 결제 호출시 에러 발생 시 예외 처리
    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json();
      console.log("결제 정보 조회 실패:", errorData);
      return NextResponse.redirect(
        `${url.origin}/dashboard?error=payment-verification-failed`
      );
    }

    const payment = await paymentResponse.json();

    // 결제 내역 콘솔 출력
    console.log("결제 정보 조회 성공!");
    console.log("결제 상태:", payment.status);
    console.log("결제 금액:", payment.amount?.total);
    console.log("주문명:", payment.orderName);

    // 성공 페이지로 리다이렉트
    console.log("대시보드로 리다이렉트 중...");
    return NextResponse.redirect(
      `${url.origin}/dashboard?payment=success&paymentId=${paymentId}`
    );
  } catch (error) {
    console.error("결제 처리 중 오류 발생:", error);
    return NextResponse.redirect(
      `${
        url.origin
      }/dashboard?error=processing-error&message=${encodeURIComponent(
        error.message
      )}`
    );
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
