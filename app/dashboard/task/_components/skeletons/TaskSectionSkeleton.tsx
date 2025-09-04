import TaskRowSkeleton from './TaskRowSkeleton'

export default function TaskSectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <section>
      <div className="h-6 w-40 bg-base-300 rounded animate-pulse mb-4" />
      <div className="bg-base-100 rounded-lg shadow">
        {Array.from({ length: rows }).map((_, i) => (
          <TaskRowSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}
