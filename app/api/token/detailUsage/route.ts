import { NextResponse } from "next/server";
import { handleApiError, createGoneError } from '@/app/apis/base'

export async function GET() {
  try {
    throw createGoneError('/api/token/detailUsage is removed. Use /api/token/transactions.')
  } catch (error) {
    const res = handleApiError(error)
    res.headers.set('X-Deprecated-Endpoint', '/api/token/detailUsage is removed; use /api/token/transactions')
    res.headers.set('Link', '</api/token/transactions>; rel="successor-version"')
    return res
  }
}
