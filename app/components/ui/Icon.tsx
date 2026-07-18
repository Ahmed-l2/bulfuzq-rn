import { ComponentType } from "react"
import {
  Bell,
  CalendarDays,
  CreditCard,
  LucideProps,
  Shield,
  Tag,
  User,
  Users,
} from "lucide-react-native"

import { useAppTheme } from "@/theme/context"

export type UIIconName = "bell" | "calendar" | "credit-card" | "shield" | "tag" | "user" | "users"

export interface UIIconProps {
  color?: string
  name: UIIconName
  size?: number
  strokeWidth?: number
}

const icons: Record<UIIconName, ComponentType<LucideProps>> = {
  "bell": Bell,
  "calendar": CalendarDays,
  "credit-card": CreditCard,
  "shield": Shield,
  "tag": Tag,
  "user": User,
  "users": Users,
}

export function UIIcon({ color, name, size = 26, strokeWidth = 2.2 }: UIIconProps) {
  const { theme } = useAppTheme()
  const Icon = icons[name]

  return (
    <Icon color={color ?? theme.colors.palette.neutral100} size={size} strokeWidth={strokeWidth} />
  )
}
