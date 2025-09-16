"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Users,
  Settings,
  HelpCircle,
  Gamepad2,
  Hand,
} from "lucide-react"

import { useNotificationStore } from "@/stores/notificationStore"
import { useAuthStore } from "@/stores/authStore"
import { useSidebarStore } from "@/stores/sidebarStore"
import { Separator } from "@/components/ui/Separator"
import { useBodyScrollLock } from "@/hooks/ui/useBodyScrollLock"

import RecommendMate from "./RecommendMate"
import PartnerMate from "./PartnerMate"
import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

export default function Sidebar() {
  // 개별 selector 사용으로 불필요한 렌더 최소화
  const isOpen = useSidebarStore((s) => s.isOpen)
  const close = useSidebarStore((s) => s.close)
  const pathname = usePathname()
  const isLoggedIn = useAuthStore((state) => state.user)
  const { unreadCount, startNotificationSubscription } = useNotificationStore()
  //isopen에 의해 useNotificationStore가 재생성되더라도 zustand는 안정적인 참조를 제공하기 때문에,
  // 이전 참조를 계속 사용할 수 있습니다. 이 때문에 컴포넌트가 리렌더링되어도 useEffect의 의존성 배열은
  // 변경되지 않기 때문에, useEffect가 재실행되지 않음.

  // 알림 실시간 구독 시작(스토어가 SUBSCRIBED 시 초기 동기화를 수행)
  useEffect(() => {
    let stop: (() => void) | undefined

    if (isLoggedIn) {
      console.log("Sidebar Effect: 로그인됨. 알림 실시간 구독 시작.")
      stop = startNotificationSubscription()
    } else {
      console.log("Sidebar Effect: 로그아웃됨. 알림 관련 작업 건너뜀.")
    }

    return () => {
      if (stop) {
        console.log("Sidebar Effect Cleanup: 알림 구독 해제.")
        stop()
      } else {
        console.log("Sidebar Effect Cleanup: 해제할 구독 없음.")
      }
    }
  }, [isLoggedIn, startNotificationSubscription])

  // 라우트 변경 시(모바일 뷰) 사이드바 자동 닫기
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      close()
    }
  }, [pathname, close])

  // ESC 키로 닫기 (접근성 개선)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [close])

  // 모바일 전용 body 스크롤 락 (사이드바 열림 시에만 적용)
  useBodyScrollLock(isOpen, { onlyMobile: true, breakpoint: 767 })

  const menuItems = [
    {
      title: "일반",
      items: [
        {
          href: "/dashboard",
          label: "마이페이지",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          href: "/dashboard/task?tab=received",
          label: "의뢰",
          icon: <ClipboardList className="w-5 h-5" />,
          badge: unreadCount.request > 0 ? unreadCount.request.toString() : undefined,
        },
      ],
    },
    {
      title: "앱",
      items: [
        {
          href: "/dashboard/chat",
          label: "채팅",
          icon: <MessageSquare className="w-5 h-5" />,
          badge: unreadCount.message > 0 ? unreadCount.message.toString() : undefined,
        },
        {
          href: "/dashboard/follow",
          label: "팔로우",
          icon: <Users className="w-5 h-5" />,
          badge: unreadCount.follow > 0 ? unreadCount.follow.toString() : undefined,
        },
        {
          href: "/category",
          label: "게임 카테고리",
          icon: <Gamepad2 className="w-5 h-5" />,
        },
      ],
    },
  ]

  const commonItems = [
    {
      title: "기타",
      items: [
        {
          id: "intro",
          href: "/intro",
          label: "소개",
          icon: <Hand className="w-5 h-5" />,
        },
        {
          id: "setting",
          href: "",
          label: "설정",
          icon: <Settings className="w-5 h-5" />,
        },
        {
          id: "help",
          href: "",
          label: "도움말",
          icon: <HelpCircle className="w-5 h-5" />,
        },
      ],
    },
  ]

  return (
    <div className="w-0 flex-none md:block">
      {/* 오버레이 */}
      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={close} />}

      {/* 사이드바 */}
      <div
        id="app-sidebar"
        className={`
        overflow-y-auto hide-scrollbar fixed h-screen top-0 left-0 z-40 bg-base-100 border-r border-base-300
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
        md:fixed md:top-0 md:left-0 md:w-64 md:translate-x-0
        md:border-r md:border-base-300 md:bg-base-100 md:rounded-md
        
        `}
      >
        {/* 스크롤 가능한 내부 컨테이너 */}
        <div className="flex flex-col gap-6 p-4 pt-20">
          {/* 로고 또는 타이틀 */}
          <div className="h-16 flex items-center px-3 flex-shrink-0">
            <h1 className="text-xl font-bold">내 공간</h1>
          </div>

          {/* --- 로그인 시 보이는 메뉴 --- */}
          {isLoggedIn &&
            menuItems.map((section) => (
              <div key={section.title} className="flex-shrink-0">
                <h3 className="text-sm font-semibold text-base-content/60 mb-2 px-1">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-base-content
                        ${
                          pathname === item.href.split("?")[0]
                            ? "bg-warning text-warning-content"
                            : ""
                        }`}
                        onClick={close} // 모바일 메뉴 닫기
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-primary text-primary-content text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          {/* --- 로그인 시 메뉴와 아래 섹션 구분선 --- */}
          {isLoggedIn && <Separator className="bg-base-200 flex-shrink-0" />}

          {/* --- 추천 채널 섹션 --- */}
          <div className="flex-shrink-0">
            <QuerySectionBoundary keys={queryKeys.mates.recommended()}>
              <RecommendMate />
            </QuerySectionBoundary>
          </div>

          {/* --- 파트너 메이트 섹션 --- */}
          <div className="flex-shrink-0 mt-2">
            <QuerySectionBoundary keys={queryKeys.mates.partner()}>
              <PartnerMate />
            </QuerySectionBoundary>
          </div>

          {/* --- 공통 메뉴 구분선 --- */}
          <Separator className="my-2 bg-base-200 flex-shrink-0" />

          {/* --- 항상 보이는 메뉴 (기타) --- */}
          {commonItems.map((section) => (
            <div key={section.title} className="flex-shrink-0">
              <h3 className="text-sm font-semibold text-base-content/60 mb-2 px-1">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-base-content
                         ${
                           pathname === item.href.split("?")[0]
                             ? "bg-warning text-warning-content"
                             : ""
                         }`}
                      onClick={close}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
