'use server'
import { getGameHeaderByName } from '@/app/apis/repository/category/headerRepository'

export async function getCategoryHeader(categoryId: string) {
  const game = await getGameHeaderByName(categoryId)
  if (!game || !game.description) {
    return { error: 'Game category not found', status: 404 as const }
  }
  return game
}


