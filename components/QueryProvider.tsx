'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { defaultRetry } from "@/libs/api/errors";

export default function QueryProvider({ children }: { children: ReactNode }) {
  // useState를 사용하여 QueryClient 인스턴스를 안정적으로 생성
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5분 (글로벌 기본)
        retry: defaultRetry, // 4xx 미재시도, 5xx 최대 2회
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
