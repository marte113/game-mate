interface BadgeProps {
  level: string
}

export default function Badge({ level }: BadgeProps) {
  // level에 따른 배경 색상 결정
  const styles = {
    아마추어: "bg-yellow-500 text-white",
    베테랑: "bg-blue-500 text-white",
    프로: "bg-purple-500 text-white",
    레전드: "bg-red-500 text-white",
    관리자: "bg-gray-500 text-white",
  }

  return <span className={`badge ${styles[level as keyof typeof styles]}`}>{level}</span>
}
