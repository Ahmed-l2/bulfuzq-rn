import { FC, useEffect, useEffectEvent, useState } from "react"
import { View, ViewStyle } from "react-native"
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { hasSupabaseConfig } from "@/config/env"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { getMembershipSummary, MembershipSummary } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type HomeScreenProps = AppStackScreenProps<"Home">

export const HomeScreen: FC<HomeScreenProps> = () => {
  const { signOut } = useClerk()
  const { getToken, isLoaded, userId } = useAuth()
  const { user } = useUser()
  const { themed } = useAppTheme()
  const [membership, setMembership] = useState<MembershipSummary | null>(null)
  const [membershipError, setMembershipError] = useState<string | null>(null)
  const [isLoadingMembership, setIsLoadingMembership] = useState(false)
  const loadMembership = useEffectEvent(async () => {
    if (!isLoaded || !hasSupabaseConfig || !userId) return

    try {
      setIsLoadingMembership(true)
      setMembershipError(null)
      setMembership(null)

      const summary = await getMembershipSummary(() => getToken(), userId)

      setMembership(summary)
    } catch (error) {
      setMembershipError(error instanceof Error ? error.message : "Unable to load membership.")
    } finally {
      setIsLoadingMembership(false)
    }
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadMembership()
    }, 0)

    return () => clearTimeout(timeout)
  }, [isLoaded, userId])

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="Member Portal" />
      <Text
        size="md"
        text={`Signed in as ${user?.primaryEmailAddress?.emailAddress ?? "BUL Racing member"}.`}
      />
      <View style={themed($statusCard)}>
        <Text preset="subheading" text="Membership" />
        {isLoadingMembership ? <Text size="sm" text="Loading membership..." /> : null}
        {!hasSupabaseConfig ? (
          <Text size="sm" text="Supabase is not configured for this build." />
        ) : null}
        {membershipError ? <Text size="sm" text={membershipError} /> : null}
        {membership ? (
          <>
            <Text size="md" text={membership.membership.badge} />
            <Text
              size="sm"
              text={
                membership.membership.active
                  ? `Active${membership.membership.daysRemaining !== null ? ` for ${membership.membership.daysRemaining} more days` : ""}`
                  : "No active membership found"
              }
            />
          </>
        ) : null}
      </View>
      <Button text="Sign Out" onPress={() => signOut()} />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})

const $statusCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  gap: spacing.sm,
  padding: spacing.md,
  borderRadius: spacing.sm,
  backgroundColor: colors.palette.neutral100,
})
