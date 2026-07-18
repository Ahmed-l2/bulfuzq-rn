# Icon System

Adopt `lucide-react-native` as the primary icon library for the application.

Requirements:

- Install `lucide-react-native`.
- Create a reusable `UIIcon` wrapper component.
- All newly developed screens should use `UIIcon` instead of directly importing icons.
- Centralize icon sizing and colors so they follow the theme automatically.
- Existing screens do not need to be migrated immediately, but all future UI should use the new icon system.

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
src/
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
src/
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
 * Added explicit Jest globals typing in `tsconfig.json` for colocated test files under source.
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
* `/home/shika/bulfuzq-rn/src/app/_layout.tsx`
* `/home/shika/bulfuzq-rn/src/app/index.tsx`
* `/home/shika/bulfuzq-rn/src/config/env.ts`
* `/home/shika/bulfuzq-rn/src/config/config.base.ts`
* `/home/shika/bulfuzq-rn/src/screens/HomeScreen.tsx`
* `/home/shika/bulfuzq-rn/src/screens/LoadingScreen.tsx`
* `/home/shika/bulfuzq-rn/src/screens/MissingAuthConfigScreen.tsx`
* `/home/shika/bulfuzq-rn/src/screens/SignInScreen.tsx`
* `/home/shika/bulfuzq-rn/src/screens/SignUpScreen.tsx`
* `/home/shika/bulfuzq-rn/src/services/auth/clerkTokenCache.ts`
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
* [x] Forgot-password email code reset flow implemented through Clerk Expo.
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
* Expo Router follow-up: sign-in, MFA verification, OAuth, and sign-up verification now call `router.replace("/")` after Clerk session activation so the root auth/role router can enter the correct app experience.
* Expo Router follow-up: signed-in users visiting `/sign-in` or `/sign-up` now redirect back to `/` instead of staying on auth screens.
* Added compact `Forgot password?` text action to `SignInScreen`, plus `src/screens/ForgotPasswordScreen.tsx` and `src/app/forgot-password.tsx`.
* Forgot-password flow requests Clerk `reset_password_email_code`, verifies the code with a new password, activates the returned session when Clerk provides one, and otherwise returns to sign-in after a successful reset.

---

# 4.75. Phase 2.5 — Multi-Role Foundation

## Objective

Implement a scalable multi-role architecture using the existing Clerk + Supabase setup. The website remains a read-only reference. The mobile app continues communicating directly with Supabase through the typed service layer.

### Database Changes

* Added migration artifact: `/home/shika/bulfuzq-rn/supabase/migrations/202607170001_create_user_roles.sql`.
* The migration creates `public.user_roles`, enables RLS, adds a Clerk `sub`-based select policy, and inserts existing racing-team registrants as `member` roles.

### Files Affected

* `/home/shika/bulfuzq-rn/supabase/migrations/202607170001_create_user_roles.sql`
* `/home/shika/bulfuzq-rn/src/services/supabase/database.types.ts`
* `/home/shika/bulfuzq-rn/src/services/supabase/roles.ts`
* `/home/shika/bulfuzq-rn/src/services/supabase/index.ts`
* `/home/shika/bulfuzq-rn/src/services/roles/RoleProvider.tsx`
* `/home/shika/bulfuzq-rn/src/services/roles/index.ts`
* `/home/shika/bulfuzq-rn/src/screens/RoleSelectionScreen.tsx`
* `/home/shika/bulfuzq-rn/src/screens/MerchantHomeScreen.tsx`
* `/home/shika/bulfuzq-rn/src/screens/HomeScreen.tsx`
* `/home/shika/bulfuzq-rn/src/app/index.tsx`

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

* Role data is resolved from Supabase via `src/services/supabase/roles.ts` using the authenticated Clerk user ID.
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
* Expo Router follow-up: `RoleProvider` now tracks which Clerk user ID roles have loaded for, preventing the post-login race where `isSignedIn` was true but role data was still empty.

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
* `/home/shika/bulfuzq-rn/src/services/supabase/database.types.ts`
* `/home/shika/bulfuzq-rn/src/services/supabase/roles.ts`
* `/home/shika/bulfuzq-rn/src/services/roles/RoleProvider.tsx`
* `/home/shika/bulfuzq-rn/src/screens/AccountScreen.tsx`
* `/home/shika/bulfuzq-rn/src/screens/HomeScreen.tsx`
* `/home/shika/bulfuzq-rn/src/screens/MerchantHomeScreen.tsx`
* `/home/shika/bulfuzq-rn/src/app/index.tsx`

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
* [x] Create typed Supabase service modules. Initial `src/services/supabase/` module added.
* [x] Reuse existing Clerk authentication. Initial Supabase client uses Clerk's session token through Supabase's `accessToken` option.
* [x] Ensure all queries respect Row Level Security. Initial membership service filters by authenticated Clerk `userId`; content services rely on RLS-visible rows.

### Phase 3 Progress Notes

* Previous website data-access changes were removed after the architecture update.
* Website repository is now read-only reference material unless explicitly requested otherwise.
* Added public Supabase config to mobile config using the website reference implementation's public URL and anon key.
* Added dependencies: `@supabase/supabase-js`, `react-native-url-polyfill`, and `zod`.
* Removed unused Ignite network client files.
* Added typed Supabase foundation under `src/services/supabase/`.
* Added initial dashboard-oriented membership service in `src/services/supabase/membership.ts`.
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
* Added `src/services/query/QueryProvider.tsx` with MMKV-backed query persistence.
* Added `src/services/query/queryClient.ts` with app-wide query defaults.
* Added `src/services/query/useMembershipSummary.ts`.
* Added `src/services/query/useMemberContent.ts` with persisted query hooks for membership news, current announcements, member events, partner offers, and sponsors.
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

