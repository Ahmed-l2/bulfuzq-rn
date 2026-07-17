import { useEffect } from "react"
import { useAuth } from "@clerk/clerk-expo"

import { hasOneSignalConfig } from "@/config/env"

import { NotificationService } from "./NotificationService"

export function NotificationBootstrap() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth()

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || !hasOneSignalConfig) return

    NotificationService.initialize()
    void NotificationService.registerDevice({
      appVersion: null,
      getClerkSupabaseToken: () => getToken(),
      memberId: userId,
    })
  }, [getToken, isLoaded, isSignedIn, userId])

  return null
}
