# Implementation Plan Updates

Apply the following architectural changes to `IMPLEMENTATION_PLAN.md` before continuing with Phase 2.

These updates supersede any conflicting items in the current plan.

---

# 1. Add Architecture Principles

Create a new section near the top called:

## Architecture Principles

- Website is a read-only reference implementation unless explicitly requested otherwise.
- React Native communicates directly with Supabase using Clerk authentication.
- Business logic must never be duplicated.
- Existing website code provides database schema, business rules, Supabase query, and UI/UX reference only.
- Mobile Supabase services must reuse the shared data model and shared business rules.
- Authentication belongs exclusively to Clerk.
- Membership calculations belong in typed React Native Supabase services and must follow existing business rules.
- Supabase service-role keys must never be used in the mobile app.
- Mobile contains presentation logic only.
- All mobile data access must respect existing Supabase Row Level Security policies.

---

# 2. Supabase Service Layer

Create a typed Supabase data access layer inside the React Native application. The website repository is read-only and must only be used as reference unless explicitly requested otherwise.

Suggested structure:

```text
app/
    services/
        supabase/
            membership.ts
            events.ts
            offers.ts
            sponsors.ts
            news.ts
            support.ts
```

### Completion Checklist

* [x] Supabase service layer created inside React Native.
* [x] Existing website queries audited without modifying the website for membership, news, events, offers, and sponsors.
* [ ] React Native services mirror reusable Supabase queries. Membership, news, events, offers, and sponsors are mirrored.
* [ ] No duplicated business rules beyond the required mobile service implementation. Membership active/expiry logic is mirrored from the website reference.
* [ ] No duplicated business logic.
* [x] Existing website repository remains unchanged.

Architecture:

```text
React Native
      │
      ▼
Clerk Authentication
      │
      ▼
Supabase
```

---

# 3. Shared Data Contract Layer

Create shared data contracts for React Native Supabase services.

Suggested structure:

```text
app/
    services/
        supabase/
            schemas/
            responses/
            types/
```

Use Zod for:

* Query input validation
* Supabase response validation
* Shared types

### Completion Checklist

* [x] Shared schemas created inside the React Native app for membership, news, events, offers, and sponsors.
* [x] Shared response types created inside the React Native app for membership, news, events, offers, and sponsors.
* [x] Zod validation implemented for initial Supabase service responses.
* [x] Supabase service modules return typed responses for initial data slices.
* [x] Data contracts follow the shared Supabase schema from `schema.json` for initial data slices.

---

# 4. Phase 1.5 — Platform Upgrade

Insert this phase after Phase 1.

## Objective

Upgrade the project foundation to Expo SDK 57 before production development begins. All future phases, including Clerk, React Query, and notifications, must target SDK 57.

### Completion Checklist

* [x] Upgrade Expo SDK from 55 to latest stable SDK 57.
* [x] Upgrade React Native to the SDK 57 required version.
* [x] Upgrade Expo modules to SDK 57 compatible versions.
* [x] Upgrade related tooling/configuration for SDK 57.
* [x] Resolve SDK 57 breaking changes.
* [x] `expo install --check` passes.
* [x] Compile passes.
* [x] Lint passes.
* [x] Web export passes.
* [x] Native prebuild succeeds.
* [x] Android debug build succeeds.
* [ ] iOS build succeeds.

### Phase 1.5 Verification Notes

* Completed SDK 57 migration from Expo SDK 55 to Expo SDK 57.0.4.
* Aligned SDK 57 patch dependencies after Expo update prompt: `expo` to `57.0.6`, matching Expo modules to expected SDK 57 patch versions, and `jest-expo` to `57.0.2`.
* Added required config plugins for `expo-secure-store` and `expo-web-browser` because Expo cannot auto-write dynamic config.
* Updated `expo` to `57.0.4`.
* Updated React Native to `0.86.0`.
* Updated React/React DOM to `19.2.3`.
* Updated TypeScript to `6.0.3`.
* Updated Expo packages to SDK 57 compatible versions via `pnpm exec expo install --fix`.
* Updated Expo tooling packages: `jest-expo` to `57.0.1`, `eslint-config-expo` to `57.0.0`.
* Updated `react-test-renderer` to `19.2.3` to match React.
* Resolved TypeScript 6 `baseUrl` deprecation with `ignoreDeprecations: "6.0"`.
* Added explicit Jest globals typing in `tsconfig.json` for colocated test files under `app/`.
* Refactored Ignite toggle/screen components to satisfy React 19/SDK 57 ref-safety lint rules instead of disabling the rule globally.
* `pnpm exec expo install --check` passes.
* `pnpm run compile` passes.
* `pnpm run lint:check` passes.
* `pnpm run bundle:web` passes.
* Android prebuild passes with `CI=1 pnpm exec expo prebuild --platform android --clean`.
* iOS prebuild passes with `CI=1 pnpm exec expo prebuild --platform ios --clean`; CocoaPods is skipped because the host is Linux.
* Android debug build passes with `./gradlew assembleDebug` on the generated SDK 57 Android project.
* iOS native build is blocked on this Linux host because `xcodebuild` is not installed and iOS builds require macOS/Xcode.
* Generated `android/`, `ios/`, and `dist/` directories are verification artifacts and should be removed after checks.

