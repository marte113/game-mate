import LoginPageContainer from "./_components/LoginPageContainer"

// Supabase 회원가입 및 로그인 페이지
export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Next.js 15 타입 정의: searchParams가 Promise일 수 있으므로 안전하게 await
  const resolved = (await searchParams) ?? {}
  const raw = resolved.next
  let nextParam: string | undefined
  if (Array.isArray(raw)) {
    // 다중 쿼리인 경우 첫 번째 값 사용
    const val = raw[0]
    if (typeof val === "string") {
      const hasProtocol = /^([a-z]+:)?\/\//i.test(val)
      if (!hasProtocol && val.startsWith("/") && !val.startsWith("//")) {
        nextParam = val
      }
    }
  } else if (typeof raw === "string") {
    // 절대 URL 금지, 프로토콜 금지, //로 시작 금지. /로 시작하는 경로만 허용
    const hasProtocol = /^([a-z]+:)?\/\//i.test(raw)
    if (!hasProtocol && raw.startsWith("/") && !raw.startsWith("//")) {
      nextParam = raw
    }
  }

  return <LoginPageContainer nextParam={nextParam} />
}
