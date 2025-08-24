'use server'
import { getServerSupabase } from '@/app/apis/base'

const BUCKET_NAME = 'albums'

export async function listAlbumImages(userId: string) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('album_images')
    .select('id, image_url, order_num')
    .eq('user_id', userId)
    .order('order_num', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getUserThumbnail(userId: string) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('users')
    .select('profile_thumbnail_img')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data?.profile_thumbnail_img as string | null
}

export async function getExistingAlbumImage(userId: string, index: number) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('album_images')
    .select('id, image_url')
    .eq('user_id', userId)
    .eq('order_num', index)
    .maybeSingle()
  if (error && (error as any).code !== 'PGRST116') throw error
  return data ?? null
}

export async function deleteAlbumImageRecord(imageId: string) {
  const supabase = await getServerSupabase()
  const { error } = await supabase.from('album_images').delete().eq('id', imageId)
  if (error) throw error
}

export async function insertAlbumImage(userId: string, imageUrl: string, index: number) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('album_images')
    .insert({ user_id: userId, image_url: imageUrl, order_num: index })
    .select('id, image_url, order_num')
    .single()
  if (error) throw error
  return data
}

export async function listFirstAlbumImage(userId: string) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('album_images')
    .select('image_url')
    .eq('user_id', userId)
    .order('order_num', { ascending: true })
    .limit(1)
  if (error) throw error
  return (data && data.length > 0) ? data[0].image_url as string : null
}

export async function updateUserThumbnail(userId: string, url: string | null) {
  const supabase = await getServerSupabase()
  const { error } = await supabase
    .from('users')
    .update({ profile_thumbnail_img: url, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}

export async function uploadToAlbumBucket(userId: string, file: File, index: number) {
  const supabase = await getServerSupabase()
  const fileExt = file.name.split('.').pop()
  const fileName = `album_${index}_${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
  return { publicUrl, filePath }
}

export async function removeFromAlbumBucket(path: string) {
  const supabase = await getServerSupabase()
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])
  if (error) throw error
}


