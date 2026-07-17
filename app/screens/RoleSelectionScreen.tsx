import { FC } from "react"
import { ViewStyle } from "react-native"
import { useAuth, useClerk } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { NotificationService } from "@/services/notifications"
import { clearAppQueryCache } from "@/services/query"
import { useRole } from "@/services/roles"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type RoleSelectionScreenProps = AppStackScreenProps<"RoleSelection">

export const RoleSelectionScreen: FC<RoleSelectionScreenProps> = () => {
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const { availableRoles, roleError, selectRole, refreshRoles } = useRole()
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="Choose Experience" />
      <Text size="md" text="Select how you want to use BUL Racing today." />

      {roleError ? <Text size="sm" text={roleError} /> : null}

      {availableRoles.length === 0 ? (
        <>
          <Text size="sm" text="No mobile roles are available for this account yet." />
          <Button preset="reversed" text="Try Again" onPress={refreshRoles} />
          <Button text="Sign Out" onPress={handleSignOut} />
        </>
      ) : null}

      {availableRoles.map((record) => (
        <Button
          key={record.id}
          text={getRoleLabel(record.role)}
          onPress={() => selectRole(record.role)}
        />
      ))}
    </Screen>
  )

  async function handleSignOut() {
    await NotificationService.removeDevice(() => getToken())
    clearAppQueryCache()
    await signOut()
  }
}

function getRoleLabel(role: string) {
  if (role === "member") return "Member"
  if (role === "merchant") return "Merchant"
  return role
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})
