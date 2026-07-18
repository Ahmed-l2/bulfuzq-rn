import { FC, PropsWithChildren } from "react"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"

import * as storage from "@/utils/storage"

import { QUERY_CACHE_STORAGE_KEY, queryClient } from "./queryClient"

const queryStorage = {
  getItem: (key: string) => storage.loadString(key),
  setItem: (key: string, value: string) => {
    storage.saveString(key, value)
  },
  removeItem: (key: string) => {
    storage.remove(key)
  },
}

const persister = createSyncStoragePersister({
  storage: queryStorage,
  key: QUERY_CACHE_STORAGE_KEY,
})

export const AppQueryProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.meta?.persist !== false,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
