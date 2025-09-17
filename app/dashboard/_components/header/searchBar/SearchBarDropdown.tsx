"use client"

import ResultItem from "./ResultItem"
import type { UserSearchResult } from "./types"

export default function SearchBarDropdown({
  items,
  isFetching,
  isError,
  activeIndex,
  onItemHover,
}: {
  items: UserSearchResult[]
  isFetching: boolean
  isError: boolean
  activeIndex: number
  onItemHover: (i: number) => void
}) {
  return (
    <div className="absolute right-0 top-[110%] z-50 w-[22rem] max-w-[90vw] rounded-lg border bg-base-100 shadow-lg">
      <ul
        id="search-users-listbox"
        role="listbox"
        aria-label="사용자 검색 결과"
        aria-live="polite"
        aria-busy={isFetching || undefined}
        className="max-h-80 overflow-auto py-2"
      >
        {/* 로딩 행: 항상 상단 표시(이전 결과와 동시 표출 가능) */}
        {isFetching && <li className="px-4 py-3 text-sm text-base-content/60">검색 중…</li>}

        {/* 에러 상태 */}
        {!isFetching && isError && (
          <li className="px-4 py-3 text-sm text-error">검색 중 오류가 발생했습니다</li>
        )}

        {/* 결과/빈 상태 */}
        {!isError && items.length === 0 && !isFetching ? (
          <li className="px-4 py-3 text-sm text-base-content/60">일치하는 사용자가 없습니다</li>
        ) : (
          items.map((u, idx) => (
            <ResultItem
              key={u.profile_id}
              user={u}
              index={idx}
              isActive={activeIndex === idx}
              onHover={() => onItemHover(idx)}
            />
          ))
        )}
      </ul>
    </div>
  )
}
