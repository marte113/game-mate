import 'server-only'

/**
 * [DEPRECATED] 상세 사용 내역은 `/api/token/transactions` 로 통합되었습니다.
 * 내부 구현은 `getMyTokenTransactions`로 위임됩니다. 신규 코드는 본 함수를 사용하지 마세요.
 */
export async function getMyDetailUsage(params: { pageParam?: string; limit?: number } = {}) {
  throw new Error('[REMOVED] getMyDetailUsage is removed. Use /api/token/transactions and getMyTokenTransactions instead.')
}


