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

* [ ] React Query configured.
* [ ] MMKV persistence configured.
* [ ] Offline cache implemented.
* [ ] Sensitive data operations excluded from persistence.

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

* [ ] Theme extracted.
* [ ] UI component library created.
* [ ] Website branding applied.
* [ ] Ignite branding removed.

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

* [ ] Offline strategy documented.
* [ ] Cached resources implemented.
* [ ] Cache invalidation strategy defined.

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

* [ ] OneSignal SDK integrated.
* [ ] NotificationService abstraction created.
* [ ] Device registration implemented.
* [ ] Device removal implemented.
* [ ] Supabase table created.
* [ ] Supabase device registration service implemented.
* [ ] OneSignal Player ID linked to Clerk member.
* [ ] Push notifications verified.

---

# 11. Image Service

Create an image service.

The Supabase service layer should always return complete image URLs.

The mobile app should never know:

* Supabase bucket names
* Storage paths
* Storage implementation

### Completion Checklist

* [ ] Image service created.
* [ ] Supabase services return usable URLs.
* [ ] App contains no storage-specific logic.

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

* [ ] Universal Links configured.
* [ ] Android App Links configured.
* [ ] Custom scheme configured.
* [ ] Deep links navigate correctly.

---

# 13. Garage Profile

Move Garage Profile into its own future phase.

Treat it as a major feature.

Expected work:

* Database tables
* Image uploads
* Editing
* Moderation
* Admin support

### Completion Checklist

* [ ] Database designed.
* [ ] Supabase services implemented.
* [ ] Profile editing completed.
* [ ] Upload flow completed.
* [ ] Admin management supported.

---

# 14. Final Production Phase

Add a final phase called:

## Production Readiness

### Completion Checklist

* [ ] EAS Build configured.
* [ ] EAS Update configured.
* [ ] Production environment configured.
* [ ] Staging environment configured.
* [ ] Environment validation completed.
* [ ] Sentry integrated.
* [ ] Analytics verified.
* [ ] OneSignal production verified.
* [ ] Android release checklist completed.
* [ ] iOS release checklist completed.
* [ ] Performance audit completed.

---

# 15. Engineering Rules

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
