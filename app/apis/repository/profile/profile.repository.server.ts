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


