"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType, EmblaCarouselType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";

import { cn } from "@/utils/classname";

interface Slide {
  image: string;
  alt: string;
  text?: string;
}

interface MainCarouselProps {
  slides: Slide[];
  initialSlideIndex?: number;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  align?: "start" | "center" | "end";
  dragFree?: boolean;
  onSlideChange?: (index: number) => void;
}

export default function MainCarousel({
  slides,
  initialSlideIndex = 0,
  className = "",
  loop = true,
  autoplay = true,
  autoplayInterval = 5000,
  align = "start",
  dragFree = false,
  onSlideChange,
}: MainCarouselProps) {
  const totalSlides = slides ? slides.length : 0;

  // 빈 슬라이드여도 훅은 항상 호출되도록 분기 없이 진행

  const safeInitialIndex = Math.min(Math.max(0, initialSlideIndex), Math.max(0, totalSlides - 1));

  const options: EmblaOptionsType = useMemo(() => ({
    loop,
    align,
    dragFree,
    startIndex: safeInitialIndex,
  }), [loop, align, dragFree, safeInitialIndex]);

  const autoplayPluginRef = useRef(
    Autoplay({
      delay: autoplayInterval,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  );

  const plugins = useMemo(() => (autoplay && totalSlides > 1 ? [autoplayPluginRef.current] : []), [autoplay, totalSlides]);

  const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);
  const [currentIndex, setCurrentIndex] = useState<number>(safeInitialIndex);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    const idx = api.selectedScrollSnap();
    setCurrentIndex(idx);
    if (onSlideChange) onSlideChange(idx);
  }, [onSlideChange]);

  // 슬라이드/초기 인덱스가 변하면 안전 인덱스로 이동
  useEffect(() => {
    if (!emblaApi) return;
    const newSafe = Math.min(Math.max(0, initialSlideIndex), Math.max(0, totalSlides - 1));
    emblaApi.reInit({ ...options, startIndex: newSafe });
    if (emblaApi.selectedScrollSnap() !== newSafe) {
      emblaApi.scrollTo(newSafe, true);
    }
  }, [emblaApi, totalSlides, initialSlideIndex, options]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi && emblaApi.scrollTo(i), [emblaApi]);

  const containerClasses = cn(
    "relative w-full overflow-hidden rounded-lg mb-8 mt-6",
    className
  );

  return (
    <div className={containerClasses}>
      {totalSlides === 0 ? (
        <div className={cn("relative w-full aspect-video overflow-hidden rounded-lg bg-base-200 flex items-center justify-center text-base-content/50", className)}>
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
                    className="object-center"
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
              <div className="absolute bottom-8 right-8 bg-black/50 px-3 py-1 rounded-md backdrop-blur-sm">
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-300"
                aria-label="다음 슬라이드"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
