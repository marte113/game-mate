"use client"

type Status = "pending" | "accepted" | "completed" | "rejected" | "canceled"

const statusConfig: Record<Status, { color: string; label: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", label: "대기 중" },
  accepted: { color: "bg-blue-100 text-blue-800", label: "진행 중" },
  completed: { color: "bg-green-100 text-green-800", label: "완료됨" },
  rejected: { color: "bg-red-100 text-red-800", label: "거절됨" },
  canceled: { color: "bg-gray-100 text-gray-800", label: "취소됨" },
}

export default function StatusBadge({ status }: { status: Status | string }) {
  const statusInfo = (statusConfig as Record<string, { color: string; label: string }>)[status] || {
    color: "bg-gray-100 text-gray-800",
    label: "알 수 없음",
  }

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${statusInfo.color}`}>{statusInfo.label}</span>
  )
}
