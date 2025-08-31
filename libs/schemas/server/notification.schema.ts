import { z } from 'zod'

// POST /api/notifications/mark-chat-read
export const markChatReadPostBodySchema = z.object({
  chatRoomId: z
    .string({ required_error: 'chatRoomId는 필수입니다.' })
    .min(1, { message: 'chatRoomId는 비어 있을 수 없습니다.' })
})
export type MarkChatReadPostBody = z.infer<typeof markChatReadPostBodySchema>

// POST /api/notifications/mark-read
export const markReadPostBodySchema = z.object({
  notificationId: z
    .string({ required_error: 'notificationId는 필수입니다.' })
    .min(1, { message: 'notificationId는 비어 있을 수 없습니다.' })
})
export type MarkReadPostBody = z.infer<typeof markReadPostBodySchema>
