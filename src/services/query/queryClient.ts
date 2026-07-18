import { QueryClient } from "@tanstack/react-query"

import * as storage from "@/utils/storage"

export const QUERY_CACHE_STORAGE_KEY = "reactQuery.cache.v1"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
    },
  },
})

export function clearAppQueryCache() {
  queryClient.clear()
  storage.remove(QUERY_CACHE_STORAGE_KEY)
}
