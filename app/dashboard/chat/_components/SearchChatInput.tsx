'use client'

import { useState, useRef, useEffect } from 'react'

interface SearchChatInputProps {
  onSearch: (query: string) => void
}

export default function SearchChatInput({ onSearch }: SearchChatInputProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 검색어가 변경될 때마다 상위 컴포넌트에 알림
  useEffect(() => {
    // 검색어가 변경될 때마다 바로 검색 실행
    onSearch(searchQuery)
  }, [searchQuery, onSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 폼 제출 시에도 검색 실행 (Enter 키)
    onSearch(searchQuery)
    // 포커스 유지
    searchInputRef.current?.focus()
  }

  return (
    <div className="p-4 border-b">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>
      <div className="form-control">
        <form onSubmit={handleSearch} className="flex input-group">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="채팅방 검색하기..."
            className="input input-bordered w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-square btn-ghost">
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
          </button>
        </form>
      </div>
    </div>
  )
} 