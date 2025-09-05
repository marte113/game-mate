import { type Tables } from "./database.types"

// 레거시 Row 별칭을 제네릭 기반으로 유지하여 호환성 보장
// 추가 헬퍼 제네릭 -> TablesInsert, TablesUpdate, Enums
export type Album_imagesRow = Tables<"album_images">
export type UsersRow = Tables<"users">
export type ProfilesRow = Tables<"profiles">
export type Chat_room_participantsRow = Tables<"chat_room_participants">
export type Chat_roomsRow = Tables<"chat_rooms">
export type MessagesRow = Tables<"messages">
export type PaymentsRow = Tables<"payments">
export type Token_transactionsRow = Tables<"token_transactions">
export type User_tokensRow = Tables<"user_tokens">
export type RequestsRow = Tables<"requests">
export type ReviewsRow = Tables<"reviews">
export type GamesRow = Tables<"games">
