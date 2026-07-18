import { FC, memo, useCallback, useMemo, useState } from "react"
import { FlatList, Pressable, RefreshControl, TextStyle, View, ViewStyle } from "react-native"
import { useFocusEffect, useRouter } from "expo-router"
import { useAuth } from "@clerk/clerk-expo"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { isAnnouncementRead } from "@/services/announcements/readState"
import { useMembershipNews } from "@/services/query"
import type { MembershipNewsItem } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type AnnouncementFilter = "all" | "unread"

interface AnnouncementRowProps {
  announcement: MembershipNewsItem
  isRead: boolean
  onPress: (id: string) => void
}

export const AnnouncementsScreen: FC = () => {
  const router = useRouter()
  const { userId } = useAuth()
  const { themed } = useAppTheme()
  const announcementsQuery = useMembershipNews()
  const announcements = announcementsQuery.data
  const [activeFilter, setActiveFilter] = useState<AnnouncementFilter>("all")
  const [readVersion, setReadVersion] = useState(0)

  useFocusEffect(
    useCallback(() => {
      setReadVersion((value) => value + 1)
    }, []),
  )

  const decoratedAnnouncements = useMemo(() => {
    const currentAnnouncements = announcements ?? []

    return currentAnnouncements.map((announcement) => ({
      announcement,
      isRead: userId && readVersion >= 0 ? isAnnouncementRead(userId, announcement.id) : false,
    }))
  }, [announcements, readVersion, userId])
  const unreadCount = decoratedAnnouncements.filter((item) => !item.isRead).length
  const visibleAnnouncements =
    activeFilter === "unread"
      ? decoratedAnnouncements.filter((item) => !item.isRead)
      : decoratedAnnouncements

  const openAnnouncement = useCallback(
    (id: string) => {
      router.push(`/news/${id}`)
    },
    [router],
  )

  const renderItem = useCallback(
    ({ item }: { item: (typeof decoratedAnnouncements)[number] }) => (
      <AnnouncementRow
        announcement={item.announcement}
        isRead={item.isRead}
        onPress={openAnnouncement}
      />
    ),
    [openAnnouncement],
  )

  return (
    <Screen
      preset="fixed"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
      systemBarStyle="light"
    >
      <FlatList
        data={visibleAnnouncements}
        keyExtractor={(item) => item.announcement.id}
        renderItem={renderItem}
        extraData={`${activeFilter}-${readVersion}`}
        refreshControl={
          <RefreshControl
            refreshing={announcementsQuery.isRefetching}
            onRefresh={refresh}
            tintColor="#E10600"
          />
        }
        ListHeaderComponent={
          <View style={themed($header)}>
            <Text preset="heading" text="Announcements" style={themed($title)} />
            <View style={themed($tabs)}>
              <FilterPill
                label="All"
                active={activeFilter === "all"}
                onPress={() => setActiveFilter("all")}
              />
              <FilterPill
                label="Unread"
                count={unreadCount}
                active={activeFilter === "unread"}
                onPress={() => setActiveFilter("unread")}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          announcementsQuery.isLoading ? (
            <AnnouncementsSkeleton />
          ) : (
            <EmptyAnnouncements isFiltered={activeFilter === "unread"} />
          )
        }
        ItemSeparatorComponent={Separator}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  )

  function refresh() {
    void announcementsQuery.refetch()
  }
}

