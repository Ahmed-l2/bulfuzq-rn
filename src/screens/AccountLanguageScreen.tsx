import { FC } from "react"
import { Pressable, TextStyle, ViewStyle } from "react-native"
import { useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const AccountLanguageScreen: FC = () => {
  const router = useRouter()
  const { themed } = useAppTheme()

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
      <Text preset="heading" text="Language" style={themed($title)} />
      <Text
        text="Language switching is coming soon. The app is prepared for English and Arabic content where available."
        style={themed($body)}
      />
    </Screen>
  )
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
const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $body: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3", lineHeight: 22 })
