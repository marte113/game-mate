"use client";

import { Suspense } from "react";
import PaymentCompleteContent from "./PaymentCompleteContent";

// 동적 렌더링 강제 (SSR 비활성화)
export const dynamic = 'force-dynamic';


export default function PaymentCompletePage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">결제 결과</h1>
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">결제 정보를 확인하고 있습니다...</p>
        </div>
      </div>
    }>
      <PaymentCompleteContent />
    </Suspense>
  );
}

