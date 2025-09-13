"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { useTaskStore } from "../store/useTaskStore"
import { DEFAULT_AVATAR_SRC } from "@/constants/image"

export default function TaskDetailModal({ isReceived }: { isReceived: boolean }) {
  // 스토어에서 직접 상태와 액션 가져오기
  const isOpen = useTaskStore((state) => state.taskDetailModal.isOpen)
  const task = useTaskStore((state) => state.taskDetailModal.task)
  const closeModal = useTaskStore((state) => state.closeTaskDetailModal)

  // isOpen이 false이면 아무것도 렌더링하지 않음
  if (!isOpen || !task) return null

  // 상대방 정보 (의뢰자 또는 제공자)
  const userInfo = isReceived ? task.requester : task.provider
  const userLabel = isReceived ? "신청자" : "제공자"

  return (
    <dialog open className="modal modal-bottom sm:modal-middle modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">의뢰 상세 정보</h3>

        <div className="flex items-center mb-4">
          <div className="avatar mr-4">
            <div className="w-12 rounded-full relative">
              <Image
                src={userInfo?.profile_circle_img || DEFAULT_AVATAR_SRC}
                alt="avatar"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <p className="font-semibold">{userInfo?.name}</p>
            <p className="text-sm text-gray-500">{userLabel}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p>
            <span className="font-semibold w-24 inline-block">게임:</span> {task.game}
          </p>
          <p>
            <span className="font-semibold w-24 inline-block">예약 일시:</span>{" "}
            {task.scheduled_date} {task.scheduled_time.slice(0, 5)}
          </p>
          <p className="flex items-center">
            <span className="font-semibold w-24 inline-block">가격:</span>
            <Image
              src="/images/tokken.png"
              alt="token"
              width={16}
              height={16}
              className="w-4 h-4 mr-1"
            />
            {task.price}
          </p>
          <p>
            <span className="font-semibold w-24 inline-block">상태:</span> {task.status}
          </p>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={closeModal}
          >
            <X className="w-4 h-4" />
          </button>
          <button className="btn" onClick={closeModal}>
            닫기
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>close</button>
      </form>
    </dialog>
  )
}
