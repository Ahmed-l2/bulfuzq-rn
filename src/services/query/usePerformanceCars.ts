import { useAuth } from "@clerk/clerk-expo"
import { useQuery } from "@tanstack/react-query"

import { hasSupabaseConfig } from "@/config/env"
import { getPerformanceCars } from "@/services/supabase"

export function usePerformanceCars() {
  const { getToken, isLoaded, userId } = useAuth()

  return useQuery({
    queryKey: ["performanceCars", userId],
    enabled: isLoaded && hasSupabaseConfig && Boolean(userId),
    queryFn: () => getPerformanceCars(() => getToken()),
    meta: { persist: true },
  })
}
