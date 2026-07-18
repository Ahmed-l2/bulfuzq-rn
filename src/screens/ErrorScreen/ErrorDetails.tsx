import { ErrorInfo } from "react"
import { ScrollView, TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface ErrorDetailsProps {
  error: Error
  errorInfo: ErrorInfo | null
  onReset(): void
}

/**
 * Renders the error details screen.
 * @param {ErrorDetailsProps} props - The props for the `ErrorDetails` component.
 * @returns {JSX.Element} The rendered `ErrorDetails` component.
 */
export function ErrorDetails(props: ErrorDetailsProps) {
  const { themed } = useAppTheme()
  return (
    <Screen
      preset="fixed"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($contentContainer)}
    >
      <View style={$topSection}>
        <Icon icon="ladybug" size={64} />
        <Text style={themed($heading)} preset="subheading" tx="errorScreen:title" />
        <Text tx="errorScreen:friendlySubtitle" style={themed($subtitle)} />
      </View>

      <ScrollView
        style={themed($errorSection)}
        contentContainerStyle={themed($errorSectionContentContainer)}
      >
        <Text style={themed($errorContent)} weight="bold" text={`${props.error}`.trim()} />
        <Text
          selectable
          style={themed($errorBacktrace)}
          text={`${props.errorInfo?.componentStack ?? ""}`.trim()}
        />
      </ScrollView>

      <Button
        preset="reversed"
        style={themed($resetButton)}
        onPress={props.onReset}
        tx="errorScreen:reset"
      />
    </Screen>
  )
}

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  flex: 1,
})

const $topSection: ViewStyle = {
  flex: 1,
  alignItems: "center",
}

const $heading: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
})

const $subtitle: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })

const $errorSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 2,
  backgroundColor: "#111516",
  marginVertical: spacing.md,
  borderRadius: 6,
})

const $errorSectionContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $errorContent: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})

const $errorBacktrace: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  color: colors.textDim,
})

const $resetButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  paddingHorizontal: spacing.xxl,
})
