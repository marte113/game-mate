import { RequestsRow } from "@/types/database.table.types"

export type Order = RequestsRow

export type OrderResponse = {
    orders: Order[]
}
