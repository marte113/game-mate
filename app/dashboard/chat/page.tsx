import ChatPageContainer from "./_hooks/ChatPageContainer"
import LeftSection from "./_components/LeftSection"
import RightSection from "./_components/RightSection"
import ChatRoomBoundary from "./_components/ChatRoomBoundary"
import SearchChatInput from "./_components/SearchChatInput"
import ChatList from "./_components/ChatList"
import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "채팅 - Game Mate",
  description: "게임 메이트와 채팅으로 소통하세요",
}

export default function ChatPage() {
  return (
    <ChatPageContainer>
      <LeftSection>
        <SearchChatInput />
        <QuerySectionBoundary keys={queryKeys.chat.chatRooms()}>
          <ChatList />
        </QuerySectionBoundary>
      </LeftSection>

      <RightSection>
        <ChatRoomBoundary />
      </RightSection>
    </ChatPageContainer>
  )
}
