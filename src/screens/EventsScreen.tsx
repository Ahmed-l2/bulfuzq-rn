import { FC, memo, useCallback, useMemo, useState } from "react"
import {
  FlatList,
  Image,
  ImageStyle,
  Pressable,
  RefreshControl,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { useMemberEvents } from "@/services/query"
import type { MemberEventItem } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type EventFilter = "upcoming" | "past"

interface EventRowProps {
  event: MemberEventItem
  onPress: (id: string) => void
  referenceTime: number
}

export const EventsScreen: FC = () => {
  const router = useRouter()
  const { themed } = useAppTheme()
  const eventsQuery = useMemberEvents()
  const events = eventsQuery.data
  const [activeFilter, setActiveFilter] = useState<EventFilter>("upcoming")
  const [referenceTime] = useState(() => Date.now())

  const visibleEvents = useMemo(() => {
    const currentEvents = events ?? []
    const filteredEvents = currentEvents.filter((event) => {
      const isPast = new Date(event.event_date).getTime() < referenceTime
      return activeFilter === "past" ? isPast : !isPast
    })

    return filteredEvents.sort((left, right) => {
      const leftTime = new Date(left.event_date).getTime()
      const rightTime = new Date(right.event_date).getTime()
      return activeFilter === "past" ? rightTime - leftTime : leftTime - rightTime
    })
  }, [activeFilter, events, referenceTime])

  const openEvent = useCallback(
    (id: string) => {
      router.push(`/events/${id}`)
    },
    [router],
  )

  const renderItem = useCallback(
    ({ item }: { item: MemberEventItem }) => (
      <EventRow event={item} onPress={openEvent} referenceTime={referenceTime} />
    ),
    [openEvent, referenceTime],
  )

  return (
    <Screen
      preset="fixed"
      backgroundColor="#000000"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($container)}
      systemBarStyle="light"
    >
      <FlatList
        data={visibleEvents}
        keyExtractor={(event) => event.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={eventsQuery.isRefetching}
            onRefresh={refresh}
            tintColor="#E10600"
          />
        }
        ListHeaderComponent={
          <View style={themed($header)}>
            <Text preset="heading" text="Events" style={themed($title)} />
            <View style={themed($tabs)}>
              <FilterPill
                label="Upcoming"
                active={activeFilter === "upcoming"}
                onPress={() => setActiveFilter("upcoming")}
              />
              <FilterPill
                label="Past"
                active={activeFilter === "past"}
                onPress={() => setActiveFilter("past")}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          eventsQuery.isLoading ? <EventsSkeleton /> : <EmptyEvents filter={activeFilter} />
        }
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  )

  function refresh() {
    void eventsQuery.refetch()
  }
}

