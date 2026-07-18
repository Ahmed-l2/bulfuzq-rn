import { Platform } from "react-native"
import { OneSignal } from "react-native-onesignal"

import { env, hasOneSignalConfig } from "@/config/env"
import { GetClerkSupabaseToken, registerPushDevice, removePushDevice } from "@/services/supabase"

export interface NotificationRegistrationInput {
  appVersion?: string | null
  getClerkSupabaseToken: GetClerkSupabaseToken
  memberId: string
}

class NotificationServiceImpl {
  private initialized = false
  private handlersRegistered = false

  initialize(onOpenDeepLink?: (url: string) => void) {
    if (this.initialized || !hasOneSignalConfig || Platform.OS === "web") return

    OneSignal.initialize(env.oneSignalAppId)
    this.initialized = true

    if (onOpenDeepLink) this.registerHandlers(onOpenDeepLink)
  }

  registerHandlers(onOpenDeepLink: (url: string) => void) {
    if (!this.initialized || this.handlersRegistered || Platform.OS === "web") return

    OneSignal.Notifications.addEventListener(
      "foregroundWillDisplay",
      (event: NotificationForegroundEvent) => {
        event.notification.display()
      },
    )

    OneSignal.Notifications.addEventListener("click", (event: NotificationClickEvent) => {
      const additionalData = event.notification.additionalData as
        Record<string, unknown> | undefined
      const deepLink = getNotificationDeepLink(additionalData)
      if (deepLink) onOpenDeepLink(deepLink)
    })

    this.handlersRegistered = true
  }

  async requestPermission() {
    if (!this.initialized) return false
    return OneSignal.Notifications.requestPermission(true)
  }

  async registerDevice(input: NotificationRegistrationInput) {
    if (!this.initialized) return null

    OneSignal.login(input.memberId)
    await this.requestPermission()

    const oneSignalPlayerId = await OneSignal.User.pushSubscription.getIdAsync()
    if (!oneSignalPlayerId) return null

    return registerPushDevice(input.getClerkSupabaseToken, {
      appVersion: input.appVersion,
      memberId: input.memberId,
      oneSignalPlayerId,
    })
  }

  async removeDevice(getClerkSupabaseToken: GetClerkSupabaseToken) {
    if (!this.initialized) return

    const oneSignalPlayerId = await OneSignal.User.pushSubscription.getIdAsync()
    OneSignal.logout()

    if (!oneSignalPlayerId) return
    await removePushDevice(getClerkSupabaseToken, oneSignalPlayerId)
  }

  syncBadgeCount(count: number) {
    if (!this.initialized || Platform.OS === "web") return

    const notifications = OneSignal.Notifications as unknown as {
      setBadgeCount?: (count: number) => void
    }
    notifications.setBadgeCount?.(count)
    OneSignal.User.addTag("support_unread_count", String(count))
  }
}

export const NotificationService = new NotificationServiceImpl()

type NotificationForegroundEvent = {
  notification: {
    display: () => void
  }
}

type NotificationClickEvent = {
  notification: {
    additionalData?: unknown
  }
}

function getNotificationDeepLink(additionalData: Record<string, unknown> | undefined) {
  if (!additionalData) return null

  const route = additionalData.route ?? additionalData.url ?? additionalData.deepLink
  if (typeof route === "string" && route.startsWith("/")) return route

  if (additionalData.type === "support" || additionalData.conversation_id) return "/account/support"
  return null
}
