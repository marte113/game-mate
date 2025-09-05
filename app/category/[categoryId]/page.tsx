import CategoryIdPageContainer from "../_components/CategoryIdPageContainer"
import CategoryHeader from "../_components/CategoryHeader"
import CategoryMatesSection from "../_components/CategoryMatesSection"

export default async function Page({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params

  return (
    <CategoryIdPageContainer>
      <CategoryHeader categoryId={categoryId} />
      <CategoryMatesSection categoryId={categoryId} />
    </CategoryIdPageContainer>
  )
}
