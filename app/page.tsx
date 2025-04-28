"use client";

import React from "react";
import GameCategorySlider from "@/components/GameCategorySlider";
import RecommendedMatesSlider from "@/components/RecommendedMatesSlider";
import MainCarousel from "@/components/MainCarousel";

interface Slide {
  image: string;
  alt: string;
  text?: string;
}

const slides: Slide[] = [
  {
    image: "/images/arcadeBanner.jpg",
    alt: "게임 배너 1",
    text: "새로운 게임 친구와 스쿼드를 이루어 두 배로 즐겨봐요!",
  },
  {
    image: "/carousel/welcome.png",
    alt: "게임 배너 2",
    text: "첫 가입 이벤트 진행 중!",
  },
];

export default function Home() {
  return (
    <>
      <main className="min-h-screen w-full bg-base-100">
        <div className="container mx-auto px-4 pt-6">
          <MainCarousel slides={slides} className="h-[370px]" />
          <GameCategorySlider />
          <RecommendedMatesSlider />
        </div>
      </main>
     
    </>
  );
}
