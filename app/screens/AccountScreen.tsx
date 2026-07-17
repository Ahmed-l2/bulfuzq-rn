import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { NotificationService } from "@/services/notifications"
import { clearAppQueryCache } from "@/services/query"
import { useRole } from "@/services/roles"
import { type AppRole } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type AccountScreenProps = AppStackScreenProps<"Account">

export const AccountScreen: FC<AccountScreenProps> = ({ navigation }) => {
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { user } = useUser()
  const { availableRoles, currentRole, switchRole } = useRole()
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="Account" />
      <Text
        size="md"
        text={user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "BUL Racing account"}
      />

      <View style={themed($section)}>
        <Text preset="subheading" text="Current Role" />
        <Text size="md" text={`● ${getRoleLabel(currentRole)}`} />
      </View>

      {availableRoles.length > 1 ? (
        <View style={themed($section)}>
          <Text preset="subheading" text="Switch Experience" />
          {availableRoles.map((record) => (
            <Button
              key={record.id}
              preset={record.role === currentRole ? "default" : "reversed"}
              text={`${record.role === currentRole ? "●" : "○"} ${getRoleLabel(record.role)}`}
              onPress={() => switchRole(record.role)}
            />
          ))}
        </View>
      ) : null}

      <Button preset="reversed" text="Back" onPress={goBackToActiveExperience} />
      <Button text="Sign Out" onPress={handleSignOut} />
    </Screen>
  )

  function goBackToActiveExperience() {
    navigation.reset({
      index: 0,
      routes: [{ name: currentRole === "merchant" ? "MerchantHome" : "Home" }],
    })
  }

  async function handleSignOut() {
    await NotificationService.removeDevice(() => getToken())
    clearAppQueryCache()
    await signOut()
  }
}

function getRoleLabel(role: AppRole | null) {
  if (role === "member") return "Member"
  if (role === "merchant") return "Merchant"
  if (role === "admin") return "Admin"
  if (role === "staff") return "Staff"
  return "None"
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  gap: spacing.sm,
  padding: spacing.md,
  borderRadius: spacing.sm,
  backgroundColor: colors.palette.neutral100,
})
