const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F4F7FB",
  neutral300: "#D7E0EA",
  neutral400: "#A9B7C7",
  neutral500: "#738195",
  neutral600: "#46566A",
  neutral700: "#26384D",
  neutral800: "#111B2A",
  neutral900: "#06111F",

  primary100: "#FFE0E4",
  primary200: "#FFB3BC",
  primary300: "#FF7A88",
  primary400: "#F73A4F",
  primary500: "#D7192C",
  primary600: "#A80F20",

  secondary100: "#E6F1FF",
  secondary200: "#B8D8FF",
  secondary300: "#79B6FF",
  secondary400: "#2F80ED",
  secondary500: "#1557A8",

  accent100: "#FFF7D7",
  accent200: "#FFECA3",
  accent300: "#FFDD63",
  accent400: "#FFC928",
  accent500: "#F5B400",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(6, 17, 31, 0.2)",
  overlay50: "rgba(6, 17, 31, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral300,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
} as const
