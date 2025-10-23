// @vitest-environment node
/**
 * 의뢰 상태 변경 API 통합 테스트
 *
 * 테스트 대상: PATCH /api/order/status
 * 검증 항목:
 * 1. Zod 스키마 검증 (changeOrderStatusBodySchema)
 * 2. 서비스 레이어 호출
 * 3. 적절한 HTTP 응답 (200, 400 등)
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { PATCH } from "@/app/api/order/status/route"

// 서비스 레이어 모킹
vi.mock("@/app/apis/service/order/statusService", () => ({
  changeOrderStatus: vi.fn(),
}))

import { changeOrderStatus } from "@/app/apis/service/order/statusService"

describe("PATCH /api/order/status - 의뢰 상태 변경 API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("✅ 성공 케이스", () => {
    it("유효한 요청으로 상태 변경 시 200과 업데이트된 의뢰를 반환한다", async () => {
      // Given: 정상 서비스 응답
      const mockServiceResult = {
        order: {
          id: "request-123",
          status: "accepted",
          updated_at: "2025-01-23T12:00:00Z",
          created_at: "2025-01-23T10:00:00Z",
          game: "리그오브레전드",
          price: 1000,
          provider_id: "provider-123",
          requester_id: "requester-456",
          scheduled_date: "2025-01-25",
          scheduled_time: "14:00",
        },
      }

      vi.mocked(changeOrderStatus).mockResolvedValue(mockServiceResult)

      // When: API 요청
      const requestBody = {
        requestId: "request-123",
        status: "accepted",
      }

      const request = new NextRequest("http://localhost:3000/api/order/status", {
        method: "PATCH",
        body: JSON.stringify(requestBody),
      })

      const response = await PATCH(request)

      // Then: 200 응답 및 결과 확인
      expect(response.status).toBe(200)

      const json = await response.json()
      expect(json.order).toBeDefined()
      expect(json.order.status).toBe("accepted")
      expect(json.error).toBeUndefined()

      // 서비스 호출 확인
      expect(changeOrderStatus).toHaveBeenCalledWith({
        requestId: "request-123",
        status: "accepted",
      })
    })

    it("서비스에서 에러를 반환해도 200으로 응답한다", async () => {
      // Given: 서비스 레벨 에러
      const mockServiceResult = {
        error: "이 작업을 수행할 권한이 없습니다.",
      }

      vi.mocked(changeOrderStatus).mockResolvedValue(mockServiceResult)

      // When
      const request = new NextRequest("http://localhost:3000/api/order/status", {
        method: "PATCH",
        body: JSON.stringify({
          requestId: "request-123",
          status: "accepted",
        }),
      })

      const response = await PATCH(request)

      // Then: 200이지만 에러 메시지 포함
      expect(response.status).toBe(200)

      const json = await response.json()
      expect(json.error).toBe("이 작업을 수행할 권한이 없습니다.")
      expect(json.order).toBeUndefined()
    })
  })

  describe("❌ 실패 케이스 - 입력 검증", () => {
    it("requestId가 누락되면 400 ValidationError를 반환한다", async () => {
      // Given: requestId 없는 요청
      const request = new NextRequest("http://localhost:3000/api/order/status", {
        method: "PATCH",
        body: JSON.stringify({
          status: "accepted",
        }),
      })

      // When
      const response = await PATCH(request)

      // Then: 400 에러
      expect(response.status).toBe(400)

      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.code).toBeDefined()
      expect(json.message).toContain("유효하지 않습니다")

      // 서비스는 호출되지 않음
      expect(changeOrderStatus).not.toHaveBeenCalled()
    })

    it("status가 누락되면 400 ValidationError를 반환한다", async () => {
      // Given: status 없는 요청
      const request = new NextRequest("http://localhost:3000/api/order/status", {
        method: "PATCH",
        body: JSON.stringify({
          requestId: "request-123",
        }),
      })

      // When
      const response = await PATCH(request)

      // Then: 400 에러
      expect(response.status).toBe(400)

      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.code).toBeDefined()

      expect(changeOrderStatus).not.toHaveBeenCalled()
    })

    it("잘못된 status 값은 400 ValidationError를 반환한다", async () => {
      // Given: 유효하지 않은 status
      const request = new NextRequest("http://localhost:3000/api/order/status", {
        method: "PATCH",
        body: JSON.stringify({
          requestId: "request-123",
          status: "invalid_status",
        }),
      })

      // When
      const response = await PATCH(request)

      // Then: 400 에러
      expect(response.status).toBe(400)

      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.code).toBeDefined()

      expect(changeOrderStatus).not.toHaveBeenCalled()
    })

    it("빈 requestId는 400 ValidationError를 반환한다", async () => {
      // Given: 빈 requestId
      const request = new NextRequest("http://localhost:3000/api/order/status", {
        method: "PATCH",
        body: JSON.stringify({
          requestId: "",
          status: "accepted",
        }),
      })

      // When
      const response = await PATCH(request)

      // Then: 400 에러
      expect(response.status).toBe(400)

      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.code).toBeDefined()

      expect(changeOrderStatus).not.toHaveBeenCalled()
    })
  })

  describe("❌ 실패 케이스 - 서비스 예외", () => {
    it("서비스에서 예외가 발생하면 에러 응답을 반환한다", async () => {
      // Given: 서비스 예외
      const serviceError = new Error("Database connection failed")
      vi.mocked(changeOrderStatus).mockRejectedValue(serviceError)

      // When
      const request = new NextRequest("http://localhost:3000/api/order/status", {
        method: "PATCH",
        body: JSON.stringify({
          requestId: "request-123",
          status: "accepted",
        }),
      })

      const response = await PATCH(request)

      // Then: 에러 응답
      expect(response.status).toBeGreaterThanOrEqual(400)

      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.code).toBeDefined()
    })
  })
})