Do not continue with later phases until this phase is complete.

---

# 4.5. Phase 2 — Authentication

## Objective

Integrate Clerk Expo authentication against the same Clerk instance as the website. The mobile app must preserve identical Clerk user IDs across web and mobile and must not introduce a parallel authentication system.

### Files Affected

* `/home/shika/bulfuzq-rn/AUTHENTICATION.md`
* `/home/shika/bulfuzq-rn/app/app.tsx`
* `/home/shika/bulfuzq-rn/app/config/env.ts`
* `/home/shika/bulfuzq-rn/app/config/config.base.ts`
* `/home/shika/bulfuzq-rn/app/navigators/AppNavigator.tsx`
* `/home/shika/bulfuzq-rn/app/navigators/navigationTypes.ts`
* `/home/shika/bulfuzq-rn/app/screens/HomeScreen.tsx`
* `/home/shika/bulfuzq-rn/app/screens/LoadingScreen.tsx`
* `/home/shika/bulfuzq-rn/app/screens/MissingAuthConfigScreen.tsx`
* `/home/shika/bulfuzq-rn/app/screens/SignInScreen.tsx`
* `/home/shika/bulfuzq-rn/app/screens/SignUpScreen.tsx`
* `/home/shika/bulfuzq-rn/app/services/auth/clerkTokenCache.ts`
* `/home/shika/bulfuzq-rn/.npmrc`
* `/home/shika/bulfuzq-rn/package.json`
* `/home/shika/bulfuzq-rn/pnpm-lock.yaml`

### Data Access Involved

* None. Supabase data access starts in Phase 3.

### Database Changes

* None.

### Dependencies

* `@clerk/clerk-expo`
* `expo-secure-store`
* `expo-web-browser`

### Completion Checklist

