const WEBSITE_ORIGIN = "https://bulfuzq.com"

const IMAGE_EXTENSION_PATTERN = /\.(svg|png|jpe?g|webp)(\?.*)?$/i

export function isImageLikeValue(value: string) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    IMAGE_EXTENSION_PATTERN.test(value)
  )
}

export function resolveImageUrl(value: string | null | undefined) {
  if (!value) return null

  if (value.startsWith("http://") || value.startsWith("https://")) return value
  if (value.startsWith("//")) return `https:${value}`
  if (value.startsWith("/")) return `${WEBSITE_ORIGIN}${value}`

  return value
}

export function resolveImageIdentifier(value: string) {
  if (!isImageLikeValue(value)) return value
  return resolveImageUrl(value) ?? value
}
