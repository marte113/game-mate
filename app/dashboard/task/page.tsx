import { Suspense } from "react"

import TaskList from "./_components/TaskList"
import TaskPageContainer from "./_components/TaskPageContainer"
import TaskPageNavTab from "./_components/TaskPageNavTab"
import TaskPageNavTabSkeleton from "./_components/skeletons/TaskPageNavTabSkeleton"
import TaskListSkeleton from "./_components/skeletons/TaskListSkeleton"
import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

export const dynamic = "force-dynamic"

export default function TaskPage() {
  return (
    <TaskPageContainer>
      {/* useSearchParams()를 사용하는 클라이언트 컴포넌트는 Suspense 경계로 감싼다 */}
      <Suspense fallback={<TaskPageNavTabSkeleton />}>
        <TaskPageNavTab />
      </Suspense>
      <QuerySectionBoundary keys={[queryKeys.orders.received(), queryKeys.orders.requested()]}>
        <Suspense fallback={<TaskListSkeleton />}>
          <TaskList />
        </Suspense>
      </QuerySectionBoundary>
    </TaskPageContainer>
  )
}
