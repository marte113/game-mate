import { z } from 'zod'

// POST /api/storage/upload (avatar)
export const avatarUploadFormDataSchema = z.object({
  file: z
    .instanceof(File, { message: 'file은 필수이며 File 타입이어야 합니다.' })
    .refine((f) => f.type?.startsWith('image/'), { message: '이미지 파일만 업로드할 수 있습니다.' })
    .refine((f) => f.size <= 5 * 1024 * 1024, { message: '파일 크기는 5MB를 초과할 수 없습니다.' }),
})

export type AvatarUploadFormData = z.infer<typeof avatarUploadFormDataSchema>
