import { FC, useMemo } from "react"
import { Image, ImageStyle, Linking, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { useSponsors } from "@/services/query"
import type { SponsorItem } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const SponsorDetailScreen: FC = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { themed } = useAppTheme()
  const sponsorsQuery = useSponsors()
  const sponsor = useMemo(
    () => sponsorsQuery.data?.find((candidate) => candidate.id === id) ?? null,
    [id, sponsorsQuery.data],
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

      {sponsorsQuery.isLoading ? <SponsorDetailSkeleton /> : null}

      {sponsorsQuery.error ? (
        <MessageBlock title="Unable to Open" message={getErrorMessage(sponsorsQuery.error)} />
      ) : null}

      {!sponsorsQuery.isLoading && !sponsor ? (
        <MessageBlock title="Sponsor Not Found" message="This sponsor is unavailable." />
      ) : null}

      {sponsor ? <SponsorArticle sponsor={sponsor} /> : null}
    </Screen>
  )
}

function SponsorArticle({ sponsor }: { sponsor: SponsorItem }) {
  const { themed } = useAppTheme()
  const logoUri = getLogoUri(sponsor.icon)

  return (
    <View style={themed($article)}>
      {logoUri ? (
        <View style={themed($hero)}>
          <Image source={{ uri: logoUri }} style={themed($heroLogo)} resizeMode="contain" />
        </View>
      ) : null}

      <View style={themed($titleSection)}>
        <Text preset="heading" text={sponsor.name} style={themed($title)} />
        {sponsor.url ? <Text size="md" text="Official Partner" style={themed($subtitle)} /> : null}
      </View>

      <View style={themed($metadata)}>
        <MetaRow label="Partner" value={sponsor.name} />
        {sponsor.url ? <MetaRow label="Website" value={formatUrl(sponsor.url)} /> : null}
      </View>

      {sponsor.url ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL(sponsor.url ?? "")}
          style={({ pressed }) => [themed($cta), pressed && themed($pressed)]}
        >
          <Text size="sm" weight="semiBold" text="Visit Website" style={themed($ctaText)} />
          <UIIcon name="external-link" size={16} color="#ffffff" strokeWidth={1.8} />
        </Pressable>
      ) : null}
    </View>
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

function SponsorDetailSkeleton() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($skeleton)}>
      <View style={themed($skeletonHero)} />
      <View style={themed($skeletonTitle)} />
      <View style={themed($skeletonLine)} />
      <View style={themed($skeletonMeta)} />
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

function getLogoUri(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  if (value.startsWith("/")) return value
  if (/\.(svg|png|jpe?g|webp)(\?.*)?$/i.test(value)) return value
  return null
}

function formatUrl(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Cached sponsor details may still be available."
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

const $hero: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  backgroundColor: "#111516",
  borderRadius: radius.xl,
  justifyContent: "center",
  minHeight: 170,
  padding: spacing.xl,
})

const $heroLogo: ThemedStyle<ImageStyle> = () => ({ height: 92, width: "84%" })
const $titleSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })
const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $subtitle: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })

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
const $metaValue: ThemedStyle<TextStyle> = () => ({ color: "#ffffff", flex: 1, textAlign: "right" })

const $cta: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  alignSelf: "stretch",
  backgroundColor: "#E10600",
  borderRadius: radius.lg,
  flexDirection: "row",
  gap: spacing.xs,
  justifyContent: "center",
  minHeight: 52,
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

const $skeletonHero: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.xl,
  height: 170,
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
  width: "42%",
})

const $skeletonMeta: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#101010",
  borderRadius: radius.lg,
  height: 86,
  width: "100%",
})
