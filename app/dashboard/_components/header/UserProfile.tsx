"use client";

import { useState, useCallback, memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuthStore } from '@/stores/authStore';

import ProfileDropdown from '../ProfileDropdown';
import AlarmDropdown from '../AlarmDropdown';

// 메모이제이션을 통한 불필요한 리렌더링 방지
export default memo(function UserProfile() {
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false); // 드롭다운 상태 관리
  const { logout, user } = useAuthStore();
  const router = useRouter();
  
  // 프로필 이미지 결정 로직 (상태 없이 계산)
  const profileImage = user?.profile_circle_img || "/avatar/avatar_8.jpeg";

  const handleLogoutClick = useCallback(async () => {
    await logout();
    router.push('/');
  }, [logout, router]);

  const toggleProfile = useCallback(() => {
    setIsProfileOpen(prev => !prev);
  }, []);

  return (
    <>
      <AlarmDropdown />
      
      <div className="relative">
        <button 
          className="btn btn-ghost btn-circle avatar"
          onClick={toggleProfile}
        >
          <div className="w-10 rounded-full">
            <Image
              src={profileImage}
              alt="profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority // LCP 최적화
            />
          </div>
        </button>
        <ProfileDropdown 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          onLogout={handleLogoutClick}
        />
      </div>
    </>
  );
}); 