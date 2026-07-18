import { z } from "zod"

import { resolveImageUrl } from "@/services/images"

import { createAuthenticatedSupabaseClient, GetClerkSupabaseToken } from "./client"

export const memberEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  ar_title: z.string(),
  description: z.string(),
  ar_description: z.string(),
  event_date: z.string(),
  location: z.string(),
  ar_location: z.string(),
  image_url: z.string().nullable(),
  attendees: z.number(),
  created_at: z.string(),
})

export const memberEventsSchema = z.array(memberEventSchema)
export type MemberEventItem = z.infer<typeof memberEventSchema>

export async function getMemberEvents(
  getClerkSupabaseToken: GetClerkSupabaseToken,
): Promise<MemberEventItem[]> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("member_events")
    .select("*")
    .order("event_date", { ascending: true })

  if (error) throw error
  return memberEventsSchema
    .parse(data ?? [])
    .map((item) => ({ ...item, image_url: resolveImageUrl(item.image_url) }))
}

export async function getMemberEventById(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  id: string,
): Promise<MemberEventItem | null> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("member_events")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const item = memberEventSchema.parse(data)
  return { ...item, image_url: resolveImageUrl(item.image_url) }
}
