import type { MetadataRoute } from "next"

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "")
}

export default function robots(): MetadataRoute.Robots {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com"
  const baseUrl = stripTrailingSlash(raw)
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"

  // 프리뷰/스테이징은 색인 금지, 프로덕션만 허용
  const rules = isProd
    ? [
        {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/api/", // API 경로 색인 금지
            "/dashboard/", // 인증 필요한 내부 화면 차단
            "/_next/", // Next 내부 자원
          ],
        },
      ]
    : [{ userAgent: "*", disallow: "/" }]

  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
