"use client";


import { useAuthStore } from '@/stores/authStore';

import SearchBar from './SearchBar';
import TokenDisplay from './TokenDisplay';
import UserProfile from './UserProfile';
import LoginButton from './LoginButton';


export default function HeaderRight() {
  const { user, isLoading } = useAuthStore();

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <span className="loading loading-spinner loading-sm w-5 h-5 flex items-center justify-center"></span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <SearchBar />
      
      {user ? (
        // 로그인 상태일 때 보여줄 UI
        <>
          <TokenDisplay />
          <UserProfile />
        </>
      ) : (
        // 비로그인 상태일 때 보여줄 UI
        <LoginButton />
      )}
    </div>
  );
} 