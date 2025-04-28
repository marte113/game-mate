import { createClient, createServerClient } from './supabase';
import { clientFetch, serverFetch, ApiResponse } from './base';
import { Database } from '@/types/supabase';
import { cache } from 'react';

export type ProfileData = {
  id: string;
  userId: string;
  nickname: string | null;
  introduction: string | null;
  selectedGames: string[] | null;
  selectedTags: string[] | null;
  youtubeUrls: string[] | null;
  profileImage: string | null;
  albumImages: Array<{ id: string; url: string; order: number } | null>;
  createdAt: string;
  updatedAt: string;
};

export type ProfileUpdateData = {
  nickname?: string;
  introduction?: string;
  selectedGames?: string[];
  selectedTags?: string[];
  youtubeUrls?: string[];
};

// 서버 컴포넌트에서 사용할 프로필 데이터 가져오기 함수 (캐싱 적용)
export const getProfileData = cache(async (userId: string): Promise<ApiResponse<ProfileData>> => {
  const supabase = createServerClient();
  
  return serverFetch(async () => {
    // 프로필 정보 가져오기
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      return { data: null, error: profileError };
    }
    
    // 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('profile_circle_img')
      .eq('id', userId)
      .single();
    
    if (userError) {
      return { data: null, error: userError };
    }
    
    // 앨범 이미지 가져오기
    const { data: albumImages, error: albumError } = await supabase
      .from('album_images')
      .select('*')
      .eq('user_id', userId)
      .order('order_num', { ascending: true });
    
    if (albumError) {
      return { data: null, error: albumError };
    }
    
    // 데이터 포맷팅
    const formattedAlbumImages = formatAlbumImages(albumImages || []);
    
    return {
      data: {
        id: profileData.id,
        userId: profileData.user_id,
        nickname: profileData.nickname,
        introduction: profileData.description,
        selectedGames: profileData.selected_games,
        selectedTags: profileData.selected_tags,
        youtubeUrls: profileData.youtube_urls,
        profileImage: userData.profile_circle_img,
        albumImages: formattedAlbumImages,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      },
      error: null,
    };
  });
});

// 클라이언트 컴포넌트에서 사용할 프로필 데이터 가져오기 함수
export const fetchProfileData = async (): Promise<ApiResponse<ProfileData>> => {
  const supabase = createClient();
  
  return clientFetch(async () => {
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('로그인이 필요합니다') };
    }
    
    // 프로필 정보 가져오기
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      return { data: null, error: profileError };
    }
    
    // 앨범 이미지 가져오기
    const { data: albumImages, error: albumError } = await supabase
      .from('album_images')
      .select('*')
      .eq('user_id', user.id)
      .order('order_num', { ascending: true });
    
    if (albumError) {
      return { data: null, error: albumError };
    }
    
    // 데이터 포맷팅
    const formattedAlbumImages = formatAlbumImages(albumImages || []);
    
    return {
      data: {
        id: profileData.id,
        userId: profileData.user_id,
        nickname: profileData.nickname,
        introduction: profileData.description,
        selectedGames: profileData.selected_games,
        selectedTags: profileData.selected_tags,
        youtubeUrls: profileData.youtube_urls,
        profileImage: user.user_metadata?.avatar_url || null,
        albumImages: formattedAlbumImages,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      },
      error: null,
    };
  });
};

// 프로필 업데이트 함수
export const updateProfile = async (data: ProfileUpdateData): Promise<ApiResponse<boolean>> => {
  const supabase = createClient();
  
  return clientFetch(async () => {
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('로그인이 필요합니다') };
    }
    
    // 프로필 정보 업데이트
    const { error } = await supabase
      .from('profiles')
      .update({
        nickname: data.nickname,
        description: data.introduction,
        selected_games: data.selectedGames,
        selected_tags: data.selectedTags,
        youtube_urls: data.youtubeUrls,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
    
    if (error) {
      return { data: null, error };
    }
    
    return { data: true, error: null };
  });
};

// 프로필 이미지 업로드 함수
export const uploadProfileImage = async (file: File): Promise<ApiResponse<string>> => {
  const supabase = createClient();
  
  return clientFetch(async () => {
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('로그인이 필요합니다') };
    }
    
    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop();
    const fileName = `profile_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;  // 사용자 ID 폴더 아래에 파일 저장
    
    // 스토리지에 이미지 업로드 - avatars 버킷 사용
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true  // 같은 경로에 파일이 있으면 덮어쓰기
      });
    
    if (uploadError) {
      return { data: null, error: uploadError };
    }
    
    // 업로드된 이미지 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    // 사용자 프로필 이미지 업데이트
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_circle_img: publicUrl })
      .eq('id', user.id);
    
    if (updateError) {
      return { data: null, error: updateError };
    }
    
    return { data: publicUrl, error: null };
  });
};

// 앨범 이미지 업로드 함수
export const uploadAlbumImage = async (file: File, index: number): Promise<ApiResponse<{ id: string; url: string }>> => {
  const supabase = createClient();
  
  return clientFetch(async () => {
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('로그인이 필요합니다') };
    }
    
    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop();
    const fileName = `album_${index}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;  // 사용자 ID 폴더 아래에 파일 저장
    
    // 스토리지에 이미지 업로드 - albums 버킷 사용
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('albums')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true  // 같은 경로에 파일이 있으면 덮어쓰기
      });
    
    if (uploadError) {
      return { data: null, error: uploadError };
    }
    
    // 업로드된 이미지 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('albums')
      .getPublicUrl(filePath);
    
    // 기존 이미지 확인
    const { data: existingImage, error: checkError } = await supabase
      .from('album_images')
      .select('id')
      .eq('user_id', user.id)
      .eq('order_num', index)
      .maybeSingle();
    
    let result;
    
    if (existingImage) {
      // 기존 이미지 업데이트
      const { data, error: updateError } = await supabase
        .from('album_images')
        .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', existingImage.id)
        .select('id')
        .single();
      
      if (updateError) {
        return { data: null, error: updateError };
      }
      
      result = { id: data.id, url: publicUrl };
    } else {
      // 새 이미지 추가
      const { data, error: insertError } = await supabase
        .from('album_images')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          order_num: index,
          is_thumbnail: false,
        })
        .select('id')
        .single();
      
      if (insertError) {
        return { data: null, error: insertError };
      }
      
      result = { id: data.id, url: publicUrl };
    }
    
    return { data: result, error: null };
  });
};

// 앨범 이미지 삭제 함수
export const deleteAlbumImage = async (imageId: string): Promise<ApiResponse<boolean>> => {
  const supabase = createClient();
  
  return clientFetch(async () => {
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('로그인이 필요합니다') };
    }
    
    // 이미지 삭제
    const { error } = await supabase
      .from('album_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', user.id);
    
    if (error) {
      return { data: null, error };
    }
    
    return { data: true, error: null };
  });
};

// 앨범 이미지 포맷팅 함수
const formatAlbumImages = (images: any[]): Array<{ id: string; url: string; order: number } | null> => {
  const result: Array<{ id: string; url: string; order: number } | null> = Array(6).fill(null);
  
  images.forEach((image) => {
    const index = image.order_num;
    if (index >= 0 && index < 6) {
      result[index] = {
        id: image.id,
        url: image.image_url,
        order: image.order_num,
      };
    }
  });
  
  return result;
}; 