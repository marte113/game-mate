import 'server-only'

import { getServerSupabase, wrapRepo } from '@/app/apis/base'
import type { Database } from '@/types/database.types'

export type NewReview = {
  reviewer_id: string
  reviewed_id: string
  request_id: string
  rating: number
  content: string
  created_at: string
}

export async function insertReview(review: NewReview) {
  return wrapRepo('review.insertReview', async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()
    if (error) throw error
    return data
  })
}

export type ApiReviewData = Omit<Database['public']['Tables']['reviews']['Row'], 'reviewer_id' | 'reviewed_id' | 'request_id'> & {
  reviewer: { id: string; name: string | null; profile_circle_img: string | null } | null
}

export async function fetchReviewsOfReviewedUser(reviewedUserId: string): Promise<ApiReviewData[]> {
  return wrapRepo('review.fetchReviewsOfReviewedUser', async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from('reviews')
      .select(`*, reviewer:users!reviews_reviewer_id_fkey ( id, name, profile_circle_img )`)
      .eq('reviewed_id', reviewedUserId)
      .order('created_at', { ascending: false })
    if (error) throw error
    const reviews = (data || []).map((review: any) => {
      const reviewerInfo = review?.reviewer && typeof review.reviewer === 'object'
        ? { id: review.reviewer.id, name: review.reviewer.name, profile_circle_img: review.reviewer.profile_circle_img }
        : null
      const { reviewer_id, reviewed_id, request_id, reviewer: _omit, ...rest } = review
      return { ...rest, reviewer: reviewerInfo } as ApiReviewData
    })
    return reviews
  })
}


