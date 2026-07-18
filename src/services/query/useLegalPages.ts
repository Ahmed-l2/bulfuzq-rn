import { useAuth } from "@clerk/clerk-expo"
import { useQuery } from "@tanstack/react-query"

import { hasSupabaseConfig } from "@/config/env"
import { getPublishedLegalPages } from "@/services/supabase"

export function useLegalPages() {
  const { getToken, isLoaded, userId } = useAuth()

  return useQuery({
    queryKey: ["legalPages", userId],
    enabled: isLoaded && hasSupabaseConfig && Boolean(userId),
    queryFn: () => getPublishedLegalPages(() => getToken()),
    meta: { persist: true },
  })
}
