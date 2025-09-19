// @vitest-environment node
/**
 * 결제 검증 API 통합 테스트
 *
 * 테스트 대상: GET /api/payment/verify?paymentId=xxx
 * 검증 항목:
 * 1. Zod 스키마 검증 (paymentVerifyGetQuerySchema)
 * 2. 서비스 레이어 호출
 * 3. 적절한 HTTP 응답 (200, 400, 500 등)
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { GET } from "@/app/api/payment/verify/route"

// 서비스 레이어 모킹
vi.mock("@/app/apis/service/payment/verifyService", () => ({
  verifyAndChargeTokens: vi.fn(),
}))

import { verifyAndChargeTokens } from "@/app/apis/service/payment/verifyService"

describe("GET /api/payment/verify - 결제 검증 API", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // 환경 변수 설정
    process.env.PORTONE_V2_API_SECRET = "test-secret"
  })

  describe("✅ 성공 케이스", () => {
    it("유효한 paymentId로 요청 시 200과 결제 결과를 반환한다", async () => {
      // Given: 정상 서비스 응답
      const mockServiceResult = {
        success: true,
        message: "결제가 완료되었습니다",
        paymentInfo: {
          id: "payment-123",
          orderName: "토큰 1000개 충전",
          status: "PAID",
          amount: 9360,
          paidAt: "2025-01-23T12:00:00Z",
          receiptUrl: "https://tosspayments.com/receipt/xxx",
        },
        tokenAmount: 1000,
        currentBalance: 11000,
      }

      vi.mocked(verifyAndChargeTokens).mockResolvedValue(mockServiceResult)

      // When: API 요청
      const request = new NextRequest(
        "http://localhost:3000/api/payment/verify?paymentId=payment-123",
      )
      const response = await GET(request)

      // Then: 200 응답 및 결과 확인
      expect(response.status).toBe(200)

      const json = await response.json()
      expect(json).toEqual(mockServiceResult)
      expect(json.success).toBe(true)
      expect(json.tokenAmount).toBe(1000)
      expect(json.currentBalance).toBe(11000)

      // 서비스 호출 확인
      expect(verifyAndChargeTokens).toHaveBeenCalledWith("payment-123", "test-secret")
    })
  })

  describe("❌ 실패 케이스", () => {
    it("paymentId가 누락되면 400 ValidationError를 반환한다", async () => {
      // Given: paymentId 없는 요청
      const request = new NextRequest("http://localhost:3000/api/payment/verify")

      // When: API 요청
      const response = await GET(request)

      // Then: 400 에러
      expect(response.status).toBe(400)

      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.code).toBeDefined()
      expect(json.message).toContain("유효하지 않습니다")

      // 서비스는 호출되지 않음
      expect(verifyAndChargeTokens).not.toHaveBeenCalled()
    })

    it("빈 paymentId는 400 ValidationError를 반환한다", async () => {
      // Given: 빈 paymentId
      const request = new NextRequest("http://localhost:3000/api/payment/verify?paymentId=")

      // When
      const response = await GET(request)

      // Then: 400 에러
      expect(response.status).toBe(400)

      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.code).toBeDefined()

      expect(verifyAndChargeTokens).not.toHaveBeenCalled()
    })

    it("서비스에서 에러 발생 시 적절한 에러 응답을 반환한다", async () => {
      // Given: 서비스 에러
      const serviceError = new Error("이미 처리된 결제입니다.")
      serviceError.name = "ValidationError"

      vi.mocked(verifyAndChargeTokens).mockRejectedValue(serviceError)

      // When
      const request = new NextRequest(
        "http://localhost:3000/api/payment/verify?paymentId=payment-123",
      )
      const response = await GET(request)

      // Then: 에러 응답
      expect(response.status).toBeGreaterThanOrEqual(400)

      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.code).toBeDefined()
    })

    it("PORTONE_V2_API_SECRET이 없으면 500 에러를 반환한다", async () => {
      // Given: 환경 변수 누락
      delete process.env.PORTONE_V2_API_SECRET

      // When
      const request = new NextRequest(
        "http://localhost:3000/api/payment/verify?paymentId=payment-123",
      )
      const response = await GET(request)

      // Then: 500 에러
      expect(response.status).toBe(500)

      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.code).toBeDefined()

      expect(verifyAndChargeTokens).not.toHaveBeenCalled()
    })
  })
})
