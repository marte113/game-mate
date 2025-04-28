'use client';

interface LoadingStateProps {
  sectionTitle?: string;
}

export default function LoadingState({ sectionTitle }: LoadingStateProps) {
  return (
    <div className="card bg-base-100 shadow-xl animate-pulse">
      <div className="card-body">
        {sectionTitle && (
          <div className="h-6 bg-base-300 rounded w-1/4 mb-6"></div>
        )}
        <div className="flex justify-center mb-8">
          <div className="w-full h-[310px] rounded-lg bg-base-300"></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="aspect-square rounded-lg bg-base-300"></div>
          ))}
        </div>
      </div>
    </div>
  );
} 