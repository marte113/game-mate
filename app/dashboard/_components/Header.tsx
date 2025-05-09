"use client";

import HeaderLeft from "./header/HeaderLeft";
import HeaderRight from "./header/HeaderRight";


export default function Header() {
  return (
      <div className="sticky top-0 z-50 flex items-center justify-between gap-4 h-14 px-2 border-b border-gray-300 bg-base-100">
        <HeaderLeft />
        <HeaderRight />
      </div>
  );
}
