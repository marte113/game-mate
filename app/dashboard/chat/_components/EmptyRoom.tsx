"use client"

export default function EmptyRoom() {
  return (
    <div className="flex-1 bg-base-100 rounded-lg shadow-xl h-full">
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold mb-2">채팅방을 선택해 주세요</h2>
          <p className="text-base-content/60">
            왼쪽 목록에서 대화할 상대를 선택하거나, 새로운 대화를 시작하세요.
          </p>
        </div>
      </div>
    </div>
  )
}
