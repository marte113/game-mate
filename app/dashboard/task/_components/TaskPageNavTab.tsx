'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function TaskPageNavTab() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeTab = (searchParams.get('tab') ?? 'received') as 'received' | 'requested'

  const navigate = (tab: 'received' | 'requested') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    // 기존에 id 등 다른 파라미터가 있으면 유지
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="p-6 pt-0">
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === 'received' ? 'tab-active' : ''}`}
          onClick={() => navigate('received')}
        >
          받은 의뢰
        </button>
        <button
          className={`tab ${activeTab === 'requested' ? 'tab-active' : ''}`}
          onClick={() => navigate('requested')}
        >
          신청한 의뢰
        </button>
      </div>
    </div>
  )
}
