// 예시: orderTypes.ts
import { Database } from '@/types/database.types'

// 기존 Order 타입 정의에 has_review 추가
export type Order = Database['public']['Tables']['requests']['Row'] & {
  provider?: { // provider 정보 타입 (필요시 상세화)
    id: string
    name: string | null
    profile_circle_img: string | null
    is_online: boolean | null
  } | null
  requester?: { // requester 정보 타입 (필요시 상세화)
     id: string
     name: string | null
     profile_circle_img: string | null
     is_online: boolean | null
  } | null
  reviews?: { id: string }[] | null // API 응답에 맞춰 수정
  has_review?: boolean // 리뷰 작성 여부 플래그 추가
}