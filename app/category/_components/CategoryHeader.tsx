"use client"

import Image from "next/image"

import { useGameHeaderQuery } from "@/hooks/api/category/useCategoryQueries"

export default function CategoryHeader({ categoryId }: { categoryId: string }) {
  const { data: gameHeader, isLoading, error } = useGameHeaderQuery(categoryId)

  if (isLoading) return <CategoryHeaderSkeleton />
  if (error)
    return (
      <div role="alert" className="text-red-500">
        카테고리 정보를 불러오지 못했습니다.
      </div>
    )
  if (!gameHeader) return <div className="text-gray-500">카테고리 정보를 찾을 수 없습니다.</div>

  return (
    <div className="flex items-start p-4 border-b border-gray-100">
      {gameHeader.image_url && (
        <Image
          src={gameHeader.image_url}
          alt="Category Header"
          width={135}
          height={180}
          className="rounded-md"
        />
      )}
      <div className="m-4">
        <p className="text-4xl font-bold">{gameHeader.description}</p>
        <ul className="flex gap-2 py-2">
          {gameHeader.genre.map((genre: string) => (
            <li
              key={genre}
              className="text-xs text-gray-600 border border-gray-200 rounded-md px-1"
            >
              {genre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CategoryHeaderSkeleton() {
  return (
    <div className="flex items-center p-4 border-b border-gray-100">
      <div className="w-[135px] h-[180px] bg-gray-200 rounded animate-pulse" />
      <div className="ml-4 flex-1 space-y-4 py-1">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
