"use client";

import { useTokenTransactionsInfiniteQuery } from "@/hooks/api/token/useTokenTransactionsInfiniteQuery";

import { Button } from "@/components/ui";

import TokenHistoryTr from "./TokenHistoryTr";
export default function TokenHistoryTable() {
  
  const { data: transactionsData, fetchNextPage, hasNextPage, error } =
    useTokenTransactionsInfiniteQuery();

  if (error) {
    return <div>에러가 발생하였습니다.</div>;
  }

  if (transactionsData) {
    console.log(transactionsData);
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4">토큰 사용 내역</h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>날짜</th>
                <th>구분</th>
                <th>금액</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {transactionsData?.pages.flatMap((page) =>
                page.data.map((transaction: any) => (
                  <TokenHistoryTr
                    key={transaction.transaction_id}
                    transaction={transaction}
                  />
                ))
              )}
            </tbody>
          </table>
          <div className="flex justify-end">
            {hasNextPage && (
              <Button
                variant="default"
                size="sm"
                className="mt-2"
                onClick={() => fetchNextPage()}
              >
                더 보기
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
