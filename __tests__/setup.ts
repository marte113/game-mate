// Jest 테스트 설정
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Node.js 환경에서 필요한 polyfill
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// React Query 테스트 설정
import { QueryClient } from '@tanstack/react-query'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // 테스트 중 에러 로그 숨김
    },
  })
}

// API 모킹 헬퍼
export const mockApiResponse = <T>(data: T, delay = 0) => 
  new Promise<T>((resolve) => setTimeout(() => resolve(data), delay))

export const mockApiError = (message: string, code = 'TEST_ERROR', status = 500) => 
  new Promise((_, reject) => {
    const error = new Error(message) as any
    error.code = code
    error.status = status
    reject(error)
  })
