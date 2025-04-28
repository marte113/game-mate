'use client'

import React from 'react'

import { cn } from '@/libs/utils' // cn 유틸리티 사용 (선택 사항)

// Props 타입 정의 ( orientation 등 추가 확장 가능 )
interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  // orientation?: 'horizontal' | 'vertical'; // 수직/수평 구분 필요시 추가
}

const Separator = React.memo(
  React.forwardRef<HTMLHRElement, SeparatorProps>((
    { className, ...props }, ref
  ) => {
    return (
      <hr
        ref={ref}
        className={cn(
          'shrink-0 bg-border', // 기본 스타일 (shadcn/ui 스타일 참고)
          // 기본적으로 가로 구분선 스타일
          'h-[1px] w-full',
          // 커스텀 클래스 적용
          className
        )}
        {...props}
      />
    )
  })
)
Separator.displayName = 'Separator'

export { Separator } // Named export 사용

//Separator 컴포넌트는 구분선을 표시하는 컴포넌트
//