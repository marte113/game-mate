/**
 * ISO 날짜 문자열을 한국 날짜 형식으로 변환합니다
 * @param isoString - ISO 형식의 날짜 문자열 (예: "2024-03-15T10:00:00Z")
 * @returns 한국 날짜 형식의 문자열 (예: "2024.03.15 19:00")
 */
export function getFormattedDate(isoString: string | null | undefined): string {
    if (!isoString) return "-";
  
    try {
      const date = new Date(isoString);
  
      // UTC를 한국 시간으로 변환 (UTC+9)
      const koreanDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  
      const year = koreanDate.getUTCFullYear();
      const month = String(koreanDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(koreanDate.getUTCDate()).padStart(2, "0");
      const hours = String(koreanDate.getUTCHours()).padStart(2, "0");
      const minutes = String(koreanDate.getUTCMinutes()).padStart(2, "0");
  
      return `${year}.${month}.${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("날짜 변환 중 오류 발생:", error);
      return "-";
    }
  }
  