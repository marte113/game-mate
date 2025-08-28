'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { createActionClient } from '@/supabase/functions/server';

/**
 * 프로필 데이터 가져오기 서버 액션
 */
export async function getProfileServerAction() {
  const supabase = await createActionClient(cookies());
  
  // 현재 로그인한 사용자 정보 가져오기
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      error: '로그인이 필요합니다',
      success: false,
    };
  }
  
  try {
    // 프로필 정보 가져오기
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      return {
        error: '프로필 정보를 가져오는데 실패했습니다',
        success: false,
      };
    }
    
    // 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) {
      return {
        error: '사용자 정보를 가져오는데 실패했습니다',
        success: false,
      };
    }
    
    // 앨범 이미지 가져오기
    const { data: albumImages, error: albumError } = await supabase
      .from('album_images')
      .select('*')
      .eq('user_id', user.id)
      .order('order_num', { ascending: true });
    
    if (albumError) {
      return {
        error: '앨범 이미지를 가져오는데 실패했습니다',
        success: false,
      };
    }
    
    // 앨범 이미지 포맷팅
    const formattedAlbumImages = formatAlbumImages(albumImages || []);
    
    return {
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
      success: true,
    };
  } catch (error) {
    return {
      error: '프로필 정보를 가져오는데 실패했습니다',
      success: false,
    };
  }
}

/**
 * 프로필 업데이트 서버 액션
 */
export async function updateProfileServerAction(formData: FormData) {
  const supabase = await createActionClient(cookies());
  
  // 현재 로그인한 사용자 정보 가져오기
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      error: '로그인이 필요합니다',
      success: false,
    };
  }
  
  try {
    // 폼 데이터에서 값 추출
    const nickname = formData.get('nickname') as string;
    const introduction = formData.get('introduction') as string;
    const selectedGamesStr = formData.get('selectedGames') as string;
    const selectedTagsStr = formData.get('selectedTags') as string;
    const youtubeUrlsStr = formData.get('youtubeUrls') as string;
    
    // 문자열 배열로 변환
    const selectedGames = selectedGamesStr ? JSON.parse(selectedGamesStr) : [];
    const selectedTags = selectedTagsStr ? JSON.parse(selectedTagsStr) : [];
    const youtubeUrls = youtubeUrlsStr ? JSON.parse(youtubeUrlsStr) : [];
    
    // 프로필 정보 업데이트
    const { error } = await supabase
      .from('profiles')
      .update({
        nickname,
        description: introduction,
        selected_games: selectedGames,
        selected_tags: selectedTags,
        youtube_urls: youtubeUrls,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
    
    if (error) {
      return {
        error: '프로필 정보를 저장하는데 실패했습니다',
        success: false,
      };
    }
    
    // 캐시 무효화
    revalidatePath('/dashboard');
    
    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    return {
      error: error.message || '프로필 정보를 저장하는데 실패했습니다',
      success: false,
    };
  }
}

// 앨범 이미지 포맷팅 함수
function formatAlbumImages(images: any[]): Array<{ id: string; url: string; order: number } | null> {
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
} 