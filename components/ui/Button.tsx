'use client'

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/libs/utils'

// 버튼 변형 정의
const buttonVariants = cva(
  // 기본 스타일
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      // 버튼 종류
      variant: {
        default: 'btn btn-primary',
        secondary: 'btn btn-secondary',
        accent: 'btn btn-accent',
        ghost: 'btn btn-ghost',
        outline: 'btn btn-outline',
        link: 'btn btn-link',
        error: 'btn btn-error',
        success: 'btn btn-success',
        warning: 'btn btn-warning',
        info: 'btn btn-info',
      },
      // 버튼 크기
      size: {
        default: 'btn-md',
        sm: 'btn-sm',
        lg: 'btn-lg',
        xs: 'btn-xs',
      },
      // 버튼 모양
      shape: {
        default: '',
        circle: 'btn-circle',
        square: 'btn-square',
        rounded: 'rounded-full',
      },
      // 버튼 너비
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
      fullWidth: false,
    },
  }
)

// 버튼 속성 타입 정의
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

// 버튼 컴포넌트
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant,
      size,
      shape,
      fullWidth,
      children,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, shape, fullWidth }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="loading loading-spinner loading-xs mr-2"></span>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants } 