import { FC } from "react"
import { TextStyle, ViewStyle } from "react-native"
import { useRouter } from "expo-router"
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { NotificationService } from "@/services/notifications"
import { clearAppQueryCache } from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const MerchantHomeScreen: FC = () => {
  const router = useRouter()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { user } = useUser()
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="fixed"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="Merchant Portal" style={themed($title)} />
      <Text
        size="md"
        text={`Signed in as ${user?.primaryEmailAddress?.emailAddress ?? "BUL merchant"}.`}
        style={themed($body)}
      />
      <Text size="md" text="Merchant tools will be added in a later phase." style={themed($body)} />
      <Button preset="reversed" text="Account" onPress={() => router.push("/merchant/account")} />
      <Button text="Sign Out" onPress={handleSignOut} />
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
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  flex: 1,
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $body: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })
