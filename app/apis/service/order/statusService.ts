'use server'
import { getCurrentUserId } from '@/app/apis/base/auth'
import { getServerSupabase, callRpc } from '@/app/apis/base'

type Status = 'pending' | 'accepted' | 'rejected' | 'completed' | 'canceled'

function canTransition(prev: Status | null, next: Status): boolean {
  if (next === 'accepted' || next === 'rejected') return prev === 'pending'
  if (next === 'completed') return prev === 'accepted'
  if (next === 'canceled') return !prev || ['pending','accepted'].includes(prev)
  return false
}

export async function changeOrderStatus(body: { requestId?: string; status?: Status }) {
  const userId = await getCurrentUserId()
  const { requestId, status } = body
  if (!requestId || !status) return { error: '필수 정보가 누락되었습니다.' }
  const valid: Status[] = ['pending','accepted','rejected','completed','canceled']
  if (!valid.includes(status)) return { error: '유효하지 않은 상태값입니다.' }

  const supabase = await getServerSupabase()
  const { data: requestData, error: reqErr } = await supabase
    .from('requests').select('*').eq('id', requestId).single()
  if (reqErr || !requestData) return { error: '의뢰 정보를 확인하는 중 오류가 발생했습니다.' }

  if (requestData.provider_id !== userId && requestData.requester_id !== userId) {
    return { error: '이 작업을 수행할 권한이 없습니다.' }
  }

  const prev = (requestData.status ?? null) as Status | null
  if (!canTransition(prev, status)) return { error: '현재 상태에서 변경할 수 없습니다.' }

  const { data: updated, error: updateError } = await supabase
    .from('requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single()
  if (updateError) return { error: '의뢰 상태 업데이트 중 오류가 발생했습니다: ' + updateError.message }

  if (status === 'completed') {
    await callRpc('complete_order_payment', { p_order_id: requestId })
  } else if (status === 'canceled' || status === 'rejected') {
    await callRpc('cancel_request_and_refund', { p_request_id: requestId })
  }

  return { order: updated }
}


