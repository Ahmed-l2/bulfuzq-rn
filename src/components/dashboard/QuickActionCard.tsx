import { useEffect, useRef } from "react"
import { Pressable, TextStyle, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { UIIcon, UIIconName } from "@/components/ui"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface QuickActionCardProps {
  disabled?: boolean
  icon: UIIconName
  label: string
  onPress?: () => void
}

export function QuickActionCard({ disabled, icon, label, onPress }: QuickActionCardProps) {
  const startedAt = useRef(getNow())
  const { themed } = useAppTheme()

  useEffect(() => {
    logComponentCommit(`QuickActionCard:${label}`, startedAt.current)
  }, [label])

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        themed($card),
        disabled && themed($disabled),
        pressed && themed($pressed),
      ]}
    >
      <UIIcon name={icon} color={disabled ? "#6b7280" : "#ffffff"} />
      <Text
        size="xxs"
        weight="semiBold"
        text={label}
        style={themed(disabled ? $disabledText : $label)}
      />
    </Pressable>
  )
}

const $card: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  aspectRatio: 1,
  backgroundColor: "#111516",
  borderRadius: radius.lg,
  flexBasis: "30%",
  flexGrow: 1,
  gap: spacing.sm,
  justifyContent: "center",
  padding: spacing.xs,
})

const $pressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.72 })

const $disabled: ThemedStyle<ViewStyle> = () => ({ opacity: 0.45 })

const $label: ThemedStyle<TextStyle> = () => ({
  color: "#ffffff",
  textAlign: "center",
})

const $disabledText: ThemedStyle<TextStyle> = () => ({
  color: "#9ca3af",
  textAlign: "center",
})

function getNow() {
  return globalThis.performance?.now?.() ?? Date.now()
}

function logComponentCommit(component: string, startedAt: number) {
  if (!__DEV__) return

  console.info(
    `[perf][DashboardRender] ${component} first commit ${(getNow() - startedAt).toFixed(1)}ms`,
  )
}
