import { z } from "zod"

// GET /api/profile/public?publicId=...
export const profilePublicGetQuerySchema = z.object({
  publicId: z.coerce
    .number({ invalid_type_error: "publicId는 숫자여야 합니다." })
    .int({ message: "publicId는 정수여야 합니다." })
    .positive({ message: "publicId는 1 이상의 값이어야 합니다." }),
})

export type ProfilePublicGetQuery = z.infer<typeof profilePublicGetQuerySchema>

export const profileImageUpdateBodySchema = z.object({
  imageUrl: z
    .string({ required_error: "imageUrl은 필수입니다." })
    .min(1, { message: "imageUrl는 비어 있을 수 없습니다." }),
})

// GET /api/profile/selected-games?userId=...
export const profileSelectedGamesGetQuerySchema = z.object({
  userId: z
    .string({ required_error: "userId는 필수입니다." })
    .uuid({ message: "userId는 UUID 형식이어야 합니다." }),
})

export type ProfileSelectedGamesGetQuery = z.infer<typeof profileSelectedGamesGetQuerySchema>

// GET /api/search/users?q=... (username/nickname 검색)
export const profileSearchGetQuerySchema = z.object({
  q: z
    .string({ required_error: "q는 필수입니다." })
    .trim()
    .min(1, { message: "검색어는 1자 이상이어야 합니다." })
    .max(50, { message: "검색어는 50자 이하여야 합니다." }),
})

export type ProfileSearchGetQuery = z.infer<typeof profileSearchGetQuerySchema>
