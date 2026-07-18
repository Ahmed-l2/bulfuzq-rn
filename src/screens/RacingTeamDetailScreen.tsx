import { FC, useMemo } from "react"
import { Image, ImageStyle, Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { usePerformanceCars } from "@/services/query"
import type { PerformanceCarItem } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type SpecRow = { label: string; value: string }

export const RacingTeamDetailScreen: FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { themed } = useAppTheme()
  const carsQuery = usePerformanceCars()
  const car = carsQuery.data?.find((item) => item.id === id) ?? null

  const specs = useMemo(() => (car ? getSpecRows(car) : []), [car])
  const dynamicSpecs = useMemo(() => (car ? getDynamicSpecs(car.specs) : []), [car])
  const gallery = car?.gallery_urls.filter(Boolean) ?? []

  return (
    <Screen
      preset="fixed"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      systemBarStyle="light"
    >
      <ScrollView contentContainerStyle={themed($content)} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={themed($backButton)}
        >
          <UIIcon name="arrow-left" size={20} color="#ffffff" strokeWidth={1.9} />
          <Text size="sm" weight="medium" text="Back" style={themed($backText)} />
        </Pressable>

        {!car && !carsQuery.isLoading ? <MissingVehicle /> : null}
        {car ? (
          <>
            <View style={themed($hero)}>
              {car.main_image ? (
                <Image
                  source={{ uri: car.main_image }}
                  style={themed($heroImage)}
                  resizeMode="cover"
                />
              ) : (
                <View style={themed($heroPlaceholder)}>
                  <UIIcon name="car" size={58} color="#737373" strokeWidth={1.7} />
                </View>
              )}
            </View>

            <View style={themed($intro)}>
              <Text preset="heading" text={car.name} style={themed($title)} />
              {getSubtitle(car) ? <Text text={getSubtitle(car)} style={themed($subtitle)} /> : null}
              {car.base_info ? <Text text={car.base_info} style={themed($body)} /> : null}
            </View>

            {specs.length > 0 ? <SpecGrid rows={specs} /> : null}
            {dynamicSpecs.length > 0 ? (
              <SpecSection title="Specs" rows={dynamicSpecs} icon="settings" />
            ) : null}
            {car.modifications.length > 0 ? (
              <TextList title="Modifications" items={car.modifications} icon="wrench" />
            ) : null}
            {car.parts_used.length > 0 ? (
              <TextList title="Parts Used" items={car.parts_used} icon="zap" />
            ) : null}
            {car.notes ? <NotesSection notes={car.notes} /> : null}
            {gallery.length > 0 ? <Gallery images={gallery} /> : null}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  )
}

function SpecGrid({ rows }: { rows: SpecRow[] }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($specGrid)}>
      {rows.map((row) => (
        <View key={row.label} style={themed($specCard)}>
          <Text
            size="xxs"
            weight="bold"
            text={row.label.toUpperCase()}
            style={themed($specLabel)}
          />
          <Text preset="subheading" text={row.value} style={themed($specValue)} />
        </View>
      ))}
    </View>
  )
}

function SpecSection({ title, rows, icon }: { title: string; rows: SpecRow[]; icon: "settings" }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($section)}>
      <SectionHeader title={title} icon={icon} />
      {rows.map((row) => (
        <View key={row.label} style={themed($row)}>
          <Text size="sm" text={row.label} style={themed($rowLabel)} />
          <Text size="sm" weight="medium" text={row.value} style={themed($rowValue)} />
        </View>
      ))}
    </View>
  )
}

function TextList({
  title,
  items,
  icon,
}: {
  title: string
  items: string[]
  icon: "wrench" | "zap"
}) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($section)}>
      <SectionHeader title={title} icon={icon} />
      {items.map((item) => (
        <View key={item} style={themed($bulletRow)}>
          <View style={themed($bullet)} />
          <Text text={item} style={themed($body)} />
        </View>
      ))}
    </View>
  )
}

