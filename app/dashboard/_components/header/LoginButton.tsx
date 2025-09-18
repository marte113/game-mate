"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

export default function LoginButton() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleLoginClick = () => {
    const query = searchParams?.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname
    router.push(`/login?next=${encodeURIComponent(nextUrl)}`)
  }

  return (
    <button onClick={handleLoginClick} className="btn btn-primary btn-sm rounded-full px-6">
      로그인
    </button>
  )
}
