import * as storage from "@/utils/storage"

function getReadAnnouncementsKey(userId: string) {
  return `announcements.read.${userId}`
}

export function loadReadAnnouncementIds(userId: string) {
  const value = storage.loadString(getReadAnnouncementsKey(userId))
  if (!value) return new Set<string>()

  try {
    const ids = JSON.parse(value)
    return new Set(Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [])
  } catch {
    return new Set<string>()
  }
}

export function isAnnouncementRead(userId: string, announcementId: string) {
  return loadReadAnnouncementIds(userId).has(announcementId)
}

export function markAnnouncementRead(userId: string, announcementId: string) {
  const ids = loadReadAnnouncementIds(userId)
  ids.add(announcementId)
  storage.saveString(getReadAnnouncementsKey(userId), JSON.stringify([...ids]))
}