* [x] `AUTHENTICATION.md` created.
* [x] Clerk provider configured.
* [x] SecureStore token cache configured.
* [x] Fake AuthContext remains removed.
* [x] Navigation depends on Clerk auth state.
* [x] Sign-in/sign-up/sign-out screens implemented through Clerk Expo.
* [x] Sign-in handles Clerk-required additional code verification instead of stopping on incomplete status.
* [x] Clerk SSO buttons added for Google and Apple sign-in.
* [x] Missing Clerk publishable key state handled without crashing local builds.
* [x] Clerk publishable key is read from `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, with fallback to Ignite config, so mobile can target the same Clerk instance as the website.
* [x] TypeScript passes with `pnpm run compile`.
* [x] Lint passes with `pnpm run lint:check`.
* [x] Web export passes with `pnpm run bundle:web`.
* [x] Native prebuild passes for Android and iOS.
* [x] Android debug build passes.

### Phase 2 Verification Notes

* `pnpm exec expo install --check` passes.
* `pnpm run compile` passes.
* `pnpm run lint:check` passes.
* `pnpm run bundle:web` passes.
* `CI=1 pnpm exec expo prebuild --platform android --clean` passes.
* `./gradlew assembleDebug` passes on the generated Android project.
* `CI=1 pnpm exec expo prebuild --platform ios --clean` passes; CocoaPods is skipped because the host is Linux.
* iOS native build still requires macOS/Xcode.
* Generated `android/`, `ios/`, and `dist/` directories were removed after verification.

---

# 4.75. Phase 2.5 — Multi-Role Foundation

## Objective

Implement a scalable multi-role architecture using the existing Clerk + Supabase setup. The website remains a read-only reference. The mobile app continues communicating directly with Supabase through the typed service layer.

### Database Changes

* Added migration artifact: `/home/shika/bulfuzq-rn/supabase/migrations/202607170001_create_user_roles.sql`.
* The migration creates `public.user_roles`, enables RLS, adds a Clerk `sub`-based select policy, and inserts existing racing-team registrants as `member` roles.

### Files Affected

* `/home/shika/bulfuzq-rn/supabase/migrations/202607170001_create_user_roles.sql`
* `/home/shika/bulfuzq-rn/app/services/supabase/database.types.ts`
* `/home/shika/bulfuzq-rn/app/services/supabase/roles.ts`
* `/home/shika/bulfuzq-rn/app/services/supabase/index.ts`
* `/home/shika/bulfuzq-rn/app/services/roles/RoleProvider.tsx`
* `/home/shika/bulfuzq-rn/app/services/roles/index.ts`
* `/home/shika/bulfuzq-rn/app/screens/RoleSelectionScreen.tsx`
* `/home/shika/bulfuzq-rn/app/screens/MerchantHomeScreen.tsx`
* `/home/shika/bulfuzq-rn/app/screens/HomeScreen.tsx`
* `/home/shika/bulfuzq-rn/app/navigators/AppNavigator.tsx`
* `/home/shika/bulfuzq-rn/app/navigators/navigationTypes.ts`
* `/home/shika/bulfuzq-rn/app/app.tsx`

### Completion Checklist

* [x] `user_roles` schema added.
* [x] Existing members migrated to the `member` role in the migration artifact.
* [x] Typed `RolesService` implemented.
* [x] `RoleProvider` created.
* [x] Role selection flow implemented.
* [x] MMKV remembers the last selected role.
* [x] Empty Merchant navigation scaffolded.
* [x] Documentation updated.
* [x] Compile passes.
* [x] Lint passes.
* [x] Build passes.

### Phase 2.5 Verification Notes

* Role data is resolved from Supabase via `app/services/supabase/roles.ts` using the authenticated Clerk user ID.
* `RoleProvider` stores the selected role per Clerk user in MMKV.
* Single-role users automatically enter their experience.
* Multi-role users can select a role and switch roles from member/merchant placeholder screens.
* `member` routes continue using the existing member home.
* `merchant` routes currently use an empty placeholder screen until merchant features are implemented.
* Website repository was not modified.
* `pnpm run compile` passes.
* `pnpm run lint:check` passes.
* `pnpm run bundle:web` passes.
* Generated `dist/` directory was removed after verification.

---

# 4.8. Phase 2.5.1 — Multi-Role Foundation Improvements

## Objective

Refine the multi-role foundation for clearer naming, stronger database typing, better RoleProvider ergonomics, and account-based role switching. These changes build on Phase 2.5 and do not modify the website repository.

### Database Changes

* Updated `supabase/migrations/202607170001_create_user_roles.sql` to use `clerk_user_id` instead of ambiguous `user_id`.
* Added PostgreSQL enum `public.app_role` with `member`, `merchant`, `admin`, and `staff`.
* Updated `user_roles.role` to use `public.app_role`.
* Preserved `metadata jsonb` for future role-specific configuration.
* Preserved `is_active` for disabling roles without deleting history.
* Added reusable `public.update_updated_at_column()` trigger function and attached it to `user_roles`.
* Retained indexes for Clerk user lookup and active-role lookup using `clerk_user_id`.
* Updated existing-member migration to insert `clerk_user_id` and `member` enum role.
* Added follow-up migration `/home/shika/bulfuzq-rn/supabase/migrations/202607170002_refine_existing_user_roles.sql` for existing deployments that already created `user_roles` with `user_id text` and `role text`.

### Files Affected

* `/home/shika/bulfuzq-rn/supabase/migrations/202607170001_create_user_roles.sql`
* `/home/shika/bulfuzq-rn/app/services/supabase/database.types.ts`
* `/home/shika/bulfuzq-rn/app/services/supabase/roles.ts`
* `/home/shika/bulfuzq-rn/app/services/roles/RoleProvider.tsx`
* `/home/shika/bulfuzq-rn/app/screens/AccountScreen.tsx`
* `/home/shika/bulfuzq-rn/app/screens/HomeScreen.tsx`
* `/home/shika/bulfuzq-rn/app/screens/MerchantHomeScreen.tsx`
* `/home/shika/bulfuzq-rn/app/navigators/AppNavigator.tsx`
* `/home/shika/bulfuzq-rn/app/navigators/navigationTypes.ts`
* `/home/shika/bulfuzq-rn/app/app.tsx`

### Completion Checklist

* [x] `user_id` renamed to `clerk_user_id` everywhere in the role schema/service/types.
* [x] PostgreSQL enum created for roles.
* [x] `user_roles` updated to use enum.
* [x] Existing migration updated.
* [x] Existing members migrated correctly by the migration artifact.
* [x] RLS policy updated.
* [x] `updated_at` trigger configured.
* [x] Existing indexes retained.
* [x] RoleProvider helper methods added.
* [x] Role switching moved into the Account/Profile experience.
* [x] Compile passes.
* [x] Lint passes.
* [x] Build passes.
* [x] Documentation updated.

### Phase 2.5.1 Verification Notes

* `RoleProvider` now exposes `currentRole`, `availableRoles`, `hasRole(role)`, `isMember`, `isMerchant`, and `switchRole(role)`.
* Role loading now surfaces Supabase error messages instead of hiding non-`Error` PostgREST failures behind a generic message.
* Authenticated users without explicit `user_roles` rows now receive a default mobile `member` role so normal accounts without an active membership are not trapped on role selection.
* Role selection fallback/error state includes Sign Out so users can recover by switching accounts.
* Account screen now owns role switching and sign-out UI.
* Home and Merchant screens link to Account instead of exposing role switching directly.
* `pnpm run compile` passes.
* `pnpm run lint:check` passes.
* `pnpm run bundle:web` passes.
* Generated `dist/` directory was removed after verification.
* Website repository was not modified.

---

# 5. Phase 3 — Supabase Data Access Layer

## Objective

Build a shared Supabase data access layer inside the React Native app while reusing the existing database schema and business rules.

Before creating any service:

* Audit existing website queries.
* Search existing helpers.
* Search existing Supabase logic.
* Mirror reusable queries inside React Native services.
* Keep the website repository unchanged.

Never duplicate business logic.

### Completion Checklist

* [x] Audit existing website queries for the initial membership/content slices.
* [ ] Mirror reusable queries inside React Native services. Membership, news, events, offers, and sponsors queries mirrored.
* [x] Keep the website repository unchanged.
* [x] Create typed Supabase service modules. Initial `app/services/supabase/` module added.
* [x] Reuse existing Clerk authentication. Initial Supabase client uses Clerk's session token through Supabase's `accessToken` option.
* [x] Ensure all queries respect Row Level Security. Initial membership service filters by authenticated Clerk `userId`; content services rely on RLS-visible rows.

### Phase 3 Progress Notes

* Previous website data-access changes were removed after the architecture update.
* Website repository is now read-only reference material unless explicitly requested otherwise.
* Added public Supabase config to mobile config using the website reference implementation's public URL and anon key.
* Added dependencies: `@supabase/supabase-js`, `react-native-url-polyfill`, and `zod`.
* Removed unused Ignite network client files.
* Added typed Supabase foundation under `app/services/supabase/`.
* Added initial dashboard-oriented membership service in `app/services/supabase/membership.ts`.
* Wired `HomeScreen` to load membership summary with Clerk's current session token.
* Fixed membership scoping so registration lookup filters by authenticated Clerk `userId`.
* Added typed Supabase services for `membership_news`, `member_events`, `partner_offers`, and `sponsors`.
* Added Zod schemas and response types for membership, news, events, offers, and sponsors.
* `pnpm run compile` passes after the content service additions.
* `pnpm run lint:check` passes after the content service additions.
* `pnpm run bundle:web` passes after the content service additions.
* Generated `dist/` directory was removed after verification.

---

# 6. Membership Supabase Service

Create a dashboard-oriented membership Supabase service inside React Native.

Return a dashboard-oriented data shape.

Example:

```json
{
  "member": {},
  "membership": {
    "active": true,
    "tier": "...",
    "badge": "...",
    "expiresAt": "...",
    "daysRemaining": 42,
    "renewable": true
  },
  "quickActions": [],
  "renewal": {}
}
```

The React Native app must follow the existing membership business rules from the website reference implementation and rely on Supabase RLS for user isolation.

### Completion Checklist

* [x] Membership service returns computed data. Initial service returns member, membership, quick actions, and renewal fields.
* [x] Dashboard requires minimal Supabase queries. Initial service uses latest registration plus latest PayPal/UPay subscription checks.
* [x] Membership calculations follow existing business rules. Initial active/expiry logic mirrors the website reference implementation.
* [x] Queries respect Supabase Row Level Security. Initial service filters by Clerk auth `userId` instead of UI-provided identity.

---

# 7. Expand Phase 4 — Data Layer

In addition to React Query:

Configure MMKV persistence.

Cache:

* Membership summary
* Announcements
* Events
* Sponsors
* Offers

Do not cache:

* Payments
* Support messages
* Sensitive write operations

### Completion Checklist

* [x] React Query configured.
* [x] MMKV persistence configured.
* [x] Offline cache implemented for membership summary, announcements, events, sponsors, and offers.
* [x] Sensitive data operations excluded from persistence. Query metadata supports `persist: false` for sensitive operations; no payment, support, or write-operation queries are persisted.

### Phase 4 Progress Notes

* Added `@tanstack/react-query`, `@tanstack/react-query-persist-client`, and `@tanstack/query-sync-storage-persister`.
* Added `app/services/query/QueryProvider.tsx` with MMKV-backed query persistence.
* Added `app/services/query/queryClient.ts` with app-wide query defaults.
* Added `app/services/query/useMembershipSummary.ts`.
* Added `app/services/query/useMemberContent.ts` with persisted query hooks for membership news, current announcements, member events, partner offers, and sponsors.
* Wrapped the app in `AppQueryProvider` inside Clerk.
* Converted `HomeScreen` membership loading from manual effect state to React Query.
* Wired `HomeScreen` to consume cached announcement, events, offers, and sponsors queries so Phase 4 cached resources are active in the app.
* Query keys include the Clerk user ID to avoid reusing persisted member-scoped cache entries across users.
* Removed an unnecessary nested `QueryClientProvider`; `PersistQueryClientProvider` now owns the query client context.
* Persisted queries can be excluded using `meta: { persist: false }`.
* Payment, support, renewal, and write-operation queries have not been added to the persisted cache.
* `pnpm run compile` passes after Phase 4 cache coverage.
* `pnpm run lint:check` passes after Phase 4 cache coverage.
* `pnpm run bundle:web` passes after Phase 4 cache coverage.
* Generated `dist/` directory was removed after verification.

---

# 8. Expand Phase 5 — Design System

Separate Theme from UI Components.

Theme:

```text
theme/

