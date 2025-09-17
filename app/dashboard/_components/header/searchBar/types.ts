// 검색바 관련 타입 모음 (클라이언트/프레젠테이셔널 간 공유)

export type UserSearchResult = {
  profile_id: string
  public_id: string
  username?: string
  name?: string
  nickname?: string
  profile_circle_img?: string
  is_online: boolean
}

export type UseUserSearchLiveReturn = {
  data?: { items: UserSearchResult[] }
  isFetching: boolean
  isError: boolean
  search: (q: string) => void
  cancel?: () => void // 훅이 AbortController 기반 취소를 지원하는 경우
}
