import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "tests/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "tests/e2e/support/e2e.ts",
    videosFolder: "tests/e2e/videos",
    screenshotsFolder: "tests/e2e/screenshots",

    setupNodeEvents(on, config) {
      // 필요한 플러그인 추가 가능
    },

    // 타임아웃 설정
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,

    // 뷰포트 설정 (데스크탑 기본)
    viewportWidth: 1280,
    viewportHeight: 720,

    // 실패 시 자동 재시도
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
})
