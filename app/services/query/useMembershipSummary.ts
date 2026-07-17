import { useAuth } from "@clerk/clerk-expo"
import { useQuery } from "@tanstack/react-query"

import { hasSupabaseConfig } from "@/config/env"
import { getMembershipSummary } from "@/services/supabase"

export function useMembershipSummary() {
  const { getToken, isLoaded, userId } = useAuth()

  return useQuery({
    queryKey: ["membershipSummary", userId],
    enabled: isLoaded && hasSupabaseConfig && Boolean(userId),
    queryFn: () => getMembershipSummary(() => getToken(), userId ?? ""),
    meta: { persist: true },
  })
}
