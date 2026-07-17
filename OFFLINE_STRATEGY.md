# Offline Strategy

The mobile app uses TanStack Query with MMKV persistence for read-only member dashboard data.

## Cached Resources

- Membership summary and card-ready status.
- Dashboard summary data.
- Member announcements and membership news.
- Member events.
- Active sponsors.
- Partner offers.

## Not Cached

- Payments.
- Membership renewals.
- QR validation.
- Support messages.
- Sensitive write operations.

## Cache Invalidation

- Query keys include the active Clerk user ID for member-scoped data.
- Persisted query cache is cleared during sign-out before the Clerk session ends.
- Read queries can opt out of persistence with `meta: { persist: false }`.
- Writes and sensitive operations must invalidate relevant read queries and stay excluded from persistence.

## Runtime Behavior

- Cached dashboard data can render while the app refreshes from Supabase.
- Supabase RLS remains the authorization boundary for every network request.
- The app must never persist service-role credentials, payment secrets, support messages, or write payloads.
