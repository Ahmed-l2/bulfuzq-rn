import { FC, memo, useCallback, useMemo } from "react"
import {
  FlatList,
  Image,
  ImageStyle,
  Pressable,
  RefreshControl,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { useSponsors } from "@/services/query"
import type { SponsorItem } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface SponsorCardProps {
  sponsor: SponsorItem
  onPress: (id: string) => void
}

export const SponsorsScreen: FC = () => {
  const router = useRouter()
  const { themed } = useAppTheme()
  const sponsorsQuery = useSponsors()
  const sponsors = sponsorsQuery.data

  const visibleSponsors = useMemo(() => sponsors ?? [], [sponsors])

  const openSponsor = useCallback(
    (id: string) => {
      router.push(`/sponsors/${id}`)
    },
    [router],
  )

  const renderItem = useCallback(
    ({ item }: { item: SponsorItem }) => <SponsorCard sponsor={item} onPress={openSponsor} />,
    [openSponsor],
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
        data={visibleSponsors}
        keyExtractor={(sponsor) => sponsor.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={sponsorsQuery.isRefetching}
            onRefresh={refresh}
            tintColor="#E10600"
          />
        }
        ListHeaderComponent={
          <View style={themed($header)}>
            <Text preset="heading" text="Sponsors" style={themed($title)} />
          </View>
        }
        ListEmptyComponent={sponsorsQuery.isLoading ? <SponsorsSkeleton /> : <EmptySponsors />}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  )

  function refresh() {
    void sponsorsQuery.refetch()
  }
}

const SponsorCard = memo(function SponsorCard({ onPress, sponsor }: SponsorCardProps) {
  const { themed } = useAppTheme()
  const logoUri = getLogoUri(sponsor.icon)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open sponsor ${sponsor.name}`}
      onPress={() => onPress(sponsor.id)}
      style={({ pressed }) => [themed($sponsorCard), pressed && themed($pressed)]}
    >
      {logoUri ? (
        <Image source={{ uri: logoUri }} style={themed($logo)} resizeMode="contain" />
      ) : (
        <View style={themed($logoPlaceholder)}>
          <Text
            size="sm"
            weight="bold"
            text={getInitials(sponsor.name)}
            style={themed($initials)}
          />
        </View>
      )}

      <View style={themed($sponsorBody)}>
        <Text size="sm" weight="bold" text={sponsor.name} numberOfLines={2} style={themed($name)} />
        {sponsor.url ? <Text size="xs" text="Official Partner" style={themed($tagline)} /> : null}
      </View>

      <UIIcon name="chevron-right" size={18} color="#525252" strokeWidth={1.8} />
    </Pressable>
  )
})

function SponsorsSkeleton() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($skeletonWrap)}>
      {[0, 1, 2, 3, 4].map((item) => (
        <View key={item} style={themed($skeletonCard)}>
          <View style={themed($skeletonLogo)} />
          <View style={themed($skeletonBody)}>
            <View style={themed($skeletonTitle)} />
            <View style={themed($skeletonLine)} />
          </View>
        </View>
      ))}
    </View>
  )
}

function EmptySponsors() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($empty)}>
      <UIIcon name="building-2" size={46} color="#525252" strokeWidth={1.8} />
      <Text preset="subheading" text="No sponsors available" style={themed($emptyText)} />
    </View>
  )
}

function getLogoUri(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  if (value.startsWith("/")) return value
  if (/\.(svg|png|jpe?g|webp)(\?.*)?$/i.test(value)) return value
  return null
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

const $container: ThemedStyle<ViewStyle> = () => ({ backgroundColor: "#000000", flex: 1 })

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.lg,
  paddingBottom: spacing.sm,
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $sponsorCard: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  backgroundColor: "#111516",
  borderRadius: radius.lg,
  flexDirection: "row",
  gap: spacing.md,
  minHeight: 88,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $pressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.75 })

const $logo: ThemedStyle<ImageStyle> = ({ radius }) => ({
  backgroundColor: "#0b0b0b",
  borderRadius: radius.md,
  height: 52,
  width: 94,
})

const $logoPlaceholder: ThemedStyle<ViewStyle> = ({ radius }) => ({
  alignItems: "center",
  backgroundColor: "#181818",
  borderRadius: radius.md,
  height: 52,
  justifyContent: "center",
  width: 94,
})

const $initials: ThemedStyle<TextStyle> = () => ({ color: "#E10600", letterSpacing: 1 })
const $sponsorBody: ThemedStyle<ViewStyle> = ({ spacing }) => ({ flex: 1, gap: spacing.xxxs })
const $name: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $tagline: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })

const $empty: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.md,
  justifyContent: "center",
  paddingTop: spacing.xxxl,
})

const $emptyText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $skeletonWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.md })

const $skeletonCard: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.lg,
  flexDirection: "row",
  gap: spacing.md,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $skeletonLogo: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#202020",
  borderRadius: radius.md,
  height: 52,
  width: 94,
})

const $skeletonBody: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xs,
  justifyContent: "center",
})

const $skeletonTitle: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#242424",
  borderRadius: radius.sm,
  height: 14,
  width: "58%",
})

const $skeletonLine: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#1a1a1a",
  borderRadius: radius.sm,
  height: 11,
  width: "42%",
})
