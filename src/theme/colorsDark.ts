const palette = {
  neutral900: "#FFFFFF",
  neutral800: "#F4F7FB",
  neutral700: "#D7E0EA",
  neutral600: "#A9B7C7",
  neutral500: "#738195",
  neutral400: "#46566A",
  neutral300: "#26384D",
  neutral200: "#111B2A",
  neutral100: "#06111F",

  primary600: "#FFE0E4",
  primary500: "#FFB3BC",
  primary400: "#FF7A88",
  primary300: "#F73A4F",
  primary200: "#D7192C",
  primary100: "#A80F20",

  secondary500: "#E6F1FF",
  secondary400: "#B8D8FF",
  secondary300: "#79B6FF",
  secondary200: "#2F80ED",
  secondary100: "#1557A8",

  accent500: "#FFF7D7",
  accent400: "#FFECA3",
  accent300: "#FFDD63",
  accent200: "#FFC928",
  accent100: "#F5B400",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(6, 17, 31, 0.2)",
  overlay50: "rgba(6, 17, 31, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral300,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
} as const
