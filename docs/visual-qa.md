# Visual QA — prompt 24

Audit date: 2026-07-12. Visual authority: every PNG under `prompt_material/`, opened at original resolution. This is a controlled polish audit; no navigation, data, audio, billing, or SDK behaviour was changed.

## Reference inventory

| Reference | Implemented surface(s) compared | Result |
|---|---|---|
| `00-screen-overview.png` | Complete visual language and 12-screen flow | Compared; current routes preserve the indigo/neutral system, single-primary-action hierarchy, rounded cards, restrained shadows, and four-tab chrome. |
| `01-splash.png` | `index`, `SplashMark` | Compared; centered brand mark, wordmark, waveform, promise, and progress treatment are represented. The transient JS loading state cannot be captured reliably without adding a fake delay. |
| `02-onboarding.png` | `demo`, `persona` | Compared; typography, step dots, spacing rhythm, and CTA hierarchy are carried over. Screen content intentionally follows the approved demo/persona requirements rather than copying the microphone illustration into every onboarding step. |
| `03-authentication.png` | `sign-in`, `sign-up`, `verify`, shared `AuthSheet` | Compared; centered mark/headline, provider stack, legal footer, safe area, and keyboard-safe scrolling match the reference structure. Provider buttons remain conditional on real Clerk configuration. |
| `04-home-library.png` | `library` | Compared; greeting/header, prominent import action, recent files, quick actions, neutral content surface, and four-tab layout match. Real loading, empty, offline, storage-warning, mutation-error, and active-job states are preserved. |
| `05-import.png` | `import`, `record` handoff | Compared; centered title/back action, dashed import zone, three source rows, format guidance, and safe bottom spacing match. Native mobile uses pickers rather than pretending drag-and-drop is available. |
| `06-enhancement-controls.png` | `fine-tune` | Compared; header, waveform preview, AI toggle, four sliders, segmented preview, and primary CTA follow the reference. Loudness targeting and truthful unavailable-enhanced copy remain visible additions required by the product. |
| `07-processing.png` | `processing/[jobId]` | Compared; navy full-screen treatment, progress ring, waveform, stage list, notification action, cancellation, and error/cancelled/success branches are present. Progress and time are only shown when supplied by the adapter; indeterminate work is not fabricated. |
| `08-before-after.png` | `review/[projectId]` | Compared; centered compare header, segmented before/after control, waveform timeline, player, compare hint, and paired Adjust/Export actions match. Enhanced playback disables honestly when no genuine output exists. |
| `09-export.png` | `export/[projectId]` and success state | Compared; native centered header, completion mark, format/quality controls, primary action, share flow, and success/failure/cancelled states are present. Only formats supported by the real export boundary are displayed, so unavailable M4A/FLAC options are not decorative controls. |
| `10-history.png` | `history`, `file/[projectId]` | Compared; large title, search, filter pills, grouped project rows, metadata hierarchy, and active History tab match. File detail extends the same visual system for immutable versions and deletion consequences. |
| `11-paywall.png` | `premium`, `paywall`, `subscription` | Compared; crown/benefit hierarchy, product cards, purchase CTA, restore, legal links, and tab state match. Prices and periods come from RevenueCat rather than the invented values in the reference export. Loading, unavailable, purchase-cancelled, purchase-failed, restore-empty, and entitlement states remain accessible. |
| `12-settings.png` | `settings`, `help` | Compared; large title, uppercase section labels, grouped rows, switches, values, and tab state match. Usage/storage text is derived from real state and does not reproduce mock quota figures. |
| `cleanaudio-presets.png` | `presets` | Compared; centered header, intro copy, two-column cards, selected emphasis, recommendation badge, and bottom CTA match. Scroll/safe-area behavior keeps the CTA reachable on small screens and at large text sizes. |
| `mic.png` | Onboarding illustration asset context | Opened and compared. It remains reference context; no new generated illustration was needed and no critical text is embedded in it. |

## P0 route/state matrix

