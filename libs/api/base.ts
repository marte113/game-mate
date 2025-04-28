import { PostgrestError } from '@supabase/supabase-js';


export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

export type ApiErrorResponse = {
  error: string;
  status: number;
};

// 성공 응답 생성 유틸리티 함수
export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  data,
  error: null,
  status: 200,
});

// 에러 응답 생성 유틸리티 함수
export const createErrorResponse = (error: string | PostgrestError | Error, status = 400): ApiErrorResponse => {
  if (typeof error === 'string') {
    return {
      error,
      status,
    };
  }
  
  if ('code' in error && 'details' in error) {
    // PostgrestError 타입
    return {
      error: error.message || '알 수 없는 오류가 발생했습니다',
      status: error.code === 'PGRST116' ? 404 : status,
    };
  }
  
  // 일반 Error 타입
  return {
    error: error.message || '알 수 없는 오류가 발생했습니다',
    status,
  };
};

// 클라이언트 사이드 API 호출 래퍼
export const clientFetch = async <T>(
  apiFunction: () => Promise<{ data: T | null; error: PostgrestError | Error | null }>
): Promise<ApiResponse<T>> => {
  try {
    const { data, error } = await apiFunction();
    
    if (error) {
      if ('code' in error && 'details' in error) {
        // PostgrestError 타입
        return {
          data: null,
          error: error.message,
          status: error.code === 'PGRST116' ? 404 : 400,
        };
      }
      
      // 일반 Error 타입
      return {
        data: null,
        error: error.message,
        status: 400,
      };
    }
    
    return {
      data,
      error: null,
      status: 200,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || '알 수 없는 오류가 발생했습니다',
      status: 500,
    };
  }
};

// 서버 사이드 API 호출 래퍼
export const serverFetch = async <T>(
  apiFunction: () => Promise<{ data: T | null; error: PostgrestError | Error | null }>
): Promise<ApiResponse<T>> => {
  try {
    const { data, error } = await apiFunction();
    
    if (error) {
      if ('code' in error && 'details' in error) {
        // PostgrestError 타입
        return {
          data: null,
          error: error.message,
          status: error.code === 'PGRST116' ? 404 : 400,
        };
      }
      
      // 일반 Error 타입
      return {
        data: null,
        error: error.message,
        status: 400,
      };
    }
    
    return {
      data,
      error: null,
      status: 200,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || '알 수 없는 오류가 발생했습니다',
      status: 500,
    };
  }
}; 