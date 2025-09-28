import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-[40vh] flex items-center justify-center">
      <div className="w-full max-w-xl text-center space-y-4">
        <h1 className="text-2xl font-semibold">프로필을 찾을 수 없어요</h1>
        <p className="text-base-content/70">
          요청하신 사용자의 공개 프로필이 존재하지 않거나 비공개로 전환되었을 수 있어요.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href="/" className="btn btn-sm btn-primary rounded-full">
            홈으로 가기
          </Link>
        </div>
      </div>
    </main>
  )
}