colors
typography
spacing
radius
shadows
animations
```

UI Components:

```text
components/ui/

Button
Card
Badge
Pill
Avatar
Header
Section
Screen
EmptyState
Loading
```

Reusable UI components must never contain business logic.

### Completion Checklist

* [x] Theme extracted.
* [x] UI component library created.
* [x] Website branding applied.
* [x] Ignite branding removed.

### Phase 5 Progress Notes

* Added focused design tokens for `radius`, `shadows`, and `animations` under `app/theme/`.
* Extended the app `Theme` contract to expose `radius`, `shadows`, and `animations` alongside existing `colors`, `spacing`, `typography`, and `timing`.
* Updated light and dark palettes toward BUL Racing branding while preserving existing semantic color keys for compatibility.
* Replaced the Ignite MMKV theme key with `bulRacing.themeScheme`.
* Added initial `app/components/ui/` library wrappers and primitives: `UIButton`, `UICard`, `UIHeader`, `UIScreen`, `UIEmptyState`, `UIAvatar`, `UIBadge`, `UIPill`, `UISection`, and `UILoading`.
* Exported required base component prop types for typed UI wrappers.
* Removed remaining Ignite/Infinite Red documentation references from app source comments.
* `pnpm run compile` passes after Phase 5 design-system changes.
* `pnpm run lint:check` passes after Phase 5 design-system changes.
* `pnpm run bundle:web` passes after Phase 5 design-system changes.
* Generated `dist/` directory was removed after verification.

---

# 9. Offline Strategy

Add a dedicated section.

## Offline Strategy

Cache:

* Membership Card
* Dashboard Summary
* Announcements
* Events
* Sponsors
* Offers

Do NOT cache:

* Payments
* Membership Renewals
* QR Validation
* Support Messages

### Completion Checklist

* [x] Offline strategy documented.
* [x] Cached resources implemented.
* [x] Cache invalidation strategy defined.

### Offline Strategy Progress Notes

* Added `/home/shika/bulfuzq-rn/OFFLINE_STRATEGY.md`.
* Documented cached resources: membership card/dashboard summary, announcements, events, sponsors, and offers.
* Documented non-cached resources: payments, membership renewals, QR validation, support messages, and sensitive writes.
* Added `clearAppQueryCache()` to clear both in-memory TanStack Query state and MMKV persisted query storage.
* Shared the persisted query cache key through `QUERY_CACHE_STORAGE_KEY` so the provider and reset helper cannot drift.
* Wired member, merchant, and account sign-out flows to clear persisted query cache before ending the Clerk session.
* Cache keys for persisted member data include the Clerk user ID.
* Sensitive query opt-out remains available through `meta: { persist: false }`.
* `pnpm run compile` passes after Offline Strategy changes.
* `pnpm run lint:check` passes after Offline Strategy changes.
* `pnpm run bundle:web` passes after Offline Strategy changes.
* Generated `dist/` directory was removed after verification.

---

# 10. Replace Notifications Phase

Replace the existing notification phase completely.

Use OneSignal from the beginning.

Architecture:

```text
OneSignal SDK
       │
