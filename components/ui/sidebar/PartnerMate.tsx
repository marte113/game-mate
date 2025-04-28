'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Loader2, ExternalLink } from 'lucide-react'
import React from 'react'

import MateRow from './MateRow'
import { fetchPartnerMates } from './mateApi'

const PartnerMate = React.memo(() => {
  const { data: mates, isLoading, isError, error } = useQuery({
    queryKey: ['partnerMates'],
    queryFn: fetchPartnerMates,
    staleTime: 10 * 60 * 1000, // 10분 동안 캐시 유지 (파트너는 덜 자주 바뀔 수 있음)
    refetchOnWindowFocus: false,
  })

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin text-base-content/50" />
        </div>
      )
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-24 text-center text-error">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p className="text-sm mb-1">파트너 로딩 실패</p>
          <p className="text-xs">{(error as Error)?.message || '알 수 없는 오류'}</p>
        </div>
      )
    }

    if (!mates || mates.length === 0) {
      return <p className="text-sm text-center text-base-content/60 py-4">파트너 메이트가 없습니다.</p>
    }

    return (
      // 가로 스크롤 또는 flex-wrap 등을 고려할 수 있으나, 우선 4개 고정으로 가정
      <div className="flex justify-around gap-2 mt-1">
        {mates.map((mate) => (
          <MateRow key={mate.public_id} mate={mate} variant="partner" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <h3 className="text-sm font-semibold text-base-content/60">파트너 메이트</h3>
        {/* 외부 링크 아이콘 등 추가 가능 */}
        <ExternalLink className="w-3 h-3 text-base-content/60" />
      </div>
      {renderContent()}
    </div>
  )
})

PartnerMate.displayName = 'PartnerMate'

export default PartnerMate

//파트너 메이트 섹션을 담당할 컴포넌트
//