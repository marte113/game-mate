'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  image: string
  slug: string
}

interface GameCategoryItemProps {
  image: string
  name: string
  slug: string
}

const categories: Category[] = [
  {
    id: 'lol',
    name: '리그오브레전드',
    image: '/images/lol2.webp',
    slug: '/games/lol'
  },
  {
    id: 'tft',
    name: '전략적 팀 전투',
    image: '/images/tft.jpg',
    slug: '/games/tft'
  },
  {
    id: 'pubg',
    name: '배틀그라운드',
    image: '/images/bg.jpg',
    slug: '/games/pubg'
  },
  {
    id: 'voice',
    name: '보이스 채팅',
    image: '/images/voicechat.jpeg',
    slug: '/games/voice'
  },
  {
    id: 'valorant',
    name: '발로란트',
    image: '/images/valrorant.webp',
    slug: '/games/valorant'
  },
  {
    id: 'er',
    name: '이터널리턴',
    image: '/images/eternalreturn.jpg',
    slug: '/games/er'
  }
]

const GameCategoryItem = ({ image, name, slug }: GameCategoryItemProps) => {
  return (
    <Link href={slug} className="group">
      <div className="carousel-item w-[180px] md:w-[200px] flex flex-col items-center gap-3 transition-all duration-300 group-hover:scale-105">
        <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-md">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 180px, 200px"
            className="object-cover"
            
          />
        </div>
        <span className="font-medium text-center text-base-content">{name}</span>
      </div>
    </Link>
  )
}

const GameCategorySlider = () => {
  const scrollLeft = () => {
    document.getElementById('game-categories')?.scrollBy({ left: -200, behavior: 'smooth' })
  }

  const scrollRight = () => {
    document.getElementById('game-categories')?.scrollBy({ left: 200, behavior: 'smooth' })
  }

  return (
    <section className="py-8 w-full max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-base-content">추천 카테고리</h2>
        <div className="flex gap-2">
          <button 
            onClick={scrollLeft}
            className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300"
            aria-label="이전 카테고리"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={scrollRight}
            className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300"
            aria-label="다음 카테고리"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

        <div 
          id="game-categories" 
          className="carousel carousel-center gap-3 p-4 rounded-box max-w-full overflow-x-auto"
        >
          {categories.map((category) => (
            <GameCategoryItem
              key={category.id}
              image={category.image}
              name={category.name}
              slug={category.slug}
            />
          ))}
        </div>
          
    </section>
  )
}

export default GameCategorySlider 