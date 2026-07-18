import { FC, useEffect, useRef, useState } from "react"
import { RefreshControl, ViewStyle } from "react-native"
import { useRouter } from "expo-router"
import { useUser } from "@clerk/clerk-expo"

import {
  DashboardQuickAction,
  MemberStatusCard,
  QuickActionsGrid,
  WelcomeHeader,
} from "@/components/dashboard"
import { Screen } from "@/components/Screen"
import {
  useCurrentMemberAnnouncement,
  useMemberEvents,
  useMembershipSummary,
  usePartnerOffers,
  useSponsors,
} from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const HomeScreen: FC = () => {
  const renderStartedAt = getNow()
  const firstRenderStartedAt = useRef(renderStartedAt)
  const [areSecondaryQueriesEnabled, setAreSecondaryQueriesEnabled] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  const { themed } = useAppTheme()
  const membershipQueryStartedAt = getNow()
  const membershipQuery = useMembershipSummary()
  logHookInit("useMembershipSummary", membershipQueryStartedAt, renderStartedAt)

  const announcementQueryStartedAt = getNow()
  const announcementQuery = useCurrentMemberAnnouncement({ enabled: areSecondaryQueriesEnabled })
  logHookInit("useCurrentMemberAnnouncement", announcementQueryStartedAt, renderStartedAt)

  const eventsQueryStartedAt = getNow()
  const eventsQuery = useMemberEvents({ enabled: areSecondaryQueriesEnabled })
  logHookInit("useMemberEvents", eventsQueryStartedAt, renderStartedAt)

  const offersQueryStartedAt = getNow()
  const offersQuery = usePartnerOffers({ enabled: areSecondaryQueriesEnabled })
  logHookInit("usePartnerOffers", offersQueryStartedAt, renderStartedAt)

  const sponsorsQueryStartedAt = getNow()
  const sponsorsQuery = useSponsors({ enabled: areSecondaryQueriesEnabled })
  logHookInit("useSponsors", sponsorsQueryStartedAt, renderStartedAt)
  const dashboardQueries = [
    membershipQuery,
    announcementQuery,
    eventsQuery,
    offersQuery,
    sponsorsQuery,
  ]
  const membership = membershipQuery.data ?? null
  const isRefreshing = dashboardQueries.some((query) => query.isRefetching)
  const quickActions = getQuickActions({
    goToAnnouncements: () => router.push("/announcements"),
    goToEvents: () => router.push("/events"),
    goToMembershipCard: () => router.push("/membership-card"),
    goToOffers: () => router.push("/offers"),
    goToRacingTeam: () => router.push("/racing-team"),
    goToSponsors: () => router.push("/sponsors"),
  })

  useEffect(() => {
    logHomeTiming("first commit", firstRenderStartedAt.current)

    const frame = requestAnimationFrame(() => {
      logHomeTiming("secondary queries enabled", firstRenderStartedAt.current)
      setAreSecondaryQueriesEnabled(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <Screen
      preset="scroll"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
      ScrollViewProps={{
        refreshControl: <RefreshControl refreshing={isRefreshing} onRefresh={refreshDashboard} />,
      }}
    >
      <WelcomeHeader firstName={user?.firstName} />
      <MemberStatusCard
        active={Boolean(membership?.membership.active)}
        memberId={membership?.member?.id ?? null}
        membershipNumber={null}
        validUntil={formatDate(membership?.membership.expiresAt)}
      />
      <QuickActionsGrid actions={quickActions} />
    </Screen>
  )

  function refreshDashboard() {
    void Promise.all(dashboardQueries.map((query) => query.refetch()))
  }
}

function getQuickActions({
  goToAnnouncements,
  goToEvents,
  goToMembershipCard,
  goToOffers,
  goToRacingTeam,
  goToSponsors,
}: {
  goToAnnouncements: () => void
  goToEvents: () => void
  goToMembershipCard: () => void
  goToOffers: () => void
  goToRacingTeam: () => void
  goToSponsors: () => void
}): DashboardQuickAction[] {
  return [
    {
      id: "membership-card",
      icon: "credit-card",
      label: "Membership Card",
      onPress: goToMembershipCard,
    },
    { id: "announcements", icon: "bell", label: "Announcements", onPress: goToAnnouncements },
    { id: "events", icon: "calendar", label: "Events", onPress: goToEvents },
    { id: "offers", icon: "tag", label: "Offers", onPress: goToOffers },
    { id: "sponsors", icon: "shield", label: "Sponsors", onPress: goToSponsors },
    { id: "racing-team", icon: "car", label: "Racing Team", onPress: goToRacingTeam },
  ]
}

function formatDate(value: string | null | undefined) {
  if (!value) return null
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  gap: spacing.xl,
  padding: spacing.lg,
})

function logHookInit(label: string, startedAt: number, renderStartedAt: number) {
  if (__DEV__) {
    console.info(`[perf][HomeScreen] ${label} init ${(getNow() - startedAt).toFixed(1)}ms`, {
      sinceRenderStartMs: (getNow() - renderStartedAt).toFixed(1),
    })
  }
}

function getNow() {
  return globalThis.performance?.now?.() ?? Date.now()
}

function logHomeTiming(label: string, startedAt: number) {
  if (!__DEV__) return

  console.info(`[perf][HomeScreen] ${label} ${(getNow() - startedAt).toFixed(1)}ms`)
}
