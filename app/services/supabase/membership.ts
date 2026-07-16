import { z } from "zod"

import { createAuthenticatedSupabaseClient, GetClerkSupabaseToken } from "./client"
import type {
  RacingTeamRegistration,
  RacingTeamSubscription,
  UpayLocalSubscription,
} from "./database.types"

type MembershipProvider = "paypal" | "upayments"
type MembershipSubscription = RacingTeamSubscription | UpayLocalSubscription

export const membershipSummarySchema = z.object({
  member: z
    .object({
      id: z.string(),
      fullName: z.string(),
      email: z.string(),
      phone: z.string(),
    })
    .nullable(),
  membership: z.object({
    active: z.boolean(),
    tier: z.string().nullable(),
    badge: z.string(),
    provider: z.enum(["paypal", "upayments"]).nullable(),
    expiresAt: z.string().nullable(),
    daysRemaining: z.number().int().nonnegative().nullable(),
    renewable: z.boolean(),
  }),
  quickActions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      target: z.string(),
    }),
  ),
  renewal: z.object({
    required: z.boolean(),
    target: z.string().nullable(),
  }),
})

export type MembershipSummary = z.infer<typeof membershipSummarySchema>

export async function getMembershipSummary(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  clerkUserId: string,
): Promise<MembershipSummary> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)

  const { data: registration, error: registrationError } = await supabase
    .from("racing_team_registrations")
    .select("*")
    .eq("user_id", clerkUserId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (registrationError) throw registrationError

  if (!registration) return buildMembershipSummary(null, null, null)

  const paypalSubscription = await getLatestPaypalSubscription(
    registration.id,
    getClerkSupabaseToken,
  )
  const paypalState = getActiveSubscriptionState(paypalSubscription, "paypal")

  if (paypalState.active) {
    return buildMembershipSummary(registration, paypalSubscription, "paypal")
  }

  const upaySubscription = await getLatestUpaySubscription(registration.id, getClerkSupabaseToken)
  const upayState = getActiveSubscriptionState(upaySubscription, "upayments")

  if (upayState.active) {
    return buildMembershipSummary(registration, upaySubscription, "upayments")
  }

  return buildMembershipSummary(registration, null, null)
}

async function getLatestPaypalSubscription(
  registrationId: string,
  getClerkSupabaseToken: GetClerkSupabaseToken,
) {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("racing_team_subscriptions")
    .select("*")
    .eq("registration_id", registrationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

async function getLatestUpaySubscription(
  registrationId: string,
  getClerkSupabaseToken: GetClerkSupabaseToken,
) {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data, error } = await supabase
    .from("upay_local_subscriptions")
    .select("*")
    .eq("module", "racing_team")
    .eq("registration_id", registrationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

function buildMembershipSummary(
  registration: RacingTeamRegistration | null,
  subscription: MembershipSubscription | null,
  provider: MembershipProvider | null,
) {
  const expiresAt = getMembershipExpiresAt(subscription)
  const active = Boolean(subscription && getActiveSubscriptionState(subscription, provider).active)

  return membershipSummarySchema.parse({
    member: registration
      ? {
          id: registration.id,
          fullName: registration.full_name,
          email: registration.email,
          phone: registration.phone,
        }
      : null,
    membership: {
      active,
      tier: registration?.package_id ?? null,
      badge: active ? "Active member" : "Inactive",
      provider,
      expiresAt,
      daysRemaining: getMembershipDaysRemaining(expiresAt),
      renewable: !active,
    },
    quickActions: [
      { id: "membership-card", label: "Membership Card", target: "MembershipCard" },
      { id: "events", label: "Events", target: "Events" },
      { id: "offers", label: "Offers", target: "Offers" },
    ],
    renewal: {
      required: !active,
      target: active ? null : "MembershipRenewal",
    },
  })
}

function getActiveSubscriptionState(
  subscription: MembershipSubscription | null,
  provider: MembershipProvider | null,
) {
  if (!subscription || !provider || subscription.status !== "active") return { active: false }

  const expiresAt = getMembershipExpiresAt(subscription)
  if (!expiresAt) return { active: provider === "upayments" }

  return { active: new Date(expiresAt) >= new Date() }
}

function getMembershipExpiresAt(subscription: MembershipSubscription | null) {
  if (!subscription) return null

  if ("current_period_end" in subscription) {
    return subscription.next_billing_date ?? subscription.current_period_end
  }

  return subscription.next_billing_date
}

function getMembershipDaysRemaining(expiresAt: string | null) {
  if (!expiresAt) return null

  const remainingMs = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(remainingMs / 86_400_000))
}
