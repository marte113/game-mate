import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 1. 요청 데이터 파싱
    const { requestId, userId, amount } = await request.json()
    
    // 2. 트랜잭션 시작
    const { data: transaction, error: transactionError } = await supabase.rpc('begin_transaction')
    if (transactionError) throw transactionError
    
    try {
      // 3. 토큰 잔액 업데이트
      const { error: updateError } = await supabase.rpc('increment_balance', {
        user_id_param: userId,
        amount_param: amount
      })
      if (updateError) throw updateError
      
      // 4. 토큰 거래 내역 기록
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          transaction_type: 'REFUND',
          description: `의뢰 취소 반환 (의뢰 ID: ${requestId})`,
          related_user_id: null
        })
      if (transactionError) throw transactionError
      
      // 5. 트랜잭션 커밋
      const { error: commitError } = await supabase.rpc('commit_transaction')
      if (commitError) throw commitError
      
      return NextResponse.json({ success: true })
    } catch (error) {
      // 6. 오류 발생 시 롤백
      await supabase.rpc('rollback_transaction')
      throw error
    }
  } catch (error) {
    console.error('토큰 반환 중 오류 발생:', error)
    return NextResponse.json(
      { error: '토큰 반환에 실패했습니다.' },
      { status: 500 }
    )
  }
}   