"use client"

import React, { useState, useCallback } from "react"
import Image from "next/image"
import { Plus, X, ChevronDown, Check } from "lucide-react"
import { useFormContext, Controller, type ControllerRenderProps } from "react-hook-form"

import { type ProfileDataSchema } from "@/libs/schemas/profile.schema"
import { useAllGames } from "@/hooks/api/games/useAllGames"

// 페이지 사이즈 상수 (클라이언트 페이징)
const PAGE_SIZE = 6

// Define props including the 'name' for react-hook-form field identification
interface GameSelectionCardProps {
  name: keyof ProfileDataSchema
}

// Use React.memo for potential performance optimization if props are stable
const GameSelectionCard = React.memo(({ name }: GameSelectionCardProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const {
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<ProfileDataSchema>()
  const { data, isLoading, isError } = useAllGames()
  const allGames = data?.games ?? []
  // DB 스키마: description(한글명) -> title로 사용, image_url -> image 사용
  const mappedGames = allGames
    .map((g) => ({
      id: g.id,
      title: g.description ?? "",
      image: g.image_url ?? "/hero/hero-image.jpg",
    }))
    .filter((g) => !!g.title) // description이 없는 항목은 제외 (선택값은 한글 title 기준)

  // 클라이언트 페이징 계산
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(mappedGames.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE
  const pageGames = mappedGames.slice(start, end)

  const fieldError = errors[name]?.message

  // 선택된 게임의 정보 조회 (전체 목록에서 검색)
  const getSelectedGameInfo = (gameTitle: string) => {
    return mappedGames.find((game) => game.title === gameTitle)
  }

  // Update form state when toggling game selection (wrapped with useCallback)
  const toggleGameSelection = useCallback(
    (gameTitle: string) => {
      const currentSelection = (getValues(name) as string[] | undefined) ?? []
      let newSelection: string[]
      if (currentSelection.includes(gameTitle)) {
        newSelection = currentSelection.filter((title) => title !== gameTitle)
      } else {
        newSelection = [...currentSelection, gameTitle]
      }
      setValue(name, newSelection, { shouldValidate: true, shouldDirty: true })
    },
    [getValues, setValue, name],
  ) // Add dependencies

  // Update form state when removing a game (wrapped with useCallback)
  const removeGame = useCallback(
    (gameTitle: string) => {
      const currentSelection = (getValues(name) as string[] | undefined) ?? []
      const newSelection = currentSelection.filter((title) => title !== gameTitle)
      setValue(name, newSelection, { shouldValidate: true, shouldDirty: true })
    },
    [getValues, setValue, name],
  ) // Add dependencies

  return (
    <div className="form-control mt-4">
      <label className="label">
        <span className="label-text">게임 카테고리</span>
        {fieldError && <span className="label-text-alt text-error">{fieldError}</span>}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field }: { field: ControllerRenderProps<ProfileDataSchema, typeof name> }) => {
          const selectedGamesValue = (field.value as string[] | undefined) ?? []

          return (
            <>
              <div className="grid grid-cols-3 gap-2 my-4">
                {selectedGamesValue.map((gameTitle: string) => {
                  const game = getSelectedGameInfo(gameTitle)
                  if (!game) return null
                  return (
                    <div key={game.id} className="card bg-base-200 relative">
                      <div className="card-body p-3">
                        <div className="w-full aspect-video relative rounded-lg overflow-hidden mb-2">
                          <Image
                            src={game.image}
                            alt={game.title}
                            fill
                            className="object-cover object-bottom"
                          />
                          <button
                            type="button"
                            onClick={() => removeGame(game.title)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-base-100/80 hover:bg-error/80 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-center font-medium">{game.title}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <details
                className="dropdown w-full"
                open={isDropdownOpen}
                onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <summary className="flex items-center justify-between w-full px-4 py-3 bg-base-100 hover:bg-black hover:text-white rounded-lg cursor-pointer border border-base-300 transition-colors">
                  <div className="flex items-center">
                    <Plus className="w-5 h-5" />
                    <span>&nbsp;게임 추가하기</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </summary>
                <div className="dropdown-content bg-gray-100 rounded-b-md w-full p-4 shadow-2xl z-10">
                  {isError && (
                    <div className="text-error text-sm mb-3">
                      게임 목록을 불러오는데 실패했습니다.
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      className="btn btn-xs"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage((p) => Math.max(0, p - 1))
                      }}
                      disabled={isLoading || page === 0}
                    >
                      이전
                    </button>
                    <span className="text-xs text-base-content/70">
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-xs"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }}
                      disabled={isLoading || page >= totalPages - 1}
                    >
                      다음
                    </button>
                  </div>
                  {isLoading ? (
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-lg overflow-hidden animate-pulse bg-base-200"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {pageGames.map((game) => (
                        <div
                          key={game.id}
                          className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer group ${
                            selectedGamesValue.includes(game.title) ? "ring-2 ring-yellow-400" : ""
                          }`}
                          onClick={() => toggleGameSelection(game.title)}
                        >
                          <Image
                            src={game.image}
                            alt={game.title}
                            fill
                            className="object-cover object-bottom"
                          />
                          {selectedGamesValue.includes(game.title) && (
                            <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-white text-sm font-medium">{game.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            </>
          )
        }}
      />
    </div>
  )
})

GameSelectionCard.displayName = "GameSelectionCard"

export default GameSelectionCard
