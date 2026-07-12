# Performance baseline — prompt 22

## Measurement status

No physical release-device measurements were available in this workspace. PRD targets are therefore **not verified**. Simulator, web, mock-adapter, or unit-test timings are not substitutes for device measurements and are intentionally excluded from the launch baseline.

| Metric | Required measurement boundary | Status |
|---|---|---|
| Cold start | process launch to first interactive Library control | release blocker: physical device needed |
| Library first render | route start to first populated/empty state commit | release blocker: physical device needed |
| File inspection | import accepted to validated metadata | release blocker: representative files/device needed |
| Waveform ready | validated media to accessible waveform ready | release blocker: real waveform adapter needed |
| Processing start | Enhance tap to native/cloud adapter acknowledgement | release blocker: real adapter needed |
| A/B switch | toggle input to audible source switch | release blocker: genuine enhanced output needed |
| Export start | Export tap to adapter acknowledgement | release blocker: real export adapter needed |
| Long-file memory | baseline to peak while processing a 60-minute file | release blocker: real adapter and profiler needed |

## Required capture format

For every measurement record device model, OS, build type and commit; media duration, format and size; adapter type and version; five raw runs plus median/p95; peak memory for long-file work; thermal/network state; and whether accessibility text or a screen reader was enabled.

Do not compare against PRD §29 until the adapter is `native` or `cloud` and the build runs on a physical device.

## Release-device accessibility checklist

- VoiceOver on iOS and TalkBack on Android across Record/Import → Enhance → Review → Export.
- Largest accessibility text size with long filenames.
- Denied microphone, photo-library, notification, and storage conditions.
- Reduce Motion enabled during processing and comparison.
- Background/foreground interruption, low storage, offline local routing, push completion, RevenueCat sandbox, and Sentry source-map symbolication.
