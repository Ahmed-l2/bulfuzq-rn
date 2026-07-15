import Config from "@/config"

export const env = {
  clerkPublishableKey:
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? Config.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
}

export const hasClerkPublishableKey = Boolean(env.clerkPublishableKey)
