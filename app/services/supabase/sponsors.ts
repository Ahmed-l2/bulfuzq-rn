import { z } from "zod"

import { createAuthenticatedSupabaseClient, GetClerkSupabaseToken } from "./client"

export const sponsorSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  url: z.string().nullable(),
  is_active: z.boolean(),
  display_order: z.number(),
})

export const sponsorsSchema = z.array(sponsorSchema)
export type SponsorItem = z.infer<typeof sponsorSchema>

export async function getSponsors(
  getClerkSupabaseToken: GetClerkSupabaseToken,
): Promise<SponsorItem[]> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) throw error
  return sponsorsSchema.parse(data ?? [])
}