NotificationService
       │
Application
```

Do not couple the application directly to OneSignal.

Create a NotificationService abstraction.

Supabase table:

```text
push_devices

id
member_id
platform
one_signal_player_id
app_version
last_seen
created_at
updated_at
```

### Completion Checklist

* [x] OneSignal SDK integrated.
* [x] NotificationService abstraction created.
* [x] Device registration implemented.
* [x] Device removal implemented.
* [x] Supabase table created.
* [x] Supabase device registration service implemented.
* [x] OneSignal Player ID linked to Clerk member.
* [ ] Push notifications verified.

### Notification Progress Notes

* Added `react-native-onesignal` and `onesignal-expo-plugin`.
* Added optional public `EXPO_PUBLIC_ONESIGNAL_APP_ID` config and `hasOneSignalConfig` guard.
* Added OneSignal Expo config plugin entry in `app.json` with development mode.
* Added `app/services/notifications/NotificationService.ts` abstraction.
* Added `app/services/notifications/NotificationBootstrap.tsx` to initialize/register only after Clerk auth is loaded and OneSignal config exists.
* Added Supabase service module `app/services/supabase/pushDevices.ts` for device registration and removal.
* Added migration `/home/shika/bulfuzq-rn/supabase/migrations/202607170003_create_push_devices.sql`.
* Added `push_devices` DB type to `app/services/supabase/database.types.ts`.
* Device registration uses Clerk user ID as `member_id` and OneSignal external ID.
* Member, merchant, and account sign-out flows remove the current push device before clearing query cache and ending the Clerk session.
* Push notification verification remains blocked until a real OneSignal app ID is configured and native device builds are available.
* `pnpm run compile` passes after notification integration.
* `pnpm run lint:check` passes after notification integration.
* `pnpm run bundle:web` passes after notification integration.
* Generated `dist/` directory was removed after verification.

---

# 11. Image Service

Create an image service.

The Supabase service layer should always return complete image URLs.

The mobile app should never know:

* Supabase bucket names
* Storage paths
* Storage implementation

### Completion Checklist

* [x] Image service created.
* [x] Supabase services return usable URLs.
* [x] App contains no storage-specific logic.

### Image Service Progress Notes

* Added `app/services/images/imageService.ts` and `app/services/images/index.ts`.
* Added image normalization for absolute URLs, protocol-relative URLs, and website-root-relative paths.
* Mirrored the website sponsor behavior by preserving non-image sponsor icon identifiers while normalizing image-like values.
* Updated Supabase services for membership news, member events, partner offers, and sponsors to return normalized image/logo/icon values.
* Kept storage/path normalization inside the service layer so screens do not need bucket names, storage paths, or storage implementation details.
* `pnpm run compile` passes after Image Service changes.
* `pnpm run lint:check` passes after Image Service changes.
* `pnpm run bundle:web` passes after Image Service changes.
* Generated `dist/` directory was removed after verification.

---

# 12. Deep Linking

Add a future phase.

Support:

* Universal Links
* Android App Links
* Custom Scheme

Examples:

```text
bulracing://events/123

