import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { toSafeNextOrDefault } from "@/libs/url/safeNext"

export const dynamic = "force-dynamic" // 없어도 되지만, 명시해도 무방

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const cookieNext = request.cookies.get("return_to")?.value
  // URLSearchParams.get() returns string | null, normalize null -> undefined for the util type
  const safeNext = toSafeNextOrDefault(cookieNext ?? url.searchParams.get("next") ?? undefined)

  if (!code) {
    const resp = NextResponse.redirect(new URL("/login?error=missing_code", request.url))
    // 사용 후 보조 쿠키 제거
    resp.cookies.set("return_to", "", { maxAge: 0, path: "/" })
    return resp
  }

  // 성공 시 돌려보낼 Redirect 응답 객체 (요청 origin 기준 동일 도메인)
  const res = NextResponse.redirect(new URL(safeNext, request.url))

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      const resp = NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      )
      resp.cookies.set("return_to", "", { maxAge: 0, path: "/" })
      return resp
    }

    // 성공 시에도 보조 쿠키 제거
    res.cookies.set("return_to", "", { maxAge: 0, path: "/" })
    return res
  } catch {
    const resp = NextResponse.redirect(new URL("/login?error=callback_error", request.url))
    resp.cookies.set("return_to", "", { maxAge: 0, path: "/" })
    return resp
  }
}
