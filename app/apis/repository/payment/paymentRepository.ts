import 'server-only'

import { getServerSupabase, wrapRepo } from '@/app/apis/base'
import type { Database } from '@/types/database.types'

export type PaymentRecord = Pick<Database['public']['Tables']['payments']['Row'], 'payment_id' | 'status'>

export async function findPaymentByExternalId(externalPaymentId: string): Promise<PaymentRecord | null> {
  return wrapRepo('payment.findPaymentByExternalId', async () => {
    const supabase = await getServerSupabase()
    const { data } = await supabase
      .from('payments')
      .select('payment_id, status')
      .eq('external_payment_id', externalPaymentId)
      .single()
    return (data as PaymentRecord) ?? null
  })
}

export async function upsertPaymentFromPortOne(payment: any) {
  return wrapRepo('payment.upsertPaymentFromPortOne', async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from('payments')
      .upsert(
        {
          external_payment_id: payment.id,
          transaction_id: payment.transactionId,
          provider: payment.channel?.pgProvider || 'UNKNOWN',
          method_type: payment.method?.type || 'UNKNOWN',
          method_detail: payment.method,
          channel_name: payment.channel?.name || 'UNKNOWN',
          order_name: payment.orderName,
          amount_total: payment.amount?.total || 0,
          amount_paid: payment.amount?.paid || 0,
          currency: payment.currency,
          status: payment.status,
          raw_response: payment,
          receipt_url: payment.receiptUrl,
          requested_at: payment.requestedAt,
          paid_at: payment.paidAt,
        },
        { onConflict: 'external_payment_id' }
      )
      .select()
      .single()
    if (error || !data) throw error
    return data
  })
}

export async function insertTokenChargeTransaction(params: {
  userId: string
  amount: number
  paymentId: string
  description: string
}) {
  return wrapRepo('payment.insertTokenChargeTransaction', async () => {
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('token_transactions')
      .insert({
        user_id: params.userId,
        amount: params.amount,
        transaction_type: 'CHARGE',
        payment_id: params.paymentId,
        description: params.description,
      })
    if (error) throw error
  })
}

export async function getUserTokenBalance(userId: string): Promise<number> {
  return wrapRepo('payment.getUserTokenBalance', async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from('user_tokens')
      .select('balance')
      .eq('user_id', userId)
      .single()
    if (error && !String(error.message).includes('not found')) throw error
    return (data?.balance as number) ?? 0
  })
}

export async function upsertUserTokenBalance(userId: string, newBalance: number) {
  return wrapRepo('payment.upsertUserTokenBalance', async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from('user_tokens')
      .upsert(
        {
          user_id: userId,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  })
}


