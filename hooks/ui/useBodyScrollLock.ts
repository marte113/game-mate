import { useEffect, useRef } from "react"

// 모바일 전용 body 스크롤 락 훅
// - 루트 레이아웃/서버 컴포넌트는 변경하지 않고, 클라이언트 컴포넌트 내부에서만 사용
// - enabled=true일 때만 잠금, 언마운트/의존성 변경 시 해제
// - 여러 컴포넌트에서 중복 사용될 경우를 대비해 레퍼런스 카운트로 안전하게 처리

export type BodyScrollLockOptions = {
  // 모바일에서만 적용할지 여부 (기본값: true)
  onlyMobile?: boolean
  // 모바일 기준 max-width(px). Tailwind md 기준: 768px -> max-width: 767px
  breakpoint?: number
}

let lockCount = 0
let savedScrollY = 0

export function useBodyScrollLock(enabled: boolean, options: BodyScrollLockOptions = {}) {
  const { onlyMobile = true, breakpoint = 767 } = options
  const activeRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return

    const isMobile = window.matchMedia(`(max-width: ${breakpoint}px)`).matches

    // 잠금 조건 불충족 시 해제
    if (!enabled || (onlyMobile && !isMobile)) {
      if (activeRef.current) {
        unlock()
        activeRef.current = false
      }
      return
    }

    // 잠금
    lock()
    activeRef.current = true

    // 클린업
    return () => {
      if (activeRef.current) {
        unlock()
        activeRef.current = false
      }
    }
  }, [enabled, onlyMobile, breakpoint])
}

function lock() {
  if (lockCount === 0) {
    savedScrollY = window.scrollY || window.pageYOffset
    const body = document.body
    body.style.position = "fixed"
    body.style.top = `-${savedScrollY}px`
    body.style.left = "0"
    body.style.right = "0"
    body.style.width = "100%"
    body.style.overflow = "hidden"
    // 모바일 Safari 등에서 바운스/제스처 방지 보조 속성 (타입 안전하게 setProperty 사용)
    body.style.setProperty("touch-action", "none")
    body.style.setProperty("overscroll-behavior", "none")
  }
  lockCount += 1
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    const body = document.body
    const top = body.style.top
    body.style.position = ""
    body.style.top = ""
    body.style.left = ""
    body.style.right = ""
    body.style.width = ""
    body.style.overflow = ""
    body.style.setProperty("touch-action", "")
    body.style.setProperty("overscroll-behavior", "")

    const scrollY = top ? -parseInt(top, 10) : 0
    window.scrollTo(0, scrollY)
  }
}
