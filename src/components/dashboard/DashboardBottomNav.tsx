import { ReactNode, useEffect, useRef } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { UIIcon, UIIconName } from "@/components/ui"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

const tabIcons: Record<string, UIIconName> = {
  Account: "user",
  Events: "calendar",
  Home: "user",
  Membership: "credit-card",
  account: "user",
  events: "calendar",
  index: "user",
  membership: "credit-card",
}

const tabLabels: Record<string, string> = {
  Account: "Account",
  Events: "Events",
  Home: "Home",
  Membership: "Membership",
  account: "Account",
  events: "Events",
  index: "Home",
  membership: "Membership",
}

interface BottomNavItem {
  focused: boolean
  icon: UIIconName
  label: string
  onPress?: () => void
}

interface DashboardBottomNavProps {
  descriptors: Record<
    string,
    // Expo Router and React Navigation disagree on the exact label callback shape.
    { options: { tabBarLabel?: ReactNode | ((props: any) => ReactNode); title?: string } }
  >
  navigation: {
    emit: (event: any) => any
    navigate: (...args: any[]) => void
  }
  insets?: { bottom: number }
  state: {
    index: number
    routes: Array<{ key: string; name: string; params?: object }>
  }
}

export function DashboardBottomNav({
  descriptors,
  insets,
  navigation,
  state,
}: DashboardBottomNavProps) {
  const startedAt = useRef(getNow())
  const { themed } = useAppTheme()
  const bottomInset = Math.max(insets?.bottom ?? 0, 12)

  useEffect(() => {
    logComponentCommit("DashboardBottomNav", startedAt.current)
  }, [])

  const items: BottomNavItem[] = state.routes.map((route, index) => {
    const descriptor = descriptors[route.key]
    const label =
      descriptor.options.tabBarLabel?.toString() ??
      descriptor.options.title ??
      tabLabels[route.name] ??
      route.name
    const focused = state.index === index

    return {
      focused,
      icon: tabIcons[route.name] ?? "user",
      label,
      onPress: () => {
        const event = navigation.emit({
          type: "tabPress",
          target: route.key,
          canPreventDefault: true,
        })

        if (!focused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params)
        }
      },
    }
  })

  return (
    <View style={[themed($container), { paddingBottom: bottomInset }]}>
      {items.map((item) => (
        <Pressable
          key={item.label}
          accessibilityRole="button"
          accessibilityState={{ selected: item.focused }}
          onPress={item.onPress}
          style={themed($item)}
        >
          <UIIcon name={item.icon} size={24} color={item.focused ? "#dc2626" : "#9ca3af"} />
          <Text
            size="xxs"
            weight="semiBold"
            text={item.label}
            style={themed(item.focused ? $activeLabel : $label)}
          />
        </Pressable>
      ))}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  borderTopColor: "#171717",
  borderTopWidth: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  paddingTop: spacing.md,
})

const $item: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flex: 1,
  gap: spacing.xxxs,
})

const $label: ThemedStyle<TextStyle> = () => ({ color: "#9ca3af" })
const $activeLabel: ThemedStyle<TextStyle> = () => ({ color: "#dc2626" })

function getNow() {
  return globalThis.performance?.now?.() ?? Date.now()
}

function logComponentCommit(component: string, startedAt: number) {
  if (!__DEV__) return

  console.info(
    `[perf][DashboardRender] ${component} first commit ${(getNow() - startedAt).toFixed(1)}ms`,
  )
}
