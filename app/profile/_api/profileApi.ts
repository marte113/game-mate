//profile페이지에서 사용되는 api 코드를 작성
//

import { ApiReviewData } from '@/app/api/profile/review/route'; // API 라우트에서 정의한 타입 임포트

// API 응답의 예상 구조 (reviews 키가 있는 객체)
interface ReviewsApiResponse {
  reviews: ApiReviewData[];
}

const profileApi = {
  /**
   * 특정 프로필(public_id 기준)에 달린 리뷰 목록을 가져옵니다.
   * @param profileId - 조회할 프로필의 public_id
   * @returns 리뷰 목록 Promise
   */
  async getReviewsByProfileId(profileId: string): Promise<ApiReviewData[]> {
    try {
      const response = await fetch(`/api/profile/review?profileId=${profileId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // 에러 응답 파싱 시도
        console.error(`API Error (${response.status}): `, errorData);
        throw new Error(`Failed to fetch reviews. Status: ${response.status}`);
      }

      const data: ReviewsApiResponse = await response.json();
      return data.reviews || []; // reviews 배열 반환, 없으면 빈 배열

    } catch (error) {
      console.error('Error fetching reviews:', error);
      // 에러를 다시 throw하여 useQuery에서 처리하도록 함
      throw error;
    }
  }
};

export default profileApi;
