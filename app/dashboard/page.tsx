import { Suspense } from "react";

import DashboardPageContainer from "./_components/DashboardPageContainer"
import ClientTabNav from "./_components/ClientTabNav";
import DashboardContent from "./_components/DashboardContent"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const currentTab = tab ?? "profile"

  return (
    <DashboardPageContainer>

      <ClientTabNav currentTab={currentTab} />
      {/* 서버 경계에서 스트리밍 */}
      <Suspense >
        <DashboardContent currentTab={currentTab} />
      </Suspense>

    </DashboardPageContainer>
  )
}