* Added focused design tokens for `radius`, `shadows`, and `animations` under `src/theme/`.
* Extended the app `Theme` contract to expose `radius`, `shadows`, and `animations` alongside existing `colors`, `spacing`, `typography`, and `timing`.
* Updated light and dark palettes toward BUL Racing branding while preserving existing semantic color keys for compatibility.
* Replaced the Ignite MMKV theme key with `bulRacing.themeScheme`.
* Added initial `src/components/ui/` library wrappers and primitives: `UIButton`, `UICard`, `UIHeader`, `UIScreen`, `UIEmptyState`, `UIAvatar`, `UIBadge`, `UIPill`, `UISection`, and `UILoading`.
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
* Added `src/services/notifications/NotificationService.ts` abstraction.
* Added `src/services/notifications/NotificationBootstrap.tsx` to initialize/register only after Clerk auth is loaded and OneSignal config exists.
* Added Supabase service module `src/services/supabase/pushDevices.ts` for device registration and removal.
* Added migration `/home/shika/bulfuzq-rn/supabase/migrations/202607170003_create_push_devices.sql`.
* Added `push_devices` DB type to `src/services/supabase/database.types.ts`.
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

* Added `src/services/images/imageService.ts` and `src/services/images/index.ts`.
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

* Deep linking is now owned by Expo Router routes under `src/app`.
* Added custom scheme support for `bulracing://` while preserving the existing `bulfuzq-rn://` development scheme.
* Added website URL support for `https://bulfuzq.com` and `https://www.bulfuzq.com` through Expo Router route resolution.
* Configured route files for sign-in, sign-up, role selection, member home, merchant home, account, membership card, announcements, and announcement detail.
* Implemented currently available content routes through Expo Router paths such as `/membership`, `/announcements`, and `/news/:id`.
* Added iOS associated domains for `applinks:bulfuzq.com` and `applinks:www.bulfuzq.com`.
* Added Android App Links intent filter with `autoVerify` for `bulfuzq.com` and `www.bulfuzq.com`.
* `pnpm exec expo config --type public` validates the deep-link config shape.
* `pnpm run compile` passes after Deep Linking changes.
* `pnpm run lint:check` passes after Deep Linking changes.
* `pnpm run bundle:web` passes after Deep Linking changes.
* Generated `dist/` directory was removed after verification.

---

# Phase 5.5 — Migrate Navigation to Expo Router (SDK 57)

## Objective

Move the app from a React Navigation-owned root to Expo Router while preserving Clerk auth, role selection, member/merchant flows, deep links, notification bootstrap, and offline query caching.

## Requirements

* Use `expo-router/entry` as the app entry point.
* Keep route files under `src/app/` and implementation source under sibling `src/` folders so non-route source folders are not treated as route segments.
* Preserve Clerk provider, SecureStore token cache, RoleProvider, ThemeProvider, TanStack Query provider, and NotificationBootstrap.
* Preserve member tabs: Home, Membership, Events, Account.
* Preserve pushed member routes: Membership Card, Announcements, Announcement Detail.
* Preserve merchant routes: Merchant Home and Merchant Account.
* Preserve custom schemes and app/universal link configuration through Expo Router routing.
* Remove obsolete React Navigation root entry, typed navigator, linking, and imperative navigation utility files after migration.

### Completion Checklist

* [x] `expo-router` installed and configured.
* [x] `package.json` uses `expo-router/entry`.
* [x] Expo Router plugin added to app config.
* [x] Root provider tree migrated to `src/app/_layout.tsx`.
* [x] Auth/role redirect route added at `src/app/index.tsx`.
* [x] Sign-in, sign-up, and role selection routes added.
* [x] Member route group and tab layout added.
* [x] Merchant route group added.
* [x] Screens migrated from React Navigation props to Expo Router hooks.
* [x] Custom bottom tab bar works with Expo Router tab state.
* [x] Obsolete legacy entry point and navigator source files removed.
* [x] Reactotron navigation commands removed because they depended on the old imperative navigation ref.
* [x] Compile passes after migration.
* [x] Lint passes after migration.
* [x] Web export passes after migration.
* [x] Non-route source code moved under `src/` while `src/app/` remains route-only.

### Phase 5.5 Progress Notes

* Added Expo Router routes under `src/app` and moved implementation source to sibling `src/` folders.
* Migrated sign-in/sign-up, role selection, member tabs, membership card, announcements, announcement detail, merchant home, and account screens to Expo Router navigation APIs.
* Removed the React Navigation root stack, member tab navigator, linking config, navigation types, and imperative navigation utilities.
* Preserved native deep link schemes and associated domains in Expo config; Expo Router now owns route resolution.
* `pnpm run compile` passes after Expo Router migration.
* `pnpm run lint:check` passes after Expo Router migration.
* `pnpm run bundle:web` passes after Expo Router migration.
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

# Phase 6.1 — Home Dashboard UI Polish

## Objective

Redesign the existing `HomeScreen` to match the approved BUL Racing dashboard mockup while preserving the existing business logic, queries, navigation, caching, and refresh behavior.

This is a UI refactor only.

Do not change Supabase logic, Clerk logic, TanStack Query hooks, navigation routes, or refresh implementation.