https://bulfuzq.com/events/123
```

### Completion Checklist

* [x] Universal Links configured.
* [x] Android App Links configured.
* [x] Custom scheme configured.
* [x] Deep links navigate correctly for currently implemented screens and member dashboard content routes.

### Deep Linking Progress Notes

* Added `app/navigators/linking.ts` as the single React Navigation linking configuration.
* Added custom scheme support for `bulracing://` while preserving the existing `bulfuzq-rn://` development scheme.
* Added website URL prefixes for `https://bulfuzq.com` and `https://www.bulfuzq.com`.
* Configured route paths for sign-in, sign-up, role selection, member home, merchant home, and account.
* Mapped dashboard content links such as `/events/:id`, `/offers/:id`, `/news/:id`, `/sponsors`, `/membership`, and `/racing-team` to the member home until dedicated detail screens are implemented.
* Added iOS associated domains for `applinks:bulfuzq.com` and `applinks:www.bulfuzq.com`.
* Added Android App Links intent filter with `autoVerify` for `bulfuzq.com` and `www.bulfuzq.com`.
* `pnpm exec expo config --type public` validates the deep-link config shape.
* `pnpm run compile` passes after Deep Linking changes.
* `pnpm run lint:check` passes after Deep Linking changes.
* `pnpm run bundle:web` passes after Deep Linking changes.
* Generated `dist/` directory was removed after verification.

---

# Phase 6 — Member Dashboard

## Objective

Build the primary authenticated member experience using the existing design system, TanStack Query, and Supabase services.

## Features

* Dashboard welcome section
* Membership status summary
* Quick action cards
* Membership Card quick action
* Events quick action
* Offers quick action
* Announcements quick action
* Sponsors quick action
* Current announcement banner
* Upcoming event preview
* Latest offers preview
* Featured sponsors preview
* Pull-to-refresh support
* Loading, empty and error states
* Offline-aware experience

### Completion Checklist

* [x] Dashboard welcome section implemented.
* [x] Membership status summary implemented.
* [x] Quick action cards implemented.
* [x] Current announcement banner implemented.
* [x] Upcoming event preview implemented.
* [x] Latest offers preview implemented.
* [x] Featured sponsors preview implemented.
* [x] Pull-to-refresh updates all dashboard content.
* [x] Loading states implemented.
* [x] Empty states implemented.
* [x] Error states implemented.
* [x] Offline-aware cached experience implemented.
* [ ] Dashboard loads correctly for authenticated members.
* [ ] Cached data displays correctly when offline.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.
* [x] Documentation updated.

### Phase 6 Progress Notes

* Replaced the placeholder `HomeScreen` with a scrollable member dashboard.
* Added welcome hero content using Clerk profile data.
* Added membership status summary using the cached membership query.
* Added quick action cards for Membership Card, Events, Offers, Announcements, and Sponsors.
* Added current announcement, upcoming event, latest offer, and featured sponsor previews using cached TanStack Query hooks.
* Added pull-to-refresh that refetches membership, announcement, events, offers, and sponsors together.
* Added setup, loading, empty, and error states.
* Dashboard data uses the existing persisted query cache for offline-aware display after first successful load.
* Quick action cards are visual entry points until Phase 7-11 detail/list screens exist.
* `pnpm run compile` passes after Phase 6 dashboard implementation.
* `pnpm run lint:check` passes after Phase 6 dashboard implementation.
* `pnpm run bundle:web` passes after Phase 6 dashboard implementation.
* Generated `dist/` directory was removed after verification.

---

# Phase 7 — Digital Membership Card

## Objective

Create the digital membership card experience.

## Features

* Premium branded membership card
* Member information
* Membership package
* Membership status badge
* Expiry / renewal information
* QR Code
* Full-screen card view
* Offline availability
* Secure handling of sensitive membership data

## Future Ready

* QR validation
* Merchant scanning
* Event check-in

### Completion Checklist

* [x] Premium branded card implemented.
* [x] Member information displayed.
* [x] Membership package displayed.
* [x] Membership status badge displayed.
* [x] Expiry / renewal information displayed.
* [x] QR code renders correctly.
* [x] Full-screen card view implemented.
* [x] Offline viewing works.
* [x] Sensitive membership data handled securely.
* [x] Card loads from Supabase.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.
* [x] Documentation updated.

### Phase 7 Progress Notes

