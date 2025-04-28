'use client'

import TaskRow from './TaskRow'

export default function TaskSection({ 
  title, 
  tasks, 
  taskType, 
  emptyMessage, 
  activeTab,
}) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="bg-base-100 rounded-lg shadow">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskRow 
              key={task.id} 
              task={task} 
              taskType={taskType}
              activeTab={activeTab}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">{emptyMessage}</div>
        )}
      </div>
    </section>
  )
} 