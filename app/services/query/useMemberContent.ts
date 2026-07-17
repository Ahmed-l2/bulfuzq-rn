import { useAuth } from "@clerk/clerk-expo"
import { useQuery } from "@tanstack/react-query"

import { hasSupabaseConfig } from "@/config/env"
import {
  getCurrentMemberAnnouncement,
  getMemberEvents,
  getMembershipNews,
  getPartnerOffers,
  getSponsors,
} from "@/services/supabase"

function useContentQueryEnabled() {
  const { getToken, isLoaded, userId } = useAuth()

  return {
    enabled: isLoaded && hasSupabaseConfig && Boolean(userId),
    getToken,
    userId,
  }
}

export function useMembershipNews() {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["membershipNews", userId],
    enabled,
    queryFn: () => getMembershipNews(() => getToken()),
    meta: { persist: true },
  })
}

export function useCurrentMemberAnnouncement() {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["currentMemberAnnouncement", userId],
    enabled,
    queryFn: () => getCurrentMemberAnnouncement(() => getToken()),
    meta: { persist: true },
  })
}

export function useMemberEvents() {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["memberEvents", userId],
    enabled,
    queryFn: () => getMemberEvents(() => getToken()),
    meta: { persist: true },
  })
}

export function usePartnerOffers() {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["partnerOffers", userId],
    enabled,
    queryFn: () => getPartnerOffers(() => getToken()),
    meta: { persist: true },
  })
}

export function useSponsors() {
  const { enabled, getToken, userId } = useContentQueryEnabled()

  return useQuery({
    queryKey: ["sponsors", userId],
    enabled,
    queryFn: () => getSponsors(() => getToken()),
    meta: { persist: true },
  })
}