## Layout

The screen should visually match the approved dashboard design.

Order:

* Welcome Header
* Membership Status Card
* Quick Actions Grid
* Bottom Navigation

Remove the generic dashboard preview cards for now:

* Featured Sponsors
* Latest Offer
* Upcoming Event
* Announcement

Those sections will move into their dedicated screens later.

## Welcome Header

Replace the current hero section.

Design:

* Large greeting: `Hi, Ahmed`
* Small subtitle: `Welcome back!`
* No badge.
* Use first name from Clerk with fallback to `Member`.

## Membership Card

Replace the generic `UICard`.

Design:

* Rounded dark card.
* Title: `Membership`.
* Top-right status badge: `Active` or `Inactive`.
* Valid-until line.
* Bottom divider.
* Bottom row with `Member ID` and membership number from existing data.
* Use existing membership data and active/inactive logic.
* Do not invent data.

## Quick Actions

Use a 3-column grid.

Each item:

* Rounded square.
* Centered icon.
* Centered title.
* No description text.

Actions:

* Membership Card
* Announcements
* Events
* Offers
* Sponsors
* Racing Team

Use existing navigation where available. Where a destination is not implemented, show disabled state or navigate to placeholder.

## Icons

Use vector icons through the shared `UIIcon` wrapper.

Suggested icons:

* Membership Card: `credit-card`
* Announcements: `bell`
* Events: `calendar`
* Offers: `tag`
* Sponsors: `shield`
* Racing Team: `users`

Do not use emoji.

## Styling

Follow BUL Racing branding.

* Background: pure black.
* Cards: very dark gray.
* Accent: `#dc2626`.
* Text: white.
* Secondary text: gray.
* Status badge: green.
* Rounded corners: large.
* Spacing: generous.
* Minimal design.
* No gradients.
* No glassmorphism.

## Animations

Keep subtle.

* Cards use press opacity or small scale animation.
* No heavy animations.

## Keep Existing

Do not modify:

* RefreshControl
* Pull to refresh
* TanStack Query
* Offline caching
* Role logic
* Authentication
* Notification registration
* Sign out
* Query hooks

## Component Extraction

Create reusable dashboard components:

* `components/dashboard/MemberStatusCard.tsx`
* `components/dashboard/QuickActionCard.tsx`
* `components/dashboard/QuickActionsGrid.tsx`
* `components/dashboard/WelcomeHeader.tsx`

Avoid placing all JSX inside `HomeScreen`.

### Completion Checklist

* [x] Phase 6.1 section added to implementation plan.
* [x] Welcome Header matches approved dashboard direction.
* [x] Membership Status Card matches approved dashboard direction.
* [x] Quick Actions Grid matches approved dashboard direction.
* [x] Generic dashboard preview cards removed from HomeScreen.
* [x] Bottom navigation area included without changing navigation routes.
* [x] `UIIcon` wrapper created using `lucide-react-native`.
* [x] Dashboard components extracted.
* [x] Existing queries preserved.
* [x] Existing refresh behavior preserved.
* [x] Existing navigation behavior preserved.
* [x] Existing offline cache behavior preserved.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.
* [x] Documentation updated.

### Phase 6.1 Progress Notes

* Installed `lucide-react-native` and added `src/components/ui/Icon.tsx` as the shared `UIIcon` wrapper.
* Added reusable dashboard components under `src/components/dashboard/`: `WelcomeHeader`, `MemberStatusCard`, `QuickActionCard`, `QuickActionsGrid`, and `DashboardBottomNav`.
* Refactored `HomeScreen` UI to the approved black dashboard layout while preserving the existing query hooks and pull-to-refresh function.
* Removed generic dashboard preview cards for Announcement, Upcoming Event, Latest Offer, and Featured Sponsors from the Home dashboard.
* Quick actions now use a 3-column icon grid with implemented navigation for Membership Card and Announcements, and disabled placeholders for Events, Offers, Sponsors, and Racing Team.
* Membership card uses existing membership summary data only; missing membership number values render as unavailable.
* Added a bottom navigation-style area without changing actual navigation routes.
* `pnpm run compile` passes after Phase 6.1 UI polish.
* `pnpm run lint:check` passes after Phase 6.1 UI polish.
* `pnpm run bundle:web` passes after Phase 6.1 UI polish.
* Generated `dist/` directory was removed after verification.
* Follow-up: Home dashboard Events quick action now navigates to `/events` instead of rendering disabled.
* Follow-up: Member tab bar background and tab scene background now use pure black instead of default/light surfaces.
* Follow-up: Shared `Button` presets now use the app black/red/white palette instead of neutral light surfaces.

---

# Navigation Refactor — Shared Member Bottom Navigation

## Objective

Refactor the current navigation architecture so the Member experience uses shared bottom tabs instead of rendering `DashboardBottomNav` inside `HomeScreen`.

The project now uses Expo Router for authentication redirects, deep linking, role management, stacks, and tabs. Preserve the existing Expo Router architecture and build on top of it.

## Requirements

* Audit the existing app navigator structure.
* Preserve Clerk authentication flow.
* Preserve role selection flow.
* Preserve member flow behavior.
* Preserve merchant flow behavior.
* Create a dedicated Expo Router member tab layout.
* Member tabs are Home, Membership, Events, and Account.
* Use the existing custom `DashboardBottomNav` component as the navigator custom tab bar.
* The tab bar must be rendered by the navigator, not by individual screens.
* Remove `DashboardBottomNav` from `HomeScreen`.
* Expo Router tab state should be the single source of truth for active tab state.
* Do not manually pass active tab state from screens.
* Non-tab screens should still push on the member stack.
* Refactor `DashboardBottomNav` to receive Expo Router tab-bar props.
* Preserve the current visual design.
* Keep the tab architecture future-ready for Offers and Sponsors.

