import CategoryIdPageContainer from "../_components/CategoryIdPageContainer"
import CategoryHeader from "../_components/CategoryHeader"
import CategoryMatesSection from "../_components/CategoryMatesSection"
import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

export default async function Page({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params

  return (
    <CategoryIdPageContainer>
      <QuerySectionBoundary keys={queryKeys.category.gameHeader(categoryId)}>
        <CategoryHeader categoryId={categoryId} />
      </QuerySectionBoundary>
      <QuerySectionBoundary keys={queryKeys.category.mates(categoryId)}>
        <CategoryMatesSection categoryId={categoryId} />
      </QuerySectionBoundary>
    </CategoryIdPageContainer>
  )
}
