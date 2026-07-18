import { ComponentType } from "react"
import type { LucideProps } from "lucide-react-native"
import ArrowLeft from "lucide-react-native/icons/arrow-left"
import Bell from "lucide-react-native/icons/bell"
import BellOff from "lucide-react-native/icons/bell-off"
import Building2 from "lucide-react-native/icons/building-2"
import CalendarDays from "lucide-react-native/icons/calendar-days"
import Car from "lucide-react-native/icons/car"
import ChevronRight from "lucide-react-native/icons/chevron-right"
import CreditCard from "lucide-react-native/icons/credit-card"
import ExternalLink from "lucide-react-native/icons/external-link"
import Gauge from "lucide-react-native/icons/gauge"
import Headset from "lucide-react-native/icons/headset"
import Info from "lucide-react-native/icons/info"
import Languages from "lucide-react-native/icons/languages"
import LockKeyhole from "lucide-react-native/icons/lock-keyhole"
import MapPin from "lucide-react-native/icons/map-pin"
import MessageCircle from "lucide-react-native/icons/message-circle"
import Settings from "lucide-react-native/icons/settings"
import Shield from "lucide-react-native/icons/shield"
import Tag from "lucide-react-native/icons/tag"
import User from "lucide-react-native/icons/user"
import Users from "lucide-react-native/icons/users"
import Wrench from "lucide-react-native/icons/wrench"
import Zap from "lucide-react-native/icons/zap"

import { useAppTheme } from "@/theme/context"

export type UIIconName =
  | "arrow-left"
  | "bell"
  | "bell-off"
  | "building-2"
  | "calendar"
  | "car"
  | "chevron-right"
  | "credit-card"
  | "external-link"
  | "gauge"
  | "headset"
  | "info"
  | "languages"
  | "lock-keyhole"
  | "map-pin"
  | "message-circle"
  | "settings"
  | "shield"
  | "tag"
  | "user"
  | "users"
  | "wrench"
  | "zap"

export interface UIIconProps {
  color?: string
  name: UIIconName
  size?: number
  strokeWidth?: number
}

const icons: Record<UIIconName, ComponentType<LucideProps>> = {
  "arrow-left": ArrowLeft,
  "bell": Bell,
  "bell-off": BellOff,
  "building-2": Building2,
  "calendar": CalendarDays,
  "car": Car,
  "chevron-right": ChevronRight,
  "credit-card": CreditCard,
  "external-link": ExternalLink,
  "gauge": Gauge,
  "headset": Headset,
  "info": Info,
  "languages": Languages,
  "lock-keyhole": LockKeyhole,
  "map-pin": MapPin,
  "message-circle": MessageCircle,
  "settings": Settings,
  "shield": Shield,
  "tag": Tag,
  "user": User,
  "users": Users,
  "wrench": Wrench,
  "zap": Zap,
}

export function UIIcon({ color, name, size = 26, strokeWidth = 2.2 }: UIIconProps) {
  const { theme } = useAppTheme()
  const Icon = icons[name]

  return (
    <Icon color={color ?? theme.colors.palette.neutral100} size={size} strokeWidth={strokeWidth} />
  )
}
