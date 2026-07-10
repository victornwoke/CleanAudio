# Audio domain, native adapters, and real processing contract

## Working rules

1. Read `AGENTS.md` and `PRD.md` before changing code.
2. Inspect the existing project, installed package versions, routes, components, and configuration before installing or replacing anything.
3. Use the local files listed under **Visual references** as the required visual source. A Figma file may provide extra context, but it must not override the supplied PNG unless the user explicitly approves the change.
4. Preserve working behaviour and existing styling outside this task.
5. Use strict TypeScript. Do not introduce `any`, silent type assertions, duplicate providers, or screen-local SDK initialization.
6. Use Expo-compatible installation commands and a development build for native SDKs. Do not claim native functionality works in Expo Go.
7. Finish loading, empty, permission-denied, offline, cancelled, success, and failure states that apply to this task.
8. Run the available lint, type-check, and relevant tests. Report what was changed and any genuine blockers.


## Objective

Define and implement the production audio-service contract. Integrate a real available adapter when the repository already contains one; otherwise provide compile-safe interfaces and an explicitly labelled development mock.

## Required types

At minimum:

```ts
AudioProject
MediaAsset
AudioVersion
AudioPresetId
MediaInspection
EnhancementRequest
EnhancementJob
EnhancementStage
EnhancementProgress
LoudnessReport
ExportRequest
ExportResult
AudioDomainError
```

## Required services

```txt
services/audio/AudioRecorder.ts
services/audio/MediaInspector.ts
services/audio/WaveformService.ts
services/audio/EnhancementService.ts
services/audio/PlaybackService.ts
services/audio/ExportService.ts
services/audio/AudioServiceFactory.ts
```

## Adapter strategy

- `NativeEnhancementAdapter`: custom native module/Core ML/TFLite/DSP integration
- `CloudEnhancementAdapter`: backend job API and signed uploads
- `DevelopmentMockAdapter`: tests/prototype only; returns labelled demo assets, never a copied source presented as enhanced

## Routing policy

Implement a typed policy using real capability data:

- connectivity
- clip duration
- device capability
- plan entitlement
- user-selected quality
- local model availability

Do not hardcode performance promises the current implementation cannot satisfy.

## Reliability

- idempotency keys
- cancellation
- resumable cloud upload where supported
- checksum/validation
- temporary-file cleanup
- app restart recovery
- meaningful error mapping

## Acceptance criteria

- UI code depends only on service contracts.
- Production builds cannot silently fall back to fake enhancement.
- The adapter selected for a job is recorded in safe metadata.