* Added `react-native-svg` and `react-native-qrcode-svg` for QR rendering.
* Added `app/screens/MembershipCardScreen.tsx`.
* Added `MembershipCard` to navigation types, member stack, and deep-link config.
* Wired the member dashboard Membership Card quick action to the new screen.
* Membership card uses the existing cached `useMembershipSummary()` query for Supabase-backed data and offline viewing after first load.
* QR payload only includes a typed version marker and member registration ID; future server-side validation is still required before merchant scanning/check-in flows.
* The screen handles loading, refresh errors, inactive memberships, and accounts without a membership record.
* `pnpm run compile` passes after Phase 7 implementation.
* `pnpm run lint:check` passes after Phase 7 implementation.
* `pnpm run bundle:web` passes after Phase 7 implementation.
* Generated `dist/` directory was removed after verification.

---

# Phase 8 — Announcements

## Objective

Implement the announcements experience.

## Features

* Announcement list
* Announcement details
* Read/unread state
* Pull-to-refresh
* Empty state
* Offline cache
* Deep linking support

### Completion Checklist

* [x] Announcement list implemented.
* [x] Announcement details implemented.
* [x] Read/unread state implemented.
* [x] Pull-to-refresh implemented.
* [x] Empty state implemented.
* [x] Offline cache implemented.
* [x] Deep linking support implemented.
* [x] Announcement feed loads.
* [x] Details open correctly.
* [x] Read state persists.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.
* [x] Documentation updated.

### Phase 8 Progress Notes

* Added `app/screens/AnnouncementsScreen.tsx`.
* Added `app/screens/AnnouncementDetailScreen.tsx`.
* Added `app/services/announcements/readState.ts` with MMKV-backed read-state persistence scoped by Clerk user ID.
* Added `useMembershipNewsItem(id)` for cached announcement detail reads.
* Added `Announcements` and `AnnouncementDetail` routes to navigation.
* Added deep links for `news` and `news/:id`.
* Wired dashboard Announcements quick action to the announcement list.
* Wired the dashboard current announcement preview to open announcement details.
* Announcement list supports pull-to-refresh, unread badges, empty state, error state, and cached offline reads.
* Announcement details mark items as read and render cached details, image, date, and content.
* `pnpm run compile` passes after Phase 8 implementation.
* `pnpm run lint:check` passes after Phase 8 implementation.
* `pnpm run bundle:web` passes after Phase 8 implementation.
* Generated `dist/` directory was removed after verification.

---

# Phase 9 — Events

## Objective

Implement the club events experience.

## Features

* Events list
* Event details
* Date and location
* Registration status
* Calendar integration
* Pull-to-refresh
* Offline cache
* Deep linking support

## Future Ready

* Event check-in QR
* RSVP support

### Completion Checklist

* [ ] Events list implemented.
* [ ] Event details implemented.
* [ ] Date and location displayed.
* [ ] Registration status displayed.
* [ ] Calendar integration implemented.
* [ ] Pull-to-refresh implemented.
* [ ] Offline cache implemented.
* [ ] Deep linking support implemented.
* [ ] Events display correctly.
* [ ] Calendar integration works.
* [ ] Deep links resolve correctly.
* [ ] Compile passes.
* [ ] Lint passes.
* [ ] Bundle passes.
* [ ] Documentation updated.

### Phase 9 Progress Notes

* Not started.

---

# Phase 10 — Partner Offers

## Objective

Implement the partner offers experience.

## Features

* Offers list
* Offer details
* Sponsor information
* Validity period
* Terms & conditions
* Pull-to-refresh
* Offline cache
* Deep linking support

## Future Ready

* Merchant QR redemption
* Redemption history

### Completion Checklist

* [ ] Offers list implemented.
* [ ] Offer details implemented.
* [ ] Sponsor information displayed.
* [ ] Validity period displayed.
* [ ] Terms & conditions displayed.
* [ ] Pull-to-refresh implemented.
* [ ] Offline cache implemented.
* [ ] Deep linking support implemented.
* [ ] Offers load correctly.
* [ ] Detail screen functions.
* [ ] Deep links work.
* [ ] Compile passes.
* [ ] Lint passes.
* [ ] Bundle passes.
* [ ] Documentation updated.

### Phase 10 Progress Notes

* Not started.

---

# Phase 11 — Sponsors

## Objective

Create the sponsor directory.

## Features

* Sponsor listing
* Sponsor details
* Logo
* Description
* Website
* Contact information
* Social media links
* Maps integration
* Deep linking support

### Completion Checklist

* [ ] Sponsor listing implemented.
* [ ] Sponsor details implemented.
* [ ] Sponsor logo displayed.
* [ ] Sponsor description displayed.
* [ ] Sponsor website link implemented.
* [ ] Sponsor contact information displayed.
* [ ] Social media links implemented.
* [ ] Maps integration implemented.
* [ ] Deep linking support implemented.
* [ ] Sponsors load correctly.
* [ ] External links open correctly.
* [ ] Compile passes.
* [ ] Lint passes.
* [ ] Bundle passes.
* [ ] Documentation updated.

### Phase 11 Progress Notes

* Not started.

---

# Phase 12 — Account

## Objective

Provide complete account management.

## Features

* Member profile
* Active role
* Role switching
* Language selection
* Notification preferences
* Logout
* App information
* Privacy & Terms
* Contact support

### Completion Checklist

