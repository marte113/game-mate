import TokenSummaryCard from "./TokenSummaryCard";
import TokenHistoryTable from "./TokenHistoryTable";
import TokenSectionContainer from "./TokenSectionContainer";

export default function TokenSection() {
    return (
        <TokenSectionContainer>
            <TokenSummaryCard />
            <TokenHistoryTable />
        </TokenSectionContainer>
    );
}
