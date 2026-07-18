import { FC, useMemo, useState } from "react"
import { Image, ImageStyle, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { usePartnerOffers } from "@/services/query"
import type { PartnerOfferItem } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const OfferDetailScreen: FC = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { themed } = useAppTheme()
  const offersQuery = usePartnerOffers()
  const [referenceTime] = useState(() => Date.now())
  const offer = useMemo(
    () => offersQuery.data?.find((candidate) => candidate.id === id) ?? null,
    [offersQuery.data, id],
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

      {offersQuery.isLoading ? <OfferDetailSkeleton /> : null}

      {offersQuery.error ? (
        <MessageBlock title="Unable to Open" message={getErrorMessage(offersQuery.error)} />
      ) : null}

      {!offersQuery.isLoading && !offer ? (
        <MessageBlock title="Offer Not Found" message="This offer is unavailable or expired." />
      ) : null}

      {offer ? <OfferArticle offer={offer} referenceTime={referenceTime} /> : null}
    </Screen>
  )
}

function OfferArticle({
  offer,
  referenceTime,
}: {
  offer: PartnerOfferItem
  referenceTime: number
}) {
  const { themed } = useAppTheme()
  const status = getOfferStatus(offer.valid_until, referenceTime)

  return (
    <View style={themed($article)}>
      {offer.logo_url ? (
        <View style={themed($hero)}>
          <Image source={{ uri: offer.logo_url }} style={themed($heroLogo)} resizeMode="contain" />
        </View>
      ) : null}

      <View style={themed($titleSection)}>
        <View style={themed($titleRow)}>
          <Text preset="heading" text={offer.offer_title} style={themed($title)} />
          <StatusBadge status={status} />
        </View>
        <Text size="md" text={offer.partner_name} style={themed($partner)} />
      </View>

      {offer.description ? (
        <View style={themed($description)}>
          {getParagraphs(offer.description).map((paragraph, index) => (
            <Text
              key={`${index}-${paragraph}`}
              size="md"
              text={paragraph}
              style={themed($paragraph)}
            />
          ))}
        </View>
      ) : null}

      <View style={themed($metadata)}>
        <MetaRow label="Partner" value={offer.partner_name} />
        <MetaRow label="Valid Until" value={formatLongDate(offer.valid_until)} />
        {offer.discount ? <MetaRow label="Discount" value={offer.discount} /> : null}
        {offer.code ? <MetaRow label="Code" value={offer.code} /> : null}
      </View>
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

function OfferDetailSkeleton() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($skeleton)}>
      <View style={themed($skeletonHero)} />
      <View style={themed($skeletonTitle)} />
      <View style={themed($skeletonLine)} />
      <View style={themed($skeletonMeta)} />
      <View style={themed($skeletonLineShort)} />
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

function getParagraphs(value: string) {
  return stripMarkup(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}

function stripMarkup(value: string) {
  return value
    .replace(/<\/?p[^>]*>/g, "\n\n")
    .replace(/<br\s*\/?\s*>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .trim()
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Cached offer details may still be available."
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
  minHeight: 150,
  padding: spacing.xl,
})

const $heroLogo: ThemedStyle<ImageStyle> = () => ({ height: 86, width: "82%" })
const $titleSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })
const $titleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })
const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $partner: ThemedStyle<TextStyle> = () => ({ color: "#d4d4d4" })
const $description: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.lg })
const $paragraph: ThemedStyle<TextStyle> = () => ({ color: "#f5f5f5", lineHeight: 25 })

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

const $statusBase: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignSelf: "flex-start",
  borderRadius: radius.round,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
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
  height: 150,
  width: "100%",
})

const $skeletonTitle: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#202020",
  borderRadius: radius.sm,
  height: 26,
  width: "72%",
})

const $skeletonLine: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#161616",
  borderRadius: radius.sm,
  height: 13,
  width: "100%",
})

const $skeletonLineShort: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#161616",
  borderRadius: radius.sm,
  height: 13,
  width: "66%",
})

const $skeletonMeta: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#101010",
  borderRadius: radius.lg,
  height: 118,
  width: "100%",
})
