import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';

const protectedPaths = ['/dashboard'];
const authPaths = ['/login'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const path = req.nextUrl.pathname;
    const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));
    const isAuthPath = authPaths.includes(path);
    const isLoggedIn = !!session;
    
    if (isProtectedPath && !isLoggedIn) {
      // 보호된 페이지 접근 시 미로그인 → 로그인 페이지로 이동
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    if (isAuthPath && isLoggedIn) {
      // 로그인 페이지 접근 시 이미 로그인된 사용자 → 대시보드로 이동
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    

    return res;
  } catch (err) {
    console.error('Middleware error:', err);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// matcher 설정 개선 (더 명확한 주석 처리)
export const config = {
  matcher: [
    /*
     * _next/static, _next/image 등 정적 리소스는 제외하고 미들웨어 적용
     */
    '/((?!_next/static|_next/image|icons|public|favicon.ico).*)',
  ],
};
