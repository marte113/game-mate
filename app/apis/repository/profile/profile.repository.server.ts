import 'server-only'
import { createServerClientComponent } from '@/supabase/functions/server'

export async function repoGetProfileUserIdByPublicId(publicId: number) {
  const supabase = await createServerClientComponent()
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('public_id', publicId)
    .maybeSingle()

  if (error) return { userId: null as string | null, error }
  return { userId: data?.user_id ?? null, error: null as unknown as null }
}

// Fetch full public profile by publicId by joining profiles and users
// Returns merged shape compatible with PrefetchedProfileData
export async function repoGetPublicProfile(publicId: number) {
  const supabase = await createServerClientComponent()

  const { data: profileInfo, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, nickname, follower_count, description, selected_tags, youtube_urls, selected_games')
    .eq('public_id', publicId)
    .single()

  if (profileError || !profileInfo || !profileInfo.user_id) {
    return { data: null as null, error: profileError ?? new Error('Profile not found') }
  }

  const { data: userInfo, error: userError } = await supabase
    .from('users')
    .select('id, name, profile_circle_img, is_online')
    .eq('id', profileInfo.user_id)
    .single()

  if (userError || !userInfo) {
    return { data: null as null, error: userError ?? new Error('User not found') }
  }

  const merged = {
    ...userInfo,
    ...profileInfo,
    user_id: userInfo.id,
    public_id: publicId,
  }

  return { data: merged, error: null as unknown as null }
}


