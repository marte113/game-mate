"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import cn from 'classnames';

interface Slide {
  image: string;
  alt: string;
  text?: string;
}

interface MainCarouselProps {
  slides: Slide[];
  initialSlideIndex?: number;
  className?: string;
}

export default function MainCarousel({
  slides,
  initialSlideIndex = 0,
  className = "",
}: MainCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(initialSlideIndex);
  const totalSlides = slides ? slides.length : 0;
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTime = 5000;

  const nextSlide = (): void => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = (): void => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToSlide = (index: number): void => {
    if (totalSlides <= 1) return;
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!slides || totalSlides <= 1) {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setTimeout(() => {
      nextSlide();
    }, intervalTime);

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [currentSlide, slides, totalSlides]);

  if (!slides || slides.length === 0) {
    return (
      <div className={cn("relative w-full aspect-video overflow-hidden rounded-lg bg-base-200 flex items-center justify-center text-base-content/50", className)}>
         등록된 슬라이드가 없습니다.
      </div>
    );
  }

  const containerClasses = cn(
    "relative w-full overflow-hidden rounded-lg mb-8 mt-6",
    className
  );

  return (
    <div className={containerClasses}>
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="min-w-full h-full relative">
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover"
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

      {totalSlides > 1 && (
        <>
          <div className="absolute bottom-8 right-8 bg-black/50 px-3 py-1 rounded-md backdrop-blur-sm">
            <p className="text-white text-sm font-medium">
              {currentSlide + 1} / {totalSlides}
            </p>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  currentSlide === index ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>

          <button
            onClick={prevSlide}
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
            onClick={nextSlide}
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
    </div>
  );
}
