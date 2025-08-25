"use client";

import { useState } from "react";

import TokenChargeModal from "../modals/TokenChargeModal";
import TokenChargeButton from "./TokenChargeButton";
import { useTokenBalanceQuery, useTokenUsageQuery } from "@/hooks/api/token/useTokenBalanceQuery";
import { useAuthStore } from "@/stores/authStore";

export default function TokenSummaryCard() {
  const [isChargeModalOpen, setIsChargeModalOpen] = useState<boolean>(false);

  const { user } = useAuthStore();
  const { data: balance, error: balanceError } = useTokenBalanceQuery(user?.id);
  const { data: usageData, error: usageError } = useTokenUsageQuery();

  if (balanceError || usageError) {
    return <div>에러가 발생하였습니다.</div>;
  }

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title mb-4">토큰 보유 현황</h2>
            <TokenChargeButton
              openChargeModal={() => setIsChargeModalOpen(true)}
            />
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">보유 토큰</div>
              <div className="stat-value">{balance ?? 0}</div>
              <div className="stat-desc">
                {usageData
                  ? usageData.diff >= 0
                    ? `↗︎ ${Math.abs(
                        usageData.diff
                      ).toLocaleString()} (지난달 대비)`
                    : `↘︎ ${Math.abs(
                        usageData.diff
                      ).toLocaleString()} (지난달 대비)`
                  : "-"}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">사용 토큰</div>
              <div className="stat-value">
                {usageData ? usageData.usageThisMonth.toLocaleString() : 0}
              </div>
              <div className="stat-desc">이번 달 사용량</div>
            </div>
          </div>
        </div>
      </div>
      <TokenChargeModal
        isOpen={isChargeModalOpen}
        onClose={() => setIsChargeModalOpen(false)}
      />
    </>
  );
}
