import { FC, useCallback, useState } from "react"
import { RefreshControl, View, ViewStyle } from "react-native"
import { useAuth } from "@clerk/clerk-expo"
import { useFocusEffect } from "@react-navigation/native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIBadge, UICard } from "@/components/ui"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { isAnnouncementRead } from "@/services/announcements/readState"
import { useMembershipNews } from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type AnnouncementsScreenProps = AppStackScreenProps<"Announcements">

export const AnnouncementsScreen: FC<AnnouncementsScreenProps> = ({ navigation }) => {
  const { userId } = useAuth()
  const { themed } = useAppTheme()
  const announcementsQuery = useMembershipNews()
  const announcements = announcementsQuery.data ?? []
  const [readVersion, setReadVersion] = useState(0)

  useFocusEffect(
    useCallback(() => {
      setReadVersion((value) => value + 1)
    }, []),
  )

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
      ScrollViewProps={{
        refreshControl: (
          <RefreshControl refreshing={announcementsQuery.isRefetching} onRefresh={refresh} />
        ),
      }}
    >
      <View style={themed($header)}>
        <Text preset="heading" text="Announcements" />
        <Text size="sm" text="Club updates, member notices, and official BUL Racing news." />
      </View>

      {announcementsQuery.isLoading ? (
        <UICard heading="Loading Announcements" content="Getting the latest member updates..." />
      ) : null}

      {announcementsQuery.error ? (
        <UICard heading="Unable to Refresh" content={getErrorMessage(announcementsQuery.error)} />
      ) : null}

      {!announcementsQuery.isLoading && announcements.length === 0 ? (
        <UICard
          heading="No Announcements"
          content="There are no announcements available right now."
        />
      ) : null}

      {announcements.map((announcement) => {
        const isRead = userId ? isAnnouncementRead(userId, announcement.id) : false

        return (
          <UICard
            key={`${announcement.id}-${readVersion}`}
            heading={announcement.title}
            content={stripMarkup(announcement.content)}
            footer={formatDate(announcement.date)}
            RightComponent={isRead ? undefined : <UIBadge tone="brand" text="Unread" />}
            onPress={() => navigation.navigate("AnnouncementDetail", { id: announcement.id })}
          />
        )
      })}

      <Button
        preset="reversed"
        text="Back to Dashboard"
        onPress={() => navigation.navigate("MemberTabs", { screen: "Home" })}
      />
    </Screen>
  )

  function refresh() {
    void announcementsQuery.refetch()
  }
}

function stripMarkup(value: string) {
  return value.replace(/<[^>]+>/g, "").trim()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Cached announcements may still be available. Pull to refresh and try again."
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  padding: spacing.lg,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })
