import type { Database } from '@/types/database.types'

export type ApiReviewData = Omit<Database['public']['Tables']['reviews']['Row'], 'reviewer_id' | 'reviewed_id' | 'request_id'> & {
  reviewer: { id: string; name: string | null; profile_circle_img: string | null } | null
}


