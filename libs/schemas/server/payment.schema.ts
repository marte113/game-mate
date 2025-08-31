import { z } from 'zod'

// GET /api/payment/verify?paymentId=...
export const paymentVerifyGetQuerySchema = z.object({
  paymentId: z
    .string({ required_error: 'paymentId는 필수입니다.' })
    .min(1, { message: 'paymentId는 비어 있을 수 없습니다.' })
})

export type PaymentVerifyGetQuery = z.infer<typeof paymentVerifyGetQuerySchema>
