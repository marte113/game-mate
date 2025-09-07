import React from "react"
import Link from "next/link"
import { MoveLeft } from "lucide-react"

import config from "@/config"

type HeaderCenterProps = {
  content: string
  title: string
  subtitle: string
}

const HeaderCenter = ({ content, title, subtitle }: HeaderCenterProps) => {
  return (
    <>
      <div className="text-center mb-4">
        <Link href="/" className="btn btn-ghost btn-sm">
          <MoveLeft className="w-5 h-5" />
          홈으로
        </Link>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-4">
        {title || config.appName}
      </h1>
      <p className="text-base md:text-xl font-normal tracking-tight text-center mb-8">
        {subtitle || content || ""}
      </p>
    </>
  )
}

export default HeaderCenter
