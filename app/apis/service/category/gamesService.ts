"use server"
import { listGamesByNames } from "@/app/apis/repository/category/gamesRepository"

export async function getGamesByNames(names: string[]) {
  // 추후 비즈니스 규칙(허용 목록, 정규화 등) 추가 여지
  return listGamesByNames(names)
}
