# Authentication

Clerk is the authentication provider for both the BULFUZQ website and the BUL Racing mobile app. It was chosen because the website already uses Clerk in production, membership records in Supabase are keyed by Clerk user IDs, and using the same Clerk instance keeps user identity identical across web and mobile.

## Auth Flow

```text
React Native app
  -> Clerk Expo SDK
  -> Clerk session/JWT
  -> Clerk Supabase JWT
  -> Supabase
```

The mobile app signs users in with Clerk Expo. After sign-in, the app receives a Clerk session and uses Clerk's official Supabase third-party auth integration to access Supabase with the authenticated Clerk session token. The website is reference-only for schema, query, business-rule, and UI/UX guidance.

Supabase uses the public project URL and anon key in mobile config. Service-role keys must never be added to the React Native app.

Sign-in supports Clerk-required additional verification. If Clerk returns `needs_first_factor` or `needs_second_factor`, the app prepares and submits supported code factors inline instead of stopping at an incomplete sign-in state. Supported code factors are email code, phone code, authenticator app code, and backup code.

Social sign-in uses Clerk Expo SSO for Google and Apple. These providers must be enabled in the shared Clerk dashboard, and redirect URLs must allow the Expo app scheme `bulfuzq-rn://` for native development builds. iOS native builds declare `usesAppleSignIn` in `app.json`.

## Token Storage

Clerk session tokens are cached through Expo SecureStore via the Clerk Expo token cache. Tokens must not be stored in MMKV, AsyncStorage, plain files, logs, or app state beyond the Clerk SDK session lifecycle.

MMKV may still be used for non-sensitive preferences only.

## Authenticated Supabase Access

All member-specific Supabase services require Clerk authentication, including:

- Membership profile access
- Membership summary access
- Announcements access
- News access
- Events access
- Offers access
- Membership card access
- Push device registration
- Support data that reads or writes user-specific conversations

Public Supabase reads may exist later only when Row Level Security allows non-member, non-user-specific content.

## Supabase Validation

React Native Supabase services must use the authenticated Clerk session token through Supabase's `accessToken` option. Queries must rely on Supabase Row Level Security and must not trust user IDs passed from UI state.

Do not trust user IDs sent from form input, route params, local storage, or component state. The authenticated Clerk token is the source of truth.

## Sign Out And Refresh

Sign out is handled through Clerk Expo. Calling Clerk sign-out clears the active session and SecureStore-backed token cache. Navigation should immediately return to the unauthenticated flow.

Token refresh is handled by Clerk. Supabase services should request the current Clerk session token before authenticated queries instead of caching bearer tokens manually.

## Identity Rules

- Mobile and website must use the same Clerk instance.
- Mobile must use the same Clerk publishable key as the website environment for the target deployment.
- The app reads the key from `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, falling back to `app/config/config.dev.ts` or `app/config/config.prod.ts` for the current Ignite environment.
- Google and Apple sign-in must remain configured in Clerk, not implemented as separate mobile-only identity providers.
- Supabase membership records continue to use Clerk user IDs.
- The mobile app communicates directly with Supabase using Clerk authentication.
- The website repository is reference-only unless explicitly requested otherwise.
- No mobile-specific user table or parallel authentication system should be created.
