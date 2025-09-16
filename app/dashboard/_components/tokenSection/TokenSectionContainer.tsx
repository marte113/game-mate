"use client"

import { ReactNode } from "react"

export default function TokenSectionContainer({ children }: { children: ReactNode }) {
  return <div className="w-full min-w-0 space-y-6">{children}</div>
}
