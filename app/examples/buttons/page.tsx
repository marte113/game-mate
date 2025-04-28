import { Button } from '@/components/ui'

export const metadata = {
  title: '버튼 컴포넌트 예제 - 게임 메이트',
  description: '다양한 스타일과 크기의 버튼 컴포넌트 사용 예제',
}

export default function ButtonExamplePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">버튼 컴포넌트 예제</h1>
      
      {/* 버튼 종류 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">버튼 종류</h2>
        <div className="flex flex-wrap gap-4">
          <Button>기본 버튼</Button>
          <Button variant="secondary">보조 버튼</Button>
          <Button variant="accent">강조 버튼</Button>
          <Button variant="ghost">고스트 버튼</Button>
          <Button variant="outline">아웃라인 버튼</Button>
          <Button variant="link">링크 버튼</Button>
          <Button variant="error">에러 버튼</Button>
          <Button variant="success">성공 버튼</Button>
          <Button variant="warning">경고 버튼</Button>
          <Button variant="info">정보 버튼</Button>
        </div>
      </section>
      
      {/* 버튼 크기 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">버튼 크기</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="xs">아주 작은 버튼</Button>
          <Button size="sm">작은 버튼</Button>
          <Button>기본 버튼</Button>
          <Button size="lg">큰 버튼</Button>
        </div>
      </section>
      
      {/* 버튼 모양 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">버튼 모양</h2>
        <div className="flex flex-wrap gap-4">
          <Button>기본 모양</Button>
          <Button shape="circle">O</Button>
          <Button shape="square">■</Button>
          <Button shape="rounded">둥근 버튼</Button>
        </div>
      </section>
      
      {/* 버튼 너비 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">버튼 너비</h2>
        <div className="flex flex-col gap-4 max-w-md">
          <Button>기본 너비</Button>
          <Button fullWidth>전체 너비</Button>
        </div>
      </section>
      
      {/* 로딩 상태 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">로딩 상태</h2>
        <div className="flex flex-wrap gap-4">
          <Button isLoading>로딩 중</Button>
          <Button variant="secondary" isLoading>로딩 중</Button>
          <Button variant="outline" isLoading>로딩 중</Button>
        </div>
      </section>
      
      {/* 비활성화 상태 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">비활성화 상태</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>비활성화 버튼</Button>
          <Button variant="secondary" disabled>비활성화 버튼</Button>
          <Button variant="outline" disabled>비활성화 버튼</Button>
        </div>
      </section>
      
      {/* 아이콘 버튼 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">아이콘 버튼</h2>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={<span>👈</span>}>왼쪽 아이콘</Button>
          <Button rightIcon={<span>👉</span>}>오른쪽 아이콘</Button>
          <Button leftIcon={<span>🔍</span>} rightIcon={<span>📋</span>}>양쪽 아이콘</Button>
        </div>
      </section>
    </div>
  )
} 