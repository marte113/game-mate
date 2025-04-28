"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HeaderLeft() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleIntroClick = () => {
    router.push('/intro');
  };

  const handleCategoryClick = () => {
    router.push('/category');
  };

  return (
    <div className="flex items-center gap-4 pl-6 md:pl-0">
      <div className="cursor-pointer group" onClick={handleLogoClick}>
        <Image src="/icons/free-icon-gamepad.png" alt="logo" width={30} height={30} />
      </div>
      <button className="cursor-pointer hover:text-gray-300" onClick={handleCategoryClick}>카테고리</button>
      <button className="cursor-pointer hover:text-gray-300" onClick={handleIntroClick}>소개</button>
    </div>
  );
} 