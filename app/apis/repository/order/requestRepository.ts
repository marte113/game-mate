import "server-only"

import { getServerSupabase, wrapRepo } from "@/app/apis/base"
import type { Database } from "@/types/database.types"

export type RequestedOrderRow = Database["public"]["Tables"]["requests"]["Row"] & {
  provider?: Pick<
    Database["public"]["Tables"]["users"]["Row"],
    "id" | "name" | "profile_circle_img" | "is_online"
  > | null
  requester?: Pick<
    Database["public"]["Tables"]["users"]["Row"],
    "id" | "name" | "profile_circle_img" | "is_online"
  > | null
  reviews?: Array<Pick<Database["public"]["Tables"]["reviews"]["Row"], "id">>
}

export async function fetchRequestedOrdersByUser(
  userId: string,
  options?: { status?: string },
): Promise<RequestedOrderRow[]> {
  return wrapRepo("order.fetchRequestedOrdersByUser", async () => {
    const supabase = await getServerSupabase()

    let query = supabase
      .from("requests")
      .select(
        `
        *,
        provider:provider_id(id, name, profile_circle_img, is_online),
        reviews!left(id)
      `,
      )
      .eq("requester_id", userId)
      .order("scheduled_date", { ascending: false })
      .order("scheduled_time", { ascending: false })

    if (options?.status) {
      query = query.eq("status", options.status)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as unknown as RequestedOrderRow[]
  })
}

export async function fetchReceivedOrdersByProvider(
  userId: string,
  options?: { status?: string },
): Promise<RequestedOrderRow[]> {
  return wrapRepo("order.fetchReceivedOrdersByProvider", async () => {
    const supabase = await getServerSupabase()

    let query = supabase
      .from("requests")
      .select(
        `
        *,
        requester:requester_id(id, name, profile_circle_img, is_online)
      `,
      )
      .eq("provider_id", userId)
      .order("scheduled_date", { ascending: false })
      .order("scheduled_time", { ascending: false })

    if (options?.status) {
      query = query.eq("status", options.status)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as unknown as RequestedOrderRow[]
  })
}

export async function fetchProviderReservations(
  providerId: string,
): Promise<Array<Pick<RequestedOrderRow, "id" | "scheduled_date" | "scheduled_time" | "status">>> {
  return wrapRepo("order.fetchProviderReservations", async () => {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from("requests")
      .select("id, scheduled_date, scheduled_time, status")
      .eq("provider_id", providerId)
      .in("status", ["pending", "accepted"])
    if (error) throw error
    return (data ?? []) as Array<
      Pick<RequestedOrderRow, "id" | "scheduled_date" | "scheduled_time" | "status">
    >
  })
}
