import 'server-only'

import { getServerSupabase, wrapRepo } from '@/app/apis/base'

export interface RequestedOrderRow {
  id: string
  requester_id: string
  provider_id: string
  status?: string
  scheduled_date?: string
  scheduled_time?: string
  // 필요 시 도메인에 맞춰 확장
  provider?: {
    id: string
    name: string
    profile_circle_img?: string | null
    is_online?: boolean | null
  }
  reviews?: Array<{ id: string }>
}

export async function fetchRequestedOrdersByUser(
  userId: string,
  options?: { status?: string }
): Promise<RequestedOrderRow[]> {
  return wrapRepo('order.fetchRequestedOrdersByUser', async () => {
    const supabase = await getServerSupabase()

    let query = supabase
      .from('requests')
      .select(`
        *,
        provider:provider_id(id, name, profile_circle_img, is_online),
        reviews!left(id)
      `)
      .eq('requester_id', userId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as unknown as RequestedOrderRow[]
  })
}

export async function fetchReceivedOrdersByProvider(
  userId: string,
  options?: { status?: string }
): Promise<RequestedOrderRow[]> {
  return wrapRepo('order.fetchReceivedOrdersByProvider', async () => {
    const supabase = await getServerSupabase()

    let query = supabase
      .from('requests')
      .select(`
        *,
        requester:requester_id(id, name, profile_circle_img, is_online)
      `)
      .eq('provider_id', userId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as unknown as RequestedOrderRow[]
  })
}

export async function fetchProviderReservations(
  providerId: string,
): Promise<Array<Pick<RequestedOrderRow, 'id' | 'scheduled_date' | 'scheduled_time' | 'status'>>> {
  return wrapRepo('order.fetchProviderReservations', async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from('requests')
      .select('id, scheduled_date, scheduled_time, status')
      .eq('provider_id', providerId)
      .in('status', ['pending', 'accepted'])
    if (error) throw error
    return (data ?? []) as any
  })
}


