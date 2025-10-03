"use client"

import React, { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { usePopularGamesQuery } from "@/hooks/api/category/useCategoryQueries"

interface GameCategoryItemProps {
  image: string
  name: string
  slug: string
}

// 폴백용 하드코딩 카테고리 (API 실패 시 사용)
const fallbackCategories = [
  {
    id: "lol",
    name: "리그오브레전드",
    image: "/images/lol2.webp",
    slug: "/category/League_Of_Legend",
  },
  {
    id: "tft",
    name: "전략적 팀 전투",
    image: "/images/tft.jpg",
    slug: "/category/TFT",
  },
  {
    id: "pubg",
    name: "배틀그라운드",
    image: "/images/bg.jpg",
    slug: "/category/Battle_Ground",
  },
  {
    id: "valorant",
    name: "발로란트",
    image: "/images/valrorant.webp",
    slug: "/category/Valorant",
  },
  {
    id: "er",
    name: "이터널리턴",
    image: "/images/eternalreturn.jpg",
    slug: "/category/Eternal_Return",
  },
  {
    id: "voice",
    name: "보이스 채팅",
    image: "/images/voicechat.jpeg",
    slug: "/category/Voice_Chat",
  },
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
            className="object-fill"
          />
        </div>
        <span className="font-medium text-center text-base-content">{name}</span>
      </div>
    </Link>
  )
}

// 스켈레톤 UI 컴포넌트
const GameCategorySliderSkeleton = () => (
  <section className="py-8 w-full max-w-7xl mx-auto px-4">
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 w-32 bg-base-300 animate-pulse rounded"></div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-base-300 animate-pulse rounded-full"></div>
        <div className="w-8 h-8 bg-base-300 animate-pulse rounded-full"></div>
      </div>
    </div>
    <div className="flex gap-3 overflow-hidden">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 min-w-[180px] md:min-w-[200px]">
            <div className="aspect-square w-full bg-base-300 animate-pulse rounded-xl"></div>
            <div className="h-4 w-20 bg-base-300 animate-pulse rounded"></div>
          </div>
        ))}
    </div>
  </section>
)

const GameCategorySlider = () => {
  const carouselRef = useRef<HTMLDivElement>(null)

  // React Query로 인기 게임 데이터 조회
  const { data, isLoading, error } = usePopularGamesQuery()

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -200, behavior: "smooth" })
  }

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 200, behavior: "smooth" })
  }

  // 로딩 상태
  if (isLoading) {
    return <GameCategorySliderSkeleton />
  }

  // 에러 상태일 때 폴백 카테고리 사용
  const categoriesToShow =
    error || !data?.games?.length
      ? fallbackCategories
      : data.games.map((game) => ({
          id: game.id,
          name: game.description || game.name,
          image: game.image_url || "/images/default-game-icon.webp",
          slug: `/category/${game.name}`,
        }))

  return (
    <section className="py-8 w-full max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-base-content">
          추천 카테고리
          {error && <span className="text-xs text-warning ml-2">(기본 목록)</span>}
        </h2>
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
        ref={carouselRef}
        className="carousel carousel-center gap-3 p-4 rounded-box max-w-full overflow-x-auto scroll-smooth"
      >
        {categoriesToShow.map((category) => (
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
