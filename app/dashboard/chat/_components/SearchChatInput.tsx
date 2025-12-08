"use client"

import { useEffect, useMemo, useState } from "react"
import debounce from "lodash/debounce"

import { useChatUiActions } from "@/stores/chatUiStore"

export default function SearchChatInput() {
  const [value, setValue] = useState("")
  const { setSearchTerm } = useChatUiActions()

  // 디바운스된 업데이트 함수 (상태 없이 수행)
  const debouncedUpdate = useMemo(
    () => debounce((q: string) => setSearchTerm(q), 250),
    [setSearchTerm],
  )

  useEffect(() => {
    return () => debouncedUpdate.cancel()
  }, [debouncedUpdate])

  const handleChangeValue = (q: string) => {
    setValue(q)
    debouncedUpdate(q)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 엔터 시 대기 중인 디바운스 취소 후 즉시 반영
    debouncedUpdate.cancel()
    setSearchTerm(value)
  }

  return (
    <div className="p-4 border-b">
      <h1 className="text-2xl font-bold mb-4">채팅</h1>
      <div className="form-control">
        <form onSubmit={handleSearch} className="flex input-group">
          <input
            type="text"
            placeholder="채팅방 검색하기..."
            className="input input-bordered w-full"
            value={value}
            onChange={(e) => handleChangeValue(e.target.value)}
          />
          <button type="submit" className="btn btn-square btn-ghost" aria-label="검색">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="sr-only">검색</span>
          </button>
        </form>
      </div>
    </div>
  )
}
