interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'second';
  }
  
  export default function LoadingSpinner({ size = 'md', color = 'primary' }: LoadingSpinnerProps) {
    const sizeClasses = {
      sm: 'h-5 w-5 border-2',
      md: 'h-8 w-8 border-4',
      lg: 'h-12 w-12 border-4',
    };

    const borderClasses = {
      primary : 'border-blue-500',
      second : 'border-gray-400',
    };
  
    return (
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent ${borderClasses[color]}`} role="status" aria-label="로딩 중...">
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
  