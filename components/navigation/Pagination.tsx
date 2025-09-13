import React from "react"

type Props = {
  totalPages: number
  page: number
  setPage: (page: number) => void
}

const Pagination = ({ totalPages, page, setPage }: Props) => {
  const startPage = Math.floor((page - 1) / 10) * 10 + 1
  const endPage = Math.min(startPage + 9, totalPages)

  return (
    <div className="join">
      <button
        onClick={() => setPage(1)}
        disabled={page === 1 || totalPages === 0}
        className="join-item btn"
      >
        첫 페이지
      </button>
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1 || totalPages === 0}
        className="join-item btn"
      >
        이전
      </button>
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => setPage(pageNum)}
          className={`join-item btn ${pageNum === page ? "btn-active" : ""}`}
        >
          {pageNum}
        </button>
      ))}
      <button
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages || totalPages === 0}
        className="join-item btn"
      >
        다음
      </button>
      <button
        onClick={() => setPage(totalPages)}
        disabled={page === totalPages || totalPages === 0}
        className="join-item btn"
      >
        마지막 페이지
      </button>
    </div>
  )
}

export default Pagination
