export default function DashboardPageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base-200 w-full min-w-0">
      <div className="min-w-0 flex-1">
        {/* 헤더 */}
        <div className="flex justify-between items-center h-12 mb-7 px-2">
          <h1 className="text-2xl md:text-3xl font-bold">마이 페이지</h1>
        </div>

        {/* 탭 + 콘텐츠 */}
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </div>
  )
}
