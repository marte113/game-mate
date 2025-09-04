import ChatPageContainer from './_hooks/ChatPageContainer'
import LeftSection from './_components/LeftSection'
import RightSection from './_components/RightSection'
import ChatRoom from './_components/ChatRoom'
import SearchChatInput from './_components/SearchChatInput'
import ChatList from './_components/ChatList'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: '채팅 - Game Mate',
  description: '게임 메이트와 채팅으로 소통하세요',
}

export default function ChatPage() {
  return (
    <ChatPageContainer>
      <LeftSection >
        <SearchChatInput />
         <ChatList />
      </LeftSection>
      
      <RightSection>
        <ChatRoom />
      </RightSection>
    </ChatPageContainer>
  )
}