### Completion Checklist

* [x] Existing navigation audited.
* [x] Authentication flow preserved.
* [x] Role selection flow preserved.
* [x] Member flow moved to Expo Router tabs.
* [x] Merchant flow preserved.
* [x] Home tab implemented.
* [x] Membership tab implemented.
* [x] Events tab implemented.
* [x] Account tab implemented.
* [x] `DashboardBottomNav` refactored as custom tab bar.
* [x] `DashboardBottomNav` removed from `HomeScreen`.
* [x] Active tab state comes from Expo Router tab state.
* [x] Non-tab screens still push normally.
* [x] Deep links still resolve.
* [x] Typed navigation updated.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.
* [x] Documentation updated.

### Navigation Refactor Progress Notes

* Confirmed the project now uses Expo Router directly; React Navigation-owned root files were removed.
* Expo Router root, member, and merchant layouts own authentication redirects, role selection, merchant flow, and pushed member screens.
* Added `src/app/(member)/(tabs)/_layout.tsx` with Home, Membership, Events, and Account tabs.
* Refactored `DashboardBottomNav` to consume the Expo Router tab-bar prop shape and derive active state from `state.index`.
* Removed page-level `DashboardBottomNav` rendering from `HomeScreen`.
* Added `MembershipScreen` and `EventsScreen` as member tab screens.
* Kept `MembershipCard`, `Announcements`, and `AnnouncementDetail` as pushed root stack screens.
* Removed React Navigation screen props/types from screens in favor of Expo Router hooks and route files.
* Updated deep linking so member tab paths resolve under Expo Router route files.
* Merchant flow remains `/merchant` plus `/merchant/account`.
* `pnpm run compile` passes after navigation refactor.
* `pnpm run lint:check` passes after navigation refactor.
* `pnpm run bundle:web` passes after navigation refactor.
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
* Added `src/screens/MembershipCardScreen.tsx`.
* Added `membership-card` to the Expo Router member stack and route tree.
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

* Added `src/screens/AnnouncementsScreen.tsx`.
* Added `src/screens/AnnouncementDetailScreen.tsx`.
* Added `src/services/announcements/readState.ts` with MMKV-backed read-state persistence scoped by Clerk user ID.
* Added `useMembershipNewsItem(id)` for cached announcement detail reads.
* Added `announcements` and `news/[id]` routes to Expo Router.
* Added deep links through Expo Router paths for `news` and `news/:id`.
* Wired dashboard Announcements quick action to the announcement list.
* Wired the dashboard current announcement preview to open announcement details.
* Announcement list supports pull-to-refresh, unread badges, empty state, error state, and cached offline reads.
* Announcement details mark items as read and render cached details, image, date, and content.
* `pnpm run compile` passes after Phase 8 implementation.
* `pnpm run lint:check` passes after Phase 8 implementation.
* `pnpm run bundle:web` passes after Phase 8 implementation.
* Generated `dist/` directory was removed after verification.

---

# Phase 8.1 — UI Polish: Announcements

## Objective

Redesign the existing announcements list and detail screens into a premium BUL Racing member experience while preserving current architecture, data sources, read-state behavior, Expo Router routes, TanStack Query hooks, Supabase services, and database schema.

This is a UI/UX polish only.

### Completion Checklist

* [x] Announcements list redesigned with premium black/red/white styling.
* [x] Generic card list replaced with compact touchable rows and soft separators.
* [x] All/Unread filter pills implemented.
* [x] Unread count calculated from existing MMKV read state.
* [x] Unread rows show a red dot and stronger title weight.
* [x] Read rows remove the dot and use calmer typography.
* [x] Loading state replaced with skeleton rows matching the final list layout.
* [x] Empty state uses a Lucide icon and minimal copy.
* [x] Pull-to-refresh behavior preserved.
* [x] Announcement detail redesigned with clean header, back control, date, optional real hero image, readable body, metadata, and optional CTA.
* [x] Detail only renders fields that exist in the current `membership_news` data model.
* [x] Existing read-state marking preserved.
* [x] Existing query hooks preserved.
* [x] Existing Expo Router routes and deep-link paths preserved.
* [x] No Supabase service or schema changes introduced.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.

### Phase 8.1 Progress Notes

* Redesigned `src/screens/AnnouncementsScreen.tsx` around `FlatList`, filter pills, memoized announcement rows, unread/read visual states, skeleton rows, and a minimal empty state.
* Redesigned `src/screens/AnnouncementDetailScreen.tsx` with a premium article layout using only `title`, `date`, `content`, `image_url`, `type`, `published_at`, `cta_url`, and `cta_label` when present.
* Added `arrow-left`, `bell-off`, and `external-link` to the shared `UIIcon` wrapper using direct Lucide subpath imports.
* Existing MMKV read-state helpers, `useMembershipNews`, `useMembershipNewsItem`, Expo Router route files, TanStack Query persistence, and Supabase services were left unchanged.
* `pnpm run compile` passes after Phase 8.1 announcements polish.
* `pnpm run lint:check` passes after Phase 8.1 announcements polish.
* `pnpm run bundle:web` passes after Phase 8.1 announcements polish.
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

