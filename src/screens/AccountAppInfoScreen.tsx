import { FC } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { useLegalPages } from "@/services/query"
import type { LegalPageItem } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const AccountAppInfoScreen: FC = () => {
  const router = useRouter()
  const { themed } = useAppTheme()
  const legalPagesQuery = useLegalPages()
  const legalPages = legalPagesQuery.data ?? []

  return (
    <Screen
      preset="scroll"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={themed($backButton)}
      >
        <UIIcon name="arrow-left" size={20} color="#ffffff" />
        <Text size="sm" weight="medium" text="Back" style={themed($title)} />
      </Pressable>

      <View style={themed($header)}>
        <Text preset="heading" text="App & Legal" style={themed($title)} />
        <Text
          text="Review published legal pages and app information from BUL Racing."
          style={themed($body)}
        />
      </View>

      <InfoCard
        title="BUL Racing Mobile"
        body="Member access, events, offers, announcements, racing team content, and support in one app."
      />
      <InfoCard title="Version" body="MVP build" />

      <View style={themed($section)}>
        <Text preset="subheading" text="Legal Pages" style={themed($title)} />
        {legalPagesQuery.isLoading ? (
          <Text text="Loading legal pages..." style={themed($body)} />
        ) : null}
        {legalPages.length === 0 && !legalPagesQuery.isLoading ? (
          <Text text="No published legal pages are available right now." style={themed($body)} />
        ) : null}
        {legalPages.map((page) => (
          <LegalPageRow
            key={page.id}
            page={page}
            onPress={() => router.push(`/account/legal/${page.slug}`)}
          />
        ))}
      </View>
    </Screen>
  )
}

function LegalPageRow({ onPress, page }: { onPress: () => void; page: LegalPageItem }) {
  const { themed } = useAppTheme()

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [themed($row), pressed && themed($pressed)]}
    >
      <View style={themed($rowIcon)}>
        <UIIcon name="lock-keyhole" size={18} color="#E10600" strokeWidth={1.9} />
      </View>
      <View style={themed($rowCopy)}>
        <Text size="sm" weight="semiBold" text={page.title_en} style={themed($title)} />
        <Text
          size="xs"
          text={page.meta_description_en ?? formatSlug(page.slug)}
          style={themed($body)}
          numberOfLines={2}
        />
      </View>
      <UIIcon name="chevron-right" size={18} color="#737373" strokeWidth={1.8} />
    </Pressable>
  )
}

function InfoCard({ body, title }: { body: string; title: string }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($card)}>
      <Text preset="subheading" text={title} style={themed($title)} />
      <Text text={body} style={themed($body)} />
    </View>
  )
}

function formatSlug(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  gap: spacing.lg,
  padding: spacing.lg,
})
const $backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  gap: spacing.xs,
  paddingTop: spacing.lg,
})
const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })
const $section: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.xl,
  gap: spacing.md,
  padding: spacing.lg,
})
const $card: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.xl,
  gap: spacing.sm,
  padding: spacing.lg,
})
const $row: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  backgroundColor: "#0b0d0e",
  borderRadius: radius.lg,
  flexDirection: "row",
  gap: spacing.md,
  padding: spacing.md,
})
const $pressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.78 })
const $rowIcon: ThemedStyle<ViewStyle> = ({ radius }) => ({
  alignItems: "center",
  backgroundColor: "rgba(225, 6, 0, 0.12)",
  borderRadius: radius.round,
  height: 36,
  justifyContent: "center",
  width: 36,
})
const $rowCopy: ThemedStyle<ViewStyle> = () => ({ flex: 1 })
const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $body: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3", lineHeight: 22 })
