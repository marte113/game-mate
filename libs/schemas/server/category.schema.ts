import { z } from 'zod'

// GET /api/category/popular?limit=...
export const categoryPopularGetQuerySchema = z.object({
  limit: z.coerce
    .number({ invalid_type_error: 'limit은 숫자여야 합니다.' })
    .int({ message: 'limit은 정수여야 합니다.' })
    .min(1, { message: 'limit은 최소 1입니다.' })
    .max(20, { message: 'limit은 최대 20입니다.' })
    .default(6),
})

// GET /api/category?page=...
export const categoryListGetQuerySchema = z.object({
  page: z.coerce
    .number({ invalid_type_error: 'page는 숫자여야 합니다.' })
    .int({ message: 'page는 정수여야 합니다.' })
    .min(0, { message: 'page는 0 이상의 값이어야 합니다.' })
    .default(0),
})

// GET /api/category/[categoryId]/mate?page=...
export const categoryMatesParamsSchema = z.object({
  categoryId: z
    .string({ required_error: 'categoryId는 필수입니다.' })
    .min(1, { message: 'categoryId는 비어 있을 수 없습니다.' }),
})

export const categoryMatesGetQuerySchema = z.object({
  page: z.coerce
    .number({ invalid_type_error: 'page는 숫자여야 합니다.' })
    .int({ message: 'page는 정수여야 합니다.' })
    .min(0, { message: 'page는 0 이상의 값이어야 합니다.' })
    .default(0),
})

export type CategoryPopularGetQuery = z.infer<typeof categoryPopularGetQuerySchema>
export type CategoryListGetQuery = z.infer<typeof categoryListGetQuerySchema>
export type CategoryMatesParams = z.infer<typeof categoryMatesParamsSchema>
export type CategoryMatesGetQuery = z.infer<typeof categoryMatesGetQuerySchema>