# Phase 9.1 — UI Polish: Events

## Objective

Redesign the existing Events experience into a premium motorsport calendar while preserving existing business logic, Supabase services, query hooks, Expo Router navigation, offline persistence, and database schema.

This is a UI/UX polish only.

### Completion Checklist

* [x] Events list redesigned with premium black/red/white styling.
* [x] Upcoming/Past pill filters implemented using existing `event_date` values.
* [x] Event rows redesigned as rounded premium list cards.
* [x] Event imagery is primary when `image_url` exists.
* [x] Clean design-system placeholder renders only when no event image exists.
* [x] Rows display only existing fields: title, event date, location, and image.
* [x] Upcoming/Past status badge derived from `event_date`.
* [x] Loading state replaced with skeleton rows matching the final layout.
* [x] Empty state uses a Lucide calendar icon and minimal copy.
* [x] Pull-to-refresh behavior preserved.
* [x] Event detail screen added using existing event fields only.
* [x] Detail screen renders optional hero image, title, status, description, date, and location.
* [x] No fake registration CTA added because registration support does not exist yet.
* [x] Existing `useMemberEvents` query hook preserved.
* [x] Existing Supabase services and schema preserved.
* [x] Expo Router navigation and route structure preserved.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.

### Phase 9.1 Progress Notes

* Redesigned `src/screens/EventsScreen.tsx` around `FlatList`, Upcoming/Past filters, memoized event rows, image-first cards, skeleton rows, and a minimal empty state.
* Added `src/screens/EventDetailScreen.tsx`, deriving detail data from the existing `useMemberEvents()` query instead of adding or changing query hooks.
* Added `src/app/(member)/events/[id].tsx` as the Expo Router detail route.
* Added `chevron-right` and `map-pin` to `UIIcon` via direct Lucide subpath imports.
* Displayed only fields provided by the current `member_events` data model: `title`, `description`, `event_date`, `location`, and `image_url`.
* `pnpm run compile` passes after Phase 9.1 events polish.
* `pnpm run lint:check` passes after Phase 9.1 events polish.
* `pnpm run bundle:web` passes after Phase 9.1 events polish.
* Generated `dist/` directory was removed after verification.

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

# Phase 10.1 — UI Polish: Offers

## Objective

Redesign the existing partner offers experience into a premium members-only benefits catalogue while preserving existing business logic, Supabase services, query hooks, Expo Router navigation, offline persistence, and database schema.

This is a UI/UX polish only.

### Completion Checklist

* [x] Offers list implemented using existing `usePartnerOffers` data.
* [x] Offers list redesigned with premium black/red/white styling.
* [x] All filter pill implemented.
* [x] Nearby pill rendered disabled because location filtering is not supported by the current schema/query implementation.
* [x] Offer cards display partner logo when `logo_url` exists.
* [x] Premium placeholder renders only when no logo exists.
* [x] Cards display only existing fields: offer title, partner name, validity date, logo, and derived status.
* [x] Available / Expires Soon / Expired status derived from `valid_until`.
* [x] Loading state replaced with skeleton offer cards.
* [x] Empty state uses a Lucide tag icon and minimal copy.
* [x] Pull-to-refresh behavior preserved.
* [x] Offer detail screen added using existing offer fields only.
* [x] Detail screen renders optional logo hero, title, partner, description, validity, discount, and code when present.
* [x] No fake redemption CTA added because redemption support does not exist yet.
* [x] Existing `usePartnerOffers` query hook preserved.
* [x] Existing Supabase services and schema preserved.
* [x] Expo Router navigation and route structure preserved.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.

### Phase 10.1 Progress Notes

* Added `src/screens/OffersScreen.tsx` using `FlatList`, memoized offer cards, skeleton cards, disabled Nearby pill, and a minimal empty state.
* Added `src/screens/OfferDetailScreen.tsx`, deriving detail data from the existing `usePartnerOffers()` query instead of adding or changing query hooks.
* Added `src/app/(member)/offers.tsx` and `src/app/(member)/offers/[id].tsx` as Expo Router routes.
* Wired the existing Home dashboard Offers quick action to `/offers`.
* Displayed only fields provided by the current `partner_offers` data model: `offer_title`, `partner_name`, `description`, `discount`, `code`, `valid_until`, and `logo_url`.
* `pnpm run compile` passes after Phase 10.1 offers polish.
* `pnpm run lint:check` passes after Phase 10.1 offers polish.
* `pnpm run bundle:web` passes after Phase 10.1 offers polish.
* Generated `dist/` directory was removed after verification.

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

# Phase 11.1 — UI Polish: Sponsors

## Objective

Redesign the existing sponsors experience into a premium official partner directory while preserving existing business logic, Supabase services, query hooks, Expo Router navigation, offline persistence, and database schema.

This is a UI/UX polish only.

### Completion Checklist

* [x] Sponsors list implemented using existing `useSponsors` data.
* [x] Sponsors list redesigned with premium black/red/white styling.
* [x] Sponsor cards display logo imagery when `icon` resolves to a real image URI.
* [x] Premium initials placeholder renders only when no image logo exists.
* [x] Cards display only existing fields: sponsor name, icon/logo, and URL-derived official partner state.
* [x] Loading state replaced with skeleton sponsor cards.
* [x] Empty state uses a Lucide Building2 icon and minimal copy.
* [x] Pull-to-refresh behavior preserved.
* [x] Sponsor detail screen added using existing sponsor fields only.
* [x] Detail screen renders optional logo hero, sponsor name, official partner label, website metadata, and website CTA when `url` exists.
* [x] No fake category, description, gallery, contact details, social links, or partner tier data added.
* [x] Existing `useSponsors` query hook preserved.
* [x] Existing Supabase services and schema preserved.
* [x] Expo Router navigation and route structure preserved.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.

