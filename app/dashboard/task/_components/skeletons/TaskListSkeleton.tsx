import TaskSectionSkeleton from './TaskSectionSkeleton'

export default function TaskListSkeleton() {
  return (
    <div className="p-6">
      <div className="space-y-8">
        <TaskSectionSkeleton rows={1} />
        <TaskSectionSkeleton rows={1} />
        <TaskSectionSkeleton rows={3} />
      </div>
    </div>
  )
}
