import { TextStyle, View, ViewStyle } from "react-native"

import { Text, TextProps } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface UIBadgeProps extends Pick<TextProps, "text" | "tx" | "txOptions"> {
  tone?: "neutral" | "brand" | "success" | "warning"
}

export function UIBadge({ tone = "neutral", ...textProps }: UIBadgeProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed([$badge, $badgeTones[tone]])}>
      <Text size="xxs" weight="semiBold" {...textProps} style={themed($badgeText)} />
    </View>
  )
}

const $badge: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignSelf: "flex-start",
  borderRadius: radius.round,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxxs,
})

const $badgeTones: Record<NonNullable<UIBadgeProps["tone"]>, ThemedStyle<ViewStyle>> = {
  neutral: ({ colors }) => ({ backgroundColor: colors.palette.neutral300 }),
  brand: ({ colors }) => ({ backgroundColor: colors.palette.primary500 }),
  success: ({ colors }) => ({ backgroundColor: colors.palette.secondary400 }),
  warning: ({ colors }) => ({ backgroundColor: colors.palette.accent400 }),
}

const $badgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  letterSpacing: 0.4,
  textTransform: "uppercase",
})
