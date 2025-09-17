"use client"

import { useCallback, useRef } from "react"

/* ───────────────── Debounced callback (lodash 제거, 내부에서 정리까지) ─────────────────
   - 컴포넌트 바깥에서 디바운스 상태를 관리하므로 useEffect 없이도 클린업이 보장됩니다.
   - 동일 인스턴스 보장을 위해 fn을 ref에 유지하고, 타이머도 ref로 관리합니다.
----------------------------------------------------------------------------- */
export default function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300,
) {
  const fnRef = useRef(fn)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  fnRef.current = fn

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => fnRef.current(...args), delay)
    },
    [delay],
  )

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return { debounced, cancel }
}
