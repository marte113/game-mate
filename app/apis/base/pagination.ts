'use server'

export type PageParams = { page: number; initialLoad: number; perPage: number }

export async function calcLimitOffset({ page, initialLoad, perPage }: PageParams) {
  const limit = page === 0 ? initialLoad : perPage
  const offset = page === 0 ? 0 : initialLoad + (page - 1) * perPage
  return { limit, offset }
}

export async function calcNextPage(hasMore: boolean, page: number): Promise<number | undefined> {
  return hasMore ? page + 1 : undefined
}


