"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentTestPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    handlePayment();
  }, []);

  const handlePayment = async () => {
    const portOneResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_V2_API_SECRET}`,
        },
      }
    );
    console.log("포트원 결제 정보:", portOneResponse);
  };

  const testRedirect = async () => {
    if (!isClient) return;

    // 테스트용 paymentId 생성
    const testPaymentId = `test-payment-${Date.now()}`;

    // 리다이렉트 URL 생성
    const redirectUrl = `/api/payment/complete?paymentId=${testPaymentId}`;

    console.log("테스트 리다이렉트 URL:", redirectUrl);

    // 리다이렉트 실행
    window.location.href = redirectUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">결제 리다이렉트 테스트</h1>
      <p className="mb-6 text-center max-w-md">
        이 페이지는 포트원 결제 후 리다이렉트 동작을 테스트하기 위한
        페이지입니다. 아래 버튼을 클릭하면 결제 완료 후의 리다이렉트를
        시뮬레이션합니다.
      </p>
      <button
        className="btn btn-primary"
        onClick={testRedirect}
        disabled={!isClient}
      >
        리다이렉트 테스트
      </button>
    </div>
  );
}
