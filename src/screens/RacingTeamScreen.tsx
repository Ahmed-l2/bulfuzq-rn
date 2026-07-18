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
import { usePerformanceCars } from "@/services/query"
import type { PerformanceCarItem } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface VehicleCardProps {
  car: PerformanceCarItem
  onPress: (id: string) => void
}

export const RacingTeamScreen: FC = () => {
  const router = useRouter()
  const { themed } = useAppTheme()
  const carsQuery = usePerformanceCars()
  const cars = carsQuery.data

  const visibleCars = useMemo(() => cars ?? [], [cars])

  const openCar = useCallback(
    (id: string) => {
      router.push(`/racing-team/${id}`)
    },
    [router],
  )

  const renderItem = useCallback(
    ({ item }: { item: PerformanceCarItem }) => <VehicleCard car={item} onPress={openCar} />,
    [openCar],
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
        data={visibleCars}
        keyExtractor={(car) => car.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={carsQuery.isRefetching}
            onRefresh={refresh}
            tintColor="#E10600"
          />
        }
        ListHeaderComponent={
          <View style={themed($header)}>
            <Text preset="heading" text="Racing Team" style={themed($title)} />
          </View>
        }
        ListEmptyComponent={carsQuery.isLoading ? <VehicleSkeleton /> : <EmptyVehicles />}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  )

  function refresh() {
    void carsQuery.refetch()
  }
}

const VehicleCard = memo(function VehicleCard({ car, onPress }: VehicleCardProps) {
  const { themed } = useAppTheme()
  const badges = getBadges(car).slice(0, 3)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open vehicle ${car.name}`}
      onPress={() => onPress(car.id)}
      style={({ pressed }) => [themed($vehicleCard), pressed && themed($pressed)]}
    >
      {car.main_image ? (
        <Image source={{ uri: car.main_image }} style={themed($heroImage)} resizeMode="cover" />
      ) : (
        <View style={themed($heroPlaceholder)}>
          <UIIcon name="car" size={48} color="#737373" strokeWidth={1.7} />
        </View>
      )}

      <View style={themed($cardBody)}>
        <View style={themed($titleRow)}>
          <View style={themed($titleBlock)}>
            <Text
              preset="subheading"
              text={car.name}
              numberOfLines={2}
              style={themed($cardTitle)}
            />
            <Text size="sm" text={getSubtitle(car)} numberOfLines={1} style={themed($subtitle)} />
          </View>
          <UIIcon name="chevron-right" size={20} color="#737373" strokeWidth={1.8} />
        </View>

        {badges.length > 0 ? (
          <View style={themed($badges)}>
            {badges.map((badge) => (
              <View key={badge} style={themed($badge)}>
                <Text size="xxs" weight="bold" text={badge} style={themed($badgeText)} />
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  )
})

function VehicleSkeleton() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($skeletonWrap)}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={themed($skeletonCard)}>
          <View style={themed($skeletonImage)} />
          <View style={themed($skeletonTitle)} />
          <View style={themed($skeletonLine)} />
        </View>
      ))}
    </View>
  )
}

function EmptyVehicles() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($empty)}>
      <UIIcon name="car" size={52} color="#525252" strokeWidth={1.7} />
      <Text
        preset="subheading"
        text="No performance vehicles are available yet."
        style={themed($emptyText)}
      />
    </View>
  )
}

function getSubtitle(car: PerformanceCarItem) {
  return [car.year, car.engine, car.category ? formatLabel(car.category) : null]
    .filter(Boolean)
    .join(" • ")
}

function getBadges(car: PerformanceCarItem) {
  return [
    car.horsepower,
    car.drivetrain,
    car.engine,
    car.category ? formatLabel(car.category) : null,
  ].filter(Boolean) as string[]
}

function formatLabel(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const $container: ThemedStyle<ViewStyle> = () => ({ backgroundColor: "#000000", flex: 1 })

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xl,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.lg,
  paddingBottom: spacing.sm,
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })

const $vehicleCard: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.xl,
  overflow: "hidden",
})

const $pressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.78, transform: [{ scale: 0.99 }] })

const $heroImage: ThemedStyle<ImageStyle> = () => ({
  backgroundColor: "#101010",
  height: 220,
  width: "100%",
})

const $heroPlaceholder: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  backgroundColor: "#101010",
  height: 220,
  justifyContent: "center",
  width: "100%",
})

const $cardBody: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  padding: spacing.lg,
})

const $titleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  gap: spacing.md,
})

const $titleBlock: ThemedStyle<ViewStyle> = () => ({ flex: 1 })
const $cardTitle: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $subtitle: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })

const $badges: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $badge: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "rgba(225, 6, 0, 0.16)",
  borderRadius: radius.round,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
})

const $badgeText: ThemedStyle<TextStyle> = () => ({ color: "#ff3b30" })

const $empty: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.md,
  justifyContent: "center",
  paddingTop: spacing.xxxl,
})

const $emptyText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff", textAlign: "center" })
const $skeletonWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xl })

const $skeletonCard: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.xl,
  gap: spacing.md,
  paddingBottom: spacing.lg,
  overflow: "hidden",
})

const $skeletonImage: ThemedStyle<ViewStyle> = () => ({ backgroundColor: "#202020", height: 220 })

const $skeletonTitle: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#242424",
  borderRadius: radius.sm,
  height: 20,
  marginHorizontal: spacing.lg,
  width: "58%",
})

const $skeletonLine: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#1a1a1a",
  borderRadius: radius.sm,
  height: 13,
  marginHorizontal: spacing.lg,
  width: "76%",
})
