import { ActivityIndicator, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface UILoadingProps {
  label?: string
}

export function UILoading({ label = "Loading..." }: UILoadingProps) {
  const { theme, themed } = useAppTheme()

  return (
    <View style={themed($loading)}>
      <ActivityIndicator color={theme.colors.tint} />
      <Text size="sm" text={label} />
    </View>
  )
}

const $loading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.sm,
  justifyContent: "center",
  padding: spacing.lg,
})
