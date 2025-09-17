"use client"

import Link from "next/link"
import Image from "next/image"
import { DEFAULT_AVATAR_SRC } from "@/constants/image"

import { UserSearchResult } from "./types"

export default function ResultItem({
  user,
  index,
  isActive,
  onHover,
}: {
  user: UserSearchResult
  index: number
  isActive: boolean
  onHover: () => void
}) {
  return (
    <li
      id={`search-users-option-${index}`}
      role="option"
      aria-selected={isActive}
      className="px-2"
      onMouseEnter={onHover}
    >
      <Link
        href={`/profile/${user.public_id}`}
        className={`flex items-center gap-3 rounded-md px-2 py-2 focus:outline-none ${
          isActive ? "bg-base-200" : "hover:bg-base-200"
        }`}
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
          <Image
            src={user.profile_circle_img || DEFAULT_AVATAR_SRC}
            alt={user.username ?? user.nickname ?? "profile"}
            fill
            sizes="40px"
            className="object-cover"
          />
          <span
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-base-100"
            style={{ backgroundColor: user.is_online ? "#0EA5E9" : "#9CA3AF" }}
            aria-label={user.is_online ? "온라인" : "오프라인"}
          />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{user.username ?? user.name ?? "-"}</div>
          <div className="text-xs text-base-content/60 truncate">
            {user.nickname ?? "닉네임 없음"}
          </div>
        </div>
      </Link>
    </li>
  )
}
