import { animations } from "./animations"
import { colors as colorsLight } from "./colors"
import { colors as colorsDark } from "./colorsDark"
import { radius } from "./radius"
import { shadows } from "./shadows"
import { spacing as spacingLight } from "./spacing"
import { spacing as spacingDark } from "./spacingDark"
import { timing } from "./timing"
import type { Theme } from "./types"
import { typography } from "./typography"

export const lightTheme: Theme = {
  colors: colorsLight,
  spacing: spacingLight,
  radius,
  shadows,
  animations,
  typography,
  timing,
  isDark: false,
}
export const darkTheme: Theme = {
  colors: colorsDark,
  spacing: spacingDark,
  radius,
  shadows,
  animations,
  typography,
  timing,
  isDark: true,
}
