import { Suspense } from "react";

import ProfileSection from "./_components/profileSection";
import TokenSection from "./_components/tokenSection/TokenSection";
import ClientTabNav from "./_components/ClientTabNav";
// searchParams는 서버 컴포넌트의 props로 자동으로 전달됩니다
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || "profile";

  const renderSection = () => {
    switch (currentTab) {
      case "profile":
        return <ProfileSection />;
      case "token":
        return <TokenSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-base-200">
      <div className="flex-1 p-4">
        {/* 헤더 섹션 */}
        <div className="flex justify-between items-center h-12 mb-7 px-2">
          <h1 className="text-2xl md:text-3xl font-bold">마이 페이지</h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* 클라이언트 컴포넌트로 분리된 TabNav */}
          <ClientTabNav currentTab={currentTab} />
          
          {/* 탭에 따른 컴포넌트 렌더링 */}
          <Suspense fallback={<div>로딩 중...</div>}>
            {renderSection()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}


