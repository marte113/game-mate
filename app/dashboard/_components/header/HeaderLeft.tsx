"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Menu } from "lucide-react"

import { useSidebarStore } from "@/stores/sidebarStore"

export default function HeaderLeft() {
  const router = useRouter()
  const { toggle, isOpen } = useSidebarStore()

  const handleLogoClick = () => {
    router.push("/")
  }

  return (
    <div className="flex items-center gap-2 pl-2 md:pl-0">
      {/* 모바일 전용 햄버거 버튼: 사이드바 토글 */}
      <button
        type="button"
        className="md:hidden btn btn-ghost btn-sm flex items-center h-[40px]"
        aria-controls="app-sidebar"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="cursor-pointer group" onClick={handleLogoClick}>
        <Image src="/icons/free-icon-gamepad.png" alt="logo" width={30} height={30} />
      </div>
    </div>
  )
}
