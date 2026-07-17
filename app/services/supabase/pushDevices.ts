import { Platform } from "react-native"
import { z } from "zod"

import { createAuthenticatedSupabaseClient, GetClerkSupabaseToken } from "./client"

export const pushDeviceSchema = z.object({
  id: z.string(),
  member_id: z.string(),
  platform: z.string(),
  one_signal_player_id: z.string(),
  app_version: z.string().nullable(),
  last_seen: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type PushDeviceRecord = z.infer<typeof pushDeviceSchema>

export interface RegisterPushDeviceInput {
  appVersion?: string | null
  memberId: string
  oneSignalPlayerId: string
}

export async function registerPushDevice(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  input: RegisterPushDeviceInput,
): Promise<PushDeviceRecord> {
  const now = new Date().toISOString()
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("push_devices")
    .upsert(
      {
        app_version: input.appVersion ?? null,
        last_seen: now,
        member_id: input.memberId,
        one_signal_player_id: input.oneSignalPlayerId,
        platform: Platform.OS,
        updated_at: now,
      },
      { onConflict: "one_signal_player_id" },
    )
    .select("*")
    .single()

  if (error) throw error
  return pushDeviceSchema.parse(data)
}

export async function removePushDevice(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  oneSignalPlayerId: string,
): Promise<void> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { error } = await supabase
    .from("push_devices")
    .delete()
    .eq("one_signal_player_id", oneSignalPlayerId)

  if (error) throw error
}
