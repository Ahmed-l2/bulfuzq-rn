import { FC, memo, useCallback, useMemo, useState } from "react"
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
import { usePartnerOffers } from "@/services/query"
import type { PartnerOfferItem } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface OfferCardProps {
  offer: PartnerOfferItem
  onPress: (id: string) => void
  referenceTime: number
}

export const OffersScreen: FC = () => {
  const router = useRouter()
  const { themed } = useAppTheme()
  const offersQuery = usePartnerOffers()
  const offers = offersQuery.data
  const [referenceTime] = useState(() => Date.now())

  const visibleOffers = useMemo(() => {
    const currentOffers = offers ?? []
    return [...currentOffers].sort(
      (left, right) => new Date(left.valid_until).getTime() - new Date(right.valid_until).getTime(),
    )
  }, [offers])

  const openOffer = useCallback(
    (id: string) => {
      router.push(`/offers/${id}`)
    },
    [router],
  )

  const renderItem = useCallback(
    ({ item }: { item: PartnerOfferItem }) => (
      <OfferCard offer={item} onPress={openOffer} referenceTime={referenceTime} />
    ),
    [openOffer, referenceTime],
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
        data={visibleOffers}
        keyExtractor={(offer) => offer.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={offersQuery.isRefetching}
            onRefresh={refresh}
            tintColor="#E10600"
          />
        }
        ListHeaderComponent={
          <View style={themed($header)}>
            <Text preset="heading" text="Offers" style={themed($title)} />
            <View style={themed($tabs)}>
              <View style={themed($pillActive)}>
                <Text size="xxs" weight="semiBold" text="All" style={themed($pillText)} />
              </View>
              <View style={themed($pillDisabled)}>
                <Text
                  size="xxs"
                  weight="semiBold"
                  text="Nearby"
                  style={themed($pillDisabledText)}
                />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={offersQuery.isLoading ? <OffersSkeleton /> : <EmptyOffers />}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  )

  function refresh() {
    void offersQuery.refetch()
  }
}

const OfferCard = memo(function OfferCard({ offer, onPress, referenceTime }: OfferCardProps) {
  const { themed } = useAppTheme()
  const status = getOfferStatus(offer.valid_until, referenceTime)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open offer ${offer.offer_title}`}
      onPress={() => onPress(offer.id)}
      style={({ pressed }) => [themed($offerCard), pressed && themed($pressed)]}
    >
      {offer.logo_url ? (
        <Image source={{ uri: offer.logo_url }} style={themed($logo)} resizeMode="contain" />
      ) : (
        <View style={themed($logoPlaceholder)}>
          <UIIcon name="tag" size={28} color="#737373" strokeWidth={1.8} />
        </View>
      )}

      <View style={themed($offerBody)}>
        <View style={themed($titleRow)}>
          <Text
            size="sm"
            weight="bold"
            text={offer.offer_title}
            numberOfLines={2}
            style={themed($offerTitle)}
          />
          <StatusBadge status={status} />
        </View>
        <Text size="xs" text={offer.partner_name} numberOfLines={1} style={themed($partner)} />
        <Text
          size="xxs"
          text={`Valid until ${formatDate(offer.valid_until)}`}
          style={themed($validity)}
        />
      </View>

      <UIIcon name="chevron-right" size={18} color="#525252" strokeWidth={1.8} />
    </Pressable>
  )
})

function StatusBadge({ status }: { status: OfferStatus }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed(status === "expired" ? $statusExpired : $statusAvailable)}>
      <Text
        size="xxs"
        weight="bold"
        text={getStatusLabel(status)}
        style={themed(status === "expired" ? $statusExpiredText : $statusAvailableText)}
      />
    </View>
  )
}

function OffersSkeleton() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($skeletonWrap)}>
      {[0, 1, 2, 3].map((item) => (
        <View key={item} style={themed($skeletonCard)}>
          <View style={themed($skeletonLogo)} />
          <View style={themed($skeletonBody)}>
            <View style={themed($skeletonTitle)} />
            <View style={themed($skeletonLine)} />
            <View style={themed($skeletonLineShort)} />
          </View>
        </View>
      ))}
    </View>
  )
}

function EmptyOffers() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($empty)}>
      <UIIcon name="tag" size={46} color="#525252" strokeWidth={1.8} />
      <Text preset="subheading" text="No offers available" style={themed($emptyText)} />
    </View>
  )
}

type OfferStatus = "available" | "expires-soon" | "expired"

function getOfferStatus(value: string, referenceTime: number): OfferStatus {
  const expiry = new Date(value).getTime()
  if (expiry < referenceTime) return "expired"
  if (expiry - referenceTime <= 14 * 24 * 60 * 60 * 1000) return "expires-soon"
  return "available"
}

function getStatusLabel(status: OfferStatus) {
  if (status === "expires-soon") return "Expires Soon"
  if (status === "expired") return "Expired"
  return "Available"
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

const $container: ThemedStyle<ViewStyle> = () => ({ backgroundColor: "#000000", flex: 1 })

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xs,
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $tabs: ThemedStyle<ViewStyle> = ({ spacing }) => ({ flexDirection: "row", gap: spacing.sm })

const $pillActive: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  backgroundColor: "#E10600",
  borderRadius: radius.round,
  justifyContent: "center",
  minHeight: 36,
  paddingHorizontal: spacing.xl,
})

const $pillDisabled: ThemedStyle<ViewStyle> = (theme) => ({
  ...$pillActive(theme),
  backgroundColor: "#151515",
  opacity: 0.55,
})

const $pillText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $pillDisabledText: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })

const $offerCard: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  backgroundColor: "#111516",
  borderRadius: radius.lg,
  flexDirection: "row",
  gap: spacing.md,
  minHeight: 96,
  padding: spacing.md,
})

const $pressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.75 })

const $logo: ThemedStyle<ImageStyle> = ({ radius }) => ({
  backgroundColor: "#0b0b0b",
  borderRadius: radius.md,
  height: 58,
  width: 88,
})

const $logoPlaceholder: ThemedStyle<ViewStyle> = ({ radius }) => ({
  alignItems: "center",
  backgroundColor: "#181818",
  borderRadius: radius.md,
  height: 58,
  justifyContent: "center",
  width: 88,
})

const $offerBody: ThemedStyle<ViewStyle> = ({ spacing }) => ({ flex: 1, gap: spacing.xxxs })
const $titleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs })
const $offerTitle: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $partner: ThemedStyle<TextStyle> = () => ({ color: "#d4d4d4" })
const $validity: ThemedStyle<TextStyle> = () => ({ color: "#8f8f8f" })

const $statusBase: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignSelf: "flex-start",
  borderRadius: radius.round,
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
})

const $statusAvailable: ThemedStyle<ViewStyle> = (theme) => ({
  ...$statusBase(theme),
  backgroundColor: "rgba(225, 6, 0, 0.16)",
})

const $statusExpired: ThemedStyle<ViewStyle> = (theme) => ({
  ...$statusBase(theme),
  backgroundColor: "rgba(255, 255, 255, 0.08)",
})

const $statusAvailableText: ThemedStyle<TextStyle> = () => ({ color: "#ff3b30" })
const $statusExpiredText: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })

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
  padding: spacing.md,
})

const $skeletonLogo: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#202020",
  borderRadius: radius.md,
  height: 58,
  width: 88,
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
  width: "74%",
})

const $skeletonLine: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#1a1a1a",
  borderRadius: radius.sm,
  height: 11,
  width: "48%",
})

const $skeletonLineShort: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#1a1a1a",
  borderRadius: radius.sm,
  height: 11,
  width: "82%",
})
