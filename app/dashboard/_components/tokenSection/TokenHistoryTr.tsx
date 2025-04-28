export default function TokenHistoryTr({ transaction }: { transaction: any }) {
  return (
    <tr key={transaction.transaction_id}>
      <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
      <td>
        {transaction.transaction_type === "CHARGE" && "충전"}
        {transaction.transaction_type === "EARN" && "획득"}
        {transaction.transaction_type === "SPEND" && "사용"}
      </td>
      <td>
        {transaction.transaction_type === "CHARGE" ||
        transaction.transaction_type === "EARN"
          ? `+${transaction.amount}`
          : `-${transaction.amount}`}
      </td>
      <td>
        <span className="badge badge-success">완료</span>
      </td>
    </tr>
  );
}
