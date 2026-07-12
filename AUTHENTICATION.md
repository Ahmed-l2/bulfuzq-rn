# Authentication

Clerk is the authentication provider for both the BULFUZQ website and the BUL Racing mobile app. It was chosen because the website already uses Clerk in production, membership records in Supabase are keyed by Clerk user IDs, and using the same Clerk instance keeps user identity identical across web and mobile.

## Auth Flow

```text
React Native app
  -> Clerk Expo SDK
  -> Clerk session/JWT
  -> Website mobile API route
  -> Shared website service layer
  -> Supabase
```

The mobile app signs users in with Clerk Expo. After sign-in, the app receives a Clerk session. Mobile API requests must include a Clerk token in the `Authorization: Bearer <token>` header. Website API routes validate that token with Clerk, then call the existing backend service layer. Supabase service-role access remains server-only inside the website/backend.

## Token Storage

Clerk session tokens are cached through Expo SecureStore via the Clerk Expo token cache. Tokens must not be stored in MMKV, AsyncStorage, plain files, logs, or app state beyond the Clerk SDK session lifecycle.

MMKV may still be used for non-sensitive preferences only.

## Authenticated APIs

All member-specific mobile APIs require authentication, including:

- `GET /api/mobile/v1/me`
- `GET /api/mobile/v1/membership`
- `GET /api/mobile/v1/announcements`
- `GET /api/mobile/v1/news`
- `GET /api/mobile/v1/events`
- `GET /api/mobile/v1/offers`
- `GET /api/mobile/v1/membership-card`
- `POST /api/mobile/v1/push-device`
- Support endpoints that read or write user-specific conversations

Public endpoints may exist later only when they expose non-member, non-user-specific content.

## API Validation

Future website API endpoints must validate Clerk authentication before calling business logic. API routes should extract the bearer token, verify it with Clerk server tooling, and use the verified Clerk `userId` as the only user identity passed into shared services.

Do not trust user IDs sent from the mobile app body, query string, or headers. The authenticated Clerk token is the source of truth.

## Sign Out And Refresh

Sign out is handled through Clerk Expo. Calling Clerk sign-out clears the active session and SecureStore-backed token cache. Navigation should immediately return to the unauthenticated flow.

Token refresh is handled by Clerk. API clients should request the current token from Clerk before making authenticated requests instead of caching bearer tokens manually.

## Identity Rules

- Mobile and website must use the same Clerk instance.
- Mobile must use the same Clerk publishable key as the website environment for the target deployment.
- Supabase membership records continue to use Clerk user IDs.
- No mobile-specific user table or parallel authentication system should be created.
