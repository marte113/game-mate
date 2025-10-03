import GameCategorySlider from "@/app/category/_components/GameCategorySlider"
import MainCarousel from "@/app/(home)/_components/MainCarousel"
import RecommendedMates from "@/components/ui/RecomendedMates"
import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"
import HomePageContainer from "@/app/(home)/_components/HomePageContainer"

interface Slide {
  image: string
  alt: string
  text?: string
}

const slides: Slide[] = [
  {
    image: "/images/arcadeBanner.jpg",
    alt: "게임 배너 1",
    text: "새로운 게임 친구와 스쿼드를 이루어 두 배로 즐겨봐요!",
  },
  {
    image: "/carousel/welcomeBanner.png",
    alt: "게임 배너 2",
    text: "첫 가입 이벤트 진행 중!",
  },
]

export default function Home() {
  return (
    <HomePageContainer>
      <MainCarousel slides={slides} className="h-[370px]" />
      <QuerySectionBoundary keys={queryKeys.category.popularGames()}>
        <GameCategorySlider />
      </QuerySectionBoundary>
      <QuerySectionBoundary keys={queryKeys.category.recommendedThemes()}>
        <RecommendedMates />
      </QuerySectionBoundary>
    </HomePageContainer>
  )
}
