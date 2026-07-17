import { z } from "zod"

import { resolveImageUrl } from "@/services/images"

import { createAuthenticatedSupabaseClient, GetClerkSupabaseToken } from "./client"

export const partnerOfferSchema = z.object({
  id: z.string(),
  partner_name: z.string(),
  ar_partner_name: z.string(),
  offer_title: z.string(),
  ar_offer_title: z.string(),
  description: z.string(),
  ar_description: z.string(),
  discount: z.string(),
  code: z.string(),
  valid_until: z.string(),
  logo_url: z.string().nullable(),
  created_at: z.string(),
})

export const partnerOffersSchema = z.array(partnerOfferSchema)
export type PartnerOfferItem = z.infer<typeof partnerOfferSchema>

export async function getPartnerOffers(
  getClerkSupabaseToken: GetClerkSupabaseToken,
): Promise<PartnerOfferItem[]> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("partner_offers")
    .select("*")
    .order("valid_until", { ascending: true })

  if (error) throw error
  return partnerOffersSchema
    .parse(data ?? [])
    .map((item) => ({ ...item, logo_url: resolveImageUrl(item.logo_url) }))
}

export async function getPartnerOfferById(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  id: string,
): Promise<PartnerOfferItem | null> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("partner_offers")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const item = partnerOfferSchema.parse(data)
  return { ...item, logo_url: resolveImageUrl(item.logo_url) }
}
