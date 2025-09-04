export default function TaskRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4 flex-1">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full bg-base-300 animate-pulse" />
        </div>
        <div className="h-4 w-[80%] bg-base-300 rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-base-300 rounded animate-pulse" />
      </div>
    </div>
  )
}
