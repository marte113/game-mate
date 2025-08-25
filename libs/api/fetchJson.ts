export type ApiSuccess<T> = { success: true; data: T }
export type ApiError = { success: false; code: string; message: string; details?: unknown }

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  let body: any = null
  try { body = await res.json() } catch {}

  if (!res.ok) {
    const message = body?.message || '요청 처리 중 오류가 발생했습니다'
    const code = body?.code || 'INTERNAL_ERROR'
    const err = new Error(message) as Error & { code?: string; details?: unknown; status?: number }
    err.code = code
    err.details = body?.details
    err.status = res.status
    throw err
  }

  // 표준 포맷이면 data만 반환, 아니면 그대로 반환
  if (body && typeof body === 'object' && 'success' in body) {
    if ((body as ApiSuccess<T>).success === true && 'data' in body) return (body as ApiSuccess<T>).data
    if ((body as ApiError).success === false) {
      const err = new Error((body as ApiError).message) as Error & { code?: string; details?: unknown; status?: number }
      err.code = (body as ApiError).code
      err.details = (body as ApiError).details
      err.status = res.status
      throw err
    }
  }
  return body as T
}


