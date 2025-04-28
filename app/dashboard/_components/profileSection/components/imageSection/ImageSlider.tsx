'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AlbumImage } from './AlbumGalleryCard';

interface ImageSliderProps {
  validImages: AlbumImage[];
}

export interface ImageSliderHandle {
  updateSlideIndex: (newIndex: number) => void;
}

const ImageSlider = forwardRef<ImageSliderHandle, ImageSliderProps>(
  function ImageSlider({ validImages }, ref) {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    // validImages가 변경될 때마다 currentSlide가 유효한지 확인
    useEffect(() => {
      if (validImages.length === 0) {
        setCurrentSlide(0);
      } else if (currentSlide >= validImages.length) {
        setCurrentSlide(validImages.length - 1);
      }
    }, [validImages, currentSlide]);
    
    // 슬라이드 이동 함수
    const nextSlide = () => {
      setCurrentSlide((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
    };
    
    const prevSlide = () => {
      setCurrentSlide((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
    };
    
    // 외부에서 호출할 수 있는 메서드 노출
    useImperativeHandle(ref, () => ({
      updateSlideIndex: (newIndex: number) => {
        if (newIndex >= 0 && newIndex < validImages.length) {
          setCurrentSlide(newIndex);
        } else if (validImages.length > 0) {
          setCurrentSlide(0);
        }
      }
    }));
    
    // 현재 표시할 이미지 URL 안전하게 가져오기
    const getCurrentImageUrl = () => {
      if (validImages.length === 0 || currentSlide >= validImages.length) {
        return null;
      }
      return validImages[currentSlide].url;
    };
    
    return (
      <div className="relative w-full mb-4 bg-base-200 rounded-xl overflow-hidden" style={{ paddingBottom: '75%' }}>
        <div className="absolute inset-0">
          {validImages.length > 0 ? (
            <>
              <Image
                src={getCurrentImageUrl() || ''}
                alt="Album"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
              {validImages.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-base-100/80"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-base-100/80"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-base-content/30">이미지를 추가해주세요</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ImageSlider.displayName = 'ImageSlider';

export default ImageSlider; 