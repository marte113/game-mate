import { useRef, useEffect } from "react";
import Link from "next/link";
import { User, FileText, ClipboardList, LogOut, HandCoins } from "lucide-react";
import ProfileDropdownInfo from "./ProfileDropdownInfo";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export default function ProfileDropdown({
  isOpen,
  onClose,
  onLogout,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // 로그아웃 페이지로 이동
      window.location.href = "/auth/logout";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-2 top-16 w-48 bg-base-100 rounded-lg shadow-lg border border-base-300 py-2 z-50"
    >
      <ProfileDropdownInfo />

      <div className="py-1">
        <Link
          href="/dashboard"
          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-base-200 text-left block"
          onClick={onClose}
        >
          <User className="w-4 h-4" />
          마이 페이지
        </Link>
        <Link
          href="/dashboard/chat"
          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-base-200 text-left block"
          onClick={onClose}
        >
          <FileText className="w-4 h-4" />
          메시지
        </Link>
        <Link
          href="/dashboard?tab=token"
          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-base-200 text-left block"
          onClick={onClose}
        >
          <HandCoins className="w-4 h-4" />
          토큰
        </Link>
        <Link
          href="/dashboard/task"
          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-base-200 text-left block"
          onClick={onClose}
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
  );
}
