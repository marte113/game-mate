import type { Database } from "@/types/database.types"

type TokenTransaction = Database["public"]["Tables"]["token_transactions"]["Row"]

// 안전한 날짜 포맷팅 함수
function formatDate(dateString: string | null): string {
  if (!dateString) return "날짜 없음"

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "잘못된 날짜"

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

// 트랜잭션 타입별 라벨과 색상 클래스를 반환
function getTransactionTypeDisplay(type: TokenTransaction["transaction_type"]): {
  label: string
  className: string
} {
  switch (type) {
    case "CHARGE":
      return { label: "충전", className: "text-blue-400 font-semibold" } // 파란색
    case "EARN":
      return { label: "획득", className: "text-green-400 font-semibold" } // 초록색
    case "SPEND":
      return { label: "사용", className: "text-red-400 font-semibold" } // 빨간색
    case "REFUND":
      return { label: "환불", className: "text-yellow-400 font-semibold" } // 노란색
    default:
      return { label: "알 수 없음", className: "badge badge-neutral font-semibold" }
  }
}

// 금액 포맷팅 (천단위 콤마 + 부호)
function formatAmount(type: TokenTransaction["transaction_type"], amount: number): string {
  const isPositive = type === "CHARGE" || type === "EARN" || type === "REFUND"
  const sign = isPositive ? "+" : "-"
  const formattedAmount = amount.toLocaleString("ko-KR")
  return `${sign}${formattedAmount}`
}

export default function TokenHistoryTr({ transaction }: { transaction: TokenTransaction }) {
  console.log("props - transaction : ", transaction)
  const typeDisplay = getTransactionTypeDisplay(transaction.transaction_type)

  return (
    <tr key={transaction.transaction_id}>
      <td>{formatDate(transaction.created_at)}</td>
      <td>
        <span className={typeDisplay.className}>{typeDisplay.label}</span>
      </td>
      <td>{formatAmount(transaction.transaction_type, transaction.amount)}</td>
      <td>
        <span className="badge badge-success font-semibold">완료</span>
      </td>
    </tr>
  )
}
