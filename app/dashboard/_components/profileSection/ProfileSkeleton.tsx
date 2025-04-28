export default function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 왼쪽 섹션 스켈레톤 */}
      <div className="space-y-6">
        {/* 프로필 이미지 스켈레톤 */}
        <div className="card bg-base-100 shadow-xl animate-pulse">
          <div className="card-body">
            <div className="h-6 bg-base-300 rounded w-1/3 mb-4"></div>
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-base-300"></div>
            </div>
          </div>
        </div>

        {/* 앨범 갤러리 스켈레톤 */}
        <div className="card bg-base-100 shadow-xl animate-pulse">
          <div className="card-body">
            <div className="h-6 bg-base-300 rounded w-1/3 mb-4"></div>
            <div className="aspect-video bg-base-300 rounded-xl mb-4"></div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="aspect-square bg-base-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 섹션 스켈레톤 */}
      <div className="space-y-6">
        <div className="card bg-base-100 shadow-xl animate-pulse">
          <div className="card-body">
            <div className="h-6 bg-base-300 rounded w-1/3 mb-4"></div>
            
            {/* 닉네임 스켈레톤 */}
            <div className="mb-4">
              <div className="h-4 bg-base-300 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-base-300 rounded"></div>
            </div>
            
            {/* 게임 선택 스켈레톤 */}
            <div className="mb-4">
              <div className="h-4 bg-base-300 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-base-300 rounded mb-2"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-20 bg-base-300 rounded"></div>
                ))}
              </div>
            </div>
            
            {/* 태그 선택 스켈레톤 */}
            <div className="mb-4">
              <div className="h-4 bg-base-300 rounded w-1/4 mb-2"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-8 w-20 bg-base-300 rounded-full"></div>
                ))}
              </div>
            </div>
            
            {/* 유튜브 URL 스켈레톤 */}
            <div className="mb-4">
              <div className="h-4 bg-base-300 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-base-300 rounded mb-2"></div>
              <div className="space-y-2">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="h-6 bg-base-300 rounded"></div>
                ))}
              </div>
            </div>
            
            {/* 자기소개 스켈레톤 */}
            <div className="mb-4">
              <div className="h-4 bg-base-300 rounded w-1/4 mb-2"></div>
              <div className="h-24 bg-base-300 rounded"></div>
            </div>
            
            {/* 저장 버튼 스켈레톤 */}
            <div className="flex justify-end mt-6">
              <div className="h-10 w-24 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 