"use client";

import { useSearchParams , useRouter } from "next/navigation";
import { useEffect, useState } from "react";


// 결제 응답 타입 정의
interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  paymentInfo?: {
    id: string;
    orderName: string;
    status: string;
    amount: number;
    paidAt: string;
  };
  tokenAmount?: number;
  currentBalance?: number;
  paymentStatus?: string;
}

export default function PaymentCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentVerificationResponse | null>(null);

  // 결제 검증을 서버 API를 통해 수행
  useEffect(() => {
    if (paymentId) {
      verifyPayment(paymentId);
    } else {
      setError("결제 ID가 없습니다");
      setLoading(false);
    }
  }, [paymentId]);

  // 뒤로가기 방지
  useEffect(() => {
    history.pushState(null, "", location.href);
    window.onpopstate = () => history.go(1);

    return () => {
      window.onpopstate = null;
    };
  }, []);

  // 서버 API를 통한 결제 검증
  const verifyPayment = async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("결제 검증 요청 시작:", paymentId);
      
      const response = await fetch(`/api/payment/verify?paymentId=${paymentId}`, {
        method: 'GET',
        credentials: 'include', // 세션 쿠키를 포함하도록 설정 
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("결제 검증 응답:", response);
      
      const result = await response.json();
      console.log("결제 검증 결과:", result);
      
      if (result.success) {
        setPaymentResult(result);
      } else {
        throw new Error(result.message || "결제 검증에 실패했습니다");
      }
    } catch (err) {
      console.error("결제 검증 중 오류 발생:", err);
      setError(err + "");
    } finally {
      setLoading(false);
    }
  };

  // 대시보드로 이동
  const goToDashboard = () => {
    router.push('/dashboard?tab=token');
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">결제 결과</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">결제 정보를 확인하고 있습니다...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">결제 오류</h2>
          <p className="text-red-600">{error}</p>
          
          {paymentResult?.paymentStatus && (
            <p className="mt-2 text-sm text-gray-600">
              결제 상태: <span className="font-mono">{paymentResult.paymentStatus}</span>
            </p>
          )}
          
          <div className="mt-4">
            <button
              onClick={goToDashboard}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-focus"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      ) : paymentResult?.success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-green-700">결제 완료</h2>
          </div>
          
          <div className="bg-white p-4 rounded border mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-semibold">주문명:</div>
              <div>{paymentResult.paymentInfo?.orderName || '-'}</div>
              
              <div className="font-semibold">결제 금액:</div>
              <div>{paymentResult.paymentInfo?.amount.toLocaleString() || 0}원</div>
              
              <div className="font-semibold">충전된 토큰:</div>
              <div className="font-semibold text-primary">{paymentResult.tokenAmount?.toLocaleString() || 0} 토큰</div>
              
              <div className="font-semibold">현재 토큰 잔액:</div>
              <div className="font-semibold text-primary">{paymentResult.currentBalance?.toLocaleString() || 0} 토큰</div>
              
              <div className="font-semibold">결제 시간:</div>
              <div>{paymentResult.paymentInfo?.paidAt ? new Date(paymentResult.paymentInfo.paidAt).toLocaleString() : '-'}</div>
            </div>
          </div>
          
          <p className="text-center text-green-700 mb-4">
            {paymentResult.message}
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={goToDashboard}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-focus"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">결제 정보를 불러올 수 없습니다.</p>
          <button
            onClick={goToDashboard}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-focus"
          >
            대시보드로 이동
          </button>
        </div>
      )}
    </div>
  );
}

