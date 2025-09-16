import type { Database } from "@/types/database.types"
import { formatRelativeFromNow } from "@/utils/date"

type TokenTransaction = Database["public"]["Tables"]["token_transactions"]["Row"]

// 날짜는 상대 시간(예: 3시간 전)으로 간략히 표기하여 작은 화면에서의 줄바꿈을 줄입니다.

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
      <td className="whitespace-nowrap text-xs sm:text-sm">
        {formatRelativeFromNow(transaction.created_at ?? "")}
      </td>
      <td className="whitespace-nowrap text-xs sm:text-sm">
        <span className={`${typeDisplay.className} text-xs sm:text-sm whitespace-nowrap`}>
          {typeDisplay.label}
        </span>
      </td>
      <td className="whitespace-nowrap text-xs sm:text-sm font-semibold">
        {formatAmount(transaction.transaction_type, transaction.amount)}
      </td>
      <td className="whitespace-nowrap">
        <span className="badge badge-success px-2 py-0.5 text-[0.7rem] sm:text-xs font-semibold">
          완료
        </span>
      </td>
    </tr>
  )
}
