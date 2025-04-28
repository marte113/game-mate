'use client'

import { ProfileTagsProps } from '@/app/profile/_types/profile.types'

export default function ProfileTags({ tags }: ProfileTagsProps) {
  // 태그 데이터가 없거나 비어있으면 렌더링 안 함
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h3 className="font-medium mb-3">태그</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="badge badge-outline">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
