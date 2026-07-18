import { useAuth } from "@clerk/clerk-expo"
import { useQuery } from "@tanstack/react-query"

import { hasSupabaseConfig } from "@/config/env"
import { getMembershipSummary } from "@/services/supabase"

export function useMembershipSummary() {
  const { getToken, isLoaded, userId } = useAuth()

  return useQuery({
    queryKey: ["membershipSummary", userId],
    enabled: isLoaded && hasSupabaseConfig && Boolean(userId),
    queryFn: () =>
      measureQuery("getMembershipSummary", () =>
        getMembershipSummary(() => getToken(), userId ?? ""),
      ),
    meta: { persist: true },
  })
}

async function measureQuery<T>(label: string, query: () => Promise<T>): Promise<T> {
  const startedAt = getNow()
  try {
    return await query()
  } finally {
    if (__DEV__) {
      console.info(`[perf][ReactQuery] ${label} queryFn ${(getNow() - startedAt).toFixed(1)}ms`)
    }
  }
}

function getNow() {
  return globalThis.performance?.now?.() ?? Date.now()
}
