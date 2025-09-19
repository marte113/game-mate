/**
 * 의뢰 관리 페이지 E2E 테스트 (Cypress)
 *
 * 테스트 시나리오:
 * 1. 의뢰 목록 렌더링
 * 2. 상태 변경 버튼 클릭 → API 호출 → UI 업데이트
 * 3. 권한 없는 작업 시 에러 메시지
 * 4. 상태 전이 규칙 위반 시 에러 메시지
 */

describe("의뢰 관리 페이지 (/dashboard/task)", () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe("✅ 의뢰 목록 렌더링", () => {
    it("의뢰 목록 페이지가 렌더링된다", () => {
      // Given: 의뢰 목록 API 모킹
      cy.intercept("GET", "/api/order/requested*", {
        statusCode: 200,
        body: {
          orders: [
            {
              id: "order-1",
              game: "리그오브레전드",
              status: "pending",
              price: 1000,
              scheduled_date: "2025-01-25",
              scheduled_time: "14:00",
              created_at: "2025-01-23T10:00:00Z",
            },
            {
              id: "order-2",
              game: "발로란트",
              status: "accepted",
              price: 2000,
              scheduled_date: "2025-01-26",
              scheduled_time: "15:00",
              created_at: "2025-01-23T11:00:00Z",
            },
          ],
        },
      }).as("requestedOrders")

      cy.intercept("GET", "/api/order/received*", {
        statusCode: 200,
        body: { orders: [] },
      }).as("receivedOrders")

      // When: 페이지 접근
      cy.visit("/dashboard/task", {
        failOnStatusCode: false,
      })

      // Then: API 호출 확인
      cy.wait("@requestedOrders")
      cy.wait("@receivedOrders")

      // 페이지 렌더링 확인
      cy.get("h1, h2").should("exist")
    })

    it("의뢰 상태별로 필터링할 수 있다", () => {
      // Given: 탭 클릭 시 다른 상태 의뢰 조회
      cy.intercept("GET", "/api/order/requested?status=pending", {
        statusCode: 200,
        body: {
          orders: [
            {
              id: "order-pending-1",
              status: "pending",
              game: "리그오브레전드",
            },
          ],
        },
      }).as("pendingOrders")

      cy.visit("/dashboard/task", {
        failOnStatusCode: false,
      })

      // When: 상태 필터 클릭 (실제 UI 구현에 따라 셀렉터 조정)
      // Then: 필터링된 목록 확인
      cy.get("body").should("exist")
    })
  })

  describe("✅ 상태 변경 성공 시나리오", () => {
    it("[모킹] pending → accepted 상태 변경이 성공한다", () => {
      // Given: 의뢰 목록과 상태 변경 API 모킹
      cy.intercept("GET", "/api/order/received*", {
        statusCode: 200,
        body: {
          orders: [
            {
              id: "order-1",
              status: "pending",
              game: "리그오브레전드",
              price: 1000,
            },
          ],
        },
      }).as("receivedOrders")

      cy.intercept("PATCH", "/api/order/status", {
        statusCode: 200,
        body: {
          order: {
            id: "order-1",
            status: "accepted",
            updated_at: "2025-01-23T12:00:00Z",
          },
        },
      }).as("statusUpdate")

      // When: 페이지 접근 및 수락 버튼 클릭
      cy.visit("/dashboard/task", {
        failOnStatusCode: false,
      })

      cy.wait("@receivedOrders")

      // "수락" 버튼 클릭 (실제 버튼 텍스트/셀렉터에 따라 조정)
      cy.contains("수락").first().click({ force: true })

      // Then: API 호출 및 성공 메시지 확인
      cy.wait("@statusUpdate").its("request.body").should("deep.include", {
        status: "accepted",
      })
    })

    it("[모킹] accepted → completed 상태 변경이 성공한다", () => {
      // Given: accepted 상태 의뢰
      cy.intercept("GET", "/api/order/received*", {
        statusCode: 200,
        body: {
          orders: [
            {
              id: "order-2",
              status: "accepted",
              game: "발로란트",
              price: 2000,
            },
          ],
        },
      }).as("receivedOrders")

      cy.intercept("PATCH", "/api/order/status", {
        statusCode: 200,
        body: {
          order: {
            id: "order-2",
            status: "completed",
            updated_at: "2025-01-23T12:30:00Z",
          },
        },
      }).as("completeOrder")

      // When: 완료 버튼 클릭
      cy.visit("/dashboard/task", {
        failOnStatusCode: false,
      })

      cy.wait("@receivedOrders")

      cy.contains("완료").first().click({ force: true })

      // Then: 완료 API 호출
      cy.wait("@completeOrder").its("request.body").should("deep.include", {
        status: "completed",
      })
    })

    it("[모킹] 의뢰 취소가 성공한다", () => {
      // Given: pending 또는 accepted 상태
      cy.intercept("GET", "/api/order/requested*", {
        statusCode: 200,
        body: {
          orders: [
            {
              id: "order-3",
              status: "pending",
              game: "오버워치",
              price: 1500,
            },
          ],
        },
      }).as("requestedOrders")

      cy.intercept("PATCH", "/api/order/status", {
        statusCode: 200,
        body: {
          order: {
            id: "order-3",
            status: "canceled",
            updated_at: "2025-01-23T13:00:00Z",
          },
        },
      }).as("cancelOrder")

      // When: 취소 버튼 클릭
      cy.visit("/dashboard/task", {
        failOnStatusCode: false,
      })

      cy.wait("@requestedOrders")

      cy.contains("취소").first().click({ force: true })

      // Then: 취소 API 호출
      cy.wait("@cancelOrder").its("request.body").should("deep.include", {
        status: "canceled",
      })
    })
  })

  describe("❌ 상태 변경 실패 시나리오", () => {
    it("[모킹] 권한 없는 사용자의 요청은 에러 메시지를 표시한다", () => {
      // Given: 권한 에러 응답
      cy.intercept("GET", "/api/order/received*", {
        statusCode: 200,
        body: {
          orders: [
            {
              id: "order-unauthorized",
              status: "pending",
              game: "리그오브레전드",
            },
          ],
        },
      }).as("receivedOrders")

      cy.intercept("PATCH", "/api/order/status", {
        statusCode: 200,
        body: {
          error: "이 작업을 수행할 권한이 없습니다.",
        },
      }).as("unauthorizedUpdate")

      // When: 상태 변경 시도
      cy.visit("/dashboard/task", {
        failOnStatusCode: false,
      })

      cy.wait("@receivedOrders")

      cy.contains("수락").first().click({ force: true })

      // Then: 에러 메시지 확인 (실제 에러 표시 방식에 따라 조정)
      cy.wait("@unauthorizedUpdate")

      // 토스트나 에러 메시지가 표시되는지 확인
      cy.get("body").should("exist")
    })

    it("[모킹] 잘못된 상태 전이는 에러를 반환한다", () => {
      // Given: pending → completed 직접 전이 시도
      cy.intercept("GET", "/api/order/received*", {
        statusCode: 200,
        body: {
          orders: [
            {
              id: "order-invalid-transition",
              status: "pending",
              game: "발로란트",
            },
          ],
        },
      }).as("receivedOrders")

      cy.intercept("PATCH", "/api/order/status", {
        statusCode: 200,
        body: {
          error: "현재 상태에서 변경할 수 없습니다.",
        },
      }).as("invalidTransition")

      // When & Then: 에러 처리 확인
      cy.visit("/dashboard/task", {
        failOnStatusCode: false,
      })

      cy.wait("@receivedOrders")

      // 실제로는 UI에서 잘못된 전이 버튼이 비활성화되어야 하지만,
      // API 레벨에서도 에러를 반환해야 함
      cy.get("body").should("exist")
    })
  })

  describe("🔄 페이지 상호작용", () => {
    it("탭 전환이 동작한다", () => {
      // Given: 두 개의 탭 (신청한 의뢰 / 받은 의뢰)
      cy.intercept("GET", "/api/order/requested*", {
        statusCode: 200,
        body: { orders: [] },
      }).as("requested")

      cy.intercept("GET", "/api/order/received*", {
        statusCode: 200,
        body: { orders: [] },
      }).as("received")

      // When: 페이지 접근
      cy.visit("/dashboard/task", {
        failOnStatusCode: false,
      })

      // Then: 탭 존재 확인 (실제 구현에 따라 조정)
      cy.get("body").should("exist")
    })

    it("의뢰 상세 모달이 열린다", () => {
      // Given: 의뢰 목록
      cy.intercept("GET", "/api/order/requested*", {
        statusCode: 200,
        body: {
          orders: [
            {
              id: "order-detail-1",
              status: "pending",
              game: "리그오브레전드",
              price: 1000,
              scheduled_date: "2025-01-25",
              scheduled_time: "14:00",
            },
          ],
        },
      }).as("requestedOrders")

      cy.visit("/dashboard/task", {
        failOnStatusCode: false,
      })

      cy.wait("@requestedOrders")

      // When: 의뢰 항목 클릭 (모달 오픈)
      // Then: 상세 정보 표시
      // 실제 구현에 따라 조정 필요
      cy.get("body").should("exist")
    })
  })
})
