//여기에 home에서 사용하는 타입을 정의해서 사용.
//

// 추천 메이트 API 응답 타입
export interface RecommendedThemeResponse {
  themes: ThemeWithMates[];
  nextPage: number | null;
}

// 게임 테마와 관련 메이트들
export interface ThemeWithMates {
  id: string;
  name: string;         // 게임 영문 이름 (ex: League_of_legend)
  description: string;  // 게임 한글 이름 (ex: 리그 오브 레전드)
  image_url: string;    // 게임 이미지 URL
  mates: MateData[];    // 해당 게임의 추천 메이트 목록
}

// 메이트 데이터 타입
export interface MateData {
  id: string;           // 유저 ID
  name: string;         // 닉네임
  game: string;         // 게임 이름 (한글)
  gameIcon: string;     // 게임 아이콘 URL
  price: number;        // 판당 가격
  rating: number;       // 평점
  description: string;  // 설명
  image: string;        // 프로필 이미지
  isOnline: boolean;    // 온라인 상태
  videoLength: string;  // 비디오 길이 (선택적)
}