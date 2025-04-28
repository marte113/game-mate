"use client";

import { useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

// API 호출 함수 분리
const fetchTokenBalance = async () => {
  const response = await fetch('/api/token/balance');
  if (!response.ok) {
    throw new Error('토큰 잔액을 가져오는데 실패했습니다.');
  }
  const data = await response.json();
  return data.balance;
};

// 메모이제이션을 통한 불필요한 리렌더링 방지
export default function TokenDisplay() {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: tokenBalance = 0, isLoading } = useQuery({
    queryKey: ['tokenBalance', user?.id],
    queryFn: fetchTokenBalance,
    enabled: !!user?.id,
    staleTime: 1000 * 60,
  });

  const handleTokenClick = useCallback(() => {
    const params = new URLSearchParams();
    params.set("tab", "token");
    router.push(`dashboard?${params.toString()}`);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-6 items-center gap-2 px-3 bg-base-200 rounded-md">
        <span className="loading loading-spinner loading-xs"></span>
      </div>
    );
  }

  return (
    <div className="flex h-6 items-center gap-2 px-3 bg-base-200 rounded-md">
      <Image
        src="/images/tokken.png"
        alt="coin"
        width={20}
        height={20}
        className="w-5 h-5"
        priority // LCP 최적화
      />
      <span className="text-sm font-semibold">{tokenBalance.balance}</span>
      <button
        onClick={handleTokenClick}
        className="bg-purple-500 rounded-full w-[18px] h-[18px] flex items-center justify-center text-white hover:bg-purple-400 transition-colors duration-200"
      >
        <Plus className="w-3 h-3" strokeWidth={2.5} />
      </button>
    </div>
  );
};
