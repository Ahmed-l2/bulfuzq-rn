import { z } from "zod"

import { resolveImageUrl } from "@/services/images"

import { createAuthenticatedSupabaseClient, GetClerkSupabaseToken } from "./client"

export const membershipNewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  ar_title: z.string(),
  content: z.string(),
  ar_content: z.string(),
  date: z.string(),
  image_url: z.string().nullable(),
  type: z.string(),
  created_at: z.string(),
  is_active: z.boolean(),
  show_as_banner: z.boolean(),
  cta_url: z.string().nullable(),
  cta_label: z.string().nullable(),
  cta_label_ar: z.string().nullable(),
  priority: z.number(),
  published_at: z.string().nullable(),
  expires_at: z.string().nullable(),
})

export const membershipNewsSchema = z.array(membershipNewsItemSchema)
export type MembershipNewsItem = z.infer<typeof membershipNewsItemSchema>

export async function getMembershipNews(
  getClerkSupabaseToken: GetClerkSupabaseToken,
): Promise<MembershipNewsItem[]> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("membership_news")
    .select("*")
    .order("date", { ascending: false })

  if (error) throw error
  return membershipNewsSchema
    .parse(data ?? [])
    .map((item) => ({ ...item, image_url: resolveImageUrl(item.image_url) }))
}

export async function getMembershipNewsById(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  id: string,
): Promise<MembershipNewsItem | null> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("membership_news")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const item = membershipNewsItemSchema.parse(data)
  return { ...item, image_url: resolveImageUrl(item.image_url) }
}

export async function getCurrentMemberAnnouncement(
  getClerkSupabaseToken: GetClerkSupabaseToken,
): Promise<MembershipNewsItem | null> {
  const now = new Date().toISOString()
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("membership_news")
    .select("*")
    .eq("type", "announcement")
    .eq("show_as_banner", true)
    .eq("is_active", true)
    .or(`published_at.is.null,published_at.lte.${now}`)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("priority", { ascending: false, nullsFirst: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("date", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const item = membershipNewsItemSchema.parse(data)
  return { ...item, image_url: resolveImageUrl(item.image_url) }
}
