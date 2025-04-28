'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

// MateRow 컴포넌트에 필요한 데이터 타입 정의
interface MateRowData {
  public_id: number
  nickname: string | null
  profileImageUrl: string | null
  isOnline: boolean | null
  // RecommendMate 전용 필드
  firstGame?: string | null
}

interface MateRowProps {
  mate: MateRowData
  variant: 'recommend' | 'partner' // 레이아웃 및 표시 정보 구분
}

const MateRow = React.memo(({ mate, variant }: MateRowProps) => {
  const { public_id, nickname, profileImageUrl, isOnline, firstGame } = mate

  // 온라인 상태에 따른 링 클래스 결정
  const ringClass = isOnline ? 'ring-success' : 'ring-base-300'
  // 기본 이미지 URL
  const defaultImageUrl = '/default-profile.png' // 실제 기본 이미지 경로로 변경

  return (
    <Link
      href={`/profile/${public_id}`}
      className={`flex items-center gap-3 p-1 rounded-lg hover:bg-base-200 transition-colors ${variant === 'partner' ? 'flex-col w-16 text-center' : ''}`}
    >
      {/* 프로필 이미지 */}
      <div className={`relative flex-shrink-0 ${variant === 'partner' ? 'w-10 h-10' : 'w-8 h-8'}`}>
        <Image
          src={profileImageUrl || defaultImageUrl}
          alt={nickname || '사용자 프로필'}
          fill
          className={`rounded-full object-cover ring-2 ${ringClass}`}
          sizes={variant === 'partner' ? '40px' : '32px'}
        />
      </div>

      {/* 텍스트 정보 (추천/파트너 분기) */}
      {variant === 'recommend' ? (
        // 추천 메이트 (세로)
        <div className="flex-grow min-w-0">
          <p className="text-sm font-semibold truncate text-base-content">{nickname || 'Unknown'}</p>
          {firstGame && <p className="text-xs text-base-content/70 truncate">{firstGame}</p>}
        </div>
      ) : (
        // 파트너 메이트 (가로 -> 세로 정렬됨)
        <p className="text-xs font-medium text-base-content truncate w-full mt-1">{nickname || 'Unknown'}</p>
      )}

      {/* 온라인 상태 텍스트 (추천 메이트만) */}
      {variant === 'recommend' && (
        <div className="flex-shrink-0 text-xs font-medium">
          {isOnline ? (
            <span className="text-success flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              온라인
            </span>
          ) : (
            <span className="text-base-content/50 flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-base-content/50"></span>
               오프라인
            </span>
          )}
        </div>
      )}
    </Link>
  )
})

MateRow.displayName = 'MateRow'

export default MateRow
