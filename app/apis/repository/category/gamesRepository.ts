"use server"
import { getServerSupabase } from "@/app/apis/base"

export async function listGames(offset: number, limit: number) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from("games")
    .select("id, name, genre, description, image_url")
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1)
  if (error) throw error
  return data ?? []
}

export async function listGamesByNames(names: string[]) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from("games")
    .select("id, name, image_url")
    .in("name", names)
  if (error) throw error
  return data ?? []
}

export async function listGamesByDescriptions(descriptions: string[]) {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from("games")
    .select("id, name, description, image_url")
    .in("description", descriptions)
  if (error) throw error
  return data ?? []
}
