"use client"

import ErrorView from "@/components/feedback/ErrorView"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isProd = process.env.NODE_ENV === "production"
  const message = isProd
    ? "페이지를 불러오는 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요."
    : error.message

  return (
    <main className="min-h-[40vh] flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <ErrorView
          title="프로필 페이지를 불러오는 중 문제가 발생했어요"
          message={message}
          hint={isProd ? undefined : error?.digest ? `digest: ${error.digest}` : undefined}
          onRetry={reset}
          retryText="다시 시도"
        />
      </div>
    </main>
  )
}
