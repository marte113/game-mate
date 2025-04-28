import { Database } from "./database.types";

export type Tables = Database['public']['Tables']
export type Album_imagesRow = Tables['album_images']['Row']
export type UsersRow = Tables['users']['Row']
export type ProfilesRow = Tables['profiles']['Row']
export type Chat_room_participantsRow = Tables['chat_room_participants']['Row']
export type Chat_roomsRow = Tables['chat_rooms']['Row']
export type MessagesRow = Tables['messages']['Row']
export type PaymentsRow = Tables['payments']['Row']
export type Token_transactionsRow = Tables['token_transactions']['Row']
export type User_tokensRow = Tables['user_tokens']['Row']
export type RequestsRow = Tables['requests']['Row']
export type ReviewsRow = Tables['reviews']['Row']
export type GamesRow = Tables['games']['Row']







