import { z } from 'zod'

// GET /api/order/verify?roomId=...
export const verifyOrderGetQuerySchema = z.object({
  roomId: z
    .string({ required_error: 'roomId는 필수입니다.' })
    .min(1, { message: 'roomId는 비어 있을 수 없습니다.' })
})

// POST /api/order/verify
// 서비스에서 추가 비즈니스 검증을 수행하므로 여기서는 형식/필수성 위주로 검증합니다.
export const verifyOrderPostBodySchema = z.object({
  providerId: z
    .string({ required_error: 'providerId는 필수입니다.' })
    .min(1, { message: 'providerId는 비어 있을 수 없습니다.' }),
  game: z
    .string({ required_error: 'game은 필수입니다.' })
    .min(1, { message: 'game은 비어 있을 수 없습니다.' })
    .max(64, { message: 'game은 64자를 초과할 수 없습니다.' }),
  // 날짜/시간은 포맷이 다양할 수 있어 우선 비어있지 않음을 확인하고,
  // 상세 포맷 검증은 서비스 계층 또는 후속 스키마에서 강화합니다.
  scheduledDate: z
    .string({ required_error: 'scheduledDate는 필수입니다.' })
    .min(1, { message: 'scheduledDate는 비어 있을 수 없습니다.' }),
  scheduledTime: z
    .string({ required_error: 'scheduledTime는 필수입니다.' })
    .min(1, { message: 'scheduledTime는 비어 있을 수 없습니다.' }),
  // price는 문자열로 올 수도 있으므로 전처리로 숫자 변환을 허용합니다.
  price: z.preprocess((v) => {
    if (typeof v === 'string' && v.trim() !== '') return Number(v)
    return v
  }, z.number({ invalid_type_error: 'price는 숫자여야 합니다.' }).int().nonnegative({ message: 'price는 음수일 수 없습니다.' }))
})

export type VerifyOrderPostBody = z.infer<typeof verifyOrderPostBodySchema>

// 공통 상태 Enum 및 쿼리/바디 스키마들
export const orderStatusEnum = z.enum(['pending', 'accepted', 'rejected', 'completed', 'canceled'])

// GET /api/order/received, /api/order/requested
export const orderListQuerySchema = z.object({
  status: orderStatusEnum.optional()
})
export type OrderListQuery = z.infer<typeof orderListQuerySchema>

// GET /api/order/provider-reservations
export const providerReservationsGetQuerySchema = z.object({
  providerId: z.string().min(1, { message: 'providerId는 비어 있을 수 없습니다.' }).optional()
})
export type ProviderReservationsGetQuery = z.infer<typeof providerReservationsGetQuerySchema>

// PATCH /api/order/status
export const changeOrderStatusBodySchema = z.object({
  requestId: z
    .string({ required_error: 'requestId는 필수입니다.' })
    .min(1, { message: 'requestId는 비어 있을 수 없습니다.' }),
  status: orderStatusEnum
})
export type ChangeOrderStatusBody = z.infer<typeof changeOrderStatusBodySchema>
