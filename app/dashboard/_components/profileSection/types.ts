// 프로필 데이터 타입 정의
export interface ProfileData {
  id?: string;
  user_id?: string;
  nickname: string;
  description: string;
  selectedGames: string[];
  selectedTags: string[];
  youtubeUrls: string[];
  is_mate?: boolean;
  created_at?: string;
  updated_at?: string;
  
}

// 앨범 이미지 타입 정의
export interface AlbumImage {
  id: string;
  url: string;
  order: number;
} 