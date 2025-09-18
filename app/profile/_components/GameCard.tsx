"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, Sparkles } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"

import ReservationModal from "@/app/dashboard/chat/_components/reserveModal/ReservationModal"

interface GameCardProps {
  game: {
    id: string | number
    title: string
    name?: string
    icon?: string
    image: string
    price?: number
  }
  rating: number
  reviewCount: number
  isOwner?: boolean
  // 프로필 소유자의 userId (의뢰 생성 시 providerId로 사용)
  providerUserId?: string
}

export default function GameCard({
  game,
  rating,
  reviewCount,
  isOwner = false,
  providerUserId,
}: GameCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  const handleOpenModal = () => {
    // 비로그인 상태면 모달을 열지 않고 로그인 페이지로 이동(next에 현재 경로 포함)
    if (!user) {
      const query = searchParams?.toString()
      const nextUrl = query ? `${pathname}?${query}` : pathname
      router.push(`/login?next=${encodeURIComponent(nextUrl)}`)
      return
    }

    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="card bg-base-100 shadow-md overflow-hidden mt-0">
        <div className="p-4">
          {/* 대표 게임 라벨 */}
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent px-3 py-1 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            <span>대표 게임</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src={game.icon || game.image}
                alt={game.name || game.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{game.title}</h3>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center gap-0.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-base-content/60">({reviewCount})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-3">
            <span className="text-amber-500 font-bold">
              {game.price?.toLocaleString() || "450"}
            </span>
            <span className="text-xs text-base-content/70">/판</span>
          </div>

          {isOwner ? (
            <button className="btn btn-block rounded-full mt-4 bg-black text-white hover:bg-gray-800">
              수정하기
            </button>
          ) : (
            <button
              className="btn btn-primary btn-block rounded-full mt-4"
              onClick={handleOpenModal}
            >
              신청하기
            </button>
          )}
        </div>
      </div>

      {/* 예약 모달 - 각 게임 카드마다 독립적인 모달 */}
      {!isOwner && (
        <ReservationModal isOpen={isModalOpen} onClose={handleCloseModal} userId={providerUserId} />
      )}
    </>
  )
}
