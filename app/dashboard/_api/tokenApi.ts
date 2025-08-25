export type RawBalanceResponse = number | { balance: number } | { balance: { balance: number } }
export interface TokenUsageData {
  usageThisMonth: number
  usageLastMonth: number
  diff: number
}

export async function fetchTokenBalance(): Promise<number> {
  const res = await fetch("/api/token/balance", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch balance")
  const body = (await res.json()) as RawBalanceResponse
  if (typeof body === 'number') return body
  const flat = body as { balance?: number } | { balance?: { balance?: number } }
  if (typeof flat.balance === 'number') return flat.balance
  const nested = (flat as { balance?: { balance?: number } }).balance
  if (nested && typeof nested.balance === 'number') return nested.balance
  return 0
}



export async function fetchTokenUsage(): Promise<TokenUsageData> {
  const res = await fetch("/api/token/variation", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch usage")
  return await res.json()
}


