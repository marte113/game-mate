import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json(
    { success: false, code: 'GONE', message: "/api/token/detailUsage is removed. Use /api/token/transactions." },
    { status: 410 }
  )
  res.headers.set('X-Deprecated-Endpoint', '/api/token/detailUsage is removed; use /api/token/transactions')
  res.headers.set('Link', '</api/token/transactions>; rel="successor-version"')
  return res
}
