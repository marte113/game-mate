// app/dashboard/chat/_utils/avatar.ts
import { DEFAULT_AVATAR_SRC } from "@/constants/image"

export const getAvatarUrl = (user?: {
  profile_circle_img?: string | null
  name?: string | null
}) => {
  return user?.profile_circle_img || DEFAULT_AVATAR_SRC
}
