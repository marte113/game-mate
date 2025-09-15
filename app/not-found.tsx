import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 text-sm font-medium text-base-content/60">404</p>
      <h1 className="mb-3 text-2xl font-bold md:text-3xl">페이지를 찾을 수 없습니다</h1>
      <p className="text-base-content/70">
        요청하신 페이지가 없거나 이동되었어요. 아래 버튼을 눌러 홈으로 돌아가세요.
      </p>

      <div className="mt-6">
        <Link href="/" className="btn btn-primary">
          홈으로 이동
        </Link>
      </div>
    </main>
  )
}
