/**
 * 의뢰 상태 변경 서비스 유닛 테스트
 *
 * 테스트 대상: changeOrderStatus()
 * 핵심 비즈니스 규칙:
 * 1. 상태 전이 규칙 (canTransition)
 *    - pending → accepted/rejected ✅
 *    - accepted → completed ✅
 *    - pending/accepted → canceled ✅
 *    - completed → canceled ❌
 * 2. 권한 검증 (provider_id 또는 requester_id만 허용)
 * 3. 토큰 처리
 *    - completed → complete_order_payment RPC (제공자 지급)
 *    - canceled/rejected → cancel_request_and_refund RPC (요청자 환불)
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { changeOrderStatus } from "@/app/apis/service/order/statusService"

// 의존성 모킹
vi.mock("@/app/apis/base/auth", () => ({
  getCurrentUserId: vi.fn(),
}))

vi.mock("@/app/apis/base", () => ({
  getServerSupabase: vi.fn(),
  callRpc: vi.fn(),
}))

import { getCurrentUserId } from "@/app/apis/base/auth"
import { getServerSupabase, callRpc } from "@/app/apis/base"

describe("changeOrderStatus - 의뢰 상태 변경 서비스", () => {
  const TEST_USER_ID = "user-123"
  const OTHER_USER_ID = "user-456"
  const REQUEST_ID = "request-abc-123"

  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    // 기본 사용자 ID
    vi.mocked(getCurrentUserId).mockResolvedValue(TEST_USER_ID)

    // Supabase 모킹
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis(),
    }

    vi.mocked(getServerSupabase).mockResolvedValue(mockSupabase)
    vi.mocked(callRpc).mockResolvedValue(undefined)
  })

  describe("✅ 성공 케이스 - 상태 전이 규칙", () => {
    it("pending → accepted 전이가 성공한다", async () => {
      // Given: pending 상태 의뢰
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: REQUEST_ID,
          status: "pending",
          provider_id: TEST_USER_ID,
          requester_id: OTHER_USER_ID,
        },
        error: null,
      })

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: REQUEST_ID,
          status: "accepted",
          updated_at: "2025-01-23T12:00:00Z",
        },
        error: null,
      })

      // When: accepted로 변경
      const result = await changeOrderStatus({
        requestId: REQUEST_ID,
        status: "accepted",
      })

      // Then: 성공
      expect(result.order).toBeDefined()
      expect(result.order?.status).toBe("accepted")
      expect(result.error).toBeUndefined()
    })

    it("pending → rejected 전이 시 환불 RPC를 호출한다", async () => {
      // Given: pending 상태
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: REQUEST_ID,
          status: "pending",
          provider_id: TEST_USER_ID,
          requester_id: OTHER_USER_ID,
        },
        error: null,
      })

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: REQUEST_ID, status: "rejected" },
        error: null,
      })

      // When: rejected로 변경
      const result = await changeOrderStatus({
        requestId: REQUEST_ID,
        status: "rejected",
      })

      // Then: 환불 RPC 호출 확인
      expect(result.order).toBeDefined()
      expect(callRpc).toHaveBeenCalledWith("cancel_request_and_refund", {
        p_request_id: REQUEST_ID,
      })
    })

    it("accepted → completed 전이 시 지급 RPC를 호출한다", async () => {
      // Given: accepted 상태
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: REQUEST_ID,
          status: "accepted",
          provider_id: TEST_USER_ID,
          requester_id: OTHER_USER_ID,
        },
        error: null,
      })

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: REQUEST_ID, status: "completed" },
        error: null,
      })

      // When: completed로 변경
      const result = await changeOrderStatus({
        requestId: REQUEST_ID,
        status: "completed",
      })

      // Then: 지급 RPC 호출 확인
      expect(result.order).toBeDefined()
      expect(callRpc).toHaveBeenCalledWith("complete_order_payment", {
        p_order_id: REQUEST_ID,
      })
    })

    it("accepted → canceled 전이 시 환불 RPC를 호출한다", async () => {
      // Given: accepted 상태
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: REQUEST_ID,
          status: "accepted",
          provider_id: TEST_USER_ID,
          requester_id: OTHER_USER_ID,
        },
        error: null,
      })

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: REQUEST_ID, status: "canceled" },
        error: null,
      })

      // When: canceled로 변경
      const result = await changeOrderStatus({
        requestId: REQUEST_ID,
        status: "canceled",
      })

      // Then: 환불 RPC 호출
      expect(result.order).toBeDefined()
      expect(callRpc).toHaveBeenCalledWith("cancel_request_and_refund", {
        p_request_id: REQUEST_ID,
      })
    })
  })

  describe("❌ 실패 케이스 - 상태 전이 규칙", () => {
    it("pending → completed 직접 전이는 불가능하다", async () => {
      // Given: pending 상태 (accepted를 거쳐야 함)
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: REQUEST_ID,
          status: "pending",
          provider_id: TEST_USER_ID,
          requester_id: OTHER_USER_ID,
        },
        error: null,
      })

      // When: completed로 직접 변경 시도
      const result = await changeOrderStatus({
        requestId: REQUEST_ID,
        status: "completed",
      })

      // Then: 전이 규칙 위반 에러
      expect(result.error).toBe("현재 상태에서 변경할 수 없습니다.")
      expect(result.order).toBeUndefined()
    })

    it("completed → canceled 전이는 불가능하다", async () => {
      // Given: completed 상태
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: REQUEST_ID,
          status: "completed",
          provider_id: TEST_USER_ID,
          requester_id: OTHER_USER_ID,
        },
        error: null,
      })

      // When: canceled로 변경 시도
      const result = await changeOrderStatus({
        requestId: REQUEST_ID,
        status: "canceled",
      })

      // Then: 전이 불가
      expect(result.error).toBe("현재 상태에서 변경할 수 없습니다.")
    })
  })

  describe("❌ 실패 케이스 - 권한 검증", () => {
    it("provider도 requester도 아닌 사용자는 상태를 변경할 수 없다", async () => {
      // Given: 제3자 사용자
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: REQUEST_ID,
          status: "pending",
          provider_id: OTHER_USER_ID,
          requester_id: "another-user-789", // 둘 다 현재 사용자가 아님
        },
        error: null,
      })

      // When: 상태 변경 시도
      const result = await changeOrderStatus({
        requestId: REQUEST_ID,
        status: "accepted",
      })

      // Then: 권한 에러
      expect(result.error).toBe("이 작업을 수행할 권한이 없습니다.")
      expect(result.order).toBeUndefined()
    })

    it("requester는 의뢰 상태를 변경할 수 있다", async () => {
      // Given: requester가 현재 사용자
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: REQUEST_ID,
          status: "pending",
          provider_id: OTHER_USER_ID,
          requester_id: TEST_USER_ID, // 현재 사용자가 requester
        },
        error: null,
      })

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: REQUEST_ID, status: "canceled" },
        error: null,
      })

      // When: 취소 시도
      const result = await changeOrderStatus({
        requestId: REQUEST_ID,
        status: "canceled",
      })

      // Then: 성공 (requester도 권한 있음)
      expect(result.order).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe("❌ 실패 케이스 - 입력 검증", () => {
    it("requestId가 없으면 에러를 반환한다", async () => {
      // When: requestId 없이 호출
      const result = await changeOrderStatus({
        status: "accepted",
      })

      // Then: 입력 검증 에러
      expect(result.error).toBe("필수 정보가 누락되었습니다.")
    })

    it("status가 없으면 에러를 반환한다", async () => {
      // When: status 없이 호출
      const result = await changeOrderStatus({
        requestId: REQUEST_ID,
      })

      // Then: 입력 검증 에러
      expect(result.error).toBe("필수 정보가 누락되었습니다.")
    })

    it("유효하지 않은 status는 거부한다", async () => {
      // When: 잘못된 status
      const result = await changeOrderStatus({
        requestId: REQUEST_ID,
        status: "invalid_status" as any,
      })

      // Then: 검증 에러
      expect(result.error).toBe("유효하지 않은 상태값입니다.")
    })
  })

  describe("❌ 실패 케이스 - DB 에러", () => {
    it("의뢰가 존재하지 않으면 에러를 반환한다", async () => {
      // Given: DB 조회 실패
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found" },
      })

      // When
      const result = await changeOrderStatus({
        requestId: "nonexistent-id",
        status: "accepted",
      })

      // Then: DB 에러
      expect(result.error).toBe("의뢰 정보를 확인하는 중 오류가 발생했습니다.")
    })
  })
})
