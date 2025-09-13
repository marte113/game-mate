/**
 * ISO 날짜 문자열을 한국 날짜 형식으로 변환합니다
 * @param isoString - ISO 형식의 날짜 문자열 (예: "2024-03-15T10:00:00Z")
 * @returns 한국 날짜 형식의 문자열 (예: "2024.03.15 19:00")
 */
export function getFormattedDate(isoString: string | null | undefined): string {
  if (!isoString) return "-"

  try {
    const date = new Date(isoString)

    // UTC를 한국 시간으로 변환 (UTC+9)
    const koreanDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)

    const year = koreanDate.getUTCFullYear()
    const month = String(koreanDate.getUTCMonth() + 1).padStart(2, "0")
    const day = String(koreanDate.getUTCDate()).padStart(2, "0")
    const hours = String(koreanDate.getUTCHours()).padStart(2, "0")
    const minutes = String(koreanDate.getUTCMinutes()).padStart(2, "0")

    return `${year}.${month}.${day} ${hours}:${minutes}`
  } catch (error) {
    console.error("날짜 변환 중 오류 발생:", error)
    return "-"
  }
}

/**
 * 현재 시간을 기준으로 상대 시간을 한국어로 반환합니다.
 * 예) 방금 전, 5분 전, 2시간 전, 3일 전, 2주 전, 4개월 전, 1년 전, (미래) 3시간 후 등
 */
export function formatRelativeFromNow(input: string | number | Date): string {
  try {
    const date = new Date(input)
    if (isNaN(date.getTime())) return "-"

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const isFuture = diffMs < 0
    const absMs = Math.abs(diffMs)

    const sec = Math.floor(absMs / 1000)
    if (sec < 60) return isFuture ? "곧" : "방금 전"

    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}분 ${isFuture ? "후" : "전"}`

    const hour = Math.floor(min / 60)
    if (hour < 24) return `${hour}시간 ${isFuture ? "후" : "전"}`

    const day = Math.floor(hour / 24)
    if (day < 7) return `${day}일 ${isFuture ? "후" : "전"}`

    if (day < 30) {
      const week = Math.floor(day / 7)
      return `${week}주 ${isFuture ? "후" : "전"}`
    }

    if (day < 365) {
      const month = Math.floor(day / 30)
      return `${month}개월 ${isFuture ? "후" : "전"}`
    }

    const year = Math.floor(day / 365)
    return `${year}년 ${isFuture ? "후" : "전"}`
  } catch (error) {
    console.error("상대 시간 변환 중 오류 발생:", error)
    return "-"
  }
}
