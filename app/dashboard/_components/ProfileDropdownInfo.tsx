"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/supabase/functions/client";

interface ProfileInfo {
  nickname: string;
  username: string;
  profileImage: string;
  following: number;
  followers: number;
  publicId: string;
}

export default function ProfileDropdownInfo() {
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({
    nickname: "",
    username: "",
    profileImage: "/avatar/avatar_default.png",
    following: 0,
    followers: 0,
    publicId: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileInfo = async () => {
      try {
        const supabase = createClient();
        
        // 현재 로그인한 사용자 정보 가져오기
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error("사용자 인증 오류:", authError);
          setIsLoading(false);
          return;
        }
        
        // 프로필 정보 가져오기 (profiles 테이블)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("nickname, username, follower_count, public_id")
          .eq("user_id", user.id)
          .single();
        
        if (profileError || !profileData) {
          console.error("프로필 정보 로드 오류:", profileError);
          setIsLoading(false);
          return;
        }
        
        // 사용자 정보 가져오기 (users 테이블에서 프로필 이미지)
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("profile_circle_img")
          .eq("id", user.id)
          .single();
        
        if (userError) {
          console.error("사용자 정보 로드 오류:", userError);
        }
        
        // 팔로잉 수는 임시 데이터 사용
        const following = 0;
        
        setProfileInfo({
          nickname: profileData.nickname || "사용자",
          username: profileData.username || user.id.substring(0, 8),
          profileImage: userData?.profile_circle_img || "/avatar/avatar_default.png",
          following,
          followers: profileData.follower_count || 0,
          publicId: String(profileData.public_id || ""),
        });
      } catch (error) {
        console.error("프로필 정보 로드 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileInfo();
  }, []);
  
  if (isLoading) {
    return (
      <div className="px-4 py-2 border-b border-base-200">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-base-300 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-base-300 animate-pulse rounded"></div>
            <div className="h-3 w-16 bg-base-300 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-center">
            <div className="h-4 w-4 bg-base-300 animate-pulse rounded mx-auto"></div>
            <div className="h-3 w-10 bg-base-300 animate-pulse rounded mt-1"></div>
          </div>
          <div className="text-center">
            <div className="h-4 w-4 bg-base-300 animate-pulse rounded mx-auto"></div>
            <div className="h-3 w-10 bg-base-300 animate-pulse rounded mt-1"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 border-b border-base-200">
      <Link href={`/profile/${profileInfo.publicId}`} className="block">
        <div className="flex items-center gap-3 hover:bg-base-200 p-1 rounded-md transition-colors">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={profileInfo.profileImage}
              alt="프로필"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-medium">{profileInfo.nickname}</div>
            <div className="text-xs text-base-content/60">ID : {profileInfo.username}</div>
          </div>
        </div>
      </Link>
      <div className="flex justify-between mt-2">
        <div className="text-center">
          <div className="font-medium">{profileInfo.following}</div>
          <div className="text-xs text-base-content/60">팔로잉</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{profileInfo.followers}</div>
          <div className="text-xs text-base-content/60">팔로워</div>
        </div>
      </div>
    </div>
  );
} 