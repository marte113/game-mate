"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  return (
    <>
      {isSearchOpen ? (
        <div className="flex items-center gap-2 mr-4">
          <input
            type="text"
            placeholder="닉네임 혹은 태그명을 입력하세요"
            className="input input-ghost w-full max-w-xs h-8 text-sm"
            autoFocus
            onBlur={() => setIsSearchOpen(false)}
          />
        </div>
      ) : (
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="w-5 h-5" />
        </button>
      )}
    </>
  );
} 