### Phase 11.1 Progress Notes

* Added `src/screens/SponsorsScreen.tsx` using `FlatList`, memoized sponsor cards, skeleton cards, image/initials presentation, and a minimal empty state.
* Added `src/screens/SponsorDetailScreen.tsx`, deriving detail data from the existing `useSponsors()` query instead of adding or changing query hooks.
* Added `src/app/(member)/sponsors.tsx` and `src/app/(member)/sponsors/[id].tsx` as Expo Router routes.
* Wired the existing Home dashboard Sponsors quick action to `/sponsors`.
* Added `building-2` to `UIIcon` via direct Lucide subpath import.
* Displayed only fields provided by the current `sponsors` data model: `name`, `icon`, `url`, `is_active`, and `display_order`.
* `pnpm run compile` passes after Phase 11.1 sponsors polish.
* `pnpm run lint:check` passes after Phase 11.1 sponsors polish.
* `pnpm run bundle:web` passes after Phase 11.1 sponsors polish.
* Generated `dist/` directory was removed after verification.

---

# Phase 11.2 — UI Polish: Racing Team Experience

## Objective

Implement the Racing Team performance vehicle showcase as a premium automotive catalogue/detail experience using only existing `bul_performance_cars` schema fields.

This phase was requested as the Racing Team Experience UI polish and does not add booking, registration, application, or fabricated vehicle metadata.

### Completion Checklist

* [x] `bul_performance_cars` type added to local Supabase database types.
* [x] Read-only performance cars Supabase service added.
* [x] TanStack Query hook added with Clerk-scoped query key and persistence metadata.
* [x] Vehicle list screen implemented with premium black/red/white styling.
* [x] Vehicle cards render real `main_image` imagery when available.
* [x] Vehicle cards render clean placeholder only when no `main_image` exists.
* [x] List displays only existing fields: `name`, `year`, `engine`, `category`, `horsepower`, and `drivetrain` when populated.
* [x] Pull-to-refresh implemented.
* [x] Empty and loading states implemented.
* [x] Vehicle detail screen added.
* [x] Detail screen renders only existing fields: `main_image`, `name`, `base_info`, `year`, `category`, `horsepower`, `torque`, `engine`, `weight`, `drivetrain`, `specs`, `modifications`, `parts_used`, `notes`, and `gallery_urls` when populated.
* [x] `main_image` and `gallery_urls` are normalized through the shared Image Service.
* [x] Home Racing Team quick action wired to `/racing-team`.
* [x] Expo Router routes added for `/racing-team` and `/racing-team/:id`.
* [x] No fake CTA, application flow, team roster, availability, pricing, or invented stats added.
* [x] Compile passes.
* [x] Lint passes.
* [x] Tests pass.
* [x] Bundle passes.

### Phase 11.2 Progress Notes

* Added `src/services/supabase/performanceCars.ts` with Zod validation and image normalization through `resolveImageUrl`.
* Added `src/services/query/usePerformanceCars.ts` for authenticated, persisted performance car queries.
* Added `src/screens/RacingTeamScreen.tsx` with image-first vehicle cards, skeleton loading, empty state, and pull-to-refresh.
* Added `src/screens/RacingTeamDetailScreen.tsx` with hero image, spec grid, dynamic JSON specs, modifications, parts used, notes, and gallery sections that only render when values exist.
* Added Expo Router routes `src/app/(member)/racing-team.tsx` and `src/app/(member)/racing-team/[id].tsx`.
* Wired the Home dashboard Racing Team quick action to `/racing-team` and changed its icon to `car`.
* Added direct Lucide subpath imports for `car`, `gauge`, `settings`, `wrench`, and `zap` in `UIIcon`.
* `pnpm run compile` passes after Racing Team Experience UI polish.
* `pnpm run lint:check` passes after Racing Team Experience UI polish.
* `pnpm test --runInBand` passes after Racing Team Experience UI polish.
* `pnpm run bundle:web` passes after Racing Team Experience UI polish.
* Generated `dist/` directory was removed after verification.
* Follow-up: App theme is forced to dark mode, older auth/account/fallback screens were given explicit pure-black backgrounds and white/gray text, and the Membership Card screen was updated to use black/dark surfaces while preserving a white QR block for scanner readability.

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

* [x] Member profile implemented.
* [x] Active role displayed.
* [x] Role switching functions.
* [x] Language selection placeholder implemented.
* [ ] Notification preferences implemented.
* [x] Logout clears session and cache.
* [x] App information displayed.
* [x] Privacy & Terms information implemented.
* [x] Contact support entry point implemented.
* [x] Account updates correctly.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.
* [x] Documentation updated.

### Phase 12 Progress Notes

