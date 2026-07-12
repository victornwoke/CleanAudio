# Third-party SDK inventory

Versions are from `package.json` on 2026-07-12.

| SDK | Version | Data/purpose | Initialization and current verification |
|---|---:|---|---|
| Clerk Expo | `^3.7.4` | authentication, session token, opaque user ID | Root `ClerkProvider`; token cache. Email/Google code exists; Apple is disabled. Release auth flow unverified. |
| RevenueCat | `^10.4.2` + UI `^10.4.2` | store customer/entitlement/purchase data | Central bootstrap and identity sync; offerings, purchase, restore, Customer Center wired. Sandbox purchase/restore unverified. |
| OneSignal | RN `5.2.14`, Expo plugin `2.7.0` | push token, permission, opaque external ID, limited tags | Central bootstrap; no launch-time permission request. Native Release build currently fails in the notification extension; real push unverified. |
| Sentry React Native | `~7.11.0` | crashes, traces, safe technical context, opaque user ID | Module-scope init, PII disabled, scrubbers tested. Source-map upload and a symbolicated release event are unverified. |
| PostHog React Native | `^4.55.0` | typed product events, safe person properties, screen/lifecycle events | Root provider, session replay disabled, analytics preference honored. Touch autocapture is enabled; consent/retention and production delivery need verification. |
| Expo Audio | `~57.0.0` | microphone audio, recording state/levels | Contextual microphone permission and recording flow. Native interruption/background matrix unverified. |
| Expo Image Picker / Document Picker | `~57.0.2` / `~57.0.0` | selected media URI/metadata | Contextual import. Format/video extraction and device permissions need full testing. |
| Expo File System / Sharing | `~57.0.0` / `~57.0.3` | app-owned media/export files and share handoff | Local import/export seams. Real transcoding and release-device share testing absent. |
| AsyncStorage | `2.2.0` | non-sensitive preferences/light metadata | Used behind persistence boundaries; must never hold tokens/raw media/entitlement authority. |
| SecureStore | `~57.0.0` | secure token storage through owning auth integration | Native rebuild required; release keychain behaviour unverified. |
| Expo SQLite | `~57.0.0` | durable local project/history/job/export/media metadata | Repository boundary now uses a WAL-mode SQLite database; native rebuild and migration/device testing required. |
| Clerk Backend | current npm dependency | verifies Clerk session tokens on the server enhancement route | Requires server-only `CLERK_SECRET_KEY` plus `CLERK_PUBLISHABLE_KEY`; not part of the client bundle. |
| ElevenLabs Voice Isolator | HTTPS API | real speech/background-noise isolation for explicitly uploaded media | Proxied only through authenticated `/api/enhance`; requires revoked/replaced server-only key and real quality/retention testing before release. |

## Dashboard and release obligations

- Clerk: production instance, approved redirect/deep-link URLs, Apple Sign In, account deletion/export process, allowed origins, session/security policy.
- RevenueCat: production iOS/Android apps, products/offerings/entitlement mapping, restore, webhook verification, transfer policy, sandbox and store-review account.
- OneSignal: production mode, APNs/FCM credentials, notification service extension/App Group correctness, payload allowlist, physical-device delivery/deep-link test.
- Sentry: release/dist naming, CI auth token, source-map/debug-symbol upload, scrubber review, retention, alerts, symbolicated release crash.
- PostHog: region/host, retention, consent/legal basis, autocapture decision, session replay kept off until masking proof, deletion/export process.

Public mobile SDK keys/IDs are configuration identifiers and may ship in a client. Server secrets, webhook secrets, Sentry auth tokens, signing material, provider private keys, and storage/AI credentials must remain in protected CI/backend secret stores.
