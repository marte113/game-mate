// components/MateCard.tsx (RecommendedMatesSlider.tsx에서 분리하거나 수정)
import Image from 'next/image'
import Link from 'next/link'
import { Star, UserRound } from 'lucide-react' // 아이콘 라이브러리 확인

import type { MateCardData } from '../_types/categoryPage.types' // MateCard 데이터 타입 임포트

interface MateCardProps {
  mate: MateCardData
}

// PascalCase로 컴포넌트 이름 수정
export function MateCard({ mate }: MateCardProps) {
  return (
    // Link href를 profile id (user_id)로 수정
    <Link href={`/profile/${mate.public_id}`} className="carousel-item w-[20%] min-w-[220px] group">
      <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
            {mate.image !== "/default-avatar.png" ? (
              <Image
                src={mate.image}
                alt={`${mate.name} 프로필 이미지`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-base-200">
                <UserRound color="#ffffff" className="w-12 h-12 text-base-content/60" aria-hidden="true" />
              </div>
            )}
            {mate.isOnline ? (
              <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                온라인
              </div>
            ) : (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                오프라인
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {mate.videoLength}
            </div>
          </div>
        </div>
        
        <div className="card-body p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="card-title text-lg">{mate.name}</h3>
              <p className="text-sm text-base-content/70 line-clamp-2 mt-1">{mate.description}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-100 text-amber-600 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-sm">{mate.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <div className="relative w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={mate.gameIcon}
                alt={mate.game}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <span className="text-sm font-medium">{mate.game}</span>
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-1">
              <span className="text-primary font-bold">{mate.price.toLocaleString()}</span>
              <span className="text-xs text-base-content/70">/판</span>
            </div>
            <button className="btn btn-sm btn-primary rounded-full">신청하기</button>
          </div>
        </div>
      </div>
    </Link>
  )
}