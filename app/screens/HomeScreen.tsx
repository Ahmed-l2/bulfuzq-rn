import { FC } from "react"
import { ViewStyle } from "react-native"
import { useClerk, useUser } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type HomeScreenProps = AppStackScreenProps<"Home">

export const HomeScreen: FC<HomeScreenProps> = () => {
  const { signOut } = useClerk()
  const { user } = useUser()
  const { themed } = useAppTheme()

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
      <Text
        size="md"
        text="Membership features will load from the website backend API in the next phases."
      />
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
