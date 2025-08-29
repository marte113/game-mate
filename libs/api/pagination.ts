export type AppPage<T> = {
  items: T[]
  nextCursor?: number | string
  hasMore: boolean
}

export function createAppPage<T>(items: T[], nextCursor?: number | string): AppPage<T> {
  return {
    items,
    nextCursor,
    hasMore: nextCursor !== undefined && nextCursor !== null,
  }
}