* [ ] Member profile implemented.
* [ ] Active role displayed.
* [ ] Role switching functions.
* [ ] Language selection implemented.
* [ ] Notification preferences implemented.
* [ ] Logout clears session and cache.
* [ ] App information displayed.
* [ ] Privacy & Terms links implemented.
* [ ] Contact support entry point implemented.
* [ ] Account updates correctly.
* [ ] Compile passes.
* [ ] Lint passes.
* [ ] Bundle passes.
* [ ] Documentation updated.

### Phase 12 Progress Notes

* Initial account screen exists with active role, role switching, and logout.

---

# Phase 13 — Merchant Experience

## Objective

Implement the merchant-facing application flow.

## Features

* Merchant dashboard
* Merchant profile
* Active offers
* Member QR scanner
* Membership validation
* Offer redemption
* Redemption confirmation
* Offline handling

## Future Ready

* Analytics
* Staff accounts
* Multi-location merchants

### Completion Checklist

* [ ] Merchant dashboard implemented.
* [ ] Merchant profile implemented.
* [ ] Active offers implemented.
* [ ] Member QR scanner implemented.
* [ ] Membership validation implemented.
* [ ] Offer redemption implemented.
* [ ] Redemption confirmation implemented.
* [ ] Offline handling implemented.
* [ ] Merchant flow works correctly.
* [ ] QR scanning validates memberships.
* [ ] Redemption flow completes successfully.
* [ ] Compile passes.
* [ ] Lint passes.
* [ ] Bundle passes.
* [ ] Documentation updated.

### Phase 13 Progress Notes

* Initial merchant placeholder screen exists.

---

# Phase 14 — Support

## Objective

Integrate member support.

## Features

* Support home
* Existing conversation list
* Chat interface
* Image attachments
* Conversation status
* Push notification integration

### Completion Checklist

* [ ] Support home implemented.
* [ ] Existing conversation list implemented.
* [ ] Chat interface implemented.
* [ ] Image attachments implemented.
* [ ] Conversation status implemented.
* [ ] Push notification integration implemented.
* [ ] Messages send and receive.
* [ ] Attachments upload successfully.
* [ ] Existing conversations load.
* [ ] Compile passes.
* [ ] Lint passes.
* [ ] Bundle passes.
* [ ] Documentation updated.

### Phase 14 Progress Notes

* Not started.

---

# Phase 15 — Push Notifications

## Objective

Complete production notification support.

## Features

* OneSignal integration
* Notification permission flow
* Foreground notifications
* Background notifications
* Deep-link routing
* Notification inbox synchronization
* Badge count support

### Completion Checklist

* [x] OneSignal integration started.
* [ ] Notification permission flow completed.
* [ ] Foreground notifications implemented.
* [ ] Background notifications implemented.
* [ ] Deep-link routing implemented.
* [ ] Notification inbox synchronization implemented.
* [ ] Badge count support implemented.
* [ ] Android notifications verified.
* [ ] iOS notifications verified.
* [ ] Deep links open correct screens.
* [ ] Notification badges update correctly.
* [ ] Compile passes.
* [ ] Lint passes.
* [ ] Bundle passes.
* [ ] Documentation updated.

### Phase 15 Progress Notes

* Initial OneSignal SDK integration, `NotificationService`, device registration, and `push_devices` migration exist.
* Production push verification remains blocked until OneSignal app ID and native device builds are available.

---

# Phase 16 — Production Readiness

## Objective

Prepare the application for public release.

## Features

* Performance audit
* Accessibility audit
* Final UI polish
* Error handling review
* Loading state review
* Analytics verification
* Deep link verification
* Offline verification
* Security review
* App Store assets
* Google Play assets
* Internal testing
* Release candidate build

### Completion Checklist

* [ ] Performance audit completed.
* [ ] Accessibility audit completed.
* [ ] Final UI polish completed.
* [ ] Error handling review completed.
* [ ] Loading state review completed.
* [ ] Analytics verified.
* [ ] Deep links verified.
* [ ] Offline behavior verified.
* [ ] Security review completed.
* [ ] App Store assets prepared.
* [ ] Google Play assets prepared.
* [ ] Internal testing completed.
* [ ] Release candidate build completed.
* [ ] Android release build passes.
* [ ] iOS release build passes.
* [ ] Store submissions are ready.
* [ ] All planned features are complete.

### Phase 16 Progress Notes

* Not started.

---

# 17. Engineering Rules

Append the following rules.

* Search the existing codebase before creating new files.
* Refactor existing implementations instead of copying them.
* Leave the repository cleaner than it was found.
* Keep files focused and small.
* Prefer composition over duplication.
* Avoid unnecessary abstractions.
* Every Supabase service must be typed.
* Every feature must update `IMPLEMENTATION_PLAN.md`.
* The website repository is read-only unless explicitly instructed otherwise.
* Before modifying the website, stop and request confirmation.
* Prefer direct Supabase access over creating website data routes.
* The mobile application should contain its own typed data service layer.
* Reuse the existing database schema without modifying the website implementation.
* Respect existing Supabase Row Level Security policies.
* Every phase must finish with:

  * [ ] Compile passes.
  * [ ] Lint passes.
  * [ ] Build passes.
  * [ ] Documentation updated.
  * [ ] No duplicated business logic introduced.
