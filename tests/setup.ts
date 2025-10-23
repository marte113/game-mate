import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"
import React from "react"

// 각 테스트 후 자동 cleanup
afterEach(() => {
  cleanup()
})

// server-only 모킹 (테스트 환경에서 서버 전용 모듈 import 허용)
vi.mock("server-only", () => ({
  default: {},
}))

// Next.js 모듈 모킹
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

vi.mock("next/image", () => ({
  default: (props: any) => {
    // JSX 대신 createElement 사용 (setup.ts는 .tsx가 아니므로)
    return React.createElement("img", props)
  },
}))

// 환경 변수 설정 (테스트용)
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key"
process.env.PORTONE_V2_API_SECRET = "test-portone-secret"
