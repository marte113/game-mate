// @vitest-environment node
/**
 * 결제 검증 서비스 유닛 테스트
 *
 * 테스트 대상: verifyAndChargeTokens()
 * 핵심 비즈니스 규칙:
 * 1. PortOne 응답 검증 (PAID 상태)
 * 2. 소유권 검증 (customerId/customData.userId)
 * 3. 샌드박스 환경 분기 (테스트 환경 완화)
 * 4. 멱등성 체크 (중복 처리 방지)
 * 5. 금액→토큰 매핑
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { verifyAndChargeTokens } from "@/app/apis/service/payment/verifyService"

// 의존성 모킹
vi.mock("@/app/apis/base/auth", () => ({
  getCurrentUserId: vi.fn(),
}))

vi.mock("@/app/apis/repository/payment/paymentRepository", () => ({
  findPaymentByExternalId: vi.fn(),
  upsertPaymentFromPortOne: vi.fn(),
  insertTokenChargeTransaction: vi.fn(),
}))

vi.mock("@/app/apis/base/rpc", () => ({
  callRpc: vi.fn(),
}))

import { getCurrentUserId } from "@/app/apis/base/auth"
import {
  findPaymentByExternalId,
  upsertPaymentFromPortOne,
  insertTokenChargeTransaction,
} from "@/app/apis/repository/payment/paymentRepository"
import { callRpc } from "@/app/apis/base/rpc"

describe("verifyAndChargeTokens - 결제 검증 서비스", () => {
  const TEST_USER_ID = "test-user-123"
  const TEST_PAYMENT_ID = "payment-abc-123"
  const SECRET = "test-portone-secret"

  beforeEach(() => {
    vi.clearAllMocks()

    // 기본 모킹 설정
    vi.mocked(getCurrentUserId).mockResolvedValue(TEST_USER_ID)
    vi.mocked(findPaymentByExternalId).mockResolvedValue(null)
    vi.mocked(upsertPaymentFromPortOne).mockResolvedValue({
      payment_id: "db-payment-1",
    } as any)
    vi.mocked(insertTokenChargeTransaction).mockResolvedValue(undefined)
    vi.mocked(callRpc).mockResolvedValue(11000) // 업데이트된 잔액
  })

  describe("✅ 성공 케이스", () => {
    it("정상 결제 시 토큰 충전에 성공한다", async () => {
      // Given: PortOne 정상 응답
      const mockPortOneResponse = {
        id: TEST_PAYMENT_ID,
        status: "PAID",
        currency: "KRW",
        orderName: "토큰 1000개 충전",
        amount: { total: 9360, paid: 9360 },
        customer: { customerId: TEST_USER_ID },
        method: { type: "CARD" },
        channel: {
          type: "LIVE",
          pgProvider: "TOSSPAYMENTS",
          name: "TOSSPAYMENTS",
        },
        paidAt: "2025-01-23T12:00:00Z",
        receiptUrl: "https://tosspayments.com/receipt/xxx",
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPortOneResponse,
      })

      // When: 결제 검증 실행
      const result = await verifyAndChargeTokens(TEST_PAYMENT_ID, SECRET)

      // Then: 성공 응답 및 토큰 충전 확인
      expect(result.success).toBe(true)
      expect(result.message).toBe("결제가 완료되었습니다")
      expect(result.tokenAmount).toBe(1000) // 9360원 → 1000토큰
      expect(result.currentBalance).toBe(11000)

      // 토큰 트랜잭션 생성 확인
      expect(insertTokenChargeTransaction).toHaveBeenCalledWith({
        userId: TEST_USER_ID,
        amount: 1000,
        paymentId: "db-payment-1",
        description: expect.stringContaining("토큰 1000개 충전"),
      })

      // RPC 호출로 잔액 증가 확인
      expect(callRpc).toHaveBeenCalledWith("increment_balance", {
        user_id_param: TEST_USER_ID,
        amount_param: 1000,
      })
    })

    it("샌드박스 환경에서는 PG 검증을 완화한다", async () => {
      // Given: 샌드박스 환경 응답 (PG는 불일치하지만 통화는 맞음)
      const mockSandboxResponse = {
        id: TEST_PAYMENT_ID,
        status: "PAID",
        currency: "KRW",
        orderName: "토큰 500개 충전",
        amount: { total: 200 },
        customer: { customerId: TEST_USER_ID },
        method: { type: "UNKNOWN" }, // 수단 불명확
        channel: {
          type: "TEST", // 샌드박스 표시
          pgProvider: "UNKNOWN_PG",
        },
        paidAt: "2025-01-23T12:00:00Z",
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSandboxResponse,
      })

      // When
      const result = await verifyAndChargeTokens(TEST_PAYMENT_ID, SECRET)

      // Then: 샌드박스 환경에서는 통과
      expect(result.success).toBe(true)
      expect(result.tokenAmount).toBe(500) // 200원 → 500토큰
    })
  })

  describe("❌ 실패 케이스", () => {
    it("소유권 불일치 시 ForbiddenError를 발생시킨다", async () => {
      // Given: 다른 사용자의 결제
      const mockResponse = {
        id: TEST_PAYMENT_ID,
        status: "PAID",
        currency: "KRW",
        amount: { total: 9360 },
        customer: { customerId: "other-user-456" }, // 다른 사용자
        method: { type: "CARD" },
        channel: { type: "LIVE", pgProvider: "TOSSPAYMENTS" },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      // When & Then: Forbidden 에러 발생
      await expect(verifyAndChargeTokens(TEST_PAYMENT_ID, SECRET)).rejects.toThrow(
        "결제 소유자 정보가 현재 사용자와 일치하지 않습니다",
      )
    })

    it("이미 처리된 결제는 거부한다 (멱등성)", async () => {
      // Given: 이미 처리된 결제
      vi.mocked(findPaymentByExternalId).mockResolvedValue({
        payment_id: "db-payment-1",
        status: "PAID",
      })

      const mockResponse = {
        id: TEST_PAYMENT_ID,
        status: "PAID",
        currency: "KRW",
        amount: { total: 9360 },
        customer: { customerId: TEST_USER_ID },
        method: { type: "CARD" },
        channel: { type: "LIVE", pgProvider: "TOSSPAYMENTS" },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      // When & Then: 중복 처리 에러
      await expect(verifyAndChargeTokens(TEST_PAYMENT_ID, SECRET)).rejects.toThrow(
        "이미 처리된 결제입니다",
      )
    })

    it("지원하지 않는 금액은 거부한다", async () => {
      // Given: 매핑되지 않은 금액
      const mockResponse = {
        id: TEST_PAYMENT_ID,
        status: "PAID",
        currency: "KRW",
        amount: { total: 9999 }, // 매핑되지 않은 금액
        customer: { customerId: TEST_USER_ID },
        method: { type: "CARD" },
        channel: { type: "LIVE", pgProvider: "TOSSPAYMENTS" },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      // When & Then: 금액 검증 실패
      await expect(verifyAndChargeTokens(TEST_PAYMENT_ID, SECRET)).rejects.toThrow(
        "지원하지 않는 결제 금액입니다",
      )
    })

    it("결제 상태가 PAID가 아니면 거부한다", async () => {
      // Given: 미완료 결제
      const mockResponse = {
        id: TEST_PAYMENT_ID,
        status: "PENDING",
        currency: "KRW",
        amount: { total: 9360 },
        customer: { customerId: TEST_USER_ID },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      // When & Then: 상태 검증 실패
      await expect(verifyAndChargeTokens(TEST_PAYMENT_ID, SECRET)).rejects.toThrow(
        "결제가 완료되지 않았습니다",
      )
    })

    it("customData에서 userId를 추출할 수 있다 (JSON 문자열)", async () => {
      // Given: customData가 JSON 문자열인 경우
      const mockResponse = {
        id: TEST_PAYMENT_ID,
        status: "PAID",
        currency: "KRW",
        amount: { total: 9360 },
        customData: JSON.stringify({ userId: TEST_USER_ID }), // 문자열 형태
        method: { type: "CARD" },
        channel: { type: "LIVE", pgProvider: "TOSSPAYMENTS" },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      // When
      const result = await verifyAndChargeTokens(TEST_PAYMENT_ID, SECRET)

      // Then: 소유권 검증 통과 (customData에서 userId 추출 성공)
      expect(result.success).toBe(true)
    })
  })
})
