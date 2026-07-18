import { z } from "zod"

import { createAuthenticatedSupabaseClient, GetClerkSupabaseToken } from "./client"

const legalContentBlockSchema = z.object({
  type: z.enum(["intro", "section"]).catch("section"),
  heading: z.string().optional(),
  icon: z.string().optional(),
  body: z.union([z.string(), z.array(z.string())]).optional(),
  subsections: z
    .array(
      z.object({
        heading: z.string().optional(),
        body: z.string().optional(),
      }),
    )
    .optional(),
})

const MOBILE_LEGAL_PAGE_SLUGS = [
  "terms-and-conditions",
  "bul-racing-terms-and-services",
  "privacy-policy",
] as const

export const legalPageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title_en: z.string(),
  title_ar: z.string(),
  content_en: z.array(legalContentBlockSchema).catch([]),
  content_ar: z.array(legalContentBlockSchema).catch([]),
  meta_title_en: z.string().nullable(),
  meta_title_ar: z.string().nullable(),
  meta_description_en: z.string().nullable(),
  meta_description_ar: z.string().nullable(),
  last_updated_at: z.string().nullable(),
  is_published: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const legalPagesSchema = z.array(legalPageSchema)
export type LegalContentBlock = z.infer<typeof legalContentBlockSchema>
export type LegalPageItem = z.infer<typeof legalPageSchema>

export async function getPublishedLegalPages(
  getClerkSupabaseToken: GetClerkSupabaseToken,
): Promise<LegalPageItem[]> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("legal_pages")
    .select("*")
    .eq("is_published", true)
    .in("slug", [...MOBILE_LEGAL_PAGE_SLUGS])
    .order("updated_at", { ascending: false })

  if (error) throw error
  return legalPagesSchema.parse(data ?? [])
}
