import { FC } from "react"
import { RefreshControl, View, ViewStyle } from "react-native"
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIBadge, UICard } from "@/components/ui"
import { hasSupabaseConfig } from "@/config/env"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { NotificationService } from "@/services/notifications"
import {
  useCurrentMemberAnnouncement,
  useMemberEvents,
  useMembershipSummary,
  usePartnerOffers,
  useSponsors,
} from "@/services/query"
import { clearAppQueryCache } from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type HomeScreenProps = AppStackScreenProps<"Home">

export const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { user } = useUser()
  const { themed } = useAppTheme()
  const membershipQuery = useMembershipSummary()
  const announcementQuery = useCurrentMemberAnnouncement()
  const eventsQuery = useMemberEvents()
  const offersQuery = usePartnerOffers()
  const sponsorsQuery = useSponsors()
  const dashboardQueries = [
    membershipQuery,
    announcementQuery,
    eventsQuery,
    offersQuery,
    sponsorsQuery,
  ]
  const membership = membershipQuery.data ?? null
  const membershipError = membershipQuery.error
  const announcement = announcementQuery.data
  const nextEvent = eventsQuery.data?.[0]
  const nextOffer = offersQuery.data?.[0]
  const featuredSponsors = sponsorsQuery.data?.slice(0, 3) ?? []
  const isRefreshing = dashboardQueries.some((query) => query.isRefetching)
  const isInitialLoading = dashboardQueries.some((query) => query.isLoading)
  const hasCachedData = dashboardQueries.some((query) => Boolean(query.data))
  const dashboardError = dashboardQueries.find((query) => query.error)?.error

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
      ScrollViewProps={{
        refreshControl: <RefreshControl refreshing={isRefreshing} onRefresh={refreshDashboard} />,
      }}
    >
      <View style={themed($hero)}>
        <UIBadge tone="brand" text="Member Dashboard" />
        <Text preset="heading" text={`Welcome${user?.firstName ? `, ${user.firstName}` : ""}`} />
        <Text
          size="sm"
          text={
            hasCachedData && isRefreshing
              ? "Refreshing your latest membership updates."
              : "Your BUL Racing membership, events, offers, and club updates in one place."
          }
        />
      </View>

      {!hasSupabaseConfig ? (
        <UICard heading="Setup Required" content="Supabase is not configured for this build." />
      ) : null}
      {isInitialLoading ? (
        <UICard heading="Loading Dashboard" content="Getting your member experience ready..." />
      ) : null}
      {dashboardError ? (
        <UICard heading="Unable to Refresh" content={getErrorMessage(dashboardError)} />
      ) : null}

      <UICard
        heading="Membership Status"
        content={getMembershipStatusText(membership, Boolean(membershipError))}
        footer={getMembershipFooterText(membership)}
      />

      <View style={themed($quickActions)}>
        <Text preset="subheading" text="Quick Actions" />
        <View style={themed($quickActionGrid)}>
          {getQuickActions(membership).map((action) => (
            <UICard
              key={action.id}
              heading={action.label}
              content={action.description}
              style={themed($quickAction)}
            />
          ))}
        </View>
      </View>

      <DashboardPreview
        title="Announcement"
        empty="No active announcements right now."
        value={announcement?.title}
      />
      <DashboardPreview
        title="Upcoming Event"
        empty="No upcoming events are available yet."
        value={nextEvent?.title}
        detail={nextEvent ? formatDate(nextEvent.event_date) : undefined}
      />
      <DashboardPreview
        title="Latest Offer"
        empty="No partner offers are available yet."
        value={nextOffer?.offer_title}
        detail={nextOffer ? `Valid until ${formatDate(nextOffer.valid_until)}` : undefined}
      />
      <UICard
        heading="Featured Sponsors"
        content={
          featuredSponsors.length > 0
            ? featuredSponsors.map((sponsor) => sponsor.name).join(" • ")
            : "No featured sponsors are available yet."
        }
      />

      <Button preset="reversed" text="Account" onPress={() => navigation.navigate("Account")} />
      <Button text="Sign Out" onPress={handleSignOut} />
    </Screen>
  )

  function refreshDashboard() {
    void Promise.all(dashboardQueries.map((query) => query.refetch()))
  }

  async function handleSignOut() {
    await NotificationService.removeDevice(() => getToken())
    clearAppQueryCache()
    await signOut()
  }
}

function DashboardPreview({
  detail,
  empty,
  title,
  value,
}: {
  detail?: string
  empty: string
  title: string
  value?: string
}) {
  return <UICard heading={title} content={value ?? empty} footer={detail} />
}

function getMembershipStatusText(
  membership: NonNullable<ReturnType<typeof useMembershipSummary>["data"]> | null,
  hasError: boolean,
) {
  if (hasError) return "Membership status is unavailable. Pull to refresh and try again."
  if (!membership) return "Membership details are not available yet."
  if (!membership.member) return "No active membership profile found for this account."
  if (!membership.membership.active) return "Your membership is inactive or pending renewal."
  return membership.membership.badge
}

function getMembershipFooterText(
  membership: NonNullable<ReturnType<typeof useMembershipSummary>["data"]> | null,
) {
  if (!membership?.membership.active) return "Renewal options will appear when available."
  if (membership.membership.daysRemaining === null) return membership.membership.tier ?? undefined
  return `${membership.membership.daysRemaining} days remaining`
}

function getQuickActions(
  membership: NonNullable<ReturnType<typeof useMembershipSummary>["data"]> | null,
) {
  const baseActions = [
    { id: "membership-card", label: "Membership Card", description: "View your digital card" },
    { id: "events", label: "Events", description: "See upcoming club events" },
    { id: "offers", label: "Offers", description: "Browse partner benefits" },
    { id: "announcements", label: "Announcements", description: "Read club updates" },
    { id: "sponsors", label: "Sponsors", description: "Explore BUL partners" },
  ]

  if (!membership?.membership.active) return baseActions
  return baseActions.map((action) =>
    action.id === "membership-card"
      ? { ...action, description: "Ready offline after first load" }
      : action,
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Pull to refresh and try again."
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  padding: spacing.lg,
})

const $hero: ThemedStyle<ViewStyle> = ({ colors, radius, spacing }) => ({
  gap: spacing.sm,
  padding: spacing.lg,
  borderRadius: radius.xl,
  backgroundColor: colors.palette.neutral100,
})

const $quickActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $quickActionGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $quickAction: ThemedStyle<ViewStyle> = () => ({
  flexBasis: "48%",
  flexGrow: 1,
})
