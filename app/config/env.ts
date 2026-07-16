import Config from "@/config"

export const env = {
  clerkPublishableKey:
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? Config.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? Config.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? Config.EXPO_PUBLIC_SUPABASE_ANON_KEY,
}

export const hasClerkPublishableKey = Boolean(env.clerkPublishableKey)
export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey)