function NotesSection({ notes }: { notes: string }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($section)}>
      <SectionHeader title="Notes" icon="gauge" />
      <Text text={notes} style={themed($body)} />
    </View>
  )
}

function Gallery({ images }: { images: string[] }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($section)}>
      <SectionHeader title="Gallery" icon="car" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={themed($gallery)}
      >
        {images.map((image) => (
          <Image
            key={image}
            source={{ uri: image }}
            style={themed($galleryImage)}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  )
}

function SectionHeader({
  title,
  icon,
}: {
  title: string
  icon: "car" | "gauge" | "settings" | "wrench" | "zap"
}) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($sectionHeader)}>
      <UIIcon name={icon} size={18} color="#E10600" strokeWidth={2} />
      <Text preset="subheading" text={title} style={themed($sectionTitle)} />
    </View>
  )
}

function MissingVehicle() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($missing)}>
      <UIIcon name="car" size={48} color="#525252" strokeWidth={1.8} />
      <Text preset="subheading" text="Vehicle not found." style={themed($title)} />
    </View>
  )
}

function getSpecRows(car: PerformanceCarItem): SpecRow[] {
  return [
    { label: "Power", value: car.horsepower },
    { label: "Torque", value: car.torque },
    { label: "Engine", value: car.engine },
    { label: "Weight", value: car.weight },
    { label: "Drivetrain", value: car.drivetrain },
  ].filter((row): row is SpecRow => Boolean(row.value))
}

function getDynamicSpecs(specs: unknown): SpecRow[] {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return []

  return Object.entries(specs)
    .filter(
      ([, value]) =>
        typeof value === "string" || typeof value === "number" || typeof value === "boolean",
    )
    .map(([label, value]) => ({ label: formatLabel(label), value: String(value) }))
}

function getSubtitle(car: PerformanceCarItem) {
  return [car.year, car.category ? formatLabel(car.category) : null].filter(Boolean).join(" • ")
}

function formatLabel(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xl,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
})

const $backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  alignSelf: "flex-start",
  flexDirection: "row",
  gap: spacing.xs,
  paddingTop: spacing.lg,
})

const $backText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $hero: ThemedStyle<ViewStyle> = ({ radius }) => ({
  borderRadius: radius.xl,
  overflow: "hidden",
})

const $heroImage: ThemedStyle<ImageStyle> = () => ({
  backgroundColor: "#101010",
  height: 290,
  width: "100%",
})

const $heroPlaceholder: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  backgroundColor: "#101010",
  height: 290,
  justifyContent: "center",
})

const $intro: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })
const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $subtitle: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })
const $body: ThemedStyle<TextStyle> = () => ({ color: "#d4d4d4", lineHeight: 22 })

const $specGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $specCard: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.lg,
  flexBasis: "48%",
  flexGrow: 1,
  gap: spacing.xs,
  padding: spacing.md,
})

const $specLabel: ThemedStyle<TextStyle> = () => ({ color: "#737373", letterSpacing: 0.8 })
const $specValue: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $section: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#0d0f10",
  borderRadius: radius.xl,
  gap: spacing.md,
  padding: spacing.lg,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  gap: spacing.sm,
})
const $sectionTitle: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.lg,
  justifyContent: "space-between",
})
const $rowLabel: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3", flex: 1 })
const $rowValue: ThemedStyle<TextStyle> = () => ({ color: "#ffffff", flex: 1, textAlign: "right" })

const $bulletRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "flex-start",
  flexDirection: "row",
  gap: spacing.sm,
})
const $bullet: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#E10600",
  borderRadius: 3,
  height: 6,
  marginTop: 8,
  width: 6,
})

const $gallery: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })
const $galleryImage: ThemedStyle<ImageStyle> = ({ radius }) => ({
  borderRadius: radius.lg,
  height: 130,
  width: 190,
})

const $missing: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.md,
  paddingTop: spacing.xxxl,
})
