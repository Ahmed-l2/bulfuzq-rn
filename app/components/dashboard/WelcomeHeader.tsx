import { TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface WelcomeHeaderProps {
  firstName?: string | null
}

export function WelcomeHeader({ firstName }: WelcomeHeaderProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($container)}>
      <Text preset="heading" text={`Hi, ${firstName || "Member"}`} style={themed($title)} />
      <Text size="md" text="Welcome back!" style={themed($subtitle)} />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxs,
  paddingTop: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.palette.neutral900 })

const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.palette.neutral700 })
