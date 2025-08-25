import 'server-only'

import { wrapService, getServerSupabase } from '@/app/apis/base'
import { fetchReviewsOfReviewedUser } from '@/app/apis/repository/review/reviewsRepository'

export async function getProfileReviewsByPublicId(publicId: number) {
  return wrapService('profile.getProfileReviewsByPublicId', async () => {
    if (!Number.isFinite(publicId)) {
      throw new Error('Invalid Profile ID format')
    }
    const supabase = await getServerSupabase()
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('public_id', publicId)
      .single()
    if (profileError || !profileData?.user_id) {
      return { reviews: [] }
    }
    const reviews = await fetchReviewsOfReviewedUser(profileData.user_id)
    return { reviews }
  })
}


