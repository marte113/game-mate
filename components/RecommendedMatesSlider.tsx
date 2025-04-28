'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

interface Mate {
  id: number
  name: string
  game: string
  gameIcon: string
  price: number
  rating: number
  description: string
  image: string
  isOnline: boolean
  videoLength: string
}

interface MateCardProps {
  mate: Mate
}

const mates: Mate[] = [
  {
    id: 1,
    name: '피츠',
    game: '리그오브레전드',
    gameIcon: '/images/lol2.webp',
    price: 950,
    rating: 5.0,
    description: '칼바람 협곡 롤체 솔랭 협심당',
    image: '/avatar/tempprofileimg1.jpg',
    isOnline: true,
    videoLength: '04:00'
  },
  {
    id: 2,
    name: '카츄',
    game: '리그오브레전드',
    gameIcon: '/images/lol2.webp',
    price: 700,
    rating: 5.0,
    description: '서포>정글>미드 순으로 선호해요(랭크게임, 칼바람 다 좋아해요)',
    image: '/avatar/tempprofileimg2.jpg',
    isOnline: true,
    videoLength: '06:00'
  },
  {
    id: 3,
    name: '미나',
    game: '발로란트',
    gameIcon: '/images/valrorant.webp',
    price: 850,
    rating: 4.9,
    description: '발로란트 경쟁전 같이 하실 분 구해요',
    image: '/avatar/tempprofileimg3.jpg',
    isOnline: false,
    videoLength: '03:30'
  },
  {
    id: 4,
    name: '준호',
    game: '배틀그라운드',
    gameIcon: '/images/bg.jpg',
    price: 800,
    rating: 4.8,
    description: '배그 스쿼드 모드 같이 치킨 먹어요',
    image: '/avatar/tempprofileimg4.jpg',
    isOnline: true,
    videoLength: '05:20'
  },
  {
    id: 5,
    name: '준호',
    game: '배틀그라운드',
    gameIcon: '/images/bg.jpg',
    price: 800,
    rating: 4.8,
    description: '배그 스쿼드 모드 같이 치킨 먹어요',
    image: '/avatar/tempprofileimg4.jpg',
    isOnline: true,
    videoLength: '05:20'
  },
  {
    id: 6,
    name: '준호',
    game: '배틀그라운드',
    gameIcon: '/images/bg.jpg',
    price: 800,
    rating: 4.8,
    description: '배그 스쿼드 모드 같이 치킨 먹어요',
    image: '/avatar/tempprofileimg4.jpg',
    isOnline: true,
    videoLength: '05:20'
  }
]

export const MateCard = ({ mate }: MateCardProps) => {
  return (
    <Link href={`/profile/${mate.id}`} className="carousel-item w-[20%] group">
      <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
            <Image
              src={mate.image}
              alt={mate.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
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

const RecommendedMatesSlider = () => {
  const scrollLeft = () => {
    document.getElementById('recommended-mates')?.scrollBy({ left: -300, behavior: 'smooth' })
  }

  const scrollRight = () => {
    document.getElementById('recommended-mates')?.scrollBy({ left: 300, behavior: 'smooth' })
  }

  return (
    <section className="py-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-base-content">추천 게임 메이트</h2>
        <div className="flex gap-2">
          <button 
            onClick={scrollLeft}
            className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300"
            aria-label="이전 메이트"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={scrollRight}
            className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300"
            aria-label="다음 메이트"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div 
          id="recommended-mates" 
          className="carousel carousel-center gap-4 pb-4 overflow-x-auto scroll-smooth"
        >
          {mates.map((mate) => (
            <MateCard key={mate.id} mate={mate} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecommendedMatesSlider 