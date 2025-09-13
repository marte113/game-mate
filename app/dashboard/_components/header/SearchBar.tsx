"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { DEFAULT_AVATAR_SRC } from "@/constants/image"
import { useUserSearchLive } from "@/hooks/api/profile/useUserSearchLive"
import debounce from "lodash/debounce"
import { queryKeys } from "@/constants/queryKeys"

export default function SearchBar() {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const latestSearchRef = useRef<(v: string) => void>(() => {})
  const [len, setLen] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const router = useRouter()
  const qc = useQueryClient()

  // 수동 refetch 기반 라이브 검색 훅(내부 상태 보유 X, 입력값은 ref로 관리)
  const { data, isFetching, isError, search } = useUserSearchLive(8)
  // 최신 search 콜백을 ref에 유지해 디바운스 인스턴스가 재생성되지 않도록 함
  useEffect(() => {
    latestSearchRef.current = search
  }, [search])
  const items = data?.items ?? []

  // 입력 이벤트에 바로 연결 가능한 디바운스 함수(1회 생성)
  const debouncedSearch = useMemo(
    () => debounce((v: string) => latestSearchRef.current(v), 300),
    [],
  )
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch])

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    const next = e.relatedTarget as Node | null
    if (next && containerRef.current?.contains(next)) return
    // 남아있는 대기 호출 취소
    debouncedSearch.cancel()
    // 인플라이트 쿼리 취소
    void qc.cancelQueries({ queryKey: queryKeys.search.users("live") })
    setIsSearchOpen(false)
  }

  // 선택 이동 시 가시 영역으로 스크롤
  useEffect(() => {
    if (activeIndex < 0) return
    const id = `search-users-option-${activeIndex}`
    document.getElementById(id)?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  // 결과 변화/표시 조건 변화에 따라 activeIndex를 안전하게 보정
  useEffect(() => {
    if (len < 2) {
      if (activeIndex !== -1) setActiveIndex(-1)
      return
    }
    if (items.length === 0) {
      if (activeIndex !== -1) setActiveIndex(-1)
      return
    }
    if (activeIndex >= items.length) {
      setActiveIndex(items.length - 1)
    }
  }, [items.length, len, activeIndex])

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      {isSearchOpen ? (
        <div className="flex items-center gap-2 mr-4">
          <div className="relative">
            <input
              type="text"
              ref={inputRef}
              onChange={(e) => {
                const v = e.target.value
                setLen(v.trim().length) // 드롭다운 표시 상태만 담당
                debouncedSearch(v) // 네트워크 요청은 디바운스
                setActiveIndex(-1) // 입력이 바뀌면 선택 초기화
              }}
              placeholder="닉네임 또는 사용자명을 입력하세요(2자 이상)"
              className="input input-ghost w-full max-w-xs h-8 text-sm pr-7"
              autoFocus
              role="combobox"
              aria-expanded={isSearchOpen}
              aria-controls="search-users-listbox"
              aria-activedescendant={
                activeIndex >= 0 ? `search-users-option-${activeIndex}` : undefined
              }
              aria-autocomplete="list"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  debouncedSearch.cancel()
                  void qc.cancelQueries({ queryKey: queryKeys.search.users("live") })
                  setIsSearchOpen(false)
                } else if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setActiveIndex((prev) => Math.min(items.length - 1, prev + 1))
                } else if (e.key === "ArrowUp") {
                  e.preventDefault()
                  setActiveIndex((prev) => Math.max(-1, prev - 1))
                } else if (e.key === "Enter") {
                  if (activeIndex >= 0 && items[activeIndex]) {
                    const to = `/profile/${items[activeIndex].public_id}`
                    debouncedSearch.cancel()
                    void qc.cancelQueries({ queryKey: queryKeys.search.users("live") })
                    setIsSearchOpen(false)
                    router.push(to)
                  }
                }
              }}
            />
            <div className="pointer-events-none absolute right-2 top-1.5 text-base-content/60">
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* 드롭다운 */}
          {len >= 2 && (
            <div className="absolute right-0 top-[110%] z-50 w-[22rem] max-w-[90vw] rounded-lg border bg-base-100 shadow-lg">
              <ul id="search-users-listbox" role="listbox" className="max-h-80 overflow-auto py-2">
                {isFetching && items.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-base-content/60">검색 중…</li>
                ) : isError ? (
                  <li className="px-4 py-3 text-sm text-error">검색 중 오류가 발생했습니다</li>
                ) : items.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-base-content/60">
                    일치하는 사용자가 없습니다
                  </li>
                ) : (
                  items.map((u, idx) => (
                    <li
                      key={u.profile_id}
                      id={`search-users-option-${idx}`}
                      role="option"
                      aria-selected={activeIndex === idx}
                      className="px-2"
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <Link
                        href={`/profile/${u.public_id}`}
                        className={
                          `flex items-center gap-3 rounded-md px-2 py-2 focus:outline-none ` +
                          (activeIndex === idx ? "bg-base-200" : "hover:bg-base-200")
                        }
                      >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={u.profile_circle_img || DEFAULT_AVATAR_SRC}
                            alt={u.username ?? u.nickname ?? "profile"}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                          <span
                            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-base-100"
                            style={{ backgroundColor: u.is_online ? "#0EA5E9" : "#9CA3AF" }}
                            aria-label={u.is_online ? "온라인" : "오프라인"}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {u.username ?? u.name ?? "-"}
                          </div>
                          <div className="text-xs text-base-content/60 truncate">
                            {u.nickname ?? "닉네임 없음"}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <button className="btn btn-ghost btn-circle" onClick={() => setIsSearchOpen(true)}>
          <Search className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
