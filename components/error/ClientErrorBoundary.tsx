"use client"

import type { ReactNode } from "react"
import { ErrorBoundary, type FallbackProps, type ErrorBoundaryProps } from "react-error-boundary"

import ErrorView from "@/components/feedback/ErrorView"

type WithFallback = { fallback: ReactNode; fallbackRender?: never }
type WithFallbackRender = {
  fallback?: never
  fallbackRender?: (args: { error: Error; reset: () => void }) => ReactNode
}
type WithoutFallback = { fallback?: undefined; fallbackRender?: undefined }

type BaseProps = {
  children: ReactNode
  resetKeys?: Array<unknown>
  onError?: ErrorBoundaryProps["onError"]
  onReset?: () => void
}

export type ClientErrorBoundaryProps = BaseProps &
  (WithFallback | WithFallbackRender | WithoutFallback)

/**
 * 섹션/카드 단위에서 부분 리렌더링을 가능하게 하는 클라이언트 에러 바운더리
 * - 내부적으로 react-error-boundary를 사용합니다.
 */
export default function ClientErrorBoundary({
  children,
  fallback,
  fallbackRender,
  resetKeys,
  onError,
  onReset,
}: ClientErrorBoundaryProps) {
  const defaultFallbackRender = ({ error, resetErrorBoundary }: FallbackProps) => (
    <ErrorView
      title="문제가 발생했어요"
      message={error?.message || "요청을 처리하는 중 오류가 발생했습니다."}
      onRetry={resetErrorBoundary}
    />
  )

  const adaptedFallbackRender = fallbackRender
    ? ({ error, resetErrorBoundary }: FallbackProps) =>
        fallbackRender({ error, reset: resetErrorBoundary })
    : undefined

  return (
    <ErrorBoundary
      onError={onError}
      onReset={onReset}
      resetKeys={resetKeys}
      {...(adaptedFallbackRender
        ? { fallbackRender: adaptedFallbackRender }
        : fallback
          ? { fallback }
          : { fallbackRender: defaultFallbackRender })}
    >
      {children}
    </ErrorBoundary>
  )
}
