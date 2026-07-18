import { FC } from "react"
import { TextStyle, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { MemberStatusCard } from "@/components/dashboard"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { MemberTabScreenProps } from "@/navigators/navigationTypes"
import { useMembershipSummary } from "@/services/query"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type MembershipScreenProps = MemberTabScreenProps<"Membership">

export const MembershipScreen: FC<MembershipScreenProps> = ({ navigation }) => {
  const { themed } = useAppTheme()
  const membershipQuery = useMembershipSummary()
  const membership = membershipQuery.data ?? null

  return (
    <Screen
      preset="scroll"
      backgroundColor="#000000"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="Membership" style={themed($title)} />
      <MemberStatusCard
        active={Boolean(membership?.membership.active)}
        memberId={membership?.member?.id ?? null}
        membershipNumber={null}
        validUntil={formatDate(membership?.membership.expiresAt)}
      />
      <Button
        text="Open Membership Card"
        onPress={() => navigation.getParent()?.navigate("MembershipCard")}
      />
    </Screen>
  )
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

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
