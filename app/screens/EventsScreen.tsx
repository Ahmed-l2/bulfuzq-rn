import { FC } from "react"
import { TextStyle, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UICard } from "@/components/ui"
import type { MemberTabScreenProps } from "@/navigators/navigationTypes"
import { useMemberEvents } from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type EventsScreenProps = MemberTabScreenProps<"Events">

export const EventsScreen: FC<EventsScreenProps> = () => {
  const { themed } = useAppTheme()
  const eventsQuery = useMemberEvents()
  const events = eventsQuery.data ?? []

  return (
    <Screen
      preset="scroll"
      backgroundColor="#000000"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="Events" style={themed($title)} />
      {events.length === 0 ? (
        <UICard
          heading="Events Coming Soon"
          content="Club event screens will be completed in Phase 9."
        />
      ) : null}
      {events.slice(0, 5).map((event) => (
        <UICard
          key={event.id}
          heading={event.title}
          content={event.location}
          footer={formatDate(event.event_date)}
        />
      ))}
    </Screen>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  gap: spacing.lg,
  padding: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
