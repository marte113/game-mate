import "server-only"
import { repoGetPublicProfile } from "@/app/apis/repository/profile/profile.repository.server"
import { repoGetUserMinimalById } from "@/app/apis/repository/user/user.repository.server"
import type { PrefetchedProfileData } from "@/app/profile/_types/profile.types"
import { wrapService } from "@/app/apis/base/errors"

export async function svcGetPublicProfile(publicId: number): Promise<PrefetchedProfileData | null> {
  return wrapService("profile.svcGetPublicProfile", async () => {
    if (!Number.isFinite(publicId)) return null

    const { data: profileInfo, error: profileErr } = await repoGetPublicProfile(publicId)
    if (profileErr) throw profileErr
    if (!profileInfo) return null

    const { data: userInfo, error: userErr } = await repoGetUserMinimalById(profileInfo.user_id)
    if (userErr) throw userErr
    if (!userInfo) return null

    const merged: PrefetchedProfileData = {
      id: userInfo.id,
      name: userInfo.name,
      profile_circle_img: userInfo.profile_circle_img,
      is_online: userInfo.is_online,
      user_id: profileInfo.user_id,
      nickname: profileInfo.nickname,
      follower_count: profileInfo.follower_count,
      description: profileInfo.description,
      selected_tags: profileInfo.selected_tags,
      youtube_urls: profileInfo.youtube_urls,
      selected_games: profileInfo.selected_games,
      public_id: publicId,
    }

    return merged
  })
}
