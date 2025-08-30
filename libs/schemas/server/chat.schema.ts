import { z } from 'zod'

// params for GET /api/chat/room/[roomId]
export const chatRoomParamsSchema = z.object({
  roomId: z
    .string({ required_error: 'roomId는 필수입니다.' })
    .min(1, { message: 'roomId는 비어 있을 수 없습니다.' })
})

export type ChatRoomParams = z.infer<typeof chatRoomParamsSchema>
 
 // params for POST /api/chat/users/[userId]/chat
 export const chatUserParamsSchema = z.object({
   userId: z
     .string({ required_error: 'userId는 필수입니다.' })
     .min(1, { message: 'userId는 비어 있을 수 없습니다.' })
 })
