import { useEffect, useRef } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { UIIconName } from "@/components/ui"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { QuickActionCard } from "./QuickActionCard"

export interface DashboardQuickAction {
  disabled?: boolean
  icon: UIIconName
  id: string
  label: string
  onPress?: () => void
}

export interface QuickActionsGridProps {
  actions: DashboardQuickAction[]
}

export function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  const startedAt = useRef(getNow())
  const { themed } = useAppTheme()

  useEffect(() => {
    logComponentCommit("QuickActionsGrid", startedAt.current)
  }, [])

  return (
    <View style={themed($container)}>
      <Text preset="subheading" text="Quick Actions" style={themed($title)} />
      <View style={themed($grid)}>
        {actions.map((action) => (
          <QuickActionCard key={action.id} {...action} />
        ))}
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.md })

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $grid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
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
