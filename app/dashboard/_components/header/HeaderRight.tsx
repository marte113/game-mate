"use client"

import { Suspense } from "react"

import { useUser, useAuthLoaded } from "@/stores/authStore"

import SearchBar from "./SearchBar"
import TokenDisplay from "./TokenDisplay"
import UserProfile from "./UserProfile"
import LoginButton from "./LoginButton"

export default function HeaderRight() {
  const user = useUser()
  const isLoaded = useAuthLoaded()

  // 초기 로드 전 또는 로딩 중일 때 스켈레톤 표시
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 md:gap-4">
        <span className="loading loading-spinner loading-sm flex items-center justify-center" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <SearchBar />

      {user ? (
        // 로그인 상태일 때 보여줄 UI
        <>
          <TokenDisplay />
          <UserProfile />
        </>
      ) : (
        // 비로그인 상태일 때 보여줄 UI
        <Suspense
          fallback={<button className="btn btn-primary btn-sm rounded-full px-6">로그인</button>}
        >
          <LoginButton />
        </Suspense>
      )}
    </div>
  )
}
