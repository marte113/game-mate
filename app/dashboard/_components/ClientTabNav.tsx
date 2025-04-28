'use client'

import { useRouter, usePathname } from 'next/navigation'

interface ClientTabNavProps {
  currentTab: string
}

export default function ClientTabNav({ currentTab }: ClientTabNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams()
    params.set('tab', tab)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="tabs tabs-boxed">
      <button
        className={`tab ${currentTab === 'profile' ? 'tab-active' : ''}`}
        onClick={() => handleTabChange('profile')}
      >
        프로필
      </button>
      <button
        className={`tab ${currentTab === 'token' ? 'tab-active' : ''}`}
        onClick={() => handleTabChange('token')}
      >
        토큰
      </button>
    </div>
  )
} 