// Query Key standard builders aligned with current usage
// Keep compatibility first; normalize later during refactors

export const queryKeys = {
  token: {
    // Header token display uses ['tokenBalance', userId]
    balanceHeader: (userId: string) => ["token", "balanceHeader", userId] as const,
    // Token summary card currently uses ['balance']
    balance: () => ["token", "balance"] as const,
    usage: () => ["token", "usage"] as const,
    transactions: () => ["token", "transactions"] as const,
  },

  orders: {
    requested: () => ["requestedOrders"] as const,
    received: () => ["receivedOrders"] as const,
    providerReservations: (userId: string) => ["providerReservations", userId] as const,
  },

  category: {
    // Listing pages
    games: () => ["games"] as const,
    // Category header per category id
    gameHeader: (categoryId: string | undefined) => ["gameHeader", categoryId] as const,
    // Mates by category id
    mates: (categoryId: string | undefined) => ["mates", categoryId] as const,
    // Sidebar/landing
    recommendedThemes: () => ["recommendedThemes"] as const,
    popularGames: () => ["popular-games"] as const,
    // Games by category
    gamesByCategory: (categoryId: string) => ["gamesByCategory", categoryId] as const,
    // Game images lookup by titles (joined key)
    gameImagesByTitles: (titlesKey: string) => ["games", "imagesByTitles", titlesKey] as const,
  },

  mates: {
    recommended: () => ["mates", "recommended"] as const,
    partner: () => ["mates", "partner"] as const,
  },

  chat: {
    rooms: () => ["chat", "rooms"] as const,
    messages: (roomId: string) => ["chat", "messages", roomId] as const,
    room: (roomId: string) => ["chat", "room", roomId] as const,
    // Legacy compatibility
    chatRooms: () => ["chatRooms"] as const,
    notifications: () => ["notifications"] as const,
  },

  profile: {
    info: () => ["profileInfo"] as const,
    image: () => ["profileImage"] as const,
    albumImages: () => ["albumImages"] as const,
    // 공개 프로필 앨범 이미지(사용자별 캐시 분리)
    albumImagesPublic: (publicUserId: string | number) =>
      ["albumImagesPublic", String(publicUserId)] as const,
    publicById: (publicId: number) => ["profilePublic", publicId] as const,
  },
} as const

export type QueryKey = ReturnType<
  | typeof queryKeys.token.balanceHeader
  | typeof queryKeys.token.balance
  | typeof queryKeys.token.usage
  | typeof queryKeys.token.transactions
  | typeof queryKeys.orders.requested
  | typeof queryKeys.orders.received
  | typeof queryKeys.orders.providerReservations
  | typeof queryKeys.category.games
  | typeof queryKeys.category.gameHeader
  | typeof queryKeys.category.mates
  | typeof queryKeys.category.recommendedThemes
  | typeof queryKeys.category.popularGames
  | typeof queryKeys.category.gamesByCategory
  | typeof queryKeys.category.gameImagesByTitles
  | typeof queryKeys.mates.recommended
  | typeof queryKeys.mates.partner
  | typeof queryKeys.chat.rooms
  | typeof queryKeys.chat.messages
  | typeof queryKeys.chat.room
  | typeof queryKeys.chat.chatRooms
  | typeof queryKeys.chat.notifications
  | typeof queryKeys.profile.info
  | typeof queryKeys.profile.image
  | typeof queryKeys.profile.albumImages
  | typeof queryKeys.profile.albumImagesPublic
  | typeof queryKeys.profile.publicById
>

// Legacy compat single keys (kept to avoid breaking existing hooks)
export const legacyQueryKeys = {
  profileInfo: ["profileInfo"] as const,
} as const
