import { z } from 'zod'

export const chatMessagesGetQuerySchema = z.object({
  roomId: z
    .string({ required_error: 'roomId는 필수입니다.' })
    .min(1, { message: 'roomId는 비어 있을 수 없습니다.' })
})

export const sendMessageBodySchema = z.object({
  content: z
    .string({ required_error: 'content는 필수입니다.' })
    .trim()
    .min(1, { message: '메시지 내용은 비어 있을 수 없습니다.' })
    .max(2000, { message: '메시지 내용은 2000자를 초과할 수 없습니다.' }),
  receiverId: z
    .string({ required_error: 'receiverId는 필수입니다.' })
    .min(1, { message: 'receiverId는 비어 있을 수 없습니다.' }),
  chatRoomId: z
    .string()
    .min(1, { message: 'chatRoomId는 비어 있을 수 없습니다.' })
    .optional(),
})

export type ChatMessagesGetQuery = z.infer<typeof chatMessagesGetQuerySchema>
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>
