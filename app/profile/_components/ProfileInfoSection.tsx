'use client'

import { ProfileInfoSectionProps } from '@/app/profile/_types/profile.types'

export default function ProfileInfoSection({ introduction }: ProfileInfoSectionProps) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        {/* 기존에는 '게임 정보' 였으나 '소개'가 더 적합해 보임 */}
        <h3 className="font-medium mb-3">소개</h3>
        <p className="text-base-content/80 whitespace-pre-line">
          {introduction || '아직 소개가 없습니다.'}
        </p>
      </div>
    </div>
  )
}
