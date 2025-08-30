import { z } from 'zod'

// POST /api/profile/image/image_gallery (form-data)
export const albumUploadFormDataSchema = z.object({
  file: z
    .instanceof(File, { message: 'file은 필수입니다.' })
    .refine((f) => f.type?.startsWith('image/'), { message: '이미지 파일만 업로드할 수 있습니다.' })
    .refine((f) => f.size <= 5 * 1024 * 1024, { message: '파일 크기는 5MB를 초과할 수 없습니다.' }),
  index: z.coerce
    .number({ invalid_type_error: 'index는 숫자여야 합니다.' })
    .int({ message: 'index는 정수여야 합니다.' })
    .min(0, { message: 'index는 0 이상이어야 합니다.' })
    .max(5, { message: 'index는 5 이하여야 합니다.' }),
})

// DELETE /api/profile/image/image_gallery
export const albumDeleteBodySchema = z.object({
  imageId: z
    .string({ required_error: 'imageId는 필수입니다.' })
    .min(1, { message: 'imageId는 비어 있을 수 없습니다.' })
})

// PATCH /api/profile/image/image_gallery
export const albumSetThumbnailBodySchema = z.object({
  imageUrl: z
    .string({ required_error: 'imageUrl은 필수입니다.' })
    .min(1, { message: 'imageUrl은 비어 있을 수 없습니다.' })
})

export type AlbumUploadFormData = z.infer<typeof albumUploadFormDataSchema>
export type AlbumDeleteBody = z.infer<typeof albumDeleteBodySchema>
export type AlbumSetThumbnailBody = z.infer<typeof albumSetThumbnailBodySchema>
