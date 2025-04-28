interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
  }
  
  export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
      sm: 'h-5 w-5 border-2',
      md: 'h-8 w-8 border-4',
      lg: 'h-12 w-12 border-4',
    };
  
    return (
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent border-blue-500`} role="status" aria-label="로딩 중...">
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
  