import { FC } from "react"
import { ViewStyle } from "react-native"
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { NotificationService } from "@/services/notifications"
import { clearAppQueryCache } from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type MerchantHomeScreenProps = AppStackScreenProps<"MerchantHome">

export const MerchantHomeScreen: FC<MerchantHomeScreenProps> = ({ navigation }) => {
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { user } = useUser()
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="Merchant Portal" />
      <Text
        size="md"
        text={`Signed in as ${user?.primaryEmailAddress?.emailAddress ?? "BUL merchant"}.`}
      />
      <Text size="md" text="Merchant tools will be added in a later phase." />
      <Button preset="reversed" text="Account" onPress={() => navigation.navigate("Account")} />
      <Button text="Sign Out" onPress={handleSignOut} />
    </Screen>
  )

  async function handleSignOut() {
    await NotificationService.removeDevice(() => getToken())
    clearAppQueryCache()
    await signOut()
  }
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})