const AnnouncementRow = memo(function AnnouncementRow({
  announcement,
  isRead,
  onPress,
}: AnnouncementRowProps) {
  const { themed } = useAppTheme()
  const preview = getPreview(announcement.content)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open announcement ${announcement.title}`}
      onPress={() => onPress(announcement.id)}
      style={({ pressed }) => [themed($row), pressed && themed($rowPressed)]}
    >
      <View style={themed($dotColumn)}>{!isRead ? <View style={themed($unreadDot)} /> : null}</View>
      <View style={themed($rowBody)}>
        <Text
          size="sm"
          weight={isRead ? "semiBold" : "bold"}
          text={announcement.title}
          numberOfLines={2}
          style={themed($rowTitle)}
        />
        {preview ? (
          <Text size="xs" text={preview} numberOfLines={2} style={themed($preview)} />
        ) : null}
      </View>
      <Text size="xxs" text={formatShortDate(announcement.date)} style={themed($date)} />
    </Pressable>
  )
})

function FilterPill({
  active,
  count,
  label,
  onPress,
}: {
  active: boolean
  count?: number
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
      {typeof count === "number" && count > 0 ? (
        <View style={themed(active ? $countBadgeActive : $countBadge)}>
          <Text size="xxs" weight="bold" text={String(count)} style={themed($countText)} />
        </View>
      ) : null}
    </Pressable>
  )
}

function AnnouncementsSkeleton() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($skeletonWrap)}>
      {[0, 1, 2, 3].map((item) => (
        <View key={item} style={themed($skeletonRow)}>
          <View style={themed($skeletonDot)} />
          <View style={themed($skeletonBody)}>
            <View style={themed($skeletonTitle)} />
            <View style={themed($skeletonLine)} />
            <View style={themed($skeletonLineShort)} />
          </View>
          <View style={themed($skeletonDate)} />
        </View>
      ))}
    </View>
  )
}

function EmptyAnnouncements({ isFiltered }: { isFiltered: boolean }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($empty)}>
      <UIIcon name="bell-off" size={42} color="#525252" strokeWidth={1.8} />
      <Text
        preset="subheading"
        text={isFiltered ? "No unread announcements" : "No announcements available"}
        style={themed($emptyText)}
      />
    </View>
  )
}

function Separator() {
  const { themed } = useAppTheme()
  return <View style={themed($separator)} />
}

function getPreview(value: string) {
  return stripMarkup(value).replace(/\s+/g, " ").trim()
}

function stripMarkup(value: string) {
  return value.replace(/<[^>]+>/g, "").trim()
}

function formatShortDate(value: string) {
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
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $tabs: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $pill: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  backgroundColor: "#151515",
  borderRadius: radius.round,
  flexDirection: "row",
  gap: spacing.xxs,
  minHeight: 36,
  paddingHorizontal: spacing.lg,
})

const $pillActive: ThemedStyle<ViewStyle> = (theme) => ({
  ...$pill(theme),
  backgroundColor: "#E10600",
})

const $pillText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $countBadge: ThemedStyle<ViewStyle> = ({ radius }) => ({
  alignItems: "center",
  backgroundColor: "#E10600",
  borderRadius: radius.round,
  height: 16,
  justifyContent: "center",
  minWidth: 16,
})

const $countBadgeActive: ThemedStyle<ViewStyle> = (theme) => ({
  ...$countBadge(theme),
  backgroundColor: "rgba(0, 0, 0, 0.24)",
})

const $countText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff", fontSize: 9 })

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  minHeight: 82,
  paddingVertical: spacing.md,
})

const $rowPressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.72 })

const $dotColumn: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingTop: spacing.xxs,
  width: 10,
})

const $unreadDot: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#E10600",
  borderRadius: radius.round,
  height: 7,
  width: 7,
})

const $rowBody: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xxxs,
})

const $rowTitle: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $preview: ThemedStyle<TextStyle> = () => ({ color: "#9ca3af", lineHeight: 18 })

const $date: ThemedStyle<TextStyle> = () => ({
  color: "#737373",
  paddingTop: 2,
  textAlign: "right",
})

const $separator: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  height: 1,
  marginLeft: 22,
})

const $empty: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.md,
  justifyContent: "center",
  paddingTop: spacing.xxxl,
})

const $emptyText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $skeletonWrap: ThemedStyle<ViewStyle> = () => ({})

const $skeletonRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  paddingVertical: spacing.md,
})

const $skeletonDot: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#202020",
  borderRadius: radius.round,
  height: 7,
  marginTop: 6,
  width: 7,
})

const $skeletonBody: ThemedStyle<ViewStyle> = ({ spacing }) => ({ flex: 1, gap: spacing.xs })

const $skeletonTitle: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#202020",
  borderRadius: radius.sm,
  height: 14,
  width: "68%",
})

const $skeletonLine: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#161616",
  borderRadius: radius.sm,
  height: 10,
  width: "88%",
})

const $skeletonLineShort: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#161616",
  borderRadius: radius.sm,
  height: 10,
  width: "54%",
})

const $skeletonDate: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#161616",
  borderRadius: radius.sm,
  height: 10,
  marginTop: 2,
  width: 56,
})
