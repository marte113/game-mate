import { z } from 'zod'

// GET /api/profile/review?profileId=...
export const profileReviewsGetQuerySchema = z.object({
  profileId: z.coerce
    .number({ invalid_type_error: 'profileId는 숫자여야 합니다.' })
    .int({ message: 'profileId는 정수여야 합니다.' })
    .positive({ message: 'profileId는 1 이상의 값이어야 합니다.' })
})

// POST /api/tasks/review
export const createReviewBodySchema = z.object({
  rating: z.coerce
    .number({ invalid_type_error: 'rating은 숫자여야 합니다.' })
    .int({ message: 'rating은 정수여야 합니다.' })
    .min(1, { message: 'rating은 최소 1입니다.' })
    .max(5, { message: 'rating은 최대 5입니다.' }),
  content: z
    .string()
    .trim()
    .max(1000, { message: 'content는 1000자를 초과할 수 없습니다.' })
    .optional(),
  requestId: z
    .string({ required_error: 'requestId는 필수입니다.' })
    .min(1, { message: 'requestId는 비어 있을 수 없습니다.' }),
  reviewedId: z
    .string({ required_error: 'reviewedId는 필수입니다.' })
    .min(1, { message: 'reviewedId는 비어 있을 수 없습니다.' }),
})

export type ProfileReviewsGetQuery = z.infer<typeof profileReviewsGetQuerySchema>
export type CreateReviewBody = z.infer<typeof createReviewBodySchema>
