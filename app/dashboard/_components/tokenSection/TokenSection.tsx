import TokenSummaryBoundary from "./TokenSummaryBoundary"
import TokenHistoryBoundary from "./TokenHistoryBoundary"
import TokenSectionContainer from "./TokenSectionContainer"

export default function TokenSection() {
  return (
    <TokenSectionContainer>
      <TokenSummaryBoundary />
      <TokenHistoryBoundary />
    </TokenSectionContainer>
  )
}
