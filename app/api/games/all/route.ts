import { NextResponse } from "next/server"

import { handleApiError } from "@/app/apis/base"
import { listAllGames } from "@/app/apis/repository/category/gamesRepository"

export async function GET() {
  try {
    const games = await listAllGames()
    return NextResponse.json({ games })
  } catch (error) {
    return handleApiError(error)
  }
}
