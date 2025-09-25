// 안전한 next 경로 파싱 유틸리티
// - 오픈 리다이렉트 방지: 절대 URL/프로토콜/`//` 시작 금지
// - 내부 경로(`/` 시작)만 허용
// - string | string[] | undefined 입력을 허용하여 App Router searchParams와 호환

const PROTOCOL_OR_PROTOCOL_RELATIVE = /^([a-z]+:)?\/\//i

export function toSafeNext(raw: string | string[] | undefined): string | undefined {
  if (Array.isArray(raw)) {
    const val = raw[0]
    if (typeof val === "string") {
      const hasProtocol = PROTOCOL_OR_PROTOCOL_RELATIVE.test(val)
      if (!hasProtocol && val.startsWith("/") && !val.startsWith("//")) {
        return val
      }
    }
    return undefined
  }

  if (typeof raw === "string") {
    const hasProtocol = PROTOCOL_OR_PROTOCOL_RELATIVE.test(raw)
    if (!hasProtocol && raw.startsWith("/") && !raw.startsWith("//")) {
      return raw
    }
  }

  return undefined
}

// 서버 라우트 등에서 기본값과 함께 사용할 때
export function toSafeNextOrDefault(
  raw: string | string[] | undefined,
  fallback: string = "/",
): string {
  return toSafeNext(raw) ?? fallback
}
