"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, UserPlus, UserMinus, MessageSquare, X } from "lucide-react"
import { useRouter } from "next/navigation"

// 임시 팔로우 데이터
type Follow = {
  id: number
  name: string
  username: string
  avatar: string
  games: string[]
  isOnline: boolean
  lastActive: string | null
}

const MOCK_FOLLOWS: Follow[] = [
  {
    id: 1,
    name: "김민수",
    username: "minsu_kim",
    avatar: "/avatar/avatar_8.jpeg",
    games: ["리그 오브 레전드", "오버워치 2"],
    isOnline: true,
    lastActive: null,
  },
  {
    id: 2,
    name: "이지은",
    username: "jieun_lee",
    avatar: "/avatar/avatar_8.jpeg",
    games: ["발로란트", "배틀그라운드"],
    isOnline: false,
    lastActive: "1시간 전",
  },
  {
    id: 3,
    name: "박준호",
    username: "junho_park",
    avatar: "/avatar/avatar_8.jpeg",
    games: ["메이플스토리", "로스트아크"],
    isOnline: true,
    lastActive: null,
  },
  {
    id: 4,
    name: "최유진",
    username: "yujin_choi",
    avatar: "/avatar/avatar_8.jpeg",
    games: ["스타크래프트 2", "디아블로 4"],
    isOnline: false,
    lastActive: "3일 전",
  },
  {
    id: 5,
    name: "정승현",
    username: "seunghyun_jung",
    avatar: "/avatar/avatar_8.jpeg",
    games: ["피파 온라인 4", "서든어택"],
    isOnline: false,
    lastActive: "1주일 전",
  },
  {
    id: 6,
    name: "한소희",
    username: "sohee_han",
    avatar: "/avatar/avatar_8.jpeg",
    games: ["원신", "블루 아카이브"],
    isOnline: true,
    lastActive: null,
  },
  {
    id: 7,
    name: "강도현",
    username: "dohyun_kang",
    avatar: "/avatar/avatar_8.jpeg",
    games: ["에이펙스 레전드", "포트나이트"],
    isOnline: false,
    lastActive: "방금 전",
  },
  {
    id: 8,
    name: "윤서연",
    username: "seoyeon_yoon",
    avatar: "/avatar/avatar_8.jpeg",
    games: ["마인크래프트", "스팀덱"],
    isOnline: true,
    lastActive: null,
  },
]

export default function Follow() {
  const [follows, setFollows] = useState<Follow[]>(MOCK_FOLLOWS)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"all" | "online" | "offline">("all")
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<number | null>(null)
  const router = useRouter()

  // 검색 필터링
  const filteredFollows = follows.filter((follow) => {
    const matchesSearch =
      follow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      follow.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      follow.games.some((game) => game.toLowerCase().includes(searchTerm.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "online") return matchesSearch && follow.isOnline
    if (activeTab === "offline") return matchesSearch && !follow.isOnline

    return matchesSearch
  })

  // 온라인 상태에 따라 정렬
  const sortedFollows = [...filteredFollows].sort((a, b) => {
    // 'all' 탭에서는 온라인 유저를 먼저 표시
    if (activeTab === "all") {
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1
    }

    // 오프라인 유저들 사이에서는 최근 활동 순으로 정렬
    if (!a.isOnline && !b.isOnline) {
      // 'lastActive'가 '방금 전', '1시간 전' 등의 문자열이므로
      // 정확한 시간 비교는 어렵지만, 임시 데이터에서는 이미 정렬된 상태로 가정
      return 0
    }

    // 이름 알파벳 순으로 정렬 (같은 상태일 경우)
    return a.name.localeCompare(b.name)
  })

  // 팔로우 삭제
  const handleRemoveFollow = (id: number) => {
    setFollows(follows.filter((follow) => follow.id !== id))
    setShowRemoveConfirm(null)
  }

  // 프로필 페이지로 이동
  const navigateToProfile = (username: string) => {
    router.push(`/profile/${username}`)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        {/* 헤더 */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">팔로우</h1>
          <p className="text-base-content/70">함께 게임을 즐기는 친구들을 관리하세요</p>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-base-content/50" />
            </div>
            <input
              type="text"
              className="input input-bordered w-full pl-10"
              placeholder="이름, 아이디 또는 게임으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setSearchTerm("")}
              >
                <X className="w-5 h-5 text-base-content/50" />
              </button>
            )}
          </div>

          <div className="tabs tabs-boxed bg-base-200 self-start">
            <button
              className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              전체
            </button>
            <button
              className={`tab ${activeTab === "online" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("online")}
            >
              온라인
            </button>
            <button
              className={`tab ${activeTab === "offline" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("offline")}
            >
              오프라인
            </button>
          </div>
        </div>

        {/* 팔로우 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFollows.length > 0 ? (
            sortedFollows.map((follow) => (
              <div
                key={follow.id}
                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={(e) => {
                  // 버튼 클릭 시 프로필 페이지로 이동하지 않도록 이벤트 전파 방지
                  const target = e.target as Element
                  if (
                    target.closest(".btn") ||
                    target.closest(".card-actions") ||
                    showRemoveConfirm === follow.id
                  ) {
                    return
                  }
                  navigateToProfile(follow.username)
                }}
              >
                <div className="card-body p-4">
                  <div className="flex items-start gap-4">
                    {/* 아바타 및 상태 */}
                    <div className="relative">
                      <div className="avatar">
                        <div className="w-16 h-16 rounded-full">
                          <Image
                            src={follow.avatar}
                            alt={follow.name}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-base-100 ${follow.isOnline ? "bg-success" : "bg-base-300"}`}
                      ></div>
                    </div>

                    {/* 유저 정보 */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="font-bold text-lg">{follow.name}</h2>
                          <p className="text-sm text-base-content/70">@{follow.username}</p>
                        </div>

                        {/* 상태 표시 */}
                        <div>
                          {follow.isOnline ? (
                            <span className="badge badge-success badge-sm">온라인</span>
                          ) : (
                            <span className="badge badge-ghost badge-sm">{follow.lastActive}</span>
                          )}
                        </div>
                      </div>

                      {/* 게임 태그 */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {follow.games.map((game, index) => (
                          <span key={index} className="badge badge-outline badge-sm">
                            {game}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="card-actions justify-end mt-3">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation() // 이벤트 전파 방지
                        router.push(`/dashboard/chats/${follow.username}`)
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="ml-1">메시지</span>
                    </button>

                    {showRemoveConfirm === follow.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-error">삭제하시겠습니까?</span>
                        <button
                          className="btn btn-error btn-sm"
                          onClick={(e) => {
                            e.stopPropagation() // 이벤트 전파 방지
                            handleRemoveFollow(follow.id)
                          }}
                        >
                          예
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={(e) => {
                            e.stopPropagation() // 이벤트 전파 방지
                            setShowRemoveConfirm(null)
                          }}
                        >
                          아니오
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={(e) => {
                          e.stopPropagation() // 이벤트 전파 방지
                          setShowRemoveConfirm(follow.id)
                        }}
                      >
                        <UserMinus className="w-4 h-4" />
                        <span className="ml-1">언팔로우</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-base-content/70">
              <UserPlus className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-semibold mb-2">팔로우한 유저가 없습니다</h3>
              <p className="text-center max-w-md">
                {searchTerm
                  ? `'${searchTerm}'에 대한 검색 결과가 없습니다.`
                  : "함께 게임을 즐길 친구를 찾아 팔로우해보세요!"}
              </p>
              <button className="btn btn-primary mt-4">
                <UserPlus className="w-5 h-5 mr-2" />
                유저 찾기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
