import { FC } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon, UIIconName } from "@/components/ui"
import { NotificationService } from "@/services/notifications"
import { clearAppQueryCache, useSupportUnreadSummary } from "@/services/query"
import { useRole } from "@/services/roles"
import { type AppRole } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const AccountScreen: FC = () => {
  const router = useRouter()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { user } = useUser()
  const { availableRoles, currentRole, switchRole } = useRole()
  const { themed } = useAppTheme()
  const supportUnreadQuery = useSupportUnreadSummary()
  const unreadSupportMessages = supportUnreadQuery.data?.unreadAdminMessages ?? 0

  return (
    <Screen
      preset="auto"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <View style={themed($header)}>
        <Text preset="heading" text="Account" style={themed($title)} />
        <Text
          size="md"
          text={user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "BUL Racing account"}
          style={themed($body)}
        />
      </View>

      <View style={themed($section)}>
        <Text preset="subheading" text="Current Role" style={themed($title)} />
        <Text size="md" text={`● ${getRoleLabel(currentRole)}`} style={themed($accentText)} />
      </View>

      <View style={themed($section)}>
        <Text preset="subheading" text="Account" style={themed($title)} />
        <AccountRow
          icon="languages"
          title="Language"
          subtitle="Coming soon"
          onPress={() => router.push("/account/language")}
        />
        <AccountRow
          icon="headset"
          title="Contact Support"
          subtitle={
            unreadSupportMessages > 0
              ? `${unreadSupportMessages} unread support message${unreadSupportMessages === 1 ? "" : "s"}`
              : "Message the BUL Racing team"
          }
          onPress={() => router.push("/account/support")}
        />
        <AccountRow
          icon="bell"
          title="Notifications"
          subtitle="Push permissions and support alerts"
          onPress={() => router.push("/account/notifications")}
        />
        <AccountRow
          icon="info"
          title="App & Legal"
          subtitle="App info, privacy, and terms"
          onPress={() => router.push("/account/app-info")}
        />
      </View>

      <View style={themed($section)}>
        <Text preset="subheading" text="Experience" style={themed($title)} />
        {availableRoles.length > 1 ? (
          availableRoles.map((record) => (
            <Button
              key={record.id}
              preset={record.role === currentRole ? "default" : "reversed"}
              text={`${record.role === currentRole ? "●" : "○"} ${getRoleLabel(record.role)}`}
              onPress={() => switchRole(record.role)}
            />
          ))
        ) : (
          <Text
            size="sm"
            text="Role switching is not available for this account."
            style={themed($body)}
          />
        )}
      </View>

      <Button preset="reversed" text="Back" onPress={goBackToActiveExperience} />
      <Button text="Sign Out" onPress={handleSignOut} />
    </Screen>
  )

  function goBackToActiveExperience() {
    router.replace(currentRole === "merchant" ? "/merchant" : "/")
  }

  async function handleSignOut() {
    try {
      await NotificationService.removeDevice(() => getToken())
    } catch {
      // Sign-out must still complete if push-device cleanup fails offline.
    }

    clearAppQueryCache()
    await signOut()
    router.replace("/sign-in")
  }
}

function AccountRow({
  icon,
  onPress,
  subtitle,
  title,
}: {
  icon: UIIconName
  onPress: () => void
  subtitle: string
  title: string
}) {
  const { themed } = useAppTheme()

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [themed($row), pressed && themed($pressed)]}
    >
      <View style={themed($rowIcon)}>
        <UIIcon name={icon} size={20} color="#E10600" strokeWidth={1.9} />
      </View>
      <View style={themed($rowCopy)}>
        <Text size="sm" weight="semiBold" text={title} style={themed($title)} />
        <Text size="xs" text={subtitle} style={themed($body)} />
      </View>
      <UIIcon name="chevron-right" size={18} color="#737373" strokeWidth={1.8} />
    </Pressable>
  )
}

function getRoleLabel(role: AppRole | null) {
  if (role === "member") return "Member"
  if (role === "merchant") return "Merchant"
  if (role === "admin") return "Admin"
  if (role === "staff") return "Staff"
  return "None"
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  flexGrow: 1,
  gap: spacing.lg,
  padding: spacing.lg,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
  paddingTop: spacing.lg,
})

const $section: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  gap: spacing.sm,
  padding: spacing.md,
  borderRadius: radius.lg,
  backgroundColor: "#111516",
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $body: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })
const $accentText: ThemedStyle<TextStyle> = () => ({ color: "#E10600" })
const $row: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  backgroundColor: "#0b0d0e",
  borderRadius: radius.lg,
  flexDirection: "row",
  gap: spacing.md,
  padding: spacing.md,
})
const $pressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.78 })
const $rowIcon: ThemedStyle<ViewStyle> = ({ radius }) => ({
  alignItems: "center",
  backgroundColor: "rgba(225, 6, 0, 0.12)",
  borderRadius: radius.round,
  height: 38,
  justifyContent: "center",
  width: 38,
})
const $rowCopy: ThemedStyle<ViewStyle> = () => ({ flex: 1 })
