# Privacy data map

Status: implementation audit, not legal advice. No production backend deployment was available to verify.

| Data | Source | Local handling | External destination | Purpose | Retention/deletion status |
|---|---|---|---|---|---|
| Raw recordings/imports | microphone, Files, Photos | App-owned file URIs; never store blobs in Zustand/AsyncStorage | Future signed upload only after explicit cloud action | enhancement/export | Local cleanup boundaries exist; deployed cloud lifecycle/cascade absent. |
| Enhanced/exported media | native/cloud adapter | Separate version/export URI; original intended immutable | share destination or future object storage | review/export | Real enhanced output is unavailable; deletion SLA not implemented. |
| Media metadata | inspection/recording | project/version repositories and UI stores | future authenticated API; safe aggregates to telemetry | library, routing, quota | Current repository is in-memory; cloud deletion unavailable. |
| Filename/project title | user/media source | displayed locally | future library API only | user organization | Explicitly forbidden from Sentry, PostHog, OneSignal, and diagnostics; scrubber tests pass. |
| Waveform/levels | audio services | transient UI/domain values | none intended | recording/review | Full waveform arrays are forbidden from persisted stores/telemetry. |
| Clerk identity/session | sign-in | Clerk token cache/SecureStore | Clerk | authentication | Clerk controls session retention; opaque Clerk ID is cross-service identity. |
| Clerk user ID | Clerk | transient context | RevenueCat, OneSignal, PostHog, Sentry | identity/entitlements/messaging/diagnostics | Detached on sign-out by centralized identity sync; dashboard retention must be configured. |
| Email/profile fields | Clerk/user | auth UI/provider | Clerk | authentication/account | Forbidden from app telemetry. Account deletion backend is not deployed. |
| Purchase/customer info | App Store/Play/RevenueCat | RevenueCat SDK state; no local premium authority | RevenueCat and stores | entitlement/purchase/restore | Store/vendor policy applies; server reconciliation/webhooks are not deployed. |
| Push token/subscription | OS/OneSignal | OneSignal SDK | OneSignal/APNs/FCM | job-complete/product notifications | Permission is contextual; deletion/retention dashboard process needs verification. |
| Safe push payload | backend | transient | OneSignal/APNs/FCM | route to completed job | Parser permits opaque job/project IDs and allowlisted route only; private-field tests pass. |
| Crash/performance data | app/runtime | transient SDK queue | Sentry | diagnostics | `sendDefaultPii: false`; auth/query/media scrubbing tested. Release symbolication and retention settings unverified. |
| Product analytics | typed events | transient SDK queue | PostHog | funnels/outcomes | Forbidden-key guard and user opt-out exist. Session replay is disabled; touch autocapture and retention/consent still need review. |
| Notification/persona tags | preferences | Zustand/AsyncStorage metadata | OneSignal | segmentation/preferences | Limited to plan, persona, preset, locale, and notification preference. |
| Preferences/onboarding | user | versioned AsyncStorage/Zustand | safe selected fields to PostHog/OneSignal | UX defaults | Clear/reset behaviour and retention need release-device verification. |
| Diagnostic report | user-initiated | previewed before submit | Sentry | support | Safe app/device fields only; diagnostic sharing can be disabled. |
| Signed URLs/auth headers | backend/Clerk | transient network only | API/object storage | authorized transfer | Forbidden from logs/telemetry; real short-lived production implementation not deployed. |

## Required production controls

- Publish a clear Privacy Policy covering microphone/media, on-device versus cloud processing, vendors, retention, deletion, exports, analytics, push, regional transfers, and user rights.
- Obtain explicit cloud-processing action/consent before upload; never silently route private media to cloud.
- Configure vendor retention, data residency, subprocessors, DPAs, deletion workflows, least-privilege access, and incident response.
- Implement account/data export and deletion across Clerk, app database, object storage, job queue, RevenueCat linkage, OneSignal, PostHog, and Sentry, with idempotency and auditable completion.
- Complete Apple privacy manifests/Privacy Nutrition Labels and Google Play Data safety answers from the final binaries and dashboards, not this code map alone.
- Review PostHog touch autocapture before release; disable it unless the exact captured element metadata and consent basis are approved.
