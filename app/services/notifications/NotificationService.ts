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

  initialize() {
    if (this.initialized || !hasOneSignalConfig || Platform.OS === "web") return

    OneSignal.initialize(env.oneSignalAppId)
    this.initialized = true
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
}

export const NotificationService = new NotificationServiceImpl()
