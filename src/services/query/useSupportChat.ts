import { useAuth } from "@clerk/clerk-expo"
import { useMutation, useQuery } from "@tanstack/react-query"

import { hasSupabaseConfig } from "@/config/env"
import * as supportService from "@/services/supabase/support"

import { queryClient } from "./queryClient"

export function useSupportHome() {
  const { getToken, isLoaded, userId } = useAuth()

  return useQuery({
    queryKey: ["support", "home", userId],
    enabled: isLoaded && hasSupabaseConfig && Boolean(userId),
    queryFn: () => supportService.getSupportHome(() => getToken(), userId ?? ""),
    refetchInterval: 10_000,
    meta: { persist: true },
  })
}

export function useSupportConversation(conversationId: string | null) {
  const { getToken, isLoaded, userId } = useAuth()

  return useQuery({
    queryKey: ["support", "conversation", userId, conversationId],
    enabled: isLoaded && hasSupabaseConfig && Boolean(userId && conversationId),
    queryFn: () =>
      supportService.getSupportConversation(() => getToken(), userId ?? "", conversationId ?? ""),
    refetchInterval: 5_000,
    meta: { persist: true },
  })
}

export function useSendSupportMessage() {
  const { getToken, userId } = useAuth()

  return useMutation({
    mutationFn: ({
      attachment,
      content,
      conversationId,
      startNew,
    }: {
      attachment?: supportService.SupportAttachmentInput | null
      content: string
      conversationId?: string | null
      startNew?: boolean
    }) =>
      supportService.sendSupportMessage({
        attachment,
        content,
        conversationId,
        customerId: userId ?? "",
        getClerkSupabaseToken: () => getToken(),
        startNew,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["support"] })
    },
  })
}

export function useMarkSupportConversationRead() {
  const { getToken, userId } = useAuth()

  return useMutation({
    mutationFn: (conversationId: string) =>
      supportService.markSupportConversationRead(() => getToken(), userId ?? "", conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["support"] })
    },
  })
}

export function useSupportUnreadSummary() {
  const { getToken, isLoaded, userId } = useAuth()

  return useQuery({
    queryKey: ["support", "unread", userId],
    enabled: isLoaded && hasSupabaseConfig && Boolean(userId),
    queryFn: () => supportService.getSupportUnreadSummary(() => getToken(), userId ?? ""),
    refetchInterval: 30_000,
    meta: { persist: true },
  })
}
