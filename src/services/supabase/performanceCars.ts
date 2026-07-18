import { z } from "zod"

import { resolveImageUrl } from "@/services/images"

import { createAuthenticatedSupabaseClient, GetClerkSupabaseToken } from "./client"

const jsonSchema: z.ZodType<unknown> = z.unknown()

export const performanceCarSchema = z.object({
  id: z.string(),
  name: z.string(),
  base_info: z.string(),
  specs: jsonSchema,
  modifications: z.array(z.string()),
  parts_used: z.array(z.string()),
  notes: z.string().nullable(),
  main_image: z.string().nullable(),
  gallery_urls: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  engine: z.string().nullable(),
  horsepower: z.string().nullable(),
  torque: z.string().nullable(),
  weight: z.string().nullable(),
  drivetrain: z.string().nullable(),
  year: z.number().nullable(),
  is_active: z.boolean().nullable(),
  is_featured: z.boolean().nullable(),
  category: z.string().nullable(),
  ar_name: z.string().nullable(),
  ar_base_info: z.string().nullable(),
  ar_specs: jsonSchema.nullable(),
  ar_modifications: z.array(z.string()).nullable(),
  ar_parts_used: z.array(z.string()).nullable(),
  ar_notes: z.string().nullable(),
  ar_engine: z.string().nullable(),
})

export const performanceCarsSchema = z.array(performanceCarSchema)
export type PerformanceCarItem = z.infer<typeof performanceCarSchema>

export async function getPerformanceCars(
  getClerkSupabaseToken: GetClerkSupabaseToken,
): Promise<PerformanceCarItem[]> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("bul_performance_cars")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  return performanceCarsSchema.parse(data ?? []).map(normalizePerformanceCarImages)
}

function normalizePerformanceCarImages(item: PerformanceCarItem): PerformanceCarItem {
  return {
    ...item,
    main_image: resolveImageUrl(item.main_image),
    gallery_urls: item.gallery_urls.map((url) => resolveImageUrl(url) ?? url),
  }
}
