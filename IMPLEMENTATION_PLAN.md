# Implementation Plan Updates

Apply the following architectural changes to `IMPLEMENTATION_PLAN.md` before continuing with Phase 2.

These updates supersede any conflicting items in the current plan.

---

# 1. Add Architecture Principles

Create a new section near the top called:

## Architecture Principles

- Website remains the single backend and source of truth.
- React Native is another client of the website.
- Business logic must never be duplicated.
- Server Actions and Mobile APIs must share the same underlying service layer.
- Every new API endpoint must call reusable services instead of implementing its own logic.
- Authentication belongs exclusively to Clerk.
- Membership calculations belong exclusively to the server.
- Supabase service-role keys must never leave the backend.
- Mobile contains presentation logic only.
- APIs should be reusable by future web, admin and mobile clients.

---

# 2. Shared Backend Service Layer

Before creating any new API endpoints, create a reusable backend service layer.

Suggested structure:

```text
lib/
    services/
        membership/
        news/
        events/
        offers/
        sponsors/
        support/
        notifications/
        images/
````

### Completion Checklist

* [ ] Shared service layer created.
* [ ] Existing Server Actions refactored to use shared services.
* [ ] Mobile API routes use shared services.
* [ ] No duplicated Supabase queries.
* [ ] No duplicated business logic.
* [ ] Existing website behavior remains unchanged.

Architecture:

```text
React Native
      │
      ▼
API Route
      │
      ▼
Shared Service
      │
      ▼
Supabase
```

Website:

```text
Website
      │
Server Action
      │
      ▼
Shared Service
      │
      ▼
Supabase
```

---

# 3. Shared API Contract Layer

Create a shared API contract layer.

Suggested structure:

```text
lib/
    mobile/
        schemas/
        responses/
        types/
```

Use Zod for:

* Request validation
* Response validation
* Shared types

### Completion Checklist

* [ ] Shared schemas created.
* [ ] Shared response types created.
* [ ] Zod validation implemented.
* [ ] Mobile endpoints return typed responses.
* [ ] API contracts are versioned.

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

### API Endpoints Involved

* None. Backend API authentication starts in Phase 3.

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

# 5. Update Phase 3

Replace the objective with:

> Build a reusable backend service layer first, then expose versioned APIs that reuse those services.

Before creating any endpoint:

* Search existing Server Actions.
* Search existing helpers.
* Search existing Supabase logic.
* Extract shared logic whenever possible.

Never duplicate business logic.

### Completion Checklist

* [ ] Existing logic audited before new code.
* [ ] Shared services extracted where needed.
* [ ] APIs consume shared services only.
* [ ] No duplicated membership logic.

---

# 6. Membership API

Replace the simple membership endpoint.

Return a dashboard-oriented response.

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

The React Native app must never calculate membership status.

### Completion Checklist

* [ ] Membership endpoint returns computed data.
* [ ] Dashboard requires minimal API calls.
* [ ] Membership calculations occur only on the server.

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
* [ ] Sensitive endpoints excluded from persistence.

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

Backend table:

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

Endpoints:

```text
POST   /api/mobile/v1/push-device
DELETE /api/mobile/v1/push-device
```

### Completion Checklist

* [ ] OneSignal SDK integrated.
* [ ] NotificationService abstraction created.
* [ ] Device registration implemented.
* [ ] Device removal implemented.
* [ ] Backend table created.
* [ ] API endpoints implemented.
* [ ] OneSignal Player ID linked to Clerk member.
* [ ] Push notifications verified.

---

# 11. Image Service

Create an image service.

The backend should always return complete image URLs.

The mobile app should never know:

* Supabase bucket names
* Storage paths
* Storage implementation

### Completion Checklist

* [ ] Image service created.
* [ ] Backend returns usable URLs.
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
* [ ] Backend APIs implemented.
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
* Every API must be typed.
* Every feature must update `IMPLEMENTATION_PLAN.md`.
* Every phase must finish with:

  * [ ] Compile passes.
  * [ ] Lint passes.
  * [ ] Build passes.
  * [ ] Documentation updated.
  * [ ] No duplicated business logic introduced.
