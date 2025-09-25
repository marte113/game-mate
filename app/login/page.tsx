import LoginPageContainer from "./_components/LoginPageContainer"
import { toSafeNext } from "@/libs/url/safeNext"

// Supabase 회원가입 및 로그인 페이지
export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Next.js 15 타입 정의: searchParams가 Promise일 수 있으므로 안전하게 await
  const resolved = (await searchParams) ?? {}
  const nextParam = toSafeNext(resolved.next)

  return <LoginPageContainer nextParam={nextParam} />
}
