import React from "react"
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from "lucide-react"

type Props = {
  totalPages: number
  page: number
  setPage: (page: number) => void
}

const Pagination = ({ totalPages, page, setPage }: Props) => {
  const startPage = Math.floor((page - 1) / 10) * 10 + 1
  const endPage = Math.min(startPage + 9, totalPages)

  // 버튼 disabled 상태 계산
  const isFirstDisabled = page === 1 || totalPages === 0
  const isPrevDisabled = isFirstDisabled
  const isNextDisabled = page === totalPages || totalPages === 0
  const isLastDisabled = isNextDisabled

  // 아이콘 컬러 클래스: disabled면 연한 색, 아니면 기본 + hover 시 강조
  const iconCls = (disabled: boolean) =>
    `w-5 h-5 transition-colors ${disabled ? "text-base-content/30" : "text-base-content/80 group-hover:text-primary"}`

  return (
    <div className="join">
      <button
        onClick={() => setPage(1)}
        disabled={isFirstDisabled}
        aria-label="첫 페이지"
        className="join-item btn btn-ghost btn-square group hover:bg-transparent disabled:hover:bg-transparent disabled:bg-transparent disabled:border-transparent disabled:opacity-100"
      >
        <ChevronFirst className={iconCls(isFirstDisabled)} />
      </button>
      <button
        onClick={() => setPage(page - 1)}
        disabled={isPrevDisabled}
        aria-label="이전 페이지"
        className="join-item btn btn-ghost btn-square group hover:bg-transparent disabled:hover:bg-transparent disabled:bg-transparent disabled:border-transparent disabled:opacity-100"
      >
        <ChevronLeft className={iconCls(isPrevDisabled)} />
      </button>
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => {
        const isActive = pageNum === page
        return (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            aria-current={isActive ? "page" : undefined}
            aria-label={`${pageNum}페이지`}
            className={`join-item btn btn-ghost hover:bg-transparent border-transparent focus-visible:ring-2 focus-visible:ring-primary/40 ${
              isActive ? "text-primary font-semibold" : "text-base-content/80 hover:text-primary"
            }`}
          >
            {pageNum}
          </button>
        )
      })}
      <button
        onClick={() => setPage(page + 1)}
        disabled={isNextDisabled}
        aria-label="다음 페이지"
        className="join-item btn btn-ghost btn-square group hover:bg-transparent disabled:hover:bg-transparent disabled:bg-transparent disabled:border-transparent disabled:opacity-100"
      >
        <ChevronRight className={iconCls(isNextDisabled)} />
      </button>
      <button
        onClick={() => setPage(totalPages)}
        disabled={isLastDisabled}
        aria-label="마지막 페이지"
        className="join-item btn btn-ghost btn-square group hover:bg-transparent disabled:hover:bg-transparent disabled:bg-transparent disabled:border-transparent disabled:opacity-100"
      >
        <ChevronLast className={iconCls(isLastDisabled)} />
      </button>
    </div>
  )
}

export default Pagination
