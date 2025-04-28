'use client'

import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

import { useNotificationStore } from '@/stores/notificationStore'

export default function AlarmDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    subscribeToNotifications,
    markHeaderNotificationsAsRead
  } = useNotificationStore()

  // 알림 데이터 로드
  useEffect(() => {
    fetchNotifications()
    
    // 실시간 구독 설정
    const unsubscribe = subscribeToNotifications()
    
    return () => {
      unsubscribe()
    }
  }, [])

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 알림 클릭 처리
  const handleNotificationClick = (id: string, type: string | null, relatedId: string | null) => {
    markAsRead(id)
    setIsOpen(false)
  }

  // 시간 포맷팅
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '알 수 없음'
    
    return formatDistanceToNow(new Date(timeString), {
      addSuffix: true,
      locale: ko
    })
  }

  // 알림 타입에 따른 경로 반환
  const getNotificationPath = (type: string | null, relatedId: string | null) => {
    if (!type || !relatedId) return '#'
    
    switch (type) {
      case 'message':
        return `/dashboard/chat`
      case 'request':
      case 'accept':
      case 'reject':
      case 'cancel':
        return `/dashboard/task?id=${relatedId}`
      case 'follow':
        return `/dashboard/follow`
      default:
        return '#'
    }
  }

  // isOpen 상태 변경 시 헤더 알림만 읽음 처리
  useEffect(() => {
    if (isOpen) {
      markHeaderNotificationsAsRead()
    }
  }, [isOpen, markHeaderNotificationsAsRead])

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="btn btn-ghost btn-circle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="indicator rounded-full hover:text-gray-300">
          <Bell className="w-6 h-6" />
          {unreadCount.total > 0 && (
            <span className="badge badge-xs badge-primary indicator-item">{unreadCount.total}</span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-box shadow-xl z-50 animate-opacity border border-base-200">
          <div className="absolute -top-2 right-5 w-4 h-4 bg-base-100 transform rotate-45 border-l border-t border-base-200"></div>
          
          <div className="relative">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">알림</h3>
                {unreadCount.total > 0 && (
                  <button 
                    className="text-xs text-blue-500 hover:underline"
                    onClick={() => markAllAsRead()}
                  >
                    모두 읽음으로 표시
                  </button>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <p className="text-center py-4 text-base-content/60">새로운 알림이 없습니다</p>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <li key={notification.id}>
                      <Link
                        href={getNotificationPath(notification.type, notification.related_id)}
                        className="flex items-start gap-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer"
                        onClick={() => handleNotificationClick(notification.id, notification.type, notification.related_id)}
                      >
                        {!notification.is_read && (
                          <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{notification.content}</p>
                          <span className="text-xs text-base-content/60">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-base-200 p-2">
              <Link
                href="/dashboard/notifications"
                className="btn btn-ghost btn-sm w-full"
                onClick={() => setIsOpen(false)}
              >
                모든 알림 보기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 