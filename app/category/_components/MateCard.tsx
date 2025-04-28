// components/MateCard.tsx (RecommendedMatesSlider.tsx에서 분리하거나 수정)
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react' // 아이콘 라이브러리 확인
import type { MateCardData } from '../_types/categoryPage.types' // MateCard 데이터 타입 임포트

interface MateCardProps {
  mate: MateCardData
}

// PascalCase로 컴포넌트 이름 수정
export function MateCard({ mate }: MateCardProps) {
  return (
    // Link href를 profile id (user_id)로 수정
    <Link href={`/profile/${mate.id}`} className="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 group block">
      <div className="relative">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
          <Image
            src={mate.image} // users.profile_thumbnail_img
            alt={`${mate.name} 프로필 이미지`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false} // 첫 화면 로드 시 중요하지 않으면 false
            // placeholder="blur" // 로딩 중 블러 처리 (선택적)
            // blurDataURL={mate.blurDataUrl} // 블러 이미지 데이터 (선택적)
          />
          {mate.isOnline ? (
            <div className="absolute top-3 left-3 badge badge-success text-white text-xs font-medium">
              온라인
            </div>
          ) : (
            <div className="absolute top-3 left-3 badge badge-error text-white text-xs font-medium">
              오프라인
            </div>
          )}
          {/* videoLength는 목 데이터이므로 주석 처리 또는 다른 정보 표시 */}
          {/* <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            {mate.videoLength}
          </div> */}
        </div>
      </div>

      <div className="card-body p-4">
        <div className="flex justify-between items-start gap-2"> {/* gap 추가 */}
          <div className='flex-1 min-w-0'> {/* 제목/설명이 길어질 경우 대비 */}
            <h3 className="card-title text-base font-semibold truncate">{mate.name}</h3> {/* 크기/굵기 조정, truncate */}
            <p className="text-sm text-base-content/70 line-clamp-2 mt-1">{mate.description}</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-100 text-amber-600 px-2 py-1 rounded-lg flex-shrink-0"> {/* flex-shrink-0 */}
            <Star className="w-3 h-3 fill-current" /> {/* 크기 조정 */}
            <span className="font-bold text-xs">{mate.rating.toFixed(1)}</span> {/* 크기 조정 */}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2"> {/* mt 조정 */}
          <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0"> {/* 크기 조정, flex-shrink-0 */}
            <Image
              src={mate.gameIcon} // games.image_url
              alt={`${mate.game} 아이콘`}
              fill
              sizes="20px" // 이미지 크기에 맞게 조정
              className="object-cover"
            />
          </div>
          <span className="text-xs font-medium capitalize truncate">{mate.game}</span> {/* 크기 조정, capitalize, truncate */}
        </div>

        <div className="flex justify-between items-center mt-2"> {/* mt 조정 */}
          <div className="flex items-center gap-1">
            <span className="text-primary font-bold text-sm">{mate.price.toLocaleString()}</span> {/* 크기 조정 */}
            <span className="text-xs text-base-content/70">/판</span>
          </div>
          {/* 버튼 스타일 및 텍스트는 필요에 따라 조정 */}
          <button className="btn btn-xs btn-primary rounded-full">신청하기</button> {/* 크기 조정 */}
        </div>
      </div>
    </Link>
  )
}