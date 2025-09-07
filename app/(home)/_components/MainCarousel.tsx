"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel"
import Autoplay from "embla-carousel-autoplay"
import { cn } from "@/utils/classname"

interface Slide {
  image: string
  alt: string
  text?: string
}

interface MainCarouselProps {
  slides: Slide[]
  initialSlideIndex?: number
  className?: string
  loop?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  align?: "start" | "center" | "end"
  dragFree?: boolean
  onSlideChange?: (index: number) => void
}

export default function MainCarousel({
  slides,
  initialSlideIndex = 0,
  className,
  loop = true,
  autoplay = true,
  autoplayInterval = 5000,
  align = "start",
  dragFree = false,
  onSlideChange,
}: MainCarouselProps) {
  const totalSlides = slides?.length ?? 0
  const safeInitial = Math.min(Math.max(0, initialSlideIndex), Math.max(0, totalSlides - 1))

  // 1) Embla 옵션: "초기화/재초기화에만" 의미 있는 순수 옵션만
  const options = useMemo<EmblaOptionsType>(
    () => ({ loop, align, dragFree }),
    [loop, align, dragFree],
  )

  // 2) 오토플레이 플러그인: 옵션 바뀌면 인스턴스 교체
  const autoplayPlugin = useMemo(
    () =>
      autoplay && totalSlides > 1
        ? Autoplay({
            delay: autoplayInterval,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          })
        : undefined,
    [autoplay, autoplayInterval, totalSlides],
  )

  const plugins = useMemo(() => (autoplayPlugin ? [autoplayPlugin] : []), [autoplayPlugin])

  // 3) 캐러셀 생성
  const [emblaRef, emblaApi] = useEmblaCarousel(
    // startIndex는 초기화에만 쓰고, 이후에는 scrollTo로 처리
    { ...options, startIndex: safeInitial },
    plugins,
  )

  // 4) 현재 인덱스 상태 (UI/점 표시)
  const [currentIndex, setCurrentIndex] = useState<number>(safeInitial)

  // 5) 이벤트 핸들러 (선택 시 인덱스 갱신 + 외부 콜백)
  const handleSelect = useCallback(
    (api: EmblaCarouselType) => {
      const idx = api.selectedScrollSnap()
      setCurrentIndex(idx)
      onSlideChange?.(idx)
    },
    [onSlideChange],
  )

  // 6) 이벤트 바인딩 & 재초기화 대응
  useEffect(() => {
    if (!emblaApi) return
    // 초기 동기화
    handleSelect(emblaApi)

    // select/reInit 모두 같은 핸들러로 연결
    emblaApi.on("select", handleSelect)
    emblaApi.on("reInit", handleSelect)

    return () => {
      emblaApi.off("select", handleSelect)
      emblaApi.off("reInit", handleSelect)
    }
  }, [emblaApi, handleSelect])

  // 7) Embla 순수 옵션(loop/align/dragFree) 변경 시에만 재초기화
  useEffect(() => {
    if (!emblaApi) return
    emblaApi.reInit(options)
  }, [emblaApi, options])

  // 8) 외부에서 initialSlideIndex가 바뀐 경우 "재초기화 없이" 이동만
  useEffect(() => {
    if (!emblaApi) return
    const next = Math.min(Math.max(0, initialSlideIndex), Math.max(0, totalSlides - 1))
    if (emblaApi.selectedScrollSnap() !== next) {
      emblaApi.scrollTo(next, true)
    }
  }, [emblaApi, initialSlideIndex, totalSlides])

  // 9) 컨트롤
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  const containerClasses = cn("relative w-full overflow-hidden rounded-lg mb-8 mt-6", className)

  return (
    <div className={containerClasses}>
      {totalSlides === 0 ? (
        <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-base-200 flex items-center justify-center text-base-content/50">
          등록된 슬라이드가 없습니다.
        </div>
      ) : (
        <>
          <div className="embla h-full" ref={emblaRef}>
            <div className="embla__container flex h-full">
              {slides.map((slide, index) => (
                <div key={index} className="embla__slide min-w-full h-full relative">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    sizes="100vw"
                    className="object-cover object-fill"
                    priority={index === 0}
                  />
                  {slide.text ? (
                    <div className="absolute bottom-8 left-8 bg-black/50 px-4 py-2 rounded-md backdrop-blur-sm">
                      <p className="text-white text-base sm:text-lg md:text-xl font-bold">
                        {slide.text}
                      </p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {totalSlides > 1 && (
            <>
              <div
                className="absolute bottom-8 right-8 bg-black/50 px-3 py-1 rounded-md backdrop-blur-sm"
                aria-live="polite"
              >
                <p className="text-white text-sm font-medium">
                  {currentIndex + 1} / {totalSlides}
                </p>
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      currentIndex === index ? "bg-white" : "bg-white/50"
                    }`}
                    aria-label={`슬라이드 ${index + 1}로 이동`}
                  />
                ))}
              </div>

              <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-300"
                aria-label="이전 슬라이드"
              >
                {/* …아이콘 생략… */}‹
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-300"
                aria-label="다음 슬라이드"
              >
                ›
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
