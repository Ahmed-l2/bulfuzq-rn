import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"

import { Text } from "@/components/Text"
import { UIIcon, UIIconName } from "@/components/ui"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

const tabIcons: Record<string, UIIconName> = {
  Account: "user",
  Events: "calendar",
  Home: "user",
  Membership: "credit-card",
}

const tabLabels: Record<string, string> = {
  Account: "Account",
  Events: "Events",
  Home: "Home",
  Membership: "Membership",
}

interface BottomNavItem {
  focused: boolean
  icon: UIIconName
  label: string
  onPress?: () => void
}

export function DashboardBottomNav({ descriptors, navigation, state }: BottomTabBarProps) {
  const { themed } = useAppTheme()
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
    <View style={themed($container)}>
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
