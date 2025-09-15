import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom 환경 (컴포넌트 테스트용)
    environment: "jsdom",

    // 설정 파일
    setupFiles: ["./tests/setup.ts"],

    // 글로벌 설정
    globals: true,

    // 커버리지 설정
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "*.config.{js,ts}",
        ".next/",
        "app/api/**", // API 라우트는 통합 테스트에서 커버
      ],
    },

    // 환경별 분리 (node 환경이 필요한 테스트)
    environmentMatchGlobs: [
      ["tests/unit/**/*.node.test.ts", "node"],
      ["tests/integration/**/*.node.test.ts", "node"],
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})
