import { ReactNode } from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface UISectionProps {
  children: ReactNode
  eyebrow?: string
  style?: StyleProp<ViewStyle>
  title: string
}

export function UISection({ children, eyebrow, style, title }: UISectionProps) {
  const { themed } = useAppTheme()

  return (
    <View style={[themed($section), style]}>
      {eyebrow ? (
        <Text size="xxs" weight="semiBold" text={eyebrow} style={themed($eyebrow)} />
      ) : null}
      <Text preset="subheading" text={title} />
      <View style={themed($content)}>{children}</View>
    </View>
  )
}

const $section: ThemedStyle<ViewStyle> = ({ colors, radius, shadows, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: radius.lg,
  gap: spacing.xs,
  padding: spacing.md,
  ...shadows.sm,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })

const $eyebrow: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary500,
  letterSpacing: 0.8,
  textTransform: "uppercase",
})
