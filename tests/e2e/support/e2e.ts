// Cypress E2E 테스트 지원 파일
// 모든 E2E 테스트 전에 자동으로 로드됩니다

/**
 * 테스트용 세션 설정 (소셜 로그인 환경)
 * 실제 로그인 플로우 대신 Supabase 세션 쿠키를 직접 설정
 */
Cypress.Commands.add("loginWithSession", (userId: string) => {
  // 테스트 환경에서 Supabase 세션 쿠키 설정
  // 실제 구현 시 테스트 계정의 access_token을 사용
  cy.setCookie("sb-access-token", `test-token-${userId}`)
  cy.setCookie("sb-refresh-token", `test-refresh-${userId}`)
})

/**
 * 로그아웃 (세션 정리)
 */
Cypress.Commands.add("logout", () => {
  cy.clearCookies()
  cy.clearLocalStorage()
})

// TypeScript 타입 정의 (ESLint namespace 규칙 비활성화)
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * 테스트용 세션으로 로그인
       * @param userId - 테스트 사용자 ID
       */
      loginWithSession(userId: string): Chainable<void>

      /**
       * 로그아웃 (세션 정리)
       */
      logout(): Chainable<void>
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export {}
