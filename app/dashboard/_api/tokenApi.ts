import { fetchJson } from "@/libs/api/fetchJson";

export type RawBalanceResponse = number | { balance: number } | { balance: { balance: number } }
export interface TokenUsageData {
  usageThisMonth: number
  usageLastMonth: number
  diff: number
}

export async function fetchTokenBalance(): Promise<number> {
  const body = await fetchJson<RawBalanceResponse | { success: true; data: RawBalanceResponse }>("/api/token/balance", { credentials: "include" })
  // unwrap if server returns { success:true, data }
  const value: RawBalanceResponse = (typeof body === 'object' && body && 'success' in (body as any) && 'data' in (body as any))
    ? (body as any).data
    : (body as any)
  if (typeof value === 'number') return value
  const flat = value as { balance?: number } | { balance?: { balance?: number } }
  if (typeof flat.balance === 'number') return flat.balance
  const nested = (flat as { balance?: { balance?: number } }).balance
  if (nested && typeof nested.balance === 'number') return nested.balance
  return 0
}



export async function fetchTokenUsage(): Promise<TokenUsageData> {
  const body = await fetchJson<TokenUsageData | ({ success: true } & TokenUsageData) | { success: true; data: TokenUsageData }>("/api/token/variation", { credentials: "include" })
  // support {success:true, ...fields} or {success:true,data:{...}}
  if (typeof body === 'object' && body) {
    if ('data' in (body as any)) return (body as any).data
    if ('usageThisMonth' in (body as any)) return body as TokenUsageData
  }
  return body as TokenUsageData
}


