import { useAuth } from "@clerk/clerk-expo"
import { useQuery } from "@tanstack/react-query"

import { hasSupabaseConfig } from "@/config/env"
import {
  getCurrentMemberAnnouncement,
  getMemberEvents,
  getMembershipNews,
  getMembershipNewsById,
  getPartnerOffers,
  getSponsors,
} from "@/services/supabase"

interface MemberContentQueryOptions {
  enabled?: boolean
}

function useContentQueryEnabled() {
  const { getToken, isLoaded, userId } = useAuth()

  return {
    enabled: isLoaded && hasSupabaseConfig && Boolean(userId),
    getToken,
    userId,
  }
}

export function useMembershipNews(options: MemberContentQueryOptions = {}) {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["membershipNews", userId],
    enabled: enabled && (options.enabled ?? true),
    queryFn: () => measureQuery("getMembershipNews", () => getMembershipNews(() => getToken())),
    meta: { persist: true },
  })
}

export function useMembershipNewsItem(id: string, options: MemberContentQueryOptions = {}) {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["membershipNewsItem", userId, id],
    enabled: enabled && Boolean(id) && (options.enabled ?? true),
    queryFn: () =>
      measureQuery("getMembershipNewsById", () => getMembershipNewsById(() => getToken(), id)),
    meta: { persist: true },
  })
}

export function useCurrentMemberAnnouncement(options: MemberContentQueryOptions = {}) {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["currentMemberAnnouncement", userId],
    enabled: enabled && (options.enabled ?? true),
    queryFn: () =>
      measureQuery("getCurrentMemberAnnouncement", () =>
        getCurrentMemberAnnouncement(() => getToken()),
      ),
    meta: { persist: true },
  })
}

export function useMemberEvents(options: MemberContentQueryOptions = {}) {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["memberEvents", userId],
    enabled: enabled && (options.enabled ?? true),
    queryFn: () => measureQuery("getMemberEvents", () => getMemberEvents(() => getToken())),
    meta: { persist: true },
  })
}

export function usePartnerOffers(options: MemberContentQueryOptions = {}) {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["partnerOffers", userId],
    enabled: enabled && (options.enabled ?? true),
    queryFn: () => measureQuery("getPartnerOffers", () => getPartnerOffers(() => getToken())),
    meta: { persist: true },
  })
}

export function useSponsors(options: MemberContentQueryOptions = {}) {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["sponsors", userId],
    enabled: enabled && (options.enabled ?? true),
    queryFn: () => measureQuery("getSponsors", () => getSponsors(() => getToken())),
    meta: { persist: true },
  })
}

async function measureQuery<T>(label: string, query: () => Promise<T>): Promise<T> {
  const startedAt = getNow()
  try {
    return await query()
  } finally {
    if (__DEV__) {
      console.info(`[perf][ReactQuery] ${label} queryFn ${(getNow() - startedAt).toFixed(1)}ms`)
    }
  }
}

function getNow() {
  return globalThis.performance?.now?.() ?? Date.now()
}
