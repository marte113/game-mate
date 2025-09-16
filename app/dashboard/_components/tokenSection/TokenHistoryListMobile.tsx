"use client"

import {
  useTokenTransactionsInfiniteQuery,
  type TokenTransaction,
} from "@/hooks/api/token/useTokenTransactionsInfiniteQuery"
import { formatRelativeFromNow } from "@/utils/date"
import { Button } from "@/components/ui"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

function getTransactionTypeDisplay(type: TokenTransaction["transaction_type"]) {
  switch (type) {
    case "CHARGE":
      return { label: "충전", className: "text-blue-400 font-semibold" }
    case "EARN":
      return { label: "획득", className: "text-green-400 font-semibold" }
    case "SPEND":
      return { label: "사용", className: "text-red-400 font-semibold" }
    case "REFUND":
      return { label: "환불", className: "text-yellow-400 font-semibold" }
    default:
      return { label: "알 수 없음", className: "badge badge-neutral font-semibold" }
  }
}

function formatAmount(type: TokenTransaction["transaction_type"], amount: number) {
  const isPositive = type === "CHARGE" || type === "EARN" || type === "REFUND"
  const sign = isPositive ? "+" : "-"
  const formattedAmount = amount.toLocaleString("ko-KR")
  return `${sign}${formattedAmount}`
}

export default function TokenHistoryListMobile() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useTokenTransactionsInfiniteQuery()

  if (error) return <div className="p-4 text-error text-sm">에러가 발생하였습니다.</div>

  const items = (data?.pages ?? []).flatMap((p) => p.items ?? [])

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-2">토큰 사용 내역</h2>
        <div className="space-y-3">
          {items.map((tx) => {
            const type = getTransactionTypeDisplay(tx.transaction_type)
            return (
              <div
                key={tx.transaction_id}
                className="rounded-lg border border-base-300 p-3 flex flex-col gap-1"
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-base-content/60 whitespace-nowrap">
                    {formatRelativeFromNow(tx.created_at ?? "")}
                  </span>
                  <span className={`${type.className} text-xs whitespace-nowrap`}>
                    {type.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatAmount(tx.transaction_type, tx.amount)}
                  </span>
                  <span className="badge badge-success px-2 py-0.5 text-[0.7rem] font-semibold">
                    완료
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        {hasNextPage && (
          <div className="flex justify-end">
            <Button variant="default" size="sm" className="mt-2" onClick={() => fetchNextPage()}>
              {isFetchingNextPage ? <LoadingSpinner size="sm" color="second" /> : "더 보기"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
