'use client'

import { RefreshCw, ChevronUp, Loader2, AlertTriangle } from 'lucide-react'
import React from 'react'

import { useRecommendedMatesQuery } from '@/hooks/api/mates/useMateQueries'

import MateRow from './MateRow'

const RecommendMate = React.memo(() => {
  const { data: mates, isLoading, isError, error, refetch } = useRecommendedMatesQuery()

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-base-content/50" />
        </div>
      )
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-center text-error">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p className="text-sm mb-1">추천 메이트 로딩 실패</p>
          <p className="text-xs">{(error as Error)?.message || '알 수 없는 오류'}</p>
        </div>
      )
    }

    if (!mates || mates.length === 0) {
      return <p className="text-sm text-center text-base-content/60 py-4">추천 메이트가 없습니다.</p>
    }

    return (
      <ul className="flex flex-col gap-1">
        {mates.map((mate) => (
          <li key={mate.public_id}>
            <MateRow mate={mate} variant="recommend" />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-base-content/60">추천 메이트</h3>
        {/* TODO: 접기/펼치기 기능 추가 */}
        <div className="flex gap-1">
          <button
            onClick={() => refetch()}
            className="btn btn-ghost btn-xs p-1" // 버튼 크기 및 패딩 조절
            aria-label="새로고침"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button className="btn btn-ghost btn-xs p-1" aria-label="접기">
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>
      </div>
      {renderContent()}
      {/* 더보기 버튼 (필요하다면) */}
      {/* <button className="btn btn-ghost btn-xs w-full mt-2">더보기</button> */}
    </div>
  )
})

RecommendMate.displayName = 'RecommendMate'

export default RecommendMate

// 추천 메이트 섹션을 담당할 컴포넌트
//