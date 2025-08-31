import { z } from 'zod'

// POST /api/tasks/refund
export const refundTokensPostBodySchema = z.object({
  requestId: z
    .string({ required_error: 'requestId는 필수입니다.' })
    .min(1, { message: 'requestId는 비어 있을 수 없습니다.' }),
  amount: z.preprocess((v) => {
    if (typeof v === 'string' && v.trim() !== '') return Number(v)
    return v
  }, z.number({ invalid_type_error: 'amount는 숫자여야 합니다.' }).int().positive({ message: 'amount는 양수여야 합니다.' }))
})

export type RefundTokensPostBody = z.infer<typeof refundTokensPostBodySchema>
