import { useEffect } from "react"
import { useRouter } from "expo-router"
import { useAuth } from "@clerk/clerk-expo"

import { hasOneSignalConfig } from "@/config/env"
import { useSupportUnreadSummary } from "@/services/query"

import { NotificationService } from "./NotificationService"

export function NotificationBootstrap() {
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn, userId } = useAuth()
  const supportUnreadQuery = useSupportUnreadSummary()

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || !hasOneSignalConfig) return

    NotificationService.initialize((url) => router.push(url as never))
    void NotificationService.registerDevice({
      appVersion: null,
      getClerkSupabaseToken: () => getToken(),
      memberId: userId,
    })
  }, [getToken, isLoaded, isSignedIn, router, userId])

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !hasOneSignalConfig) return
    NotificationService.syncBadgeCount(supportUnreadQuery.data?.unreadAdminMessages ?? 0)
  }, [isLoaded, isSignedIn, supportUnreadQuery.data?.unreadAdminMessages])

  return null
}
