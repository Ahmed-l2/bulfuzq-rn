import { Pressable, PressableProps, StyleProp, TextStyle, ViewStyle } from "react-native"

import { Text, TextProps } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface UIPillProps
  extends Omit<PressableProps, "style">, Pick<TextProps, "text" | "tx" | "txOptions"> {
  selected?: boolean
  style?: StyleProp<ViewStyle>
}

export function UIPill({ selected, text, tx, txOptions, style, ...pressableProps }: UIPillProps) {
  const { themed } = useAppTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      {...pressableProps}
      style={({ pressed }) => [
        themed([$pill, selected ? $pillSelected : $pillDefault]),
        pressed && themed($pillPressed),
        style,
      ]}
    >
      <Text
        size="xs"
        weight="medium"
        text={text}
        tx={tx}
        txOptions={txOptions}
        style={themed(selected ? $pillTextSelected : $pillTextDefault)}
      />
    </Pressable>
  )
}

const $pill: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignSelf: "flex-start",
  borderRadius: radius.round,
  borderWidth: 1,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})

const $pillDefault: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.border,
})

const $pillSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral800,
  borderColor: colors.palette.neutral800,
})

const $pillPressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.86 })

const $pillTextDefault: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.text })

const $pillTextSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})
