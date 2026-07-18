import { FC } from "react"
import { RefreshControl, ViewStyle } from "react-native"
import { useUser } from "@clerk/clerk-expo"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

import {
  DashboardQuickAction,
  MemberStatusCard,
  QuickActionsGrid,
  WelcomeHeader,
} from "@/components/dashboard"
import { Screen } from "@/components/Screen"
import type { AppStackParamList, MemberTabScreenProps } from "@/navigators/navigationTypes"
import {
  useCurrentMemberAnnouncement,
  useMemberEvents,
  useMembershipSummary,
  usePartnerOffers,
  useSponsors,
} from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type HomeScreenProps = MemberTabScreenProps<"Home">

export const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
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
  const isRefreshing = dashboardQueries.some((query) => query.isRefetching)
  const stackNavigation = navigation.getParent<NativeStackNavigationProp<AppStackParamList>>()
  const quickActions = getQuickActions({
    goToAnnouncements: () => stackNavigation?.navigate("Announcements"),
    goToMembershipCard: () => stackNavigation?.navigate("MembershipCard"),
  })

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
  goToMembershipCard,
}: {
  goToAnnouncements: () => void
  goToMembershipCard: () => void
}): DashboardQuickAction[] {
  return [
    {
      id: "membership-card",
      icon: "credit-card",
      label: "Membership Card",
      onPress: goToMembershipCard,
    },
    { id: "announcements", icon: "bell", label: "Announcements", onPress: goToAnnouncements },
    { disabled: true, id: "events", icon: "calendar", label: "Events" },
    { disabled: true, id: "offers", icon: "tag", label: "Offers" },
    { disabled: true, id: "sponsors", icon: "shield", label: "Sponsors" },
    { disabled: true, id: "racing-team", icon: "users", label: "Racing Team" },
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
