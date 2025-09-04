"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, FileText, ClipboardList, LogOut, HandCoins } from "lucide-react";

import { useAuthStore } from '@/stores/authStore';

import ProfileDropdownInfo from "./ProfileDropdownInfo";

function ProfileMenu() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const profileImage = user?.profile_circle_img || "/avatar/avatar_8.jpeg";

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  }, [logout, router]);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        className="btn btn-ghost hover:bg-primary btn-circle avatar"
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="block w-10 rounded-full overflow-hidden">
          <Image
            src={profileImage}
            alt="profile"
            width={40}
            height={40}
            className="w-full h-full max-w-10 max-h-10 rounded-full object-cover"
            priority
          />
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-2 top-16 w-48 bg-base-100 rounded-lg shadow-lg border border-base-300 py-2 z-50"
        >
          <ProfileDropdownInfo />

          <div className="py-1">
            <Link
              href="/dashboard"
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-base-200 text-left"
              onClick={close}
            >
              <User className="w-4 h-4" />
              마이 페이지
            </Link>
            <Link
              href="/dashboard/chat"
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-base-200 text-left"
              onClick={close}
            >
              <FileText className="w-4 h-4" />
              메시지
            </Link>
            <Link
              href="/dashboard?tab=token"
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-base-200 text-left"
              onClick={close}
            >
              <HandCoins className="w-4 h-4" />
              토큰
            </Link>
            <Link
              href="/dashboard/task?tab=received"
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-base-200 text-left"
              onClick={close}
            >
              <ClipboardList className="w-4 h-4" />
              의뢰
            </Link>

            <button
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-base-200 text-left"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ProfileMenu);
