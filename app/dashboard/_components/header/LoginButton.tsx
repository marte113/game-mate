"use client";

import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <button 
      onClick={handleLoginClick}
      className="btn btn-primary btn-sm rounded-full px-6"
    >
      로그인
    </button>
  );
} 