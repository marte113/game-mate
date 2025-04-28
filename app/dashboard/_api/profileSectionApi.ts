import { ProfileData } from '@/app/dashboard/_components/profileSection/types';
import { ProfileDataSchema } from '@/libs/schemas/profile.schema';

/**
 * 프로필 정보를 가져오는 함수
 */
export async function fetchProfileInfo(): Promise<ProfileDataSchema> {
  try {
    const response = await fetch('/api/profile/info');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '프로필 정보를 불러오는데 실패했습니다');
    }
    
    const { profileData } = await response.json();
    
    // API 응답 (responsePayload)를 클라이언트에서 사용할 형태로 반환
    // profileData가 null일 경우 기본값 처리 강화
    const defaultData: Partial<ProfileDataSchema> = {
        nickname: '',
        username: '',
        description: '',
        selected_games: [],
        selected_tags: [],
        youtube_urls: [],
        is_mate: false,
    }

    return {
      ...defaultData, // 기본값 먼저 적용
      ...(profileData || {}), // API에서 받은 데이터 덮어쓰기 (null일 경우 빈 객체)
      // DB 필드명과 클라이언트 필드명이 다를 경우 여기서 매핑
      // 예: introduction: profileData?.description ?? ''
    };
  } catch (error) {
    console.error('프로필 정보 로드 오류:', error);
    throw error; // 에러를 다시 throw하여 useQuery에서 처리
  }
}

/**
 * 프로필 정보를 업데이트하는 함수
 */
export async function updateProfileInfo(profileData: Partial<ProfileDataSchema>) {
  try {
    const response = await fetch('/api/profile/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 전송할 데이터에 username 포함
      body: JSON.stringify({
        nickname: profileData.nickname,
        username: profileData.username, // username 추가
        description: profileData.description, // 스키마와 필드명 일치
        selected_games: profileData.selected_games,
        selected_tags: profileData.selected_tags,
        youtube_urls: profileData.youtube_urls,
        is_mate: profileData.is_mate,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      // 서버에서 보낸 상세 에러 메시지 사용
      throw new Error(errorData.error || '프로필 정보를 저장하는데 실패했습니다');
    }
    
    return await response.json();
  } catch (error) {
    console.error('프로필 저장 오류:', error);
    throw error; // 에러를 다시 throw하여 useMutation에서 처리
  }
}

/**
 * 프로필 이미지 정보를 가져오는 함수
 */
export async function fetchProfileImage() {
  try {
    const response = await fetch('/api/profile/image/profileImage');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '프로필 이미지를 불러오는데 실패했습니다');
    }
    
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('프로필 이미지 로드 오류:', error);
    throw error;
  }
}

/**
 * 프로필 이미지를 업데이트하는 함수
 */
export async function updateProfileImage(imageUrl: string) {
  try {
    const response = await fetch('/api/profile/image/profileImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '프로필 이미지를 업데이트하는데 실패했습니다');
    }
    
    return await response.json();
  } catch (error) {
    console.error('프로필 이미지 업데이트 오류:', error);
    throw error;
  }
}

/**
 * 파일을 스토리지에 업로드하는 함수
 */
export async function uploadFileToStorage(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '파일 업로드에 실패했습니다');
    }
    
    const { data } = await response.json();
    return data.url;
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    throw error;
  }
}

/**
 * 앨범 이미지 목록을 가져오는 함수
 */
export async function fetchAlbumImages() {
  try {
    const response = await fetch('/api/profile/image/image_gallery');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '앨범 이미지를 불러오는데 실패했습니다');
    }
    const { data, thumbnailIndex } = await response.json();
    return { images: data, thumbnailIndex }; // 서버 응답 구조에 맞게 반환
  } catch (error) {
    console.error('앨범 이미지 로드 오류:', error);
    throw error;
  }
}

/**
 * 앨범 이미지를 업로드하는 함수
 */
export async function uploadAlbumImage(file: File, index: number) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('index', index.toString());

    const response = await fetch('/api/profile/image/image_gallery', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '앨범 이미지 업로드에 실패했습니다');
    }

    const { data } = await response.json();
    return data; // 업로드된 이미지 정보 반환
  } catch (error) {
    console.error('앨범 이미지 업로드 오류:', error);
    throw error;
  }
}

/**
 * 앨범 이미지를 삭제하는 함수
 */
export async function deleteAlbumImage(imageId: string) {
  try {
    const response = await fetch('/api/profile/image/image_gallery', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '앨범 이미지 삭제에 실패했습니다');
    }

    return await response.json(); // 삭제 결과 및 새 썸네일 정보 반환
  } catch (error) {
    console.error('앨범 이미지 삭제 오류:', error);
    throw error;
  }
}

/**
 * 이미지를 썸네일로 설정하는 함수
 */
export async function setAlbumImageAsThumbnail(imageUrl: string) {
  try {
    const response = await fetch('/api/profile/image/image_gallery', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '썸네일 설정에 실패했습니다');
    }

    return await response.json(); // 새 썸네일 정보 반환
  } catch (error) {
    console.error('썸네일 설정 오류:', error);
    throw error;
  }
}
