"use client"

import { useMobileView } from "@/stores/chatUiStore"
import { cn } from "@/utils/classname"

export default function RightSection({ children }: { children: React.ReactNode }) {
  const mobileView = useMobileView()

  return (
    <div
      className={cn(
        "bg-base-100 rounded-lg shadow-xl h-full flex-1 min-w-0",
        mobileView === "room" ? "flex" : "hidden md:flex",
      )}
    >
      {children}
    </div>
  )
}
