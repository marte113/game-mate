import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { toSafeNextOrDefault } from "@/libs/url/safeNext"

const protectedPaths = ["/dashboard"]
const authPaths = ["/login"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    },
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const path = req.nextUrl.pathname
    const isProtectedPath = protectedPaths.some((p) => path.startsWith(p))
    const isAuthPath = authPaths.includes(path)
    const isLoggedIn = !!user

    if (isProtectedPath && !isLoggedIn) {
      // 보호된 페이지 접근 시 미로그인 → 로그인 페이지로 이동
      // 안전한 내부 경로만 허용하여 쿠키(return_to) + 쿼리(next)로 모두 보존
      const rawNext = req.nextUrl.pathname + req.nextUrl.search
      const safeNext = toSafeNextOrDefault(rawNext)
      const redirectUrl = new URL(`/login?next=${encodeURIComponent(safeNext)}`, req.url)
      const redirectRes = NextResponse.redirect(redirectUrl)
      // 콜백에서 동일 origin으로 안전 복귀하도록 쿠키에 보존
      redirectRes.cookies.set("return_to", safeNext, {
        path: "/",
        maxAge: 600, // 10분
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      return redirectRes
    }

    if (isAuthPath && isLoggedIn) {
      // 로그인 상태에서 /login 접근 시, next가 있으면 우선 사용
      const next = toSafeNextOrDefault(
        req.nextUrl.searchParams.get("next") ?? undefined,
        "/dashboard",
      )
      return NextResponse.redirect(new URL(next, req.url))
    }

    // 로그인 페이지 접근 시(미로그인)에도 next 쿼리가 있으면 서버에서 SSOT 쿠키를 설정
    if (isAuthPath && !isLoggedIn) {
      const rawNext = req.nextUrl.searchParams.get("next")
      if (rawNext) {
        const safeNext = toSafeNextOrDefault(rawNext)
        const existing = req.cookies.get("return_to")?.value
        if (existing !== safeNext) {
          const resWithCookie = NextResponse.next()
          resWithCookie.cookies.set("return_to", safeNext, {
            path: "/",
            maxAge: 600, // 10분
            sameSite: "lax",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          })
          return resWithCookie
        }
      }
    }

    return res
  } catch (err) {
    // 오류 시에도 안전한 내부 경로만 보존하여 로그인으로 유도
    const rawNext = req.nextUrl.pathname + req.nextUrl.search
    const safeNext = toSafeNextOrDefault(rawNext)
    const redirectUrl = new URL(`/login?next=${encodeURIComponent(safeNext)}`, req.url)
    const redirectRes = NextResponse.redirect(redirectUrl)
    redirectRes.cookies.set("return_to", safeNext, {
      path: "/",
      maxAge: 600, // 10분
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    return redirectRes
  }
}

// matcher 설정 개선 (더 명확한 주석 처리)
export const config = {
  matcher: [
    /*
     * _next/static, _next/image 등 정적 리소스는 제외하고 미들웨어 적용
     */
    "/((?!api|_next/static|_next/image|icons|public|favicon.ico).*)",
  ],
}
