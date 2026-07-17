import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface UIAvatarProps {
  initials?: string
  imageUrl?: string | null
  size?: number
}

export function UIAvatar({ initials = "BR", imageUrl, size = 44 }: UIAvatarProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed([$avatar, { height: size, width: size, borderRadius: size / 2 }])}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={$image} />
      ) : (
        <Text
          size="xs"
          weight="bold"
          text={initials.slice(0, 2).toUpperCase()}
          style={themed($text)}
        />
      )}
    </View>
  )
}

const $avatar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignItems: "center",
  backgroundColor: colors.palette.primary500,
  justifyContent: "center",
  overflow: "hidden",
})

const $image: ImageStyle = {
  height: "100%",
  width: "100%",
}

const $text: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.palette.neutral100 })
