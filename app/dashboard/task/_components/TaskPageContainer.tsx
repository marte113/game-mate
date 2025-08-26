'use client';

import { ReactNode } from "react";

// 클라이언트 컴포넌트로 변경하여 SSR 문제를 해결
export default function TaskPageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
