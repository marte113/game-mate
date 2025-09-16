"use client"

import TaskRow from "./TaskRow"
import { useEffect, useState } from "react"
import Pagination from "@/components/navigation/Pagination"
import type { Order } from "../_types/orderTypes"

type Props = {
  title: string
  tasks: Order[]
  taskType: "current" | "scheduled" | "past"
  emptyMessage: string
  activeTab: "received" | "requested"
  gameImageMap?: Record<string, string | null>
}

export default function TaskSection({
  title,
  tasks,
  taskType,
  emptyMessage,
  activeTab,
  gameImageMap,
}: Props) {
  // 로컬 페이지네이션 상태
  const ITEMS_PER_PAGE = 15
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil((tasks?.length ?? 0) / ITEMS_PER_PAGE)
  const start = (page - 1) * ITEMS_PER_PAGE
  const pagedTasks = tasks.slice(start, start + ITEMS_PER_PAGE)

  // 데이터 변경 시 페이지 초기화
  useEffect(() => {
    setPage(1)
  }, [tasks])

  return (
    <section>
      <h2 className="text-lg md:text-xl font-bold mb-4">{title}</h2>
      <div className="bg-base-100 rounded-lg shadow">
        {tasks.length > 0 ? (
          pagedTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              taskType={taskType}
              activeTab={activeTab}
              gameImageMap={gameImageMap}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">{emptyMessage}</div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination totalPages={totalPages} page={page} setPage={setPage} />
        </div>
      )}
    </section>
  )
}
