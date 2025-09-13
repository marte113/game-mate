"use client"

import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MessageSquare, MoreVertical, Check, X, Edit, Ban } from "lucide-react"
import Image from "next/image"
import { DEFAULT_AVATAR_SRC } from "@/constants/image"
import { formatRelativeFromNow } from "@/utils/date"

import { orderApi } from "@/app/dashboard/_api/orderApi"
import type { ChangeOrderStatusRequest } from "@/app/dashboard/_api/orderApi"
import type { OrderResponse } from "@/app/dashboard/_api/orderApi"
import type { Order } from "../_types/orderTypes"
import { queryKeys } from "@/constants/queryKeys"

import { useTaskStore } from "../store/useTaskStore"

type Props = {
  task: Order
  taskType: "current" | "scheduled" | "past"
  activeTab: "received" | "requested"
  // 게임 한글 타이틀(description/name) -> 이미지 URL 매핑
  gameImageMap?: Record<string, string | null>
}

export default function TaskRow({ task, taskType, activeTab, gameImageMap }: Props) {
  const openTaskDetailModal = useTaskStore((state) => state.openTaskDetailModal)
  const openReviewModal = useTaskStore((state) => state.openReviewModal)
  const queryClient = useQueryClient()

  const changeStatusMutation = useMutation<OrderResponse, Error, ChangeOrderStatusRequest>({
    mutationFn: (data: ChangeOrderStatusRequest) => orderApi.changeOrderStatus(data),
    onSuccess: (data, variables) => {
      console.log(
        `[TaskRow Mutation Success] Status changed for requestId: ${variables.requestId}, status: ${variables.status}`,
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.received() })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.requested() })
    },
    onError: (error, variables) => {
      console.error(
        `[TaskRow Mutation Error] Error changing status for requestId: ${variables.requestId}, status: ${variables.status}`,
        error,
      )
      alert(`의뢰 상태 변경 중 오류 발생: ${error.message}`)
    },
  })

  const handleChangeStatus = useCallback(
    (requestId: string, status: ChangeOrderStatusRequest["status"]) => {
      const actionText =
        status === "accepted"
          ? "수락"
          : status === "rejected"
            ? "거절"
            : status === "completed"
              ? "완료"
              : "취소"

      if (confirm(`정말 이 의뢰를 ${actionText}하시겠습니까?`)) {
        changeStatusMutation.mutate({ requestId, status })
      }
    },
    [changeStatusMutation],
  )

  const isCurrent = task.status === "accepted"
  const isScheduled = task.status === "pending"
  const isPast = ["completed", "rejected", "canceled"].includes(task.status ?? "")
  const isReceived = activeTab === "received"

  const userInfo = isReceived ? task.requester : task.provider

  // 모바일에서 사용할 상대 시간 텍스트
  const RelativeTime = formatRelativeFromNow(`${task.scheduled_date}T${task.scheduled_time}`)

  return (
    <div
      className={`flex items-center justify-between p-4 border-b ${
        taskType === "past" ? "text-gray-400" : ""
      }`}
    >
      {/* 데스크탑 레이아웃 (>660px) */}
      <div className="flex items-center gap-4 flex-1 max-[660px]:hidden">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full relative overflow-hidden">
            <Image
              src={userInfo?.profile_circle_img || DEFAULT_AVATAR_SRC}
              alt="avatar"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        </div>
        <span className="w-24 font-semibold">{userInfo?.name}</span>
        <div className="w-40 flex items-center gap-2 min-w-0">
          {(() => {
            const key = typeof task.game === "string" ? task.game : ""
            const gameImg = key ? (gameImageMap?.[key] ?? null) : null
            if (!gameImg) return null
            return (
              <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                <Image
                  src={gameImg}
                  alt={`${key} image`}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
            )
          })()}
          <div className="truncate">{task.game}</div>
        </div>
        <span className="w-32 text-sm">{RelativeTime}</span>
        <div className="flex items-center gap-1 w-24">
          <Image src="/images/tokken.png" alt="token" width={16} height={16} className="w-4 h-4" />
          <span>{task.price}</span>
        </div>
      </div>

      {/* 모바일 레이아웃 (≤660px): 1행 - 아바타+이름+날짜(상대), 2행 - 가격+게임 */}
      <div className="hidden max-[660px]:flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <div className="avatar">
            <div className="w-9 h-9 rounded-full relative overflow-hidden">
              <Image
                src={userInfo?.profile_circle_img || DEFAULT_AVATAR_SRC}
                alt="avatar"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          </div>
          <span className="text-sm text-base-content/80 mr-auto font-semibold">
            {userInfo?.name}
          </span>
          <div className="text-xs text-base-content/60 flex items-end h-9 mt-1">{RelativeTime}</div>
        </div>
        <div className="mt-1 flex items-center justify-between gap-4 text-sm text-base-content/80">
          <div className="flex items-center gap-1">
            <Image
              src="/images/tokken.png"
              alt="token"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <span className="font-semibold">{task.price}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            {(() => {
              const key = typeof task.game === "string" ? task.game : ""
              const gameImg = key ? (gameImageMap?.[key] ?? null) : null
              if (!gameImg) return null
              return (
                <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={gameImg}
                    alt={`${key} image`}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
              )
            })()}
            <span className="truncate font-semibold">{task.game}</span>
          </div>
        </div>
      </div>

      {!isPast && (
        <>
          {isReceived && isScheduled && (
            <>
              <button
                className="btn btn-primary btn-sm mr-2"
                onClick={() => handleChangeStatus(task.id, "accepted")}
              >
                <Check className="w-4 h-4" />
                수락하기
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={() => handleChangeStatus(task.id, "rejected")}
              >
                <X className="w-4 h-4" />
                거절하기
              </button>
            </>
          )}

          {isReceived && isCurrent && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleChangeStatus(task.id, "completed")}
            >
              완료하기
            </button>
          )}

          {!isReceived && isScheduled && (
            <button
              className="btn btn-error btn-sm"
              onClick={() => handleChangeStatus(task.id, "canceled")}
            >
              <X className="w-4 h-4" />
              취소하기
            </button>
          )}

          <button className="btn btn-ghost btn-circle btn-sm ml-2">
            <MessageSquare className="w-4 h-4" />
          </button>
        </>
      )}

      {activeTab === "requested" && taskType === "past" && task.status === "completed" && (
        <>
          {!task.has_review ? (
            <button
              className=" text-primary hover:text-primary-content ml-3"
              onClick={() => openReviewModal(task)}
            >
              <Edit className="w-5 h-5 mr-1" />
            </button>
          ) : (
            <button className="text-base-content/60 ml-3" disabled>
              <Edit className="w-5 h-5 mr-1" />
            </button>
          )}
        </>
      )}

      {activeTab === "requested" && taskType === "past" && task.status === "canceled" && (
        <div className="flex items-center gap-1 text-error/70 ml-3">
          <Ban className="w-5 h-5" />
          <span className="sr-only">취소됨</span>
        </div>
      )}

      <div className="dropdown dropdown-end">
        <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
          <MoreVertical className="w-4 h-4" />
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <button
              className="text-left w-full"
              onClick={(e) => {
                e.stopPropagation()
                openTaskDetailModal(task)
              }}
            >
              상세 정보
            </button>
          </li>
          <li>
            <button className="text-left w-full">신고하기</button>
          </li>
        </ul>
      </div>
    </div>
  )
}
