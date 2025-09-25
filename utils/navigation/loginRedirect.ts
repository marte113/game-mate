// 클라이언트 전용 로그인 리다이렉트 유틸
// - 현재 페이지로 안전하게 복귀시키기 위해 /login?next=... URL을 생성
// - next는 상대 경로만 허용(`/` 시작, `//` 금지)

export function getCurrentPathWithSearch(): string {
  if (typeof window === "undefined") return "/"
  const path = window.location.pathname + window.location.search
  return path || "/"
}

export function buildLoginUrl(nextPath?: string): string {
  if (!nextPath) return "/login"
  const isSafe = nextPath.startsWith("/") && !nextPath.startsWith("//")
  const safe = isSafe ? nextPath : "/"
  return `/login?next=${encodeURIComponent(safe)}`
}
