import { ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function MissingAuthConfigScreen() {
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="Clerk is not configured" />
      <Text
        size="md"
        text="Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to use the same Clerk instance as the website."
      />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})
