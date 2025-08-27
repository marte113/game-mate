"use client";

import { memo } from "react";

import ProfileDropdown from '../ProfileDropdown';
import AlarmDropdown from '../AlarmDropdown';

// 메모이제이션을 통한 불필요한 리렌더링 방지
export default memo(function UserProfile() {
  return (
    <>
      <AlarmDropdown />
      <ProfileDropdown />
    </>
  );
}); 