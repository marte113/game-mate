'use client'

import { Dispatch, SetStateAction } from "react"
import SearchChatInput from "./SearchChatInput"
import ChatList from "./ChatList"

interface LeftSectionProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export default function LeftSection({ searchTerm, setSearchTerm }: LeftSectionProps) {
  const handleSearch = (query: string) => {
    setSearchTerm(query)
  }

  return (
    <div className="w-80 bg-base-100 rounded-lg shadow-xl flex flex-col">
      <SearchChatInput onSearch={handleSearch} />
      <ChatList searchTerm={searchTerm} />
    </div>
  )
} 