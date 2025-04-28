'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import profileApi from '@/app/profile/_api/profileApi'
import { ReviewInfo, ProfileReviewSectionProps } from '@/app/profile/_types/profile.types'

export default function ProfileReviewSection({ profileId }: ProfileReviewSectionProps) {
  const queryKey = ['profileReviews', profileId]
  const { data: reviews = [], isLoading, error } = useQuery<ReviewInfo[]>({
    queryKey: queryKey,
    queryFn: () => profileApi.getReviewsByProfileId(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
     return <div className="card bg-base-100 shadow-md"><div className="card-body"><div className="h-64 bg-base-300 rounded animate-pulse"></div></div></div>
  }
  if (error) {
     console.error("Error loading reviews:", error);
     return <div className="card bg-base-100 shadow-md"><div className="card-body"><p className="text-error">리뷰를 불러오는데 실패했습니다.</p></div></div>
  }
  if (reviews.length === 0) {
     return <div className="card bg-base-100 shadow-md"><div className="card-body"><p className="text-center text-base-content/60">아직 작성된 리뷰가 없습니다.</p></div></div>
  }


  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">사용자 의견 ({reviews.length})</h3>
          <button className="text-sm text-primary">자세히 보기</button>
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              <div className="avatar flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={review.reviewer?.profile_circle_img || '/avatar/avatar_default.jpeg'}
                    alt={review.reviewer?.name || '익명'}
                    className="object-cover w-full h-full" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{review.reviewer?.name || '익명'}</span>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (review.rating ?? 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-base-content/60 flex-shrink-0 ml-2">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="mt-2 text-sm text-base-content/80">{review.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button className="btn btn-outline btn-sm rounded-full">자세히 보기</button>
        </div>
      </div>
    </div>
  )
}
