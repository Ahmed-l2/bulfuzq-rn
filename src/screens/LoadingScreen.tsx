import { ActivityIndicator, TextStyle, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function LoadingScreen() {
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="fixed"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <ActivityIndicator color="#E10600" />
      <Text text="Loading..." style={themed($text)} />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
  padding: spacing.lg,
})

const $text: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
