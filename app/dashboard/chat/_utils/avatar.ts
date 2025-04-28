// app/dashboard/chat/_utils/avatar.ts
export const getAvatarUrl = (user?: { profile_circle_img?: string | null; name?: string | null }) => {
    return user?.profile_circle_img || 
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Unknown'}`
  }