import { FC, useMemo, useState } from "react"
import { Image, ImageStyle, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { useMemberEvents } from "@/services/query"
import type { MemberEventItem } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const EventDetailScreen: FC = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { themed } = useAppTheme()
  const eventsQuery = useMemberEvents()
  const [referenceTime] = useState(() => Date.now())
  const event = useMemo(
    () => eventsQuery.data?.find((candidate) => candidate.id === id) ?? null,
    [eventsQuery.data, id],
  )

  return (
    <Screen
      preset="scroll"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
      systemBarStyle="light"
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={themed($backButton)}
      >
        <UIIcon name="arrow-left" size={22} color="#ffffff" strokeWidth={1.8} />
      </Pressable>

      {eventsQuery.isLoading ? <EventDetailSkeleton /> : null}

      {eventsQuery.error ? (
        <MessageBlock title="Unable to Open" message={getErrorMessage(eventsQuery.error)} />
      ) : null}

      {!eventsQuery.isLoading && !event ? (
        <MessageBlock title="Event Not Found" message="This event is unavailable or expired." />
      ) : null}

      {event ? <EventArticle event={event} referenceTime={referenceTime} /> : null}
    </Screen>
  )
}

function EventArticle({ event, referenceTime }: { event: MemberEventItem; referenceTime: number }) {
  const { themed } = useAppTheme()
  const status = getEventStatus(event.event_date, referenceTime)

  return (
    <View style={themed($article)}>
      {event.image_url ? (
        <Image source={{ uri: event.image_url }} style={themed($hero)} resizeMode="cover" />
      ) : null}

      <View style={themed($titleSection)}>
        <View style={themed($titleRow)}>
          <Text preset="heading" text={event.title} style={themed($title)} />
          <StatusBadge status={status} />
        </View>
        {event.description ? (
          <Text size="sm" text={getPreview(event.description)} style={themed($summary)} />
        ) : null}
      </View>

      <View style={themed($metadata)}>
        <MetaRow icon="calendar" label="Date" value={formatLongDate(event.event_date)} />
        {event.location ? <MetaRow icon="map-pin" label="Location" value={event.location} /> : null}
      </View>

      {event.description ? (
        <View style={themed($description)}>
          {getParagraphs(event.description).map((paragraph, index) => (
            <Text
              key={`${index}-${paragraph}`}
              size="md"
              text={paragraph}
              style={themed($paragraph)}
            />
          ))}
        </View>
      ) : null}
    </View>
  )
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: "calendar" | "map-pin"
  label: string
  value: string
}) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($metaRow)}>
      <View style={themed($metaIcon)}>
        <UIIcon name={icon} size={17} color="#a3a3a3" strokeWidth={1.8} />
      </View>
      <Text size="xxs" text={label} style={themed($metaLabel)} />
      <Text size="xs" weight="semiBold" text={value} style={themed($metaValue)} />
    </View>
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

function EventDetailSkeleton() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($skeleton)}>
      <View style={themed($skeletonHero)} />
      <View style={themed($skeletonTitle)} />
      <View style={themed($skeletonLine)} />
      <View style={themed($skeletonMeta)} />
      <View style={themed($skeletonLine)} />
      <View style={themed($skeletonLineShort)} />
    </View>
  )
}

function MessageBlock({ message, title }: { message: string; title: string }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($messageBlock)}>
      <Text preset="subheading" text={title} style={themed($title)} />
      <Text size="sm" text={message} style={themed($muted)} />
    </View>
  )
}

type EventStatus = "upcoming" | "past"

function getEventStatus(value: string, referenceTime: number): EventStatus {
  return new Date(value).getTime() < referenceTime ? "past" : "upcoming"
}

function getPreview(value: string) {
  return stripMarkup(value).replace(/\s+/g, " ").trim()
}

function getParagraphs(value: string) {
  return stripMarkup(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}

function stripMarkup(value: string) {
  return value
    .replace(/<\/?p[^>]*>/g, "\n\n")
    .replace(/<br\s*\/?\s*>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .trim()
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Cached event details may still be available."
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  gap: spacing.lg,
  padding: spacing.lg,
})

const $backButton: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  alignSelf: "flex-start",
  borderRadius: radius.round,
  height: 42,
  justifyContent: "center",
  marginLeft: -spacing.sm,
  width: 42,
})

const $article: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xl })

const $hero: ThemedStyle<ImageStyle> = ({ radius }) => ({
  backgroundColor: "#111111",
  borderRadius: radius.lg,
  height: 220,
  width: "100%",
})

const $titleSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })

const $titleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $summary: ThemedStyle<TextStyle> = () => ({ color: "#d4d4d4", lineHeight: 21 })

const $metadata: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  borderRadius: radius.lg,
  gap: spacing.md,
  padding: spacing.md,
})

const $metaRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  gap: spacing.sm,
})

const $metaIcon: ThemedStyle<ViewStyle> = () => ({ width: 20 })

const $metaLabel: ThemedStyle<TextStyle> = () => ({ color: "#737373", width: 64 })

const $metaValue: ThemedStyle<TextStyle> = () => ({ color: "#ffffff", flex: 1 })

const $description: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.lg })

const $paragraph: ThemedStyle<TextStyle> = () => ({ color: "#f5f5f5", lineHeight: 25 })

const $statusBase: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignSelf: "flex-start",
  borderRadius: radius.round,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
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

const $messageBlock: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#101010",
  borderRadius: radius.lg,
  gap: spacing.xs,
  padding: spacing.lg,
})

const $muted: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })

const $skeleton: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.md })

const $skeletonHero: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#111111",
  borderRadius: radius.lg,
  height: 220,
  width: "100%",
})

const $skeletonTitle: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#202020",
  borderRadius: radius.sm,
  height: 26,
  width: "62%",
})

const $skeletonLine: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#161616",
  borderRadius: radius.sm,
  height: 13,
  width: "100%",
})

const $skeletonLineShort: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#161616",
  borderRadius: radius.sm,
  height: 13,
  width: "66%",
})

const $skeletonMeta: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#101010",
  borderRadius: radius.lg,
  height: 88,
  width: "100%",
})
