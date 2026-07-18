import { FC } from "react"
import { TextStyle, ViewStyle } from "react-native"
import { Redirect, useRouter } from "expo-router"
import { useAuth, useClerk } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { LoadingScreen } from "@/screens/LoadingScreen"
import { NotificationService } from "@/services/notifications"
import { clearAppQueryCache } from "@/services/query"
import { useRole } from "@/services/roles"
import type { AppRole } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const RoleSelectionScreen: FC = () => {
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { signOut } = useClerk()
  const { availableRoles, isLoadingRoles, roleError, selectRole, refreshRoles } = useRole()
  const { themed } = useAppTheme()

  if (!isLoaded || isLoadingRoles) return <LoadingScreen />
  if (!isSignedIn) return <Redirect href="/sign-in" />

  return (
    <Screen
      preset="auto"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="Choose Experience" style={themed($title)} />
      <Text size="md" text="Select how you want to use BUL Racing today." style={themed($body)} />

      {roleError ? <Text size="sm" text={roleError} style={themed($error)} /> : null}

      {availableRoles.length === 0 ? (
        <>
          <Text
            size="sm"
            text="No mobile roles are available for this account yet."
            style={themed($body)}
          />
          <Button preset="reversed" text="Try Again" onPress={refreshRoles} />
          <Button text="Sign Out" onPress={handleSignOut} />
        </>
      ) : null}

      {availableRoles.map((record) => (
        <Button
          key={record.id}
          text={getRoleLabel(record.role)}
          onPress={() => handleSelectRole(record.role)}
        />
      ))}
    </Screen>
  )

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

  function handleSelectRole(role: AppRole) {
    const startedAt = getNow()
    selectRole(role)
    logRoleSelectionTiming("selectRole returned", startedAt, role)

    const routeStartedAt = getNow()
    router.replace(role === "merchant" ? "/merchant" : "/(member)/(tabs)")
    logRoleSelectionTiming("router.replace returned", routeStartedAt, role)
  }
}

function getRoleLabel(role: string) {
  if (role === "member") return "Member"
  if (role === "merchant") return "Merchant"
  return role
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  flexGrow: 1,
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $body: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })
const $error: ThemedStyle<TextStyle> = () => ({ color: "#ff3b30" })

function getNow() {
  return globalThis.performance?.now?.() ?? Date.now()
}

function logRoleSelectionTiming(label: string, startedAt: number, role: AppRole) {
  if (!__DEV__) return

  const duration = getNow() - startedAt
  console.info(`[perf][RoleSelectionScreen] ${label} ${duration.toFixed(1)}ms`, { role })
}
