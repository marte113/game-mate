'use client'

import { memo } from 'react'
import { useGamesList } from './CategoryDataContexts'
import CategoryCard from './CategoryCard'
import type { GamesRow } from '@/types/database.table.types'

function CategoryCardListInner() {
  const { games } = useGamesList()
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {games.map((game: GamesRow) => (
        <CategoryCard
          key={game.id}
          id={game.id}
          name={game.name}
          description={game.description}
          genre={game.genre || []}
          image_url={game.image_url || '/images/default-game-icon.webp'}
        />
      ))}
    </ul>
  )
}

const CategoryCardList = memo(CategoryCardListInner)
export default CategoryCardList
