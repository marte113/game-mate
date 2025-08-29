'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import TaskSection from './TaskSection'
import TaskDetailModal from './TaskDetailModal'
import ReviewModal from './ReviewModal'
import { useNotificationStore } from '@/stores/notificationStore'
import { useTaskStore } from '../store/useTaskStore'
import { useTaskSubscription } from '../_hooks/useTaskSubscription'
import { useReceivedOrdersQuery, useRequestedOrdersQuery } from '@/hooks/api/orders/useOrdersQueries'

export default function TaskList() {
  const [activeTab, setActiveTab] = useState('received') // received 또는 requested
  const { markTaskNotificationsAsRead } = useNotificationStore()
  
  useEffect(() => {
    console.log('[TaskList useEffect - Notification] Marking task notifications as read')
    markTaskNotificationsAsRead()
  }, [markTaskNotificationsAsRead])
  
  useTaskSubscription()
  
  // 받은 의뢰 데이터 가져오기
  const { 
    data: receivedData,
    error: receivedError
  } = useReceivedOrdersQuery({
    enabled: activeTab === 'received',
    staleTime: 300000, // 5분 (60 * 1000ms)
  })
  
  // 신청한 의뢰 데이터 가져오기
  const { 
    data: requestedData,
    error: requestedError
  } = useRequestedOrdersQuery({
    enabled: activeTab === 'requested',
    staleTime: 300000, // 5분
  })
  
  // Zustand 스토어에서 모달 열림 상태만 가져오기
  const taskDetailModalIsOpen = useTaskStore((state) => state.taskDetailModal.isOpen)
  const reviewModalIsOpen = useTaskStore((state) => state.reviewModal.isOpen)
  
  // 의뢰를 상태별로 분류하는 함수
  const categorizeOrders = useCallback((orders) => {
    if (!orders) return { current: [], scheduled: [], past: [] }
    
    return {
      current: orders.filter(order => order.status === 'accepted'),
      scheduled: orders.filter(order => order.status === 'pending'),
      past: orders.filter(order => ['completed', 'rejected', 'canceled'].includes(order.status))
    }
  }, [])
  
  // 분류된 의뢰 데이터 - useMemo로 메모이제이션 적용
  const receivedOrders = useMemo(() => categorizeOrders(receivedData?.orders), [receivedData, categorizeOrders])
  const requestedOrders = useMemo(() => categorizeOrders(requestedData?.orders), [requestedData, categorizeOrders])
  
  // 로딩 처리
  if ((activeTab === 'received' && !receivedData) || 
      (activeTab === 'requested' && !requestedData)) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }
  
  // 에러 처리
  if ((activeTab === 'received' && receivedError) || 
      (activeTab === 'requested' && requestedError)) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <div>의뢰 목록을 불러오는 중 오류가 발생했습니다</div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (activeTab === 'received') {
      return (
        <>
          <TaskSection
            title="현재 진행 중인 의뢰"
            tasks={receivedOrders.current}
            taskType="current"
            emptyMessage="진행 중인 의뢰가 없습니다"
            activeTab={activeTab}
          />

          <TaskSection
            title="예약된 의뢰"
            tasks={receivedOrders.scheduled}
            taskType="scheduled"
            emptyMessage="예약된 의뢰가 없습니다"
            activeTab={activeTab}
          />

          <TaskSection
            title="지난 의뢰"
            tasks={receivedOrders.past}
            taskType="past"
            emptyMessage="지난 의뢰가 없습니다"
            activeTab={activeTab}
          />
        </>
      )
    } else {
      return (
        <>
          <TaskSection
            title="진행 중인 신청"
            tasks={requestedOrders.current}
            taskType="current"
            emptyMessage="진행 중인 신청이 없습니다"
            activeTab={activeTab}
          />

          <TaskSection
            title="대기 중인 신청"
            tasks={requestedOrders.scheduled}
            taskType="scheduled"
            emptyMessage="대기 중인 신청이 없습니다"
            activeTab={activeTab}
          />

          <TaskSection
            title="지난 신청"
            tasks={requestedOrders.past}
            taskType="past"
            emptyMessage="지난 신청이 없습니다"
            activeTab={activeTab}
          />
        </>
      )
    }
  }

  return (
    <div className="p-6">
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === 'received' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          받은 의뢰
        </button>
        <button
          className={`tab ${activeTab === 'requested' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('requested')}
        >
          신청한 의뢰
        </button>
      </div>

      <div className="space-y-8">
        {renderContent()}
      </div>
      
      {/* 상세 정보 모달 (isOpen과 isReceived prop만 전달) */}
      {taskDetailModalIsOpen && (
        <TaskDetailModal 
          isReceived={activeTab === 'received'}
        />
      )}
      
      {/* 리뷰 모달 렌더링 추가 (isOpen 상태만으로 제어) */}
      {reviewModalIsOpen && (
        <ReviewModal />
      )}
    </div>
  )
} 