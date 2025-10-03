"use client"

import React, { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { type MateData } from "@/app/(home)/_types/homePage.types"
import { MateCard } from "@/app/category/_components/MateCard"

interface RecommendedMatesSliderProps {
  theme: {
    id: string
    name: string
    description: string
  }
  mates: MateData[]
}

const RecommendedMatesSlider = ({ theme, mates }: RecommendedMatesSliderProps) => {
  // React ref로 DOM 요소 접근
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -500, behavior: "smooth" })
  }

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 500, behavior: "smooth" })
  }

  return (
    <section className="py-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-base-content">
          {theme.description} 추천 메이트
        </h2>
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
        {/* 스크롤 컨테이너: 실제 overflow-x는 여기에서 처리 */}
        <div
          ref={carouselRef}
          className="w-full overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
        >
          {/* 트랙: 콘텐츠는 가로로만 나열, 래핑 금지 + 콘텐츠 너비만큼 확장 */}
          <div className="flex w-max items-start flex-nowrap gap-4 pr-4">
            {mates.map((mate) => (
              <MateCard key={mate.id} mate={mate} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecommendedMatesSlider
