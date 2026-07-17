import { z } from "zod"

import { createAuthenticatedSupabaseClient, GetClerkSupabaseToken } from "./client"

export const appRoleSchema = z.enum(["member", "merchant", "admin", "staff"])
export type AppRole = z.infer<typeof appRoleSchema>

export const userRoleSchema = z.object({
  id: z.string(),
  clerk_user_id: z.string(),
  role: appRoleSchema,
  is_active: z.boolean(),
  metadata: z.unknown(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const userRolesSchema = z.array(userRoleSchema)
export type UserRoleRecord = z.infer<typeof userRoleSchema>

export async function getUserRoles(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  clerkUserId: string,
): Promise<UserRoleRecord[]> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  if (error) throw error

  return userRolesSchema.parse(data ?? [])
}
