"use client"

import Image from "next/image"

import { GameSelectorProps } from "./types"

export function GameSelector({
  games,
  selectedGame,
  setSelectedGame,
  isLoading,
}: GameSelectorProps) {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">게임 선택</span>
      </label>
      <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="게임 선택">
        {games.map((game) => (
          <div
            key={game.id}
            role="radio"
            aria-checked={selectedGame?.id === game.id}
            aria-label={game.game}
            aria-disabled={isLoading}
            tabIndex={isLoading ? -1 : 0}
            className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
              selectedGame?.id === game.id ? "ring-2 ring-primary" : ""
            } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => !isLoading && setSelectedGame(game)}
            onKeyDown={(e) => {
              if (isLoading) return
              if (
                e.key === "Enter" ||
                e.key === " " ||
                e.code === "Space" ||
                e.key === "Spacebar"
              ) {
                e.preventDefault()
                setSelectedGame(game)
              }
            }}
          >
            <Image src={game.image} alt={game.game} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-end p-2">
              <span className="text-white text-sm font-medium">{game.game}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
