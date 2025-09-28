export type PublicProfileResponse = {
  data: {
    id: string
    name: string | null
    profile_circle_img: string | null
    is_online: boolean | null
    user_id: string
    nickname: string | null
    follower_count: number | null
    description: string | null
    selected_tags: readonly string[] | null
    youtube_urls: readonly string[] | null
    selected_games: readonly string[] | null
    public_id: number
  }
}

export async function getPublicProfile(publicId: number) {
  const res = await fetch(`/api/profile/public?publicId=${publicId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    let message = "프로필을 불러오는데 실패했습니다"
    try {
      const body = await res.json()
      message = body?.error || message
    } catch {}
    const err = new Error(message) as Error & { status?: number }
    err.status = res.status
    throw err
  }

  const body = (await res.json()) as PublicProfileResponse
  return body.data
}
