"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { Loader2, Search as SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

import { useUserSearchLive } from "@/hooks/api/profile/useUserSearchLive"
import { queryKeys } from "@/constants/queryKeys"

import useDebouncedCallback from "../../_hooks/useDebounceCallback"
import SearchBarDropdown from "./searchBar/SearchBarDropdown"
import type { UserSearchResult, UseUserSearchLiveReturn } from "./searchBar/types"

/* ───────────────── 타입은 ./searchBar/types 로 분리 ───────────────── */

/* ───────────────── 메인 컴포넌트 ─────────────────
   목표:
   - 불필요한 useEffect 제거
   - 파일 파편화 최소화(프레젠테이셔널은 동일 파일 하단에 배치)
   - IME 조합 중이라도 2자 이상이면 검색 트리거
   - 로딩 중일 때는 글자 수 미만이어도 드롭다운 표시
----------------------------------------------------------------------------- */
export default function SearchBar() {
  const MIN = 2 // 최소 검색 길이(UX/성능 밸런스에 맞게 조절)

  // UI/상태
  const [isOpen, setIsOpen] = useState(false) // 검색창 열림/닫힘
  const [value, setValue] = useState("") // 입력값
  const [activeIndex, setActiveIndex] = useState(-1) // 키보드 포커스용 인덱스

  // DOM ref
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // 라우팅/쿼리
  const router = useRouter()
  const qc = useQueryClient()

  // 라이브 검색 훅 (주의: 내부에서 AbortSignal을 지원하면 cancel로 실제 네트워크 abort 가능)
  const { data, isFetching, isError, search, cancel } = useUserSearchLive(
    8,
  ) as unknown as UseUserSearchLiveReturn

  /* ✅ items 메모이즈 (경고 해결 포인트)
     - data?.items ?? [] 로직은 매 렌더마다 새로운 빈 배열을 만들 수 있음
     - useMemo로 참조 안정화하여 useCallback 의존성 변동을 억제
  */
  const items = useMemo<UserSearchResult[]>(() => (data?.items ? data.items : []), [data?.items])

  // 엔터 없이도 드롭다운 노출 + 로딩 중이면 글자 수 미만이어도 드롭다운 표시
  const showDropdown = isOpen && (value.trim().length >= MIN || isFetching)

  // 디바운스된 검색: 2자 이상일 때만 질의 전송
  const { debounced, cancel: cancelDebounce } = useDebouncedCallback((q: string) => {
    if (q.trim().length >= MIN) search(q)
  }, 300)

  // 하드 취소: 디바운스 타이머 + 네트워크(지원 시) + 쿼리 취소(fallback)
  const hardCancel = useCallback(() => {
    cancelDebounce()
    cancel?.()
    void qc.cancelQueries({ queryKey: queryKeys.search.users("live") })
  }, [cancel, cancelDebounce, qc])

  // 유효한 activeIndex로 보정 (감시형 effect 대신 "사용 시점"에서만 보정)
  const getValidActiveIndex = useCallback(
    (idx: number) => {
      if (!showDropdown) return -1
      if (items.length === 0) return -1
      if (idx < -1) return -1
      if (idx >= items.length) return items.length - 1
      return idx
    },
    [showDropdown, items.length], // 길이만 의존해도 충분
  )

  // 포커스 아웃 시 전체 정리(검색 취소/값 초기화)
  const onBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    const next = e.relatedTarget as Node | null
    if (next && containerRef.current?.contains(next)) return // 컨테이너 내부 포커스 이동은 유지
    hardCancel()
    setIsOpen(false)
    setValue("")
    setActiveIndex(-1)
  }

  // 입력 변경: 2자 이상이면 즉시 디바운스 검색 트리거
  const onChange = useCallback(
    (next: string) => {
      setValue(next)
      setActiveIndex(-1) // 입력이 바뀌면 포커스 초기화
      if (next.trim().length >= MIN) debounced(next)
    },
    [debounced],
  )

  // 키보드 내비게이션/액션
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        // ESC: 전체 초기화
        hardCancel()
        setIsOpen(false)
        setValue("")
        setActiveIndex(-1)
      } else if (e.key === "ArrowDown") {
        // ↓: 다음 항목
        e.preventDefault()
        const next = getValidActiveIndex(activeIndex + 1)
        setActiveIndex(next)
        if (next >= 0) {
          const id = `search-users-option-${next}`
          document.getElementById(id)?.scrollIntoView({ block: "nearest" })
        }
      } else if (e.key === "ArrowUp") {
        // ↑: 이전 항목
        e.preventDefault()
        const next = getValidActiveIndex(activeIndex - 1)
        setActiveIndex(next)
        if (next >= 0) {
          const id = `search-users-option-${next}`
          document.getElementById(id)?.scrollIntoView({ block: "nearest" })
        }
      } else if (e.key === "Enter") {
        // Enter: 활성 항목 이동
        if (activeIndex >= 0 && items[activeIndex]) {
          const to = `/profile/${items[activeIndex].public_id}`
          hardCancel()
          setIsOpen(false)
          setValue("")
          setActiveIndex(-1)
          router.push(to)
        }
      } else if (e.key === "Home") {
        // Home: 첫 항목
        e.preventDefault()
        const next = getValidActiveIndex(0)
        setActiveIndex(next)
      } else if (e.key === "End") {
        // End: 마지막 항목
        e.preventDefault()
        const next = getValidActiveIndex(items.length - 1)
        setActiveIndex(next)
      }
    },
    [activeIndex, getValidActiveIndex, hardCancel, items, router],
  )

  return (
    <div ref={containerRef} className="relative" onBlur={onBlur}>
      {isOpen ? (
        <div className="flex items-center gap-2 mr-4">
          {/* 입력 영역 */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onFocus={() => setIsOpen(true)} // 포커스 시 열림 유지
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="닉네임 또는 사용자명을 입력하세요(2자 이상)"
              className="input input-ghost w-full max-w-xs h-8 text-sm pr-7"
              autoFocus
              // ARIA: 콤보박스 + 리스트박스 관계
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={showDropdown}
              aria-controls={showDropdown ? "search-users-listbox" : undefined}
              aria-activedescendant={
                activeIndex >= 0 ? `search-users-option-${activeIndex}` : undefined
              }
              aria-autocomplete="list"
            />
            {/* 입력 우측 아이콘: 로딩 중이면 스피너 */}
            <div className="pointer-events-none absolute right-2 top-1.5 text-base-content/60">
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SearchIcon className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* 드롭다운: 로딩 중에도 열어서 '검색 중…' 상태를 표시 */}
          {showDropdown && (
            <SearchBarDropdown
              items={items}
              isFetching={isFetching}
              isError={isError}
              activeIndex={activeIndex}
              onItemHover={(i) => setActiveIndex(getValidActiveIndex(i))}
            />
          )}
        </div>
      ) : (
        // 닫힘 상태: 아이콘 버튼
        <button className="btn btn-ghost btn-circle" onClick={() => setIsOpen(true)}>
          <SearchIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
