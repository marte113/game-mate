// Query Key standard builders aligned with current usage
// Keep compatibility first; normalize later during refactors

export const queryKeys = {
  token: {
    // Header token display uses ['tokenBalance', userId]
    balanceHeader: (userId: string) => ['tokenBalance', userId] as const,
    // Token summary card currently uses ['balance']
    balance: () => ['balance'] as const,
    usage: () => ['usage'] as const,
    detailUsage: () => ['detailUsage'] as const,
  },

  orders: {
    requested: () => ['requestedOrders'] as const,
    received: () => ['receivedOrders'] as const,
    providerReservations: (userId: string) => ['providerReservations', userId] as const,
  },

  category: {
    // Listing pages
    games: () => ['games'] as const,
    // Category header per category id
    gameHeader: (categoryId: string | undefined) => ['gameHeader', categoryId] as const,
    // Mates by category id
    mates: (categoryId: string | undefined) => ['mates', categoryId] as const,
    // Sidebar/landing
    recommendedThemes: () => ['recommendedThemes'] as const,
    popularGames: () => ['popular-games'] as const,
    // Games by category
    gamesByCategory: (categoryId: string) => ['gamesByCategory', categoryId] as const,
  },

  mates: {
    recommended: () => ['mates', 'recommended'] as const,
    partner: () => ['mates', 'partner'] as const,
  },

  chat: {
    messages: (roomId: string) => ['messages', roomId] as const,
    chatRooms: () => ['chatRooms'] as const,
    notifications: () => ['notifications'] as const,
  },

  profile: {
    info: () => ['profileInfo'] as const,
    image: () => ['profileImage'] as const,
    albumImages: () => ['albumImages'] as const,
  },
} as const

export type QueryKey = ReturnType<
  | typeof queryKeys.token.balanceHeader
  | typeof queryKeys.token.balance
  | typeof queryKeys.token.usage
  | typeof queryKeys.token.detailUsage
  | typeof queryKeys.orders.requested
  | typeof queryKeys.orders.received
  | typeof queryKeys.orders.providerReservations
  | typeof queryKeys.category.games
  | typeof queryKeys.category.gameHeader
  | typeof queryKeys.category.mates
  | typeof queryKeys.category.recommendedThemes
  | typeof queryKeys.category.popularGames
  | typeof queryKeys.category.gamesByCategory
  | typeof queryKeys.mates.recommended
  | typeof queryKeys.mates.partner
  | typeof queryKeys.chat.messages
  | typeof queryKeys.chat.chatRooms
  | typeof queryKeys.chat.notifications
  | typeof queryKeys.profile.info
  | typeof queryKeys.profile.image
  | typeof queryKeys.profile.albumImages
>

// Legacy compat single keys (kept to avoid breaking existing hooks)
export const legacyQueryKeys = {
  profileInfo: ['profileInfo'] as const,
} as const