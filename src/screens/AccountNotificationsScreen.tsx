import { FC, useState } from "react"
import { Alert, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "@clerk/clerk-expo"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { hasOneSignalConfig } from "@/config/env"
import { NotificationService } from "@/services/notifications"
import { useSupportUnreadSummary } from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const AccountNotificationsScreen: FC = () => {
  const router = useRouter()
  const { getToken, userId } = useAuth()
  const { themed } = useAppTheme()
  const supportUnreadQuery = useSupportUnreadSummary()
  const [isRequesting, setIsRequesting] = useState(false)
  const notificationStatusQuery = useQuery({
    queryKey: ["notificationStatus"],
    queryFn: async () => {
      if (hasOneSignalConfig) NotificationService.initialize((url) => router.push(url as never))
      return NotificationService.getStatus()
    },
  })
  const notificationStatus = notificationStatusQuery.data
  const areNotificationsEnabled = Boolean(notificationStatus?.enabled)

  return (
    <Screen
      preset="scroll"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={themed($backButton)}
      >
        <UIIcon name="arrow-left" size={20} color="#ffffff" />
        <Text size="sm" weight="medium" text="Back" style={themed($title)} />
      </Pressable>

      <View style={themed($header)}>
        <Text preset="heading" text="Notifications" style={themed($title)} />
        <Text
          text="Manage push registration for support alerts and app updates."
          style={themed($body)}
        />
      </View>

      <View style={themed($card)}>
        <Text preset="subheading" text="Push Status" style={themed($title)} />
        <Text
          text={
            areNotificationsEnabled
              ? "Push notifications are enabled on this device."
              : hasOneSignalConfig
                ? "Push notifications are configured for this build."
                : "Push notifications need EXPO_PUBLIC_ONESIGNAL_APP_ID before they can be enabled."
          }
          style={themed($body)}
        />
        <Button
          text={
            isRequesting
              ? "Enabling..."
              : areNotificationsEnabled
                ? "Push Notifications Enabled"
                : "Enable Push Notifications"
          }
          onPress={enablePushNotifications}
          disabled={!hasOneSignalConfig || isRequesting || areNotificationsEnabled}
        />
      </View>

      <View style={themed($card)}>
        <Text preset="subheading" text="Support Alerts" style={themed($title)} />
        <Text
          text={`${supportUnreadQuery.data?.unreadAdminMessages ?? 0} unread support message${supportUnreadQuery.data?.unreadAdminMessages === 1 ? "" : "s"}.`}
          style={themed($body)}
        />
      </View>
    </Screen>
  )

  async function enablePushNotifications() {
    if (!userId) return

    try {
      setIsRequesting(true)
      NotificationService.initialize((url) => router.push(url as never))
      const registration = await NotificationService.registerDevice({
        appVersion: null,
        getClerkSupabaseToken: () => getToken(),
        memberId: userId,
      })

      Alert.alert(
        registration ? "Notifications enabled" : "Notifications pending",
        registration
          ? "This device is registered for push notifications."
          : "Permission or native push registration is not complete yet.",
      )
      await notificationStatusQuery.refetch()
    } catch (error) {
      Alert.alert("Unable to enable notifications", getErrorMessage(error))
    } finally {
      setIsRequesting(false)
    }
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Please try again."
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  gap: spacing.lg,
  padding: spacing.lg,
})
const $backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  gap: spacing.xs,
  paddingTop: spacing.lg,
})
const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })
const $card: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.xl,
  gap: spacing.md,
  padding: spacing.lg,
})
const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $body: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3", lineHeight: 22 })
