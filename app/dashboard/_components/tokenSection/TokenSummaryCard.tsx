"use client";

import TokenChargeButton from "./TokenChargeButton";
import TokenChargeModal from "../modals/TokenChargeModal";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface BalanceData {
  balance: {
    balance: number;
  };
}

interface UsageData {
  usageThisMonth: number;
  usageLastMonth: number;
  diff: number;
}

export default function TokenSummaryCard() {
  const [isChargeModalOpen, setIsChargeModalOpen] = useState<boolean>(false);


  const { data: balanceData, error: balanceError } = useQuery({
    queryKey: ["balance"],
    queryFn: () => fetchBalance(),
  });

  const { data: usageData, error: usageError } = useQuery({
    queryKey: ["usage"],
    queryFn: () => fetchUsage(),
  });

  //여기도 추후 api 레이어 이용해서 다시 구현하기.
  const fetchBalance = async (): Promise<BalanceData> => {
  const res = await fetch("/api/token/balance", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch balance");
  }
  return res.json();
};

const fetchUsage = async (): Promise<UsageData> => {
  const res = await fetch("/api/token/variation", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch usage");
  }
  return res.json();
};

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
              <div className="stat-value">{balanceData?.balance.balance ?? 0}</div>
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
