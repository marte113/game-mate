"use client"

import NextTopLoader from "nextjs-toploader"
import { ReactNode, useEffect } from "react"
import { Toaster } from "react-hot-toast"

import { useAuthActions, useUser } from "@/stores/authStore"
import { useNotificationStore } from "@/stores/notificationStore"
import config from "@/config"

/**
 * 전체 레이아웃을 감싸는 클라이언트 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. NextTopLoader - 페이지 이동시 상단에 로딩 프로그레스바를 표시
 * 2. Toaster - 토스트 메시지 표시 기능 제공
 * 3. Auth 초기화 - onAuthStateChange 구독으로 세션 변경 감지
 * 4. 알림 구독 - 로그인 시 실시간 알림 구독 시작
 *
 * 사용 위치:
 * - app/layout.js에서 전체 앱을 감싸는 레이아웃으로 사용됨
 *
 * 참고:
 * - "use client" 지시문이 필요한 클라이언트 사이드 기능들을 모아둔 컴포넌트
 * - ProgressBar와 NextTopLoader는 겹치지 않도록 하나만 선택해서 사용
 */
const ClientLayout = ({ children }: { children: ReactNode }) => {
  const { initialize } = useAuthActions()
  const user = useUser()
  const startNotificationSubscription = useNotificationStore((s) => s.startNotificationSubscription)

  // 인증 상태 초기화 및 onAuthStateChange 구독
  useEffect(() => {
    const unsubscribe = initialize()
    return unsubscribe
  }, [initialize])

  // 알림 실시간 구독 (로그인 상태일 때만)
  useEffect(() => {
    if (!user) return

    const unsubscribe = startNotificationSubscription()
    return unsubscribe
  }, [user, startNotificationSubscription])

  return (
    <>
      <NextTopLoader color={config.colors.main} showSpinner={false} />
      {/* 전체 페이지에서 ProgressBar 컴포넌트를 사용하고 싶으면 활성화 해주세요. 대신 NextTopLoader 컴포넌트와 겹치기 떄문에 높이 조절이나 색상 조절이 필요합니다. */}
      {/* <ProgressBar /> */}

      {children}

      {/* 토스트 메시지 표시 */}
      <Toaster
        toastOptions={{
          duration: 3000,
        }}
      />
    </>
  )
}

export default ClientLayout
