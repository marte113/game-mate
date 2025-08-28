import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

// OAuth provider redirect target
// Handles code exchange, sets auth cookies, and redirects user
export async function GET(request: NextRequest) {
  const url = new URL(request.url)

  // Provider may return error params
  const oauthError = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  if (oauthError) {
    const redirect = new URL(`/login?error=${encodeURIComponent(oauthError)}${errorDescription ? `&desc=${encodeURIComponent(errorDescription)}` : ''}`, request.url)
    return NextResponse.redirect(redirect)
  }

  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  const res = NextResponse.redirect(new URL(next, request.url))

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
            cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
    }

    return res
  } catch (e) {
    console.error('OAuth callback error:', e)
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url))
  }
}
