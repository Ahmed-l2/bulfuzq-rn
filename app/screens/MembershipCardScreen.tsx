import { FC } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import QRCode from "react-native-qrcode-svg"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UICard } from "@/components/ui"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useMembershipSummary } from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type MembershipCardScreenProps = AppStackScreenProps<"MembershipCard">

export const MembershipCardScreen: FC<MembershipCardScreenProps> = ({ navigation }) => {
  const { theme, themed } = useAppTheme()
  const membershipQuery = useMembershipSummary()
  const summary = membershipQuery.data ?? null
  const member = summary?.member
  const membership = summary?.membership
  const qrValue = member
    ? JSON.stringify({ type: "bul-racing-member", memberId: member.id, version: 1 })
    : "bul-racing-member-unavailable"

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <View style={themed($header)}>
        <Text preset="heading" text="Membership Card" />
        <Text size="sm" text="Available offline after your first successful dashboard load." />
      </View>

      {membershipQuery.isLoading ? (
        <UICard heading="Loading Card" content="Preparing your digital membership card..." />
      ) : null}

      {membershipQuery.error ? (
        <UICard heading="Unable to Refresh" content={getErrorMessage(membershipQuery.error)} />
      ) : null}

      <View style={themed($card)}>
        <View style={themed($cardHeader)}>
          <View style={themed($cardTitleBlock)}>
            <Text size="xxs" weight="semiBold" text="BUL RACING" style={themed($eyebrow)} />
            <Text preset="heading" text="Member Pass" style={themed($cardTitle)} />
          </View>
          <View style={themed(membership?.active ? $statusBadgeActive : $statusBadgeInactive)}>
            <Text
              size="xxs"
              weight="semiBold"
              text={membership?.badge ?? "Inactive"}
              style={themed($statusBadgeText)}
            />
          </View>
        </View>

        <View style={themed($memberBlock)}>
          <Text size="xs" text="Member" style={themed($cardLabel)} />
          <Text
            size="lg"
            weight="bold"
            text={member?.fullName ?? "No member profile"}
            style={themed($cardText)}
          />
          <Text
            size="sm"
            text={member?.email ?? "Membership profile not found"}
            style={themed($cardMuted)}
          />
        </View>

        <View style={themed($detailsGrid)}>
          <CardDetail label="Package" value={membership?.tier ?? "Unavailable"} />
          <CardDetail label="Status" value={membership?.active ? "Active" : "Inactive"} />
          <CardDetail label="Expires" value={formatExpiry(membership?.expiresAt)} />
          <CardDetail label="Renewal" value={membership?.renewable ? "Available" : "Not needed"} />
        </View>

        <View style={themed($qrWrap)}>
          <QRCode
            value={qrValue}
            size={160}
            color={theme.colors.palette.neutral900}
            backgroundColor={theme.colors.palette.neutral100}
          />
          <Text
            size="xs"
            text="Scan-ready for future validation and event check-in."
            style={themed($cardMuted)}
          />
        </View>
      </View>

      {!member ? (
        <UICard
          heading="No Active Membership"
          content="This account can use the member app, but no membership record was found yet."
        />
      ) : null}

      <Button
        preset="reversed"
        text="Back to Dashboard"
        onPress={() => navigation.navigate("MemberTabs", { screen: "Home" })}
      />
    </Screen>
  )
}

function CardDetail({ label, value }: { label: string; value: string }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($detail)}>
      <Text size="xxs" text={label} style={themed($cardLabel)} />
      <Text size="sm" weight="semiBold" text={value} style={themed($cardText)} />
    </View>
  )
}

function formatExpiry(value: string | null | undefined) {
  if (!value) return "Unavailable"
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Cached card data may still be available. Pull from the dashboard to refresh."
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  padding: spacing.lg,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })

const $card: ThemedStyle<ViewStyle> = ({ colors, radius, spacing }) => ({
  gap: spacing.lg,
  padding: spacing.lg,
  borderRadius: radius.xl,
  backgroundColor: colors.palette.neutral800,
})

const $cardHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  position: "relative",
})

const $cardTitleBlock: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "stretch",
})

const $statusBadgeBase: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  borderRadius: radius.round,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxxs,
  position: "absolute",
  right: 0,
  top: 0,
})

const $statusBadgeActive: ThemedStyle<ViewStyle> = (theme) => ({
  ...$statusBadgeBase(theme),
  backgroundColor: theme.colors.palette.primary500,
})

const $statusBadgeInactive: ThemedStyle<ViewStyle> = (theme) => ({
  ...$statusBadgeBase(theme),
  backgroundColor: theme.colors.palette.neutral600,
})

const $statusBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  letterSpacing: 0.4,
  textAlign: "center",
  textTransform: "uppercase",
})

const $eyebrow: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.accent400,
  letterSpacing: 1,
})

const $cardTitle: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.palette.neutral100 })

const $memberBlock: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xxs })

const $cardLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral400,
  textTransform: "uppercase",
})

const $cardText: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.palette.neutral100 })

const $cardMuted: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.palette.neutral300 })

const $detailsGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $detail: ThemedStyle<ViewStyle> = ({ colors, radius, spacing }) => ({
  flexBasis: "47%",
  flexGrow: 1,
  gap: spacing.xxxs,
  padding: spacing.sm,
  borderRadius: radius.md,
  backgroundColor: colors.palette.neutral700,
})

const $qrWrap: ThemedStyle<ViewStyle> = ({ colors, radius, spacing }) => ({
  alignItems: "center",
  gap: spacing.sm,
  padding: spacing.md,
  borderRadius: radius.lg,
  backgroundColor: colors.palette.neutral100,
})
