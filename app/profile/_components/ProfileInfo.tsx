'use client';

import { PublicProfile } from '@/app/profile/_types/profile.types'; // 절대 경로 alias 사용

interface ProfileInfoProps {
  profileData: PublicProfile;
  isOwnProfile: boolean;
}

export default function ProfileInfo({
  profileData,
  isOwnProfile,
}: ProfileInfoProps) {
  
  // bio 필드가 있다면 표시, 없다면 다른 정보 표시 또는 제거
  // const bio = profileData.bio;

  return (
    <section className="bg-base-200 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">소개</h2>
      {/* bio 필드가 없으므로 임시 텍스트 표시 */}
      <p className="text-base-content/80">
        {profileData.name}님의 프로필입니다. 
        {/* {bio ? bio : '아직 소개가 없습니다.'} */}
        {' 아직 소개 기능이 구현되지 않았습니다.'}
      </p>
      {/* TODO: 필요시 다른 프로필 정보 (가입일, 위치 등) 추가 */} 
    </section>
  );
}


