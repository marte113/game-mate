import { FieldValues, UseFormSetError } from 'react-hook-form';
import { ZodError } from 'zod';

// 백엔드에서 오는 표준 에러 응답 형태 (예시)
interface BackendErrorResponse {
  code?: string; // 에러 종류 코드 (예: 'VALIDATION_ERROR', 'UNAUTHENTICATED')
  message?: string; // 일반적인 에러 메시지
  details?: Record<string, string[]>; // 필드별 상세 오류 메시지
}

// 파싱된 에러 정보 인터페이스
interface ParsedError {
  generalMessage: string; // 사용자에게 보여줄 일반 메시지
  fieldErrors?: Record<string, string[]>; // 필드별 오류 (setError 용)
}

// API 에러 파싱 함수
export function parseApiError(error: any): ParsedError {
  const defaultMessage = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  const parsedError: ParsedError = { generalMessage: defaultMessage };

  // 1. Axios 등 HTTP 클라이언트의 response data 확인 (가장 우선)
  if (error?.response?.data) {
    const backendError = error.response.data as BackendErrorResponse;
    parsedError.generalMessage = backendError.message || defaultMessage;
    if (backendError.code === 'VALIDATION_ERROR' && typeof backendError.details === 'object') {
      parsedError.fieldErrors = backendError.details;
      parsedError.generalMessage = backendError.message || '입력 내용을 확인해주세요.';
    }
    console.error('Backend Error Response:', backendError); // Log backend error
    return parsedError;
  }

  // 2. error.message가 JSON 형태일 경우 파싱 시도 (Fallback)
  if (error instanceof Error && typeof error.message === 'string') {
    try {
      const jsonError = JSON.parse(error.message) as BackendErrorResponse;
      parsedError.generalMessage = jsonError.message || defaultMessage;
       if (jsonError.code === 'VALIDATION_ERROR' && typeof jsonError.details === 'object') {
         parsedError.fieldErrors = jsonError.details;
         parsedError.generalMessage = jsonError.message || '입력 내용을 확인해주세요.';
       }
      console.error('Parsed JSON Error from message:', jsonError); // Log parsed error
      return parsedError;
    } catch (e) {
      // JSON 파싱 실패 시 원본 메시지 사용
      parsedError.generalMessage = error.message;
      console.error('Failed to parse error message as JSON:', error.message); // Log original message
      return parsedError;
    }
  }

  // 3. Zod 에러 처리
   if (error instanceof ZodError) {
       parsedError.generalMessage = '입력값 형식이 올바르지 않습니다.';
       console.error("Zod Validation Error:", error.flatten()); // Log Zod error details
       return parsedError;
   }


  // 4. 기타 Error 객체
  if (error instanceof Error) {
    parsedError.generalMessage = error.message;
    console.error('Generic Error:', error); // Log generic error
    return parsedError;
  }

  // 5. 알 수 없는 에러
  console.error('Unknown Error:', error); // Log unknown error
  return parsedError;
}

// react-hook-form의 setError를 호출하는 헬퍼 함수 (선택적)
export function setFormErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors?: Record<string, string[]>
) {
  if (fieldErrors) {
    Object.entries(fieldErrors).forEach(([field, messages]) => {
      if (messages && messages.length > 0) {
        // setError 타입 캐스팅 필요할 수 있음
        setError(field as any, { type: 'manual', message: messages[0] });
      }
    });
  }
} 