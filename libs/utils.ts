import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 클래스 이름을 조합하는 유틸리티 함수
 * clsx와 tailwind-merge를 사용하여 클래스 이름을 조합하고 충돌을 해결합니다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

/**
 * 데이터를 엑셀 형식으로 변환하는 함수
 * @param _data - 엑셀로 변환할 데이터 배열
 * @returns 엑셀 버퍼
 */
export const convertToExcel = (_data: Record<string, unknown>[]): ArrayBuffer => {
  // XLSX 라이브러리가 필요한 경우에만 import하도록 수정
  // import * as XLSX from 'xlsx';
  // const worksheet = XLSX.utils.json_to_sheet(_data);
  // const workbook = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  // return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  
  throw new Error("XLSX 라이브러리가 설치되지 않았습니다. 'npm install xlsx'를 실행하세요.");
};

/**
 * 엑셀 파일을 다운로드하는 함수
 * @param excelBuffer - 엑셀 데이터 버퍼
 * @param fileName - 다운로드할 파일명
 */
export const downloadExcel = (excelBuffer: ArrayBuffer, fileName: string): void => {
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}; 