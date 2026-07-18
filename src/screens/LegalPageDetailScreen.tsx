import { FC } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UIIcon } from "@/components/ui"
import { useLegalPages } from "@/services/query"
import type { LegalContentBlock } from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const LegalPageDetailScreen: FC = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const { themed } = useAppTheme()
  const legalPagesQuery = useLegalPages()
  const page = legalPagesQuery.data?.find((item) => item.slug === slug) ?? null
  const content = page?.content_en ?? []

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
        <Text preset="heading" text={page?.title_en ?? "Legal Page"} style={themed($title)} />
        {page?.last_updated_at ? (
          <Text
            size="sm"
            text={`Last updated: ${formatDate(page.last_updated_at)}`}
            style={themed($body)}
          />
        ) : null}
      </View>

      {!page && !legalPagesQuery.isLoading ? (
        <View style={themed($card)}>
          <Text text="This legal page is not available right now." style={themed($body)} />
        </View>
      ) : null}

      {content.map((block, index) => (
        <LegalBlock key={`${block.type}-${index}`} block={block} />
      ))}
    </Screen>
  )
}

function LegalBlock({ block }: { block: LegalContentBlock }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($card)}>
      {block.heading ? (
        <Text preset="subheading" text={block.heading} style={themed($title)} />
      ) : null}
      <LegalBody body={block.body} />
      {block.subsections?.map((subsection, index) => (
        <View key={`${subsection.heading ?? "subsection"}-${index}`} style={themed($subsection)}>
          {subsection.heading ? (
            <Text size="md" weight="semiBold" text={subsection.heading} style={themed($title)} />
          ) : null}
          {subsection.body ? <Text text={subsection.body} style={themed($body)} /> : null}
        </View>
      ))}
    </View>
  )
}

function LegalBody({ body }: { body: LegalContentBlock["body"] }) {
  const { themed } = useAppTheme()
  if (!body) return null

  if (Array.isArray(body)) {
    return body.map((paragraph, index) => (
      <Text key={`${paragraph.slice(0, 16)}-${index}`} text={paragraph} style={themed($body)} />
    ))
  }

  return <Text text={body} style={themed($body)} />
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(value))
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
const $card: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.xl,
  gap: spacing.md,
  padding: spacing.lg,
})
const $subsection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderTopColor: "#262626",
  borderTopWidth: 1,
  gap: spacing.xs,
  paddingTop: spacing.md,
})
const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $body: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3", lineHeight: 22 })
