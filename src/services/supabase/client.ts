import "react-native-url-polyfill/auto"

import { createClient, SupabaseClient } from "@supabase/supabase-js"

import { env } from "@/config/env"

import type { Database } from "./database.types"

export type GetClerkSupabaseToken = () => Promise<string | null>
export type AppSupabaseClient = SupabaseClient<Database>

export function createAuthenticatedSupabaseClient(
  getClerkSupabaseToken: GetClerkSupabaseToken,
): AppSupabaseClient {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Supabase is not configured.")
  }

  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    accessToken: getClerkSupabaseToken,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