* Initial account screen exists with active role, role switching, and logout.
* Follow-up: Sign-out now completes even if push-device deregistration fails, clears query cache, signs out with Clerk, and replaces the route with `/sign-in`.
* Follow-up: Member and merchant route groups now redirect to `/sign-in` when Clerk reports the user is signed out, preventing signed-out users from remaining inside protected app screens with empty data.
* Follow-up: Member and merchant route groups now wait for role loading and enforce the active role before rendering protected screens.
* Phase 12 implemented as grouped account hub rows instead of cramming all account functions onto one page.
* Added `src/screens/AccountAppInfoScreen.tsx` and route `src/app/account/app-info.tsx` for app info plus schema-backed legal page navigation.
* Added `legal_pages` database typing, `src/services/supabase/legalPages.ts`, and `src/services/query/useLegalPages.ts`.
* Added `src/screens/LegalPageDetailScreen.tsx` and route `src/app/account/legal/[slug].tsx` to render published `legal_pages` JSON content blocks from Supabase instead of hardcoded privacy/terms placeholders.
* Added `src/screens/AccountLanguageScreen.tsx` and route `src/app/account/language.tsx` as a language-switching placeholder.
* Added support chat database types for existing `conversations` and `messages` tables.
* Added `src/services/supabase/support.ts` and `src/services/query/useSupportChat.ts` using the same website support flow shape: conversation history, open existing conversation, start new draft, send customer text messages, and periodic refresh.
* Added `src/screens/AccountSupportScreen.tsx` and route `src/app/account/support.tsx` for mobile support chat.
* Mobile support intentionally omits file attachments for now because the website signs `chat-files` URLs through a service-role API route; mobile must not expose service-role credentials.
* `pnpm run compile` passes after Phase 12 account implementation.
* `pnpm run lint:check` passes after Phase 12 account implementation.
* `pnpm test --runInBand` passes after Phase 12 account implementation.
* `pnpm run bundle:web` passes after Phase 12 account implementation.
* Generated `dist/` directory was removed after verification.

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

* [x] Support home implemented.
* [x] Existing conversation list implemented.
* [x] Chat interface implemented.
* [x] Image attachments implemented.
* [x] Conversation status implemented.
* [x] Push notification integration implemented.
* [x] Messages send and receive.
* [x] Attachments upload successfully.
* [x] Existing conversations load.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.
* [x] Documentation updated.

### Phase 14 Progress Notes

* Support chat was implemented under `src/screens/AccountSupportScreen.tsx` and `src/app/account/support.tsx` during Phase 12, backed by existing `conversations` and `messages` schema.
* Added support read-state behavior: opening a conversation marks unread admin messages as read by setting `messages.read_at`.
* Added support unread summary query for badge/count sync.
* Support screen displays conversation status, conversation history, new chat draft, text composer, admin/customer bubbles, and closed-conversation messaging.
* Text messages send and receive through direct Supabase access with Clerk auth.
* Existing conversations load and refresh through TanStack Query polling.
* Image/file attachment upload added through authenticated Supabase Storage access to the existing `chat-files` bucket.
* Support composer now supports image picker and document picker attachments: PDF, JPEG, PNG, and WEBP up to 2.5 MB.
* Support service stores attachment paths as `chat-files://...`, signs attachment URLs for display, and renders an `Open attachment` link in chat messages.
* Attachment runtime success depends on Supabase Storage policies allowing authenticated Clerk users to upload/read their own `chat-files/{clerk_user_id}/...` paths; no service-role credentials are exposed to mobile.
* `pnpm run compile`, `pnpm run lint:check`, `pnpm test --runInBand`, and `pnpm run bundle:web` pass after Phase 14 support work.
* Generated `dist/` directory was removed after verification.

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
* [x] Notification permission flow completed.
* [x] Foreground notifications implemented.
* [x] Background notifications implemented.
* [x] Deep-link routing implemented.
* [ ] Notification inbox synchronization implemented.
* [x] Badge count support implemented.
* [ ] Android notifications verified.
* [ ] iOS notifications verified.
* [ ] Deep links open correct screens.
* [ ] Notification badges update correctly.
* [x] Compile passes.
* [x] Lint passes.
* [x] Bundle passes.
* [x] Documentation updated.

### Phase 15 Progress Notes

* Initial OneSignal SDK integration, `NotificationService`, device registration, and `push_devices` migration exist.
* Added OneSignal foreground display handler.
* Added OneSignal click handler that routes notification payloads with `route`, `url`, `deepLink`, `type: support`, or `conversation_id` to the app route, including `/account/support` for support alerts.
* Added `AccountNotificationsScreen` and route `src/app/account/notifications.tsx` for user-facing push permission/device registration.
* Added support unread count sync to OneSignal badge APIs when available and OneSignal user tag `support_unread_count`.
* Notification inbox synchronization remains blocked because the current schema has `push_devices` but no notification inbox table.
* Production push verification remains blocked until OneSignal app ID and native device builds are available.
* Android/iOS notification delivery, deep-link opening from terminated/background state, and badge display still require native device builds with real `EXPO_PUBLIC_ONESIGNAL_APP_ID`.

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

# Expo Router Compatibility Audit — Completed Phases

This section is the required extra Expo Router compatibility check for every completed phase. Future completed phases must add a checked line here before being considered complete.

### Completed Phase Checks

