'use server'

import { getAdminSupabase } from './client'

export async function callRpc(
  name:
    | 'aggregate_recommended_games'
    | 'cancel_request_and_refund'
    | 'complete_order_payment'
    | 'create_order_with_payment'
    | 'get_monthly_token_usage'
    | 'increment_balance'
    | 'mark_messages_as_read'
    | 'update_thumbnail',
  args?: any,
) {
  const admin = await getAdminSupabase()
  const { data, error } = await admin.rpc(name, args)
  if (error) throw error
  return data
}