const EventRow = memo(function EventRow({ event, onPress, referenceTime }: EventRowProps) {
  const { themed } = useAppTheme()
  const status = getEventStatus(event.event_date, referenceTime)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open event ${event.title}`}
      onPress={() => onPress(event.id)}
      style={({ pressed }) => [themed($eventCard), pressed && themed($pressed)]}
    >
      {event.image_url ? (
        <Image source={{ uri: event.image_url }} style={themed($eventImage)} resizeMode="cover" />
      ) : (
        <View style={themed($imagePlaceholder)}>
          <UIIcon name="calendar" size={28} color="#737373" strokeWidth={1.8} />
        </View>
      )}

      <View style={themed($eventBody)}>
        <View style={themed($rowTitleWrap)}>
          <Text
            size="sm"
            weight="bold"
            text={event.title}
            numberOfLines={2}
            style={themed($rowTitle)}
          />
          <StatusBadge status={status} />
        </View>
        <Text size="xs" text={formatDate(event.event_date)} style={themed($eventDate)} />
        {event.location ? (
          <Text size="xs" text={event.location} numberOfLines={1} style={themed($eventLocation)} />
        ) : null}
      </View>

      <UIIcon name="chevron-right" size={18} color="#525252" strokeWidth={1.8} />
    </Pressable>
  )
})

function FilterPill({
  active,
  label,
  onPress,
}: {
  active: boolean
  label: string
  onPress: () => void
}) {
  const { themed } = useAppTheme()

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={themed(active ? $pillActive : $pill)}
    >
      <Text size="xxs" weight="semiBold" text={label} style={themed($pillText)} />
    </Pressable>
  )
}

function StatusBadge({ status }: { status: EventStatus }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed(status === "upcoming" ? $statusUpcoming : $statusPast)}>
      <Text
        size="xxs"
        weight="bold"
        text={status === "upcoming" ? "Upcoming" : "Past"}
        style={themed(status === "upcoming" ? $statusTextUpcoming : $statusTextPast)}
      />
    </View>
  )
}

function EventsSkeleton() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($skeletonWrap)}>
      {[0, 1, 2, 3].map((item) => (
        <View key={item} style={themed($skeletonCard)}>
          <View style={themed($skeletonImage)} />
          <View style={themed($skeletonBody)}>
            <View style={themed($skeletonTitle)} />
            <View style={themed($skeletonLine)} />
            <View style={themed($skeletonLineShort)} />
          </View>
        </View>
      ))}
    </View>
  )
}

function EmptyEvents({ filter }: { filter: EventFilter }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($empty)}>
      <UIIcon name="calendar" size={46} color="#525252" strokeWidth={1.8} />
      <Text
        preset="subheading"
        text={filter === "upcoming" ? "No upcoming events" : "No past events"}
        style={themed($emptyText)}
      />
    </View>
  )
}

type EventStatus = "upcoming" | "past"

function getEventStatus(value: string, referenceTime: number): EventStatus {
  return new Date(value).getTime() < referenceTime ? "past" : "upcoming"
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

const $container: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#000000",
  flex: 1,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xs,
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $tabs: ThemedStyle<ViewStyle> = ({ spacing }) => ({ flexDirection: "row", gap: spacing.sm })

const $pill: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  backgroundColor: "#151515",
  borderRadius: radius.round,
  minHeight: 36,
  paddingHorizontal: spacing.lg,
  justifyContent: "center",
})

const $pillActive: ThemedStyle<ViewStyle> = (theme) => ({
  ...$pill(theme),
  backgroundColor: "#E10600",
})

const $pillText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $eventCard: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  backgroundColor: "#111516",
  borderRadius: radius.lg,
  flexDirection: "row",
  gap: spacing.md,
  minHeight: 104,
  padding: spacing.sm,
})

const $pressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.75 })

const $eventImage: ThemedStyle<ImageStyle> = ({ radius }) => ({
  backgroundColor: "#1f1f1f",
  borderRadius: radius.md,
  height: 78,
  width: 98,
})

const $imagePlaceholder: ThemedStyle<ViewStyle> = ({ radius }) => ({
  alignItems: "center",
  backgroundColor: "#181818",
  borderRadius: radius.md,
  height: 78,
  justifyContent: "center",
  width: 98,
})

const $eventBody: ThemedStyle<ViewStyle> = ({ spacing }) => ({ flex: 1, gap: spacing.xxxs })

const $rowTitleWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs })

const $rowTitle: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $eventDate: ThemedStyle<TextStyle> = () => ({ color: "#d4d4d4" })

const $eventLocation: ThemedStyle<TextStyle> = () => ({ color: "#8f8f8f" })

const $statusBase: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignSelf: "flex-start",
  borderRadius: radius.round,
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
})

const $statusUpcoming: ThemedStyle<ViewStyle> = (theme) => ({
  ...$statusBase(theme),
  backgroundColor: "rgba(225, 6, 0, 0.16)",
})

const $statusPast: ThemedStyle<ViewStyle> = (theme) => ({
  ...$statusBase(theme),
  backgroundColor: "rgba(255, 255, 255, 0.08)",
})

const $statusTextUpcoming: ThemedStyle<TextStyle> = () => ({ color: "#ff3b30" })

const $statusTextPast: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })

const $empty: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.md,
  justifyContent: "center",
  paddingTop: spacing.xxxl,
})

const $emptyText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $skeletonWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.md })

const $skeletonCard: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.lg,
  flexDirection: "row",
  gap: spacing.md,
  padding: spacing.sm,
})

const $skeletonImage: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#202020",
  borderRadius: radius.md,
  height: 78,
  width: 98,
})

const $skeletonBody: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xs,
  justifyContent: "center",
})

const $skeletonTitle: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#242424",
  borderRadius: radius.sm,
  height: 14,
  width: "72%",
})

const $skeletonLine: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#1a1a1a",
  borderRadius: radius.sm,
  height: 11,
  width: "52%",
})

const $skeletonLineShort: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#1a1a1a",
  borderRadius: radius.sm,
  height: 11,
  width: "82%",
})
