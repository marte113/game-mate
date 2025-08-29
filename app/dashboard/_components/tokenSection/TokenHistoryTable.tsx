"use client";

import { useTokenTransactionsInfiniteQuery, type TokenTransaction } from "@/hooks/api/token/useTokenTransactionsInfiniteQuery";

import { Button } from "@/components/ui";

import TokenHistoryTr from "./TokenHistoryTr";
import LoadingSpinner from "@/app/category/_components/LoadingSpinner";
export default function TokenHistoryTable() {
  
  const { data: transactionsData, fetchNextPage, hasNextPage, error, isFetchingNextPage  } =
    useTokenTransactionsInfiniteQuery();

  if (error) {
    return <div>에러가 발생하였습니다.</div>;
  }

  if (transactionsData) {
    console.log("전체 transactionsData:", transactionsData);
    console.log("pages 배열:", transactionsData.pages);
    transactionsData.pages.forEach((page, index) => {
      console.log(`page ${index}:`, page);
      console.log(`page ${index} items:`, page.items);
    });
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
                (page.items || []).map((transaction : TokenTransaction) => (
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
                {isFetchingNextPage ? <LoadingSpinner size="sm" color="second"/> : "더 보기"}
                
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
