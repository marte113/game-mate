"use client"

import { Button } from "@/components/ui/Button"
import { isAppError } from "@/libs/api/errors"

// TaskPage 세그먼트 전용 에러 경계 컴포넌트
// React Query의 suspense 모드에서 발생한 오류를 포착해 사용자 친화적으로 안내
export default function TaskPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const message = isAppError(error)
    ? error.message
    : "의뢰 목록을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."

  return (
    <div className="p-6 min-h-[40vh] flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="alert alert-error shadow-md">
          <div className="flex-1">
            <h2 className="font-semibold text-base">오류가 발생했어요</h2>
            <p className="text-sm opacity-90 mt-1 break-words">{message}</p>
          </div>
          <div className="flex-none">
            <Button variant="error" onClick={() => reset()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
