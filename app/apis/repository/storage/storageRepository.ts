import 'server-only'

import { getServerSupabase, wrapRepo } from '@/app/apis/base'

export async function uploadAvatar(path: string, buffer: Uint8Array, contentType: string) {
  return wrapRepo('storage.uploadAvatar', async () => {
    const supabase = await getServerSupabase()
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, buffer, { contentType, cacheControl: '3600', upsert: true })
    if (error) throw error
  })
}

export async function getAvatarPublicUrl(path: string): Promise<string> {
  return wrapRepo('storage.getAvatarPublicUrl', async () => {
    const supabase = await getServerSupabase()
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  })
}