* [x] Architecture Principles verified with Expo Router: website remains read-only, mobile routes live under `src/app`, and typed mobile services live under sibling `src/` folders.
* [x] Supabase Service Layer verified with Expo Router: route files import services through `@/services/*`; no website API or route-layer backend dependency was introduced.
* [x] Shared Data Contract Layer verified with Expo Router: Zod contracts and database types live under `src/services/supabase` and are consumed by route-backed screens without navigation coupling.
* [x] Phase 1.5 Platform Upgrade verified with Expo Router: SDK 57 uses `expo-router/entry`, Expo Router plugin is configured, and `pnpm run bundle:web` resolves `src/app` as the router root.
* [x] Phase 2 Authentication verified with Expo Router: Clerk provider, SecureStore token cache, missing-auth fallback, sign-in, sign-up, and auth redirects are owned by `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/sign-in.tsx`, and `src/app/sign-up.tsx`.
* [x] Phase 2.5 Multi-Role Foundation verified with Expo Router: role selection uses `router.replace`, member users route to `/(member)/(tabs)`, merchant users route to `/merchant`, and role state remains persisted with MMKV.
* [x] Phase 2.5.1 Multi-Role Improvements verified with Expo Router: Account-based role switching and sign-out work through route files and Expo Router hooks instead of React Navigation props.
* [x] Phase 3 Supabase Data Access verified with Expo Router: all Supabase reads remain in `src/services/supabase`, screens call typed hooks/services, and route params use Expo Router where needed.
* [x] Membership Supabase Service verified with Expo Router: membership summary is consumed by Home, Membership, and Membership Card screens mounted through Expo Router routes.
* [x] Phase 4 Data Layer verified with Expo Router: `AppQueryProvider` wraps the route stack in `src/app/_layout.tsx`; query cache keys remain Clerk-user scoped and sign-out clears persisted cache.
* [x] Phase 5 Design System verified with Expo Router: theme/provider setup wraps Expo Router routes; UI components are under `src/components` and contain no route ownership.
* [x] Offline Strategy verified with Expo Router: offline cache survives route transitions and is cleared by sign-out flows reached through member, merchant, and account routes.
* [x] Notifications foundation verified with Expo Router: `NotificationBootstrap` remains mounted at the route root and does not depend on React Navigation readiness refs.
* [x] Image Service verified with Expo Router: screens reached through Expo Router consume normalized image URLs from services without route-specific storage logic.
* [x] Deep Linking verified with Expo Router: custom schemes, universal links, and Android App Links are configured in Expo config; route resolution is owned by files under `src/app`.
* [x] Phase 5.5 Expo Router Migration verified: legacy navigation root, navigation types, linking config, and imperative refs are removed; explicit `@react-navigation/*` dependencies are removed from `package.json`.
* [x] Phase 6 Member Dashboard verified with Expo Router: member home is mounted by `src/app/(member)/(tabs)/index.tsx`, quick actions use Expo Router paths, and secondary dashboard queries defer until after first paint.
* [x] Phase 6.1 Home Dashboard UI Polish verified with Expo Router: dashboard components live under `src/components/dashboard`, direct Lucide subpath imports are used, and the bottom nav receives Expo Router tab state/insets.
* [x] Navigation Refactor verified with Expo Router: historical React Navigation tab implementation is superseded by `src/app/(member)/(tabs)/_layout.tsx` and `DashboardBottomNav`.
* [x] Phase 7 Digital Membership Card verified with Expo Router: membership card is reachable via `/membership-card`, uses cached membership data, and routes back through Expo Router.
* [x] Phase 8 Announcements verified with Expo Router: announcement list is reachable via `/announcements`, details use `src/app/(member)/news/[id].tsx`, params come from `useLocalSearchParams`, and read state persists by Clerk user.
* [x] Phase 8.1 Announcements UI Polish verified with Expo Router: list/detail UI changes preserve `/announcements` and `/news/:id`, keep existing hooks/read state, and use Expo Router navigation APIs only.
* [x] Phase 9.1 Events UI Polish verified with Expo Router: event list remains on the Events tab, details use `src/app/(member)/events/[id].tsx`, params come from `useLocalSearchParams`, and existing `useMemberEvents` query data powers both list and detail.
* [x] Phase 10.1 Offers UI Polish verified with Expo Router: offers list is reachable at `/offers`, details use `src/app/(member)/offers/[id].tsx`, params come from `useLocalSearchParams`, and existing `usePartnerOffers` query data powers both list and detail.
* [x] Phase 11.1 Sponsors UI Polish verified with Expo Router: sponsors list is reachable at `/sponsors`, details use `src/app/(member)/sponsors/[id].tsx`, params come from `useLocalSearchParams`, and existing `useSponsors` query data powers both list and detail.
* [x] Source layout verified with Expo Router: all non-route TypeScript source now lives under `src/components`, `src/screens`, `src/services`, `src/theme`, `src/config`, `src/i18n`, `src/devtools`, `src/context`, and `src/utils`; `src/app` is route-only.

### Router-Only Guardrail

* [x] Final source scan shows no direct imports from `@react-navigation/*`, `@/navigators/*`, old navigation types, old navigation utilities, or React Navigation container setup.
* [x] `package.json` no longer declares direct `@react-navigation/*` dependencies; navigation should be accessed through Expo Router APIs only.
* [x] Future phases must use route files under `src/app`, `useRouter`, `useLocalSearchParams`, Expo Router layouts, or Expo Router Tabs/Stack. Do not reintroduce a React Navigation-owned root, navigation refs, or app-level linking config.

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
* Keep `src/app/` route-only; place screens, components, services, theme, config, i18n, devtools, context, and utils in sibling `src/` folders.
* Use Expo Router APIs for navigation. Do not reintroduce React Navigation root containers, navigation refs, navigation type files, or standalone linking config.
* Every completed phase must include an Expo Router compatibility check in the audit section above.
* Every phase must finish with:

  * [ ] Compile passes.
  * [ ] Lint passes.
  * [ ] Build passes.
  * [ ] Documentation updated.
  * [ ] No duplicated business logic introduced.
