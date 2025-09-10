"use client"

import React, { memo } from "react"
import dynamic from "next/dynamic"

import { GameSelectorProps } from "../types"
import { GameSectionSkeleton } from "./skeletons/GameSectionSkeleton"

const GameSelector = dynamic(
  () => import("../GameSelector").then((m) => ({ default: m.GameSelector })),
  { ssr: false, loading: () => <GameSectionSkeleton /> },
)

export const GameSection = memo(function GameSection({
  games,
  selectedGame,
  setSelectedGame,
  isLoading,
}: GameSelectorProps) {
  if (isLoading) return <GameSectionSkeleton />

  return (
    <div>
      <GameSelector
        games={games}
        selectedGame={selectedGame}
        setSelectedGame={setSelectedGame}
        isLoading={isLoading}
      />
    </div>
  )
})
