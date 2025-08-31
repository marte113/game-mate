import { z } from 'zod'

// GET /api/profile/public?publicId=...
export const profilePublicGetQuerySchema = z.object({
  publicId: z.coerce
    .number({ invalid_type_error: 'publicId는 숫자여야 합니다.' })
    .int({ message: 'publicId는 정수여야 합니다.' })
    .positive({ message: 'publicId는 1 이상의 값이어야 합니다.' })
})

export type ProfilePublicGetQuery = z.infer<typeof profilePublicGetQuerySchema>
 
 export const profileImageUpdateBodySchema = z.object({
   imageUrl: z
     .string({ required_error: 'imageUrl은 필수입니다.' })
     .min(1, { message: 'imageUrl는 비어 있을 수 없습니다.' })
 })
