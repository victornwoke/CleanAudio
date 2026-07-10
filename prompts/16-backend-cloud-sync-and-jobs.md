# Backend API, cloud jobs, and library sync

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

Implement or scaffold a secure backend contract for cloud processing, project metadata, signed media transfer, entitlement verification, and sync.

## API domains

```txt
POST   /v1/uploads
POST   /v1/enhancement-jobs
GET    /v1/enhancement-jobs/:id
POST   /v1/enhancement-jobs/:id/cancel
GET    /v1/projects
GET    /v1/projects/:id
PATCH  /v1/projects/:id
DELETE /v1/projects/:id
POST   /v1/projects/:id/exports
POST   /v1/account/delete
POST   /v1/revenuecat/webhook
```

Adapt to the actual backend framework.

## Security

- Verify Clerk JWT server-side.
- Authorize every project/job by owner ID.
- Use short-lived signed upload/download URLs.
- Validate content type, size, checksum, duration, and ownership.
- Use idempotency keys.
- Rate-limit job creation.
- Never trust client plan flags; verify RevenueCat entitlement/webhook-derived state.
- Do not log signed URLs or media content.
- Keep webhook secrets server-side.

## Sync

- local-first metadata
- explicit sync states
- conflict strategy
- retry queue with backoff
- tombstones/deletion propagation
- cloud sync gated by entitlement
- offline operations remain usable for local projects

## Job completion

Support app polling with bounded backoff and a OneSignal completion notification. Notification payload carries only a job/project opaque ID; the app fetches authorized details after opening.

## Acceptance criteria

- Cross-user project access is impossible in tests.
- Duplicate requests do not create duplicate billable jobs.
- Expired signed URLs recover cleanly.
