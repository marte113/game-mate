"use client"

import TaskRow from "./TaskRow"
import type { Order } from "../_types/orderTypes"

type Props = {
  title: string
  tasks: Order[]
  taskType: "current" | "scheduled" | "past"
  emptyMessage: string
  activeTab: "received" | "requested"
}

export default function TaskSection({ title, tasks, taskType, emptyMessage, activeTab }: Props) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="bg-base-100 rounded-lg shadow">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskRow key={task.id} task={task} taskType={taskType} activeTab={activeTab} />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">{emptyMessage}</div>
        )}
      </div>
    </section>
  )
}
