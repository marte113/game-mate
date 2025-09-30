import type { MetadataRoute } from "next"

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "")
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com"
  const baseUrl = stripTrailingSlash(raw)
  const now = new Date()

  // 1) 정적 경로: 홈/카테고리/로그인 등 공개 페이지 위주
  const staticRoutes: MetadataRoute.Sitemap = ["", "/category", "/login"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }))

  // 2) 동적 경로(예: 프로필, 게임 상세 등)
  // NOTE: 규모가 커지면 sitemap index로 분할 필요
  // TODO(feat/seo): 서버 전용 Supabase 클라이언트를 사용해 공개 프로필/카테고리 id 목록을 조회
  // const profiles = await getPublicProfileIds() // 예: [1, 2, 3]
  // const profileEntries: MetadataRoute.Sitemap = profiles.map((id) => ({
  //   url: `${baseUrl}/profile/${id}`,
  //   lastModified: now,
  //   changeFrequency: "daily",
  //   priority: 0.6,
  // }))

  return [
    ...staticRoutes,
    // ...profileEntries,
  ]
}
