"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, 
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";

import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import { Separator } from "@/components/ui/Separator";

import RecommendMate from "./ui/sidebar/RecommendMate";
import PartnerMate from "./ui/sidebar/PartnerMate";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((state) => state.user);
  const { unreadCount, fetchNotifications, setupNotificationSubscription } =
    useNotificationStore();
  //isopen에 의해 useNotificationStore가 재생성되더라도 zustand는 안정적인 참조를 제공하기 때문에,
  // 이전 참조를 계속 사용할 수 있습니다. 이 때문에 컴포넌트가 리렌더링되어도 useEffect의 의존성 배열은
  // 변경되지 않기 때문에, useEffect가 재실행되지 않음.

  // 알림 데이터 로드
  useEffect(() => {
    let unsubscribe: (() => void) | undefined; // 구독 해제 함수를 저장할 변수

    if (isLoggedIn) {
      // 로그인 상태일 때만 알림 로드 및 구독 설정
      console.log("Sidebar Effect: 로그인됨. 알림 로드 및 구독 시작.");
      fetchNotifications();
      unsubscribe = setupNotificationSubscription(); // 구독 설정하고 해제 함수 저장
    } else {
      // 로그아웃 상태일 때는 아무 작업 안 함
      console.log("Sidebar Effect: 로그아웃됨. 알림 관련 작업 건너뜀.");
    }

    // 클린업 함수: 컴포넌트 언마운트 시 또는 isLoggedIn 변경 시 이전 effect 정리
    return () => {
      if (unsubscribe) {
        // 저장된 구독 해제 함수가 있다면 호출
        console.log("Sidebar Effect Cleanup: 알림 구독 해제.");
        unsubscribe();
      } else {
        console.log("Sidebar Effect Cleanup: 해제할 구독 없음.");
      }
    };
    // 의존성: isLoggedIn 상태와 스토어에서 가져온 안정적인 함수들
  }, [isLoggedIn, fetchNotifications, setupNotificationSubscription]);

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
          badge:
            unreadCount.request > 0
              ? unreadCount.request.toString()
              : undefined,
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
          badge:
            unreadCount.message > 0
              ? unreadCount.message.toString()
              : undefined,
        },
        {
          href: "/dashboard/follow",
          label: "팔로우",
          icon: <Users className="w-5 h-5" />,
          badge:
            unreadCount.follow > 0 ? unreadCount.follow.toString() : undefined,
        },
      ],
    },
  ];

  const commonItems = [
    {
      title: "기타",
      items: [
        {
          href: "/dashboard/settings",
          label: "설정",
          icon: <Settings className="w-5 h-5" />,
        },
        {
          href: "/dashboard/help",
          label: "도움말",
          icon: <HelpCircle className="w-5 h-5" />,
        },
      ],
    },
  ];

  return (
    <div className="relative md:block">
      {/* 모바일 메뉴 버튼 */}
      <button
        className="md:hidden absolute top-2 left-1 btn btn-ghost btn-sm flex items-center h-[40px] z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 오버레이 */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
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
                          pathname === item.href.split('?')[0]
                            ? "bg-warning text-warning-content"
                            : ""
                        }`}
                        onClick={() => setIsOpen(false)} // 모바일 메뉴 닫기
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
            <RecommendMate />
          </div>

          {/* --- 파트너 메이트 섹션 --- */}
          <div className="flex-shrink-0 mt-2">
            <PartnerMate />
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
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-base-content
                         ${
                           pathname === item.href.split('?')[0]
                             ? "bg-warning text-warning-content"
                             : ""
                         }`}
                      onClick={() => setIsOpen(false)}
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
  );
}