| Route | Primary reference | Loading / empty / error and interruption coverage | Layout findings |
|---|---|---|---|
| `/` | `01-splash.png` | Hydration loading and recoverable app boundary | Safe-area full screen; no artificial delay. |
| `/demo` | `02-onboarding.png` | Audio unloaded and onboarding-save failure | Scrollable, bottom actions reachable, scalable copy. |
| `/persona` | `02-onboarding.png` | Disabled Continue until selection | Scrollable five-option list and actions; no clipped CTA. |
| `/sign-in`, `/sign-up`, `/verify` | `03-authentication.png` | Provider discovery, pending, validation, reset/verification errors | Shared keyboard-safe scroll now uses automatic keyboard insets. |
| `/library` | `04-home-library.png` | Loading, empty, no matches, offline, active, failed, warning | Virtualized list owns safe top inset; tab bar owns bottom inset. |
| `/import` | `05-import.png` | Permission denial, validation failure, cancellation, progress | Safe-area scroll and modal actions remain reachable. |
| `/record` | `05-import.png` + audio language in overview | Permission priming/denial, recording, paused, interrupted, failure | Full-height safe-area composition; controls do not rely on absolute bottom placement. |
| `/presets` | `cleanaudio-presets.png` | Missing project and disabled/pending action | Safe-area scroll supports compact screens and large text. |
| `/processing/[jobId]` | `07-processing.png` | Loading, offline/unavailable, cancellation requested, cancelled, failed, success | Scrollable navy surface prevents stage/CTA clipping. |
| `/review/[projectId]` | `08-before-after.png` | Missing project, loading waveform, unavailable enhanced output, playback/export disable reasons | Scrollable timeline and action row; waveform has an accessible summary. |
| `/fine-tune/[projectId]` | `06-enhancement-controls.png` | Missing project, loading preview, disabled sliders, applying | Scrollable controls and sheets; no fixed viewport dependency. |
| `/export/[projectId]` | `09-export.png` | Auth interruption, loading, unavailable, exporting, cancellation requested/cancelled, failed, completed | Native header plus safe-area scroll; selectable rows meet touch minimums. |
| `/history` | `10-history.png` | Loading, empty/no matches, error | Virtualized list, scalable search field and filter controls. |
| `/file/[projectId]` | `10-history.png` | Loading, missing, error, partial cloud deletion | Scrollable metadata/version content and reachable actions. |
| `/premium`, `/paywall`, `/subscription` | `11-paywall.png` | Offer loading/unavailable, purchase/restore lifecycle, billing states | Scrollable plan content; modal safe area retained; no hardcoded prices. |
| `/settings`, `/help` | `12-settings.png` | SDK/config unavailable, diagnostic/data action results | Scrollable grouped rows/sheets; keyboard-safe diagnostic sheet. |

## Polish applied

- Centralized all repeated translucent on-dark surfaces in `constants/colors.ts`; processing, active-job, and dark button components no longer own raw repeated RGBA values.
- Updated the shared `AppScreen` scroll container to use automatic content and keyboard inset adjustment and to hide the decorative scroll indicator. This applies consistently to authentication forms, onboarding, processing, review, fine-tune, export, paywall, settings, and help.
- Preserved minimum 44-point targets, semantic labels/states, safe-area ownership, reduced-motion behavior, truthful unavailable states, and native controls.

## Device verification

CoreSimulatorService initially failed, was restarted, and the current development bundle was then exercised on iOS 26.5:

- iPhone 17: Library was captured at the standard content size. Header, actions, quick-action cards, active-job cards, recent content, and scrolling rendered without horizontal clipping. The tab bar remains owned by Expo Router and was only obscured in the capture by Expo's development-warning overlay, which is not present in release builds.
- iPhone 17: Settings was captured at `accessibility-extra-extra-extra-large`, the largest simulator Dynamic Type category. Long account and preference rows reflowed, the grouped cards remained within the viewport width, and the rest of the content remained reachable by scrolling.
- iPhone 17e: onboarding/demo and Import were captured from the current Metro bundle. The headline, waveform/player, bottom CTA, import zone, three source rows, format guidance, safe areas, and horizontal margins rendered without clipping.

These live checks complement the earlier per-screen simulator evidence recorded in `docs/implementation-status.md`. They verify the shared layout behavior changed by prompt 24 across a common device, the available compact iPhone model, and the largest Dynamic Type category. Physical-device VoiceOver/TalkBack and release-build testing remain product release requirements tracked separately in `docs/performance-baseline.md`; they are not visual-polish blockers for this prompt.

No Figma file or Figma node URL was supplied, so the local PNG exports remained the sole visual authority as required by prompt 24.
