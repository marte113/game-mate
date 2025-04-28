'use client';

import { Info } from 'lucide-react';

interface EmptyStateProps {
  sectionTitle?: string;
  message?: string;
  height?: string;
}

export default function EmptyState({ 
  sectionTitle,
  message = '데이터가 없습니다.',
  height = 'h-48' // 기본 높이
}: EmptyStateProps) {
  return (
    <div className="w-full">
      {sectionTitle && <h3 className="card-title mb-4">{sectionTitle}</h3>}
      <div className={`flex flex-col items-center justify-center ${height} bg-base-200 rounded-lg text-base-content/50`}>
        <Info className="w-8 h-8 mb-2" />
        <p>{message}</p>
      </div>
    </div>
  );
} 