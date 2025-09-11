"use client"

import { ReactNode } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/Button"

/**
 * 섹션/카드 단위의 오류 화면 공통 컴포넌트
 * - 톤앤매너: 회색/흰색/노랑
 * - 재시도 버튼: 아이콘 포함
 */
export interface ErrorViewProps {
  title?: string
  message?: string
  hint?: ReactNode
  onRetry?: () => void
  retryText?: string
}

export function ErrorView({
  title = "문제가 발생했어요",
  message = "요청을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  hint,
  onRetry,
  retryText = "다시 시도",
}: ErrorViewProps) {
  return (
    <div className="p-4">
      <div className="w-full rounded-lg border border-neutral-200 bg-base-100 shadow-sm">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base text-base-content">{title}</h3>
            <p className="mt-1 text-sm text-base-content/70">{message}</p>
            {hint ? <div className="mt-2 text-xs text-base-content/60">{hint}</div> : null}
          </div>
          {onRetry ? (
            <div className="flex-none self-center">
              <Button variant="warning" onClick={onRetry} leftIcon={<RotateCcw size={16} />}>
                {retryText}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ErrorView
