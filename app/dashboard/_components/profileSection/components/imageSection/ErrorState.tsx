'use client';

import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  sectionTitle?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  sectionTitle,
  errorMessage = '데이터를 불러오는데 실패했습니다.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        {sectionTitle && <h3 className="card-title mb-4">{sectionTitle}</h3>}
        <AlertTriangle className="w-12 h-12 text-error mb-4" />
        <p className="text-error mb-4">{errorMessage}</p>
        {onRetry && (
          <button 
            className="btn btn-sm btn-outline btn-primary"
            onClick={onRetry}
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
} 