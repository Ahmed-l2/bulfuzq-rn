import { FC, useEffect } from "react"
import { Image, ImageStyle, View, ViewStyle } from "react-native"
import { useAuth } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIBadge, UICard } from "@/components/ui"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { markAnnouncementRead } from "@/services/announcements/readState"
import { useMembershipNewsItem } from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type AnnouncementDetailScreenProps = AppStackScreenProps<"AnnouncementDetail">

export const AnnouncementDetailScreen: FC<AnnouncementDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = useAuth()
  const { themed } = useAppTheme()
  const announcementQuery = useMembershipNewsItem(route.params.id)
  const announcement = announcementQuery.data

  useEffect(() => {
    if (!userId || !announcement) return
    markAnnouncementRead(userId, announcement.id)
  }, [announcement, userId])

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Button preset="reversed" text="Back" onPress={() => navigation.navigate("Announcements")} />

      {announcementQuery.isLoading ? (
        <UICard heading="Loading Announcement" content="Opening this member update..." />
      ) : null}

      {announcementQuery.error ? (
        <UICard heading="Unable to Open" content={getErrorMessage(announcementQuery.error)} />
      ) : null}

      {!announcementQuery.isLoading && !announcement ? (
        <UICard
          heading="Announcement Not Found"
          content="This announcement is unavailable or expired."
        />
      ) : null}

      {announcement ? (
        <View style={themed($article)}>
          <View style={themed($articleHeader)}>
            <UIBadge tone="brand" text={announcement.type} />
            <Text preset="heading" text={announcement.title} />
            <Text size="sm" text={formatDate(announcement.date)} />
          </View>

          {announcement.image_url ? (
            <Image
              source={{ uri: announcement.image_url }}
              style={themed($image)}
              resizeMode="cover"
            />
          ) : null}

          <Text size="md" text={stripMarkup(announcement.content)} />
        </View>
      ) : null}
    </Screen>
  )
}

function stripMarkup(value: string) {
  return value.replace(/<[^>]+>/g, "").trim()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Cached announcement details may still be available."
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  padding: spacing.lg,
})

const $article: ThemedStyle<ViewStyle> = ({ colors, radius, spacing }) => ({
  gap: spacing.lg,
  padding: spacing.lg,
  borderRadius: radius.xl,
  backgroundColor: colors.palette.neutral100,
})

const $articleHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })

const $image: ThemedStyle<ImageStyle> = ({ radius }) => ({
  width: "100%",
  height: 220,
  borderRadius: radius.lg,
})
