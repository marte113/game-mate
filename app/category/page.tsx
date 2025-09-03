import CategoryPageContainer from "./_components/CategoryPageContainer";
import CategoryCardList from "./_components/CategoryCardList";

export const metadata = {
  title: "게임 카테고리 - Game Mate",
  description: "게임 카테고리를 탐색하고 메이트를 찾아보세요.",
};

export default function CategoryPage() {
  return (
    <CategoryPageContainer>
      <CategoryCardList />
    </CategoryPageContainer>
  );
}
