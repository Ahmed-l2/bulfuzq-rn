import { useEffect, useRef } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface MemberStatusCardProps {
  active: boolean
  memberId?: string | null
  membershipNumber?: string | null
  validUntil?: string | null
}

export function MemberStatusCard({
  active,
  memberId,
  membershipNumber: _membershipNumber,
  validUntil,
}: MemberStatusCardProps) {
  const startedAt = useRef(getNow())
  const { themed } = useAppTheme()

  useEffect(() => {
    logComponentCommit("MemberStatusCard", startedAt.current)
  }, [])

  return (
    <View style={themed($card)}>
      <View style={themed($topRow)}>
        <Text preset="subheading" text="Membership" style={themed($title)} />
        <View style={themed(active ? $statusActive : $statusInactive)}>
          <Text
            size="xs"
            weight="semiBold"
            text={active ? "Active" : "Inactive"}
            style={themed($statusText)}
          />
        </View>
      </View>

      <Text size="sm" text={`Valid until ${validUntil ?? "Unavailable"}`} style={themed($muted)} />

      <View style={themed($divider)} />

      <View style={themed($bottomRow)}>
        <View style={themed($detailGroup)}>
          <Text size="xs" text="Member ID" style={themed($muted)} />
          <Text
            size="sm"
            weight="semiBold"
            text={memberId ?? "Unavailable"}
            style={themed($value)}
          />
        </View>
      </View>
    </View>
  )
}

const $card: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.xl,
  gap: spacing.sm,
  padding: spacing.lg,
})

const $topRow: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $muted: ThemedStyle<TextStyle> = () => ({ color: "#9ca3af" })

const $divider: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#252a2c",
  height: 1,
  marginVertical: spacing.xs,
})

const $bottomRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 16,
})

const $detailGroup: ThemedStyle<ViewStyle> = () => ({ gap: 4 })

const $value: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $statusBase: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  borderRadius: radius.round,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
})

const $statusActive: ThemedStyle<ViewStyle> = (theme) => ({
  ...$statusBase(theme),
  backgroundColor: "rgba(34, 197, 94, 0.16)",
})

const $statusInactive: ThemedStyle<ViewStyle> = (theme) => ({
  ...$statusBase(theme),
  backgroundColor: "rgba(156, 163, 175, 0.16)",
})

const $statusText: ThemedStyle<TextStyle> = () => ({ color: "#22c55e" })

function getNow() {
  return globalThis.performance?.now?.() ?? Date.now()
}

function logComponentCommit(component: string, startedAt: number) {
  if (!__DEV__) return

  console.info(
    `[perf][DashboardRender] ${component} first commit ${(getNow() - startedAt).toFixed(1)}ms`,
  )
}
