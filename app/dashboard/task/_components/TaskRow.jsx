'use client'

import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, MoreVertical, Check, X, Edit, CheckCheck } from 'lucide-react'
import Image from 'next/image'
import { useTaskStore } from '../store/useTaskStore'
import { orderApi } from '@/app/dashboard/_api/orderApi'

export default function TaskRow({ 
  task, 
  taskType,
  activeTab,
}) {
  const openTaskDetailModal = useTaskStore((state) => state.openTaskDetailModal)
  const openReviewModal = useTaskStore((state) => state.openReviewModal)
  const queryClient = useQueryClient()

  const changeStatusMutation = useMutation({
    mutationFn: (data) => orderApi.changeOrderStatus(data),
    onSuccess: (data, variables) => {
      console.log(`[TaskRow Mutation Success] Status changed for requestId: ${variables.requestId}, status: ${variables.status}`)
      queryClient.invalidateQueries({ queryKey: ['receivedOrders'] })
      queryClient.invalidateQueries({ queryKey: ['requestedOrders'] })
    },
    onError: (error, variables) => {
      console.error(`[TaskRow Mutation Error] Error changing status for requestId: ${variables.requestId}, status: ${variables.status}`, error)
      alert(`의뢰 상태 변경 중 오류 발생: ${error.message}`)
    },
  })

  const handleChangeStatus = useCallback((requestId, status) => {
    const actionText = status === 'accepted' ? '수락' : 
                      status === 'rejected' ? '거절' : 
                      status === 'completed' ? '완료' : '취소'
                      
    if (confirm(`정말 이 의뢰를 ${actionText}하시겠습니까?`)) {
      changeStatusMutation.mutate({ requestId, status })
    }
  }, [changeStatusMutation])

  const isCurrent = task.status === 'accepted'
  const isScheduled = task.status === 'pending'
  const isPast = ['completed', 'rejected', 'canceled'].includes(task.status)
  const isReceived = activeTab === 'received'
  
  const userInfo = isReceived ? task.requester : task.provider
  
  return (
    <div className={`flex items-center justify-between p-4 border-b ${
      taskType === 'past' ? 'text-gray-400' : ''
    }`}>
      <div className="flex items-center gap-4 flex-1">
        <div className="avatar">
          <div className="w-10 rounded-full">
            <img
              src={userInfo?.profile_circle_img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.id}`}
              alt="avatar"
            />
          </div>
        </div>
        <span className="w-24">{userInfo?.name}</span>
        <span className="w-32">{task.game}</span>
        <span className="w-32 text-sm">{`${task.scheduled_date} ${task.scheduled_time.slice(0, 5)}`}</span>
        <div className="flex items-center gap-1 w-24">
          <Image
            src="/images/tokken.png"
            alt="token"
            width={16}
            height={16}
            className="w-4 h-4"
          />
          <span>{task.price}</span>
        </div>
      </div>
      
      {!isPast && (
        <>
          {isReceived && isScheduled && (
            <>
              <button 
                className="btn btn-primary btn-sm mr-2"
                onClick={() => handleChangeStatus(task.id, 'accepted')}
              >
                <Check className="w-4 h-4" />
                수락하기
              </button>
              <button 
                className="btn btn-error btn-sm"
                onClick={() => handleChangeStatus(task.id, 'rejected')}
              >
                <X className="w-4 h-4" />
                거절하기
              </button>
            </>
          )}
          
          {isReceived && isCurrent && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleChangeStatus(task.id, 'completed')}
            >
              완료하기
            </button>
          )}
          
          {!isReceived && isScheduled && (
            <button 
              className="btn btn-error btn-sm"
              onClick={() => handleChangeStatus(task.id, 'canceled')}
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
      
      {activeTab === 'requested' && taskType === 'past' && task.status === 'completed' && (
        <>
          {!task.has_review ? (
            <button
              className="btn btn-outline btn-sm text-primary hover:bg-primary hover:text-primary-content"
              onClick={() => openReviewModal(task)}
            >
              <Edit className="w-4 h-4 mr-1" />
              리뷰 남기기
            </button>
          ) : (
            <button
              className="btn btn-sm btn-disabled text-base-content/60"
              disabled
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              작성 완료
            </button>
          )}
        </>
      )}
      
      <div className="dropdown dropdown-end">
        <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
          <MoreVertical className="w-4 h-4" />
        </button>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
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
          <li><button className="text-left w-full">신고하기</button></li>
        </ul>
      </div>
    </div>
  )
} 