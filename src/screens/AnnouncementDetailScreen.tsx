import { FC, useEffect } from "react"
import { Image, ImageStyle, Linking, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useAuth } from "@clerk/clerk-expo"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { markAnnouncementRead } from "@/services/announcements/readState"
import { useMembershipNewsItem } from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const AnnouncementDetailScreen: FC = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { userId } = useAuth()
  const { themed } = useAppTheme()
  const announcementQuery = useMembershipNewsItem(id)
  const announcement = announcementQuery.data

  useEffect(() => {
    if (!userId || !announcement) return
    markAnnouncementRead(userId, announcement.id)
  }, [announcement, userId])

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

      {announcementQuery.isLoading ? <AnnouncementDetailSkeleton /> : null}

      {announcementQuery.error ? (
        <MessageBlock title="Unable to Open" message={getErrorMessage(announcementQuery.error)} />
      ) : null}

      {!announcementQuery.isLoading && !announcement ? (
        <MessageBlock
          title="Announcement Not Found"
          message="This announcement is unavailable or expired."
        />
      ) : null}

      {announcement ? (
        <View style={themed($article)}>
          <View style={themed($articleHeader)}>
            <Text preset="heading" text={announcement.title} style={themed($title)} />
            <Text size="sm" text={formatDate(announcement.date)} style={themed($date)} />
          </View>

          {announcement.image_url ? (
            <Image
              source={{ uri: announcement.image_url }}
              style={themed($image)}
              resizeMode="cover"
            />
          ) : null}

          <View style={themed($body)}>
            {getParagraphs(announcement.content).map((paragraph, index) => (
              <Text
                key={`${index}-${paragraph}`}
                size="md"
                text={paragraph}
                style={themed($paragraph)}
              />
            ))}
          </View>

          <View style={themed($metadata)}>
            <MetaRow
              label="Published"
              value={formatDate(announcement.published_at ?? announcement.date)}
            />
            {announcement.type ? (
              <MetaRow label="Category" value={formatLabel(announcement.type)} />
            ) : null}
          </View>

          {announcement.cta_url && announcement.cta_label ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => void Linking.openURL(announcement.cta_url ?? "")}
              style={({ pressed }) => [themed($cta), pressed && themed($pressed)]}
            >
              <Text
                size="sm"
                weight="semiBold"
                text={announcement.cta_label}
                style={themed($ctaText)}
              />
              <UIIcon name="external-link" size={16} color="#ffffff" strokeWidth={1.8} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Screen>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($metaRow)}>
      <Text size="xxs" text={label} style={themed($metaLabel)} />
      <Text size="xs" weight="semiBold" text={value} style={themed($metaValue)} />
    </View>
  )
}

function AnnouncementDetailSkeleton() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($skeleton)}>
      <View style={themed($skeletonTitle)} />
      <View style={themed($skeletonDate)} />
      <View style={themed($skeletonHero)} />
      <View style={themed($skeletonLine)} />
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(value))
}

function formatLabel(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Cached announcement details may still be available."
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  gap: spacing.xl,
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

const $articleHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs })

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $date: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })

const $image: ThemedStyle<ImageStyle> = ({ radius }) => ({
  backgroundColor: "#111111",
  borderRadius: radius.lg,
  height: 210,
  width: "100%",
})

const $body: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.lg })

const $paragraph: ThemedStyle<TextStyle> = () => ({ color: "#f5f5f5", lineHeight: 25 })

const $metadata: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  borderRadius: radius.lg,
  gap: spacing.md,
  padding: spacing.md,
})

const $metaRow: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
})

const $metaLabel: ThemedStyle<TextStyle> = () => ({ color: "#737373", textTransform: "uppercase" })

const $metaValue: ThemedStyle<TextStyle> = () => ({ color: "#ffffff", textAlign: "right" })

const $cta: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  alignSelf: "flex-start",
  backgroundColor: "#E10600",
  borderRadius: radius.round,
  flexDirection: "row",
  gap: spacing.xs,
  minHeight: 44,
  paddingHorizontal: spacing.lg,
})

const $pressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.72 })

const $ctaText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $messageBlock: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#101010",
  borderRadius: radius.lg,
  gap: spacing.xs,
  padding: spacing.lg,
})

const $muted: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })

const $skeleton: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.md })

const $skeletonTitle: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#202020",
  borderRadius: radius.sm,
  height: 28,
  width: "82%",
})

const $skeletonDate: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#161616",
  borderRadius: radius.sm,
  height: 12,
  width: 110,
})

const $skeletonHero: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#111111",
  borderRadius: radius.lg,
  height: 210,
  width: "100%",
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
  width: "64%",
})
