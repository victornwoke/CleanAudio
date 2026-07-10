# CleanAudio
### Product Requirements Document

**Status:** Approved for Engineering Kickoff
**Version:** 1.0
**Owner:** Product & Engineering Leadership
**Platform:** Mobile-first (iOS primary, Android parity within one release cycle)
**Last Updated:** July 2026

---

## 1. Executive Summary

CleanAudio is a mobile-first, AI-powered audio enhancement application that turns any recording — a phone-mic podcast interview, a noisy real estate walkthrough, a classroom lecture, or a voice memo recorded on the street — into professional, broadcast-quality audio in a single tap.

The product exists because audio quality is the single most under-served part of the content pipeline. Video tools (CapCut, InShot, Premiere) and voice tools (Zoom, Riverside) have matured rapidly, but the audio layer beneath them — de-noising, leveling, EQ, mastering — still requires either expensive outboard hardware, a trained ear, or desktop software (Adobe Podcast, Descript, iZotope RX) that is unusable from a phone in the field.

CleanAudio closes that gap with an on-device-first, cloud-assisted AI pipeline that removes background noise, balances levels, applies broadcast-standard EQ/compression, and masters output to platform-ready loudness targets (Spotify, YouTube, Apple Podcasts) — all inside a three-tap mobile workflow: **Record or Import → Enhance → Export**.

CleanAudio targets five core segments — podcasters, remote workers, real estate agents, teachers, and social/UGC creators — who share one job to be done: *make my voice sound professional without needing to know anything about audio engineering.*

The business model is a freemium subscription (CleanAudio Free / Pro / Studio) with usage-based gating on processing minutes and export quality, following the proven mobile-subscription playbook (Descript, CapCut Pro, Riverside).

---

## 2. Vision

A world where anyone — regardless of equipment, environment, or technical skill — can produce audio that sounds like it came out of a professional studio, in the time it takes to tap a button.

CleanAudio becomes the **default audio layer** for mobile content creation: the thing every creator, teacher, and professional runs their voice through before it goes anywhere else, the same way filters became the default layer for photos.

## 3. Mission

**"Professional studio-quality audio in one tap."**

Every product decision is filtered through this mission. If a feature adds a second tap, a settings screen, or a technical decision the user has to make correctly to get good results, it is deprioritized in favor of a feature that gets the user to great audio faster and with less thought.

---

## 4. Problem Statement

Audio is treated as an afterthought by the tools people already use to create content, yet it is the single biggest driver of perceived production quality and audience retention.

**Specific problems:**

1. **Recording environments are uncontrolled.** Most creators record on a phone mic in a bedroom, car, coffee shop, open-plan office, or client's house — environments with HVAC hum, room echo, keyboard clatter, traffic, and inconsistent mic distance.
2. **Existing fixes require desktop software and expertise.** iZotope RX, Adobe Audition, and even Adobe Podcast Enhance require a desktop session, file transfer from phone to computer, and enough audio literacy to use noise floor, spectral repair, or multiband compression correctly.
3. **Mobile audio tools are shallow.** Native voice memo apps and most editing apps apply a single generic "noise reduction" filter that either under-cleans (leaves hiss) or over-cleans (produces robotic, metallic artifacts — "AI mouth").
4. **Turnaround time kills momentum.** A real estate agent recording a walkthrough or a teacher recording a lesson does not have 20 minutes to export, upload to a desktop tool, process, and re-import. If cleanup isn't near-instant, it doesn't happen, and the raw (bad) audio ships.
5. **Platform loudness standards are opaque.** Podcasters routinely get flagged or sound quiet/loud across Spotify, Apple Podcasts, and YouTube because they don't know (or can't easily hit) -16 LUFS vs -14 LUFS vs -23 LUFS targets.
6. **No unified workflow across use cases.** A creator today stitches together 3-4 separate tools (voice memo app → noise reduction app → loudness normalizer → file converter) to do what should be one flow.

---

## 5. User Personas

### 5.1 Maya Chen — "The Solo Podcaster"
- 29, hosts a weekly interview podcast, records remote guests via phone or laptop mic, no sound treatment in her spare room.
- Non-technical about audio; owns a $60 USB mic but often forgets it and records guests on their phones.
- Goal: consistent, professional sound episode-to-episode without hiring an audio editor.
- Pain: uneven levels between her and guests, room echo, background AC hum.
- Willingness to pay: Yes, $12-20/mo if it replaces her $50/episode freelance audio editor.

### 5.2 David Okafor — "The Remote Professional"
- 41, sales director, joins 6-8 video calls a day from home, occasionally from co-working spaces or airports.
- Not a creator; just wants to sound clear and credible on client calls and Loom recordings.
- Pain: barking dog, roommate noise, laptop fan, echo-y home office.
- Willingness to pay: Company expense-able, $8-10/mo, values "it just works" over features.

### 5.3 Priya Sharma — "The Real Estate Agent"
- 35, records walkthrough videos and voice-over descriptions on her iPhone while walking through properties (HVAC noise, echo in empty rooms, outdoor traffic).
- Needs fast turnaround — listing goes live same day.
- Pain: empty-room reverb, wind noise on outdoor shots, needs export straight into her listing video tool.
- Willingness to pay: Yes, treats it as a business tool, expenses it.

### 5.4 James Whitfield — "The Teacher / Educator"
- 47, records lecture voiceovers and flipped-classroom content on a school-issued iPad, often in a classroom or shared office.
- Budget-constrained (often personal funds, not school budget), values simplicity above all.
- Pain: HVAC and hallway noise, needs long-form (45-60 min) processing without the app choking, needs simple export to Google Classroom / YouTube.
- Willingness to pay: Price-sensitive; strong candidate for Free/Pro tier, education discount driver.

### 5.5 Zoë Martinez — "The Social/UGC Creator"
- 22, posts daily Reels/TikTok/Shorts, records everywhere (car, bedroom, outdoors, events).
- High volume, short clips (15s-3min), needs speed above all — posts multiple times a day.
- Pain: wind/outdoor noise, inconsistent volume across a multi-clip video, needs audio that matches "clean but not sterile" social aesthetic.
- Willingness to pay: Low individually, but high LTV via volume and virality-driven referral; strong free-to-paid upgrade funnel via export watermark/quality caps.

---

## 6. Jobs To Be Done

| # | Job Statement | Primary Personas |
|---|---|---|
| JTBD-1 | "When I finish recording, I want background noise gone instantly, so I don't sound like I recorded in a kitchen." | All |
| JTBD-2 | "When I have multiple speakers at different volumes, I want them automatically leveled, so listeners don't reach for the volume knob." | Maya, David |
| JTBD-3 | "When I export for a specific platform, I want the loudness automatically correct, so I don't get flagged or sound off compared to other content." | Maya, Zoë |
| JTBD-4 | "When I'm in the field with no time to edit, I want one tap to produce something postable immediately." | Priya, Zoë |
| JTBD-5 | "When I record in an echo-y or empty space, I want the roominess reduced, so I sound like I'm in a treated studio." | Priya, James |
| JTBD-6 | "When I'm on a live call, I want my noise removed in real time, so the other person hears a clean version of me, not a processed recording after the fact." | David |
| JTBD-7 | "When I batch-process many recordings, I want consistent settings applied automatically, so my back catalog matches my new content." | Maya, James |
| JTBD-8 | "When I share a clip, I want to trust the app isn't destroying my voice's natural character with over-processing." | Zoë, Maya |

---

## 7. Market Analysis

**Category:** AI Audio Enhancement / Mobile Creator Tools, sitting at the intersection of three growing markets:

- **Podcasting tools market**: driven by continued growth in podcast listenership and creator monetization tools (Spotify for Podcasters, Riverside, Descript, Adobe Podcast).
- **Mobile video/content creation tools**: CapCut, InShot, and VN have proven that mobile-native, one-tap AI editing tools can reach hundreds of millions of installs and convert a meaningful subscription base.
- **AI voice/speech enhancement**: enterprise-grade noise suppression (Krisp, Dolby.io, NVIDIA RTX Voice) has validated the underlying DNN denoising technology; CleanAudio's opportunity is bringing that technology to a mobile-first, creator-oriented, one-tap product rather than a call-center or desktop plugin.

**Why now:**
1. On-device ML inference (Core ML / NNAPI, Apple Neural Engine, Qualcomm Hexagon) has matured to the point that real-time denoising and dereverberation models can run locally on a mid-range phone without cloud latency.
2. Short-form content volume has made speed-to-post a primary value driver, favoring mobile-native tools over desktop round-trips.
3. Podcast and creator economy growth continues to expand the addressable base of non-technical people who need professional audio outcomes without professional audio skills.

**Go-to-market wedge:** Enter through the podcaster and social-creator segments (highest virality, lowest CAC via before/after audio demos on TikTok/Instagram), expand into real estate and education verticals through vertical-specific export presets and B2B/team plans, and capture remote professionals through a lightweight real-time call-enhancement feature that drives organic word-of-mouth in professional settings.

---

## 8. Competitive Analysis

| Product | Strength | Weakness vs. CleanAudio |
|---|---|---|
| **Adobe Podcast (Enhance Speech)** | Best-in-class denoise model, free, backed by Adobe | Desktop/web-only, no mobile app, no full editing/export workflow, no real-time |
| **Descript** | Powerful desktop editing + Studio Sound, transcript-based editing | Desktop-first, steep learning curve, expensive, mobile app is a companion, not primary tool |
| **Krisp** | Excellent real-time call denoising, low latency | Real-time calls only, no post-production mastering, no export/publishing workflow, not creator-focused |
| **CapCut** | Massive mobile install base, fast one-tap edits, free | Audio tools are shallow (basic noise reduction only), no loudness targeting, no dereverb, video-first not audio-first |
| **Riverside** | High-quality remote recording, separate local tracks | Recording-focused, not a general enhancement tool for arbitrary/existing audio, desktop-centric post-production |
| **iZotope RX (Mobile lacking)** | Gold-standard audio repair quality | Desktop-only, professional-grade complexity, not one-tap, expensive perpetual/subscription pricing aimed at engineers |
| **Voice Memos / native OS tools** | Zero friction, always available | No enhancement at all |

**CleanAudio's differentiated position:** the only product that is simultaneously (a) mobile-native and one-tap, (b) capable of studio-grade denoise + dereverb + mastering, (c) platform-loudness-aware for direct publishing, and (d) fast enough for field/in-the-moment use across podcasting, real estate, education, and social verticals in a single app.

---

## 9. Product Goals

**12-Month Product Goals:**
1. Ship a one-tap enhancement flow with median processing time under 8 seconds for a 5-minute clip (device-dependent, see Performance Targets).
2. Achieve a perceptual quality bar where blind A/B tests show CleanAudio output preferred over Adobe Podcast and CapCut noise reduction by target users ≥70% of the time.
3. Reach 45% Day-30 retention for users who complete at least one successful enhancement in their first session.
4. Convert 8-12% of monthly active free users to paid subscription within 90 days of first use.
5. Support the five core personas with vertical-specific presets (Podcast, Call/Meeting, Field/Real Estate, Classroom, Social Clip) without requiring manual EQ knowledge.
6. Establish CleanAudio as a top-3 result for "remove background noise from audio" and "podcast audio cleaner" App Store/Play Store search terms.

---

## 10. Success Metrics (North Star Metrics)

**North Star Metric:** **Weekly Enhanced Minutes (WEM)** — total minutes of audio successfully enhanced and exported/shared by active users per week. This is chosen over raw DAU because it directly captures the core value delivered (audio actually made better and used), not just app opens.

**Supporting metrics (tiered):**

*Activation*
- % of new users who complete their first enhancement within 24 hours of signup (Target: ≥60%)
- Time-to-first-enhanced-export (Target: median < 3 minutes from install)

*Engagement*
- Weekly Enhanced Minutes (WEM) — North Star
- Enhancements per active user per week (Target: ≥3)
- % of enhancements that result in a completed export/share (Target: ≥75%)

*Retention*
- D1 / D7 / D30 retention, segmented by persona/vertical
- W1→W4 cohort retention curve

*Monetization*
- Free-to-paid conversion rate within 30/90 days
- Monthly Recurring Revenue (MRR), Net Revenue Retention (NRR)
- Average Revenue Per Paying User (ARPPU)

*Quality*
- Blind A/B preference rate vs. competitor output
- User-reported "sounds unnatural / robotic" flag rate (Target: <3% of enhancements)
- Processing failure rate (Target: <0.5%)

---

## 11. Complete User Journey

### 11.1 First-Time User Journey
1. **Discovery** — sees a before/after audio demo on TikTok/Instagram or App Store search result.
2. **Install & Launch** — app opens directly to a demo screen: "Hear the difference" with a pre-loaded before/after sample (no signup required to experience value).
3. **Instant Demo Interaction** — user taps to hear the noisy sample vs. CleanAudio-enhanced sample. This is the core "aha" moment and happens before any account creation.
4. **Prompt to try with own audio** — "Now try it with your voice" CTA.
5. **Permission requests** — microphone access (contextual, just-in-time, not on launch).
6. **Record or Import** — user records a short clip or imports an existing voice memo/video's audio.
7. **Auto-detected preset** — CleanAudio suggests a preset (Podcast / Call / Field / Classroom / Social) based on lightweight on-device audio classification, user can override.
8. **One-tap Enhance** — processing runs, progress shown with a real-time waveform "cleaning" animation.
9. **Before/After Review** — split-screen waveform + A/B toggle so user can hear the transformation before committing.
10. **Soft account creation gate** — export requires a lightweight account (Apple/Google Sign-In or email), positioned after the value has been demonstrated, not before.
11. **Export or Share** — user picks destination (Files, platform-specific share sheet, direct upload connectors for Spotify for Podcasters/YouTube in later versions).
12. **Paywall moment** — first export is free at standard quality; second enhancement or HD/lossless export triggers the subscription paywall, framed around specific value ("Unlock unlimited enhancements + studio mastering").

### 11.2 Returning User Journey (Power User — Maya, the podcaster)
1. Opens app → lands on **Library** (not demo screen, since onboarding is complete).
2. Imports the week's raw interview recording (or records directly in-app).
3. Selects saved **custom preset** ("My Podcast Mix") built from her prior preference tuning.
4. Batch-enhances multi-speaker file; app auto-separates and levels speakers.
5. Reviews auto-generated loudness report (LUFS, true peak) against her target platform (Spotify: -16 LUFS).
6. Exports directly to her connected hosting platform or as a WAV/MP3 to Files.
7. Logs episode in **History** with quality/loudness metadata retained for consistency across the season.

### 11.3 Field User Journey (Priya, real estate)
1. Opens app on location at a property (possibly offline/poor signal).
2. Records walkthrough narration directly in-app using the **Field preset** (dereverb-forward, wind-noise-aware).
3. On-device-only processing runs (no cloud dependency) so it works with zero/poor connectivity.
4. Reviews instantly, re-records a flubbed section if needed (segment re-record, not full re-take).
5. Exports enhanced audio track to merge with her video app via share sheet or file export.
6. Cloud sync completes automatically once back online.

---

## 12. Functional Requirements

### 12.1 Recording & Import
- FR-1: Record audio directly in-app up to 180 minutes per session, with pause/resume.
- FR-2: Import audio from Files, Photos (extract audio from video), Voice Memos, and other apps via native share sheet.
- FR-3: Support input formats: WAV, MP3, M4A/AAC, FLAC, AIFF, and audio extracted from MP4/MOV.
- FR-4: Multi-track import for interview-style recordings (separate speaker tracks) with auto-alignment.
- FR-5: Live input level meter with clipping warning during recording.

### 12.2 AI Enhancement
- FR-6: One-tap "Auto Enhance" applies noise reduction, dereverberation, leveling, EQ, and mastering in a single action using the auto-detected or user-selected preset.
- FR-7: Preset library: Podcast, Call/Meeting, Field/Interview, Classroom/Lecture, Social Clip, Music-with-Voice, Custom.
- FR-8: Manual fine-tune controls (post-auto-enhance) for: Noise Reduction intensity (0-100), Voice Warmth/EQ tilt, De-essing, Loudness target, Room tone/dereverb intensity.
- FR-9: Multi-speaker auto-leveling: detect distinct speakers and normalize relative loudness.
- FR-10: Silence trimming / dead-air removal (configurable threshold, optional).
- FR-11: Real-time preview scrubbing of before/after on a shared timeline.
- FR-12: Batch processing: apply a saved preset to multiple files in a queue.
- FR-13: Undo/redo and non-destructive editing — original recording is always preserved.

### 12.3 Real-Time Mode (Calls)
- FR-14: System-level audio filter (iOS: Voice Processing / Call Extension where platform allows; Android: AudioEffect/VoIP integration) providing real-time noise suppression during third-party video/voice calls, with <30ms added latency.
- FR-15: In-app real-time monitor mode for live streaming/recording with real-time denoise preview.

### 12.4 Export & Publishing
- FR-16: Export formats: MP3 (128/192/320kbps), WAV (16/24-bit), AAC/M4A, with platform-specific presets (Podcast/Spotify, YouTube, Instagram/TikTok, Broadcast/WAV).
- FR-17: Automatic loudness normalization to target standard: -16 LUFS (Spotify/Apple Podcasts), -14 LUFS (YouTube/streaming), -23 LUFS (broadcast), or custom LUFS target.
- FR-18: Direct share-sheet export to any installed app; direct upload integrations (Spotify for Podcasters, YouTube, Descript import) in V2.
- FR-19: Batch export of multiple enhanced files as a ZIP or sequential share.

### 12.5 Library & History
- FR-20: Cloud-synced library of all recordings/imports (original + enhanced versions), searchable and filterable by date, preset, duration, persona tag.
- FR-21: Version history per file (original, each enhancement pass, exported versions).
- FR-22: Storage quota management with tiered cloud storage by subscription plan.

### 12.6 Account & Subscription
- FR-23: Sign in with Apple, Google, or email/password; account required only at export/paywall moment, not at install.
- FR-24: Subscription management (upgrade/downgrade/cancel) in-app via native billing (StoreKit/Play Billing) and web-based portal for team/business plans.
- FR-25: Usage dashboard showing processing minutes consumed vs. plan quota.

---

## 13. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | On-device enhancement of a 5-minute mono clip completes in ≤8s on a device from the last 3 iPhone/flagship Android generations; ≤20s on mid-range devices. |
| Scalability | Cloud processing backend must horizontally scale to handle burst load (e.g., viral TikTok referral spikes) up to 50x baseline traffic within 10 minutes via autoscaling. |
| Reliability | 99.9% uptime for cloud processing and sync services; on-device processing must function fully offline for core enhancement (see Offline Behaviour). |
| Availability | Real-time call-enhancement feature must maintain <1% dropped-frame rate under normal network conditions. |
| Security | All audio in transit encrypted via TLS 1.3; at rest via AES-256. See Security Requirements. |
| Privacy | No human review of user audio without explicit opt-in (e.g., for support/debugging); default is zero human access. |
| Localization | UI localized for English, Spanish, Portuguese, French, German, Japanese at launch; audio models are language-agnostic (operate on waveform characteristics, not speech content) except for optional transcript features. |
| Accessibility | Full VoiceOver/TalkBack support, dynamic type, WCAG 2.1 AA color contrast minimum. |
| Battery | On-device processing must not raise device thermal state above "nominal" for clips under 10 minutes on supported devices. |

---

## 14. Feature Priorities

**P0 — MVP Launch Blocking**
- One-tap Auto Enhance (denoise, dereverb, level, EQ, master)
- Record + Import flows
- Before/After preview
- Core preset library (5 presets)
- Export (MP3/WAV) with LUFS normalization
- Account creation + subscription paywall
- Cloud sync of library

**P1 — Fast Follow (within 90 days of launch)**
- Manual fine-tune controls
- Multi-speaker auto-leveling
- Batch processing
- Real-time call enhancement (iOS first)
- Direct publishing integrations (Spotify for Podcasters, YouTube)

**P2 — V2 Horizon**
- Custom preset training from user preference history
- Transcript-based editing (remove filler words, "um," by editing text)
- Team/collaboration plans
- Desktop/web companion app
- Android real-time call enhancement (parity)

---

## 15. Complete Screen Breakdown

1. **Splash/Launch Screen** — logo animation, cold-start audio engine warm-up.
2. **Demo/Value Screen** (first launch only) — before/after audio demo, no login required.
3. **Permission Priming Screen** — contextual explanation before mic permission system dialog.
4. **Onboarding — Persona Selection** — "What do you use CleanAudio for?" (Podcast / Calls / Real Estate / Teaching / Social) drives default preset and home screen content.
5. **Home / Library** — grid/list of recordings (original + enhanced state indicator), search, filter, primary CTA to Record/Import.
6. **Record Screen** — live waveform, level meter, pause/resume, preset selector, stop → auto-advance to Review.
7. **Import Screen** — file picker (Files/Photos/Share Extension), format validation, multi-file batch selection.
8. **Preset Selection Screen** — visual cards for each preset with 3-second audio preview per preset.
9. **Processing Screen** — animated waveform "cleaning" visualization, progress %, cancel option, estimated time remaining.
10. **Review / Before-After Screen** — dual waveform, A/B toggle button, scrubber, loudness meter (LUFS/peak readout), "Adjust" and "Export" CTAs.
11. **Manual Fine-Tune Screen** — sliders (Noise Reduction, Warmth, De-ess, Dereverb, Loudness Target), live preview, Reset to Auto button.
12. **Speaker Detection/Leveling Screen** — visual speaker segments on timeline with individual level controls (shown only when multi-speaker detected).
13. **Export Screen** — format selector, quality tier, platform preset picker, destination picker (Save to Files / Share Sheet / Direct Upload).
14. **Export Progress/Success Screen** — confirmation, share shortcuts, "Enhance another" CTA.
15. **File Detail Screen** — waveform, metadata (duration, LUFS, preset used, date), version history, re-export, delete, rename.
16. **Paywall Screen** — plan comparison (Free/Pro/Studio), contextual framing based on triggering action, free trial CTA.
17. **Subscription Management Screen** — current plan, usage meter, upgrade/downgrade, billing portal link.
18. **Account/Settings Screen** — profile, sign-out, storage usage, notification preferences, connected accounts (Spotify/YouTube), data/privacy controls.
19. **Real-Time Call Mode Screen** — toggle for system-wide call enhancement, active-call indicator, intensity control.
20. **Custom Preset Builder Screen** — save current fine-tune settings as a named custom preset.
21. **Help/Support Screen** — FAQ, contact support, diagnostic report submission (opt-in only).
22. **Error/Empty States** (not standalone screens but required states across all above): no-mic-permission state, processing-failed state, offline state, empty library state, storage-full state.

---

## 16. Navigation Flow

```
Splash
  └─▶ [First Launch] Demo/Value Screen ─▶ Permission Priming ─▶ Persona Selection ─▶ Home/Library
  └─▶ [Returning] Home/Library

Home/Library
  ├─▶ Record Screen ─▶ Preset Selection ─▶ Processing ─▶ Review (Before/After)
  ├─▶ Import Screen ─▶ Preset Selection ─▶ Processing ─▶ Review (Before/After)
  ├─▶ File Detail (tap existing item)
  ├─▶ Settings/Account
  └─▶ Subscription Management (via paywall or Settings)

Review (Before/After)
  ├─▶ Manual Fine-Tune Screen ─▶ back to Review
  ├─▶ Speaker Leveling Screen (if multi-speaker) ─▶ back to Review
  ├─▶ Export Screen ─▶ [Paywall if gated] ─▶ Export Progress ─▶ Success ─▶ Home/Library
  └─▶ Custom Preset Builder (save settings)

Paywall (triggered contextually from: 2nd enhancement, HD export, real-time mode, batch processing)
  └─▶ Subscription purchase (native IAP) ─▶ back to triggering screen, unlocked
```

Global tab bar (post-onboarding): **Library | Record (center, prominent) | Real-Time Mode | Settings**

---

## 17. AI Audio Processing Pipeline

CleanAudio's pipeline is a hybrid **on-device + cloud-assisted** architecture, chosen so that (a) core enhancement always works offline and with zero latency for short clips, and (b) heavier/longer processing and higher-fidelity models can run in the cloud for devices or clip lengths that exceed on-device capability.

### 17.1 Pipeline Stages

```
[Raw Audio Input]
      │
      ▼
1. Pre-Processing
   - Sample rate normalization (target 48kHz internal working rate)
   - Format decoding to PCM
   - Silence/clipping detection
      │
      ▼
2. Audio Classification (on-device, lightweight CNN)
   - Detect: single speaker / multi-speaker / music-present / environment type
   - Auto-select recommended preset
      │
      ▼
3. Noise Suppression (DNN-based, spectral + waveform domain)
   - On-device: quantized model (Core ML / TFLite / NNAPI), real-time-capable
   - Cloud fallback: full-precision model for long-form or low-end devices
      │
      ▼
4. Dereverberation
   - Room impulse estimation, blind deconvolution-based reduction of reflections
      │
      ▼
5. Speaker Separation & Leveling (multi-speaker files only)
   - Diarization (who spoke when) → per-speaker gain normalization
      │
      ▼
6. Dynamic EQ & Tonal Shaping
   - Preset-driven frequency curve (e.g., podcast warmth curve vs. broadcast-flat)
   - De-essing (sibilance reduction, adaptive threshold)
      │
      ▼
7. Dynamics Processing
   - Multiband compression for consistent perceived loudness
   - Limiter (true-peak safe, -1dBTP ceiling)
      │
      ▼
8. Loudness Normalization / Mastering
   - LUFS measurement (ITU-R BS.1770-4 standard) and normalization to target
   - Platform-specific presets (Spotify -16 LUFS, YouTube -14 LUFS, Broadcast -23 LUFS)
      │
      ▼
9. Quality Assurance Pass (automated)
   - Artifact detection heuristic (flags likely over-processing / musical noise)
   - Clipping/peak safety check
      │
      ▼
[Enhanced Audio Output] ─▶ Review Screen (before/after) ─▶ Export
```

### 17.2 On-Device vs. Cloud Routing Logic

| Condition | Routing |
|---|---|
| Clip ≤ 3 minutes, supported device (A13+/Snapdragon 7-series+) | Fully on-device |
| Clip > 3 minutes and ≤ 30 minutes | On-device chunked processing, streamed |
| Clip > 30 minutes, or low-end device, or user selects "Studio Quality" (higher-precision model) | Cloud processing via secure upload |
| No network connectivity | On-device only; cloud-tier features queue and retry when online |

### 17.3 Model Details
- **Noise suppression model:** custom-trained DNN (U-Net-style spectral mask predictor) distilled into a quantized INT8 mobile variant (~8MB) for on-device, and a larger full-precision variant server-side for "Studio Quality" mode.
- **Dereverberation model:** WPE (Weighted Prediction Error) inspired blind dereverberation combined with a learned residual suppression network.
- **Diarization:** lightweight embedding-based speaker clustering (on-device for privacy) rather than full transcription-based diarization, to avoid requiring speech-to-text for core enhancement.
- **Loudness measurement:** standards-compliant BS.1770-4 LUFS/true-peak implementation, not a proprietary approximation, to guarantee platform compliance.
- Models are versioned; every enhanced file stores the model version used for reproducibility and future re-processing with improved models ("Re-enhance with latest AI" feature).

---

## 18. Backend Architecture

```
                         ┌─────────────────────────┐
                         │      Mobile Clients      │
                         │   (iOS / Android apps)   │
                         └───────────┬──────────────┘
                                     │ HTTPS/TLS 1.3, gRPC for streaming
                         ┌───────────▼──────────────┐
                         │        API Gateway        │
                         │ (auth, rate limiting,     │
                         │  request routing)          │
                         └───────────┬──────────────┘
              ┌──────────────────────┼───────────────────────────┐
              ▼                      ▼                           ▼
   ┌───────────────────┐  ┌─────────────────────┐   ┌──────────────────────┐
   │  Auth Service       │  │  Processing Service  │   │  Library/Sync Service │
   │  (OAuth, JWT, SSO)  │  │  (job orchestration) │   │  (metadata, sync)     │
   └───────────────────┘  └──────────┬───────────┘   └──────────────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │   Job Queue (managed     │
                          │   message queue)         │
                          └───────────┬────────────┘
                                      │
                     ┌────────────────┼─────────────────┐
                     ▼                ▼                 ▼
           ┌──────────────┐  ┌───────────────┐  ┌───────────────┐
           │ GPU Inference │  │ GPU Inference  │  │ GPU Inference │
           │ Worker Pool A │  │ Worker Pool B  │  │ Worker Pool N │
           │ (autoscaled)  │  │ (autoscaled)   │  │ (autoscaled)  │
           └──────┬────────┘  └───────┬───────┘  └──────┬────────┘
                  └───────────────────┼──────────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │  Object Storage (audio)   │
                         │  encrypted at rest         │
                         └─────────────────────────┘
                                      │
                         ┌─────────────────────────┐
                         │   Primary Database         │
                         │   (metadata, users, subs)  │
                         └─────────────────────────┘
                                      │
                         ┌─────────────────────────┐
                         │  Billing/Subscription      │
                         │  Service (IAP webhook       │
                         │  reconciliation)            │
                         └─────────────────────────┘
```

**Key architectural decisions:**
- **Job-queue based cloud processing** so heavy inference workloads are decoupled from the API request/response cycle; mobile clients poll or receive push notification on job completion for long-form clips.
- **GPU worker autoscaling** driven by queue depth, with pre-warmed minimum pool to avoid cold-start latency during normal traffic, bursting for viral spikes.
- **Regional processing clusters** (US, EU, APAC) to minimize upload latency and satisfy data-residency requirements (GDPR).
- **Idempotent job processing** — every enhancement job has a unique idempotency key so retried uploads don't duplicate processing/billing.
- **Signed URL uploads** — clients upload directly to object storage via short-lived signed URLs, not through the API service, to avoid bottlenecking application servers with large file payloads.

---

## 19. Mobile Architecture

**iOS**
- Swift, SwiftUI for UI layer, UIKit interop where needed for advanced audio UI (waveform rendering).
- AVFoundation / AVAudioEngine for recording, playback, and real-time audio graph processing.
- Core ML for on-device model inference; Core ML model compiled per-device-class (Neural Engine-optimized where available).
- Background Audio capability + Call/Voice Processing extension for real-time call enhancement.
- Combine/async-await for reactive state management; modular MVVM architecture with a dedicated AudioEngine module decoupled from UI.

**Android**
- Kotlin, Jetpack Compose for UI.
- AudioRecord/AudioTrack + Oboe (low-latency audio library) for recording/playback.
- TensorFlow Lite (with NNAPI/GPU delegate) for on-device inference.
- Foreground Service for background/real-time processing to satisfy Android background execution limits.
- MVVM + Kotlin Coroutines/Flow; modular architecture mirroring iOS module boundaries (AudioEngine, Library, Auth, Billing as separate modules).

**Shared cross-platform considerations**
- Core DSP logic (non-ML signal chain: gain staging, LUFS calculation, format conversion) implemented in a shared C++ core (via a thin platform bridge) to guarantee identical output between iOS and Android and avoid duplicated, drift-prone reimplementation.
- ML models are platform-native format (Core ML `.mlmodel` / TFLite `.tflite`) generated from a single source model via a shared export pipeline, ensuring parity in enhancement quality across platforms.
- Local persistence: SQLite (via GRDB on iOS, Room on Android) for library metadata with a sync layer reconciling against the backend Library/Sync Service.

---

## 20. Security Requirements

- All network traffic uses TLS 1.3; certificate pinning on mobile clients for API and upload endpoints.
- Audio files encrypted at rest with AES-256; encryption keys managed via a dedicated KMS with per-region key separation.
- Signed, short-lived (≤15 min) URLs for all direct-to-storage uploads/downloads; no long-lived public URLs for user audio.
- Zero human access to user audio by default; any support-triggered access requires explicit user opt-in, is logged, and is time-boxed.
- JWT access tokens (short-lived, ~15 min) + refresh tokens (rotating, revocable) for API authentication.
- Secrets and API keys never embedded in client binaries; all third-party service calls (e.g., cloud inference) proxied through backend.
- On-device biometric lock option (Face ID/Touch ID/Android biometric) for app access, optional user setting.
- Full data export and account deletion (GDPR/CCPA compliant), deletion cascades audio files from object storage within 30 days, immediately from primary access paths.
- Regular third-party penetration testing (minimum annual) and automated dependency vulnerability scanning in CI.
- Rate limiting and abuse detection on the API gateway to prevent processing-quota abuse and credential stuffing.

---

## 21. Authentication

- **Sign-in methods at launch:** Sign in with Apple (required per App Store guidelines given other social sign-in), Sign in with Google, Email + Password (with verification).
- **Session model:** OAuth 2.0 / OIDC-based flow issuing short-lived JWT access tokens and rotating refresh tokens; refresh tokens revocable server-side (e.g., on password change, suspicious activity, manual sign-out-all-devices).
- **Guest mode:** users can record/import/enhance without an account; account required only to export or persist to cloud library (soft gate, not hard gate) — preserves the "value before signup" onboarding principle.
- **Account linking:** guest-mode local work can be linked to an account retroactively upon signup, migrating local-only files into the cloud library.
- **MFA:** optional TOTP-based two-factor authentication available for account security, required for Business/Team plan admin accounts.
- **Session expiry:** access token 15 min, refresh token 30 days sliding window with re-authentication required on sensitive actions (billing changes, account deletion).

---

## 22. Subscription Model

| Plan | Price (indicative) | Processing Minutes | Export Quality | Key Features |
|---|---|---|---|---|
| **Free** | $0 | 30 min/month | MP3 128kbps, watermark-free | Auto Enhance, 2 presets, on-device only |
| **Pro** | $11.99/mo or $79.99/yr | 300 min/month | Up to WAV 24-bit / MP3 320kbps | All presets, manual fine-tune, batch (up to 5 files), speaker leveling, cloud library sync |
| **Studio** | $24.99/mo or $179.99/yr | Unlimited | All formats, Studio Quality cloud model | Everything in Pro + real-time call enhancement, unlimited batch, direct publishing integrations, priority processing queue |
| **Team/Business** | $19.99/user/mo (min 3 seats) | Pooled unlimited | All formats | Studio features + shared workspace library, seat management, centralized billing, admin console |

**Monetization mechanics:**
- Native in-app purchase (StoreKit 2 / Google Play Billing) as the sole purchase path in-app per platform policy; web-based checkout available for Team/Business plans to avoid platform fee where permitted, with account linking.
- 7-day free trial on Pro and Studio, one trial per account, requires payment method on file (industry-standard reduces low-intent trial abuse while remaining low-friction).
- Usage-based soft paywall: Free users see remaining monthly minutes in-app; approaching/hitting the quota triggers contextual upgrade prompt rather than a hard block mid-task.
- Annual plans priced at ~33% discount vs. monthly to drive commitment and reduce churn.
- Win-back flow: downgraded/canceled users receive a targeted discount offer at 14 and 30 days post-cancellation.

---

## 23. Export Flow

1. User taps **Export** from the Review screen.
2. **Format & Quality selection:** MP3 (128/192/320kbps), WAV (16/24-bit), AAC/M4A — options gated by plan tier.
3. **Platform preset (optional):** Podcast (Spotify/Apple: -16 LUFS), YouTube (-14 LUFS), Social (Instagram/TikTok: -14 LUFS, peak-safe), Broadcast (-23 LUFS), or Custom LUFS target.
4. **Metadata tagging (optional):** episode title, artist/show name embedded as ID3/M4A metadata for podcast files.
5. **Destination selection:**
   - Save to device (Files app)
   - Native share sheet (any installed app — Messages, Slack, editing apps, etc.)
   - Direct upload integration (Spotify for Podcasters, YouTube — V2)
6. **Pre-export validation:** automated check for clipping, silence at start/end, and loudness target compliance; warns user if output doesn't meet the selected platform's spec (rare, but possible with certain manual overrides).
7. **Export processing:** local render for on-device-processed audio (near-instant); for cloud-processed audio, final render happens server-side and downloads automatically.
8. **Confirmation & follow-up:** success screen with direct share shortcuts and "Enhance another file" CTA to re-engage the loop.
9. Every export is logged to file history as an immutable version (original enhancement settings preserved for reproducibility).

---

## 24. Error Handling

**Principles:** errors are actionable (tell the user what to do next), never dead-ends, and preserve user work (nothing is lost on failure).

| Error Scenario | Handling |
|---|---|
| No microphone permission | Contextual pre-permission screen explains why; if denied, in-app banner with deep link to Settings, feature gracefully disabled (not app-blocking). |
| Recording interrupted (call, low battery, backgrounding) | Auto-save partial recording, resumable on return; clear "Recording interrupted" state with resume/discard choice. |
| Enhancement processing failure (on-device) | Auto-retry once locally; on repeat failure, offer cloud processing fallback (if plan allows) or clear error with "Try again" / "Report issue." Original file is never modified or lost. |
| Enhancement processing failure (cloud) | Job automatically retried up to 3x with backoff; user sees progress state, not raw error, until retries exhausted, then actionable failure message with support link. |
| Upload failure (poor network) | Resumable/chunked upload; auto-retry with exponential backoff; local queue persists the pending job until network restored. |
| Export format unsupported by destination app | Pre-validated at export-config step; app suggests compatible format before attempting share. |
| Storage quota exceeded (cloud) | Clear in-app banner before failure occurs (at 90% quota), with upgrade or manage-storage CTA; never silently fails a completed enhancement. |
| Subscription/billing error (IAP failure) | Native platform error surfaced with plain-language explanation; retry path; customer support escalation link for persistent failures. |
| Corrupt/unsupported input file | Validated at import step with a specific message identifying the issue (format, corruption, duration limit) rather than a generic failure. |
| App crash during processing | Crash reporting (see Analytics) auto-captures state; on relaunch, in-progress job is detected and either resumed or the user is prompted to retry, original audio untouched. |

All error states are logged with structured error codes for observability and are never silently swallowed — a floor requirement is that a user should never wonder "did that work or not?"

---

## 25. Offline Behaviour

CleanAudio is designed **offline-first for core enhancement**, since field usage (real estate, outdoor social recording, classrooms with poor WiFi) is a primary use case, not an edge case.

- **Fully available offline:** Record, Import (local files), on-device Auto Enhance (clips within on-device processing limits, see §17.2), Review/A-B preview, local export to Files/share sheet, manual fine-tune controls.
- **Requires connectivity:** Cloud/Studio Quality processing for long-form or low-end-device-routed jobs, cloud library sync, direct publish integrations, account sign-in (first time), subscription purchase/validation (cached entitlement used for grace period if offline).
- **Sync behavior:** all local work is queued in a local-first database; when connectivity returns, background sync reconciles local library state with cloud, uploads pending files, and resolves conflicts via last-write-wins with a user-visible conflict resolution prompt only in rare simultaneous-multi-device edit cases.
- **Entitlement grace period:** subscription status is cached locally; app functions at last-known entitlement level for up to 72 hours offline before requiring re-validation, so users mid-flight or in poor-signal areas aren't locked out mid-task.
- **Visual indicator:** persistent, unobtrusive offline indicator when disconnected, with a queued-jobs counter so users know what will sync later.

---

## 26. Accessibility

- Full **VoiceOver** (iOS) and **TalkBack** (Android) support across all screens, including custom waveform components (exposed via accessible labels summarizing duration, noise level detected, and enhancement state rather than raw visual waveform data).
- **Dynamic Type / font scaling** support throughout; layouts tested up to largest accessibility text sizes without truncation.
- **WCAG 2.1 AA minimum color contrast** across all UI, including waveform-on-background contrast.
- **Reduced Motion** setting respected: processing/cleaning animations degrade to a simple progress bar when Reduce Motion is enabled system-wide.
- **Captions/transcripts** (V2, tied to transcript-editing feature) to support deaf/hard-of-hearing users reviewing enhancement results via text rather than audio-only A/B comparison.
- All tap targets meet minimum 44x44pt (iOS) / 48x48dp (Android) sizing.
- Haptic feedback provided as a redundant, non-audio confirmation channel for key actions (enhancement complete, export success).
- Color is never the sole indicator of state (e.g., waveform "before/after" also labeled textually, not just color-coded).

---

## 27. Design System

**Name:** CleanAudio Design System ("Wave")

**Design principles:**
1. **Audio-first visual language** — waveforms are the primary visual motif throughout, not decorative but functionally informative (density/color reflects actual signal characteristics).
2. **Calm confidence** — muted, professional palette (avoids the "loud neon creator app" aesthetic) to reinforce the "studio-grade" positioning.
3. **One primary action per screen** — every screen has one unmistakable next step, consistent with the "one tap" mission.

**Color system:**
- Primary: deep indigo (`#2B2D6E`) — brand, primary actions
- Accent: signal teal (`#00C2A8`) — "enhanced/clean" state indicator, waveform-after color
- Warning/Before state: warm amber-gray (`#8A8578`) — waveform-before color, deliberately desaturated (not red — noise isn't an "error," it's just unenhanced)
- Neutral scale: 9-step gray scale from `#0A0A0C` to `#F7F7F8` for text/surface hierarchy
- Semantic: success `#1FAA6D`, error `#E0483E`, all validated to WCAG AA against their respective backgrounds.

**Typography:**
- Primary typeface: SF Pro (iOS) / Roboto (Android) system fonts for performance and native feel, with a custom display weight for the wordmark/marketing surfaces only.
- Type scale: 12/14/16/18/22/28/34pt steps, consistent 1.4 line-height for body text.

**Components (core library):**
- Waveform Renderer (before/after dual-state, scrubbable, accessible)
- Preset Card (audio-preview-on-press)
- Level Meter (real-time, peak-hold indicator)
- Processing Ring (circular progress with state label)
- Slider (fine-tune controls, haptic detents at meaningful values e.g. 0/50/100)
- Bottom Sheet (contextual actions — export, fine-tune)
- Paywall Card (plan comparison, consistent across all trigger points)

**Spacing/grid:** 8pt base grid throughout, 16pt standard margin, 24pt section spacing.

**Iconography:** custom icon set (not a generic icon library) for audio-specific concepts (dereverb, de-ess, LUFS meter) since no standard icon library adequately represents these; generic UI icons (settings, share, close) use SF Symbols/Material Symbols for platform-native familiarity.

---

## 28. Animation Guidelines

- **Purposeful motion only** — every animation communicates a state change (processing progress, before→after transformation), never purely decorative.
- **Signature "cleaning" animation:** during processing, the waveform visually "settles" from a jagged/noisy render to a smooth/clean render in sync with actual processing progress (not a fake loading animation) — this is the product's key emotional moment and should feel tactile and satisfying, not just functional.
- **Duration standards:** micro-interactions (button press, toggle) 100-150ms; screen transitions 250-300ms; the processing "settle" animation duration is tied to actual processing time, with a minimum floor of 1.2s even for near-instant on-device jobs so the transformation is perceptible and builds trust in the AI's "work."
- **Easing:** standard ease-in-out for transitions; a custom spring curve (subtle overshoot) for the before/after A-B toggle to give it a tactile, physical feel.
- **Reduced Motion compliance:** all non-essential motion (waveform settle animation, spring overshoots) is replaced with a simple linear progress indicator and instant state changes when the system Reduce Motion setting is on.
- **Haptics paired with key animations:** light haptic on processing start, success haptic (distinct pattern) on enhancement complete, matching the visual "settle" completion.

---

## 29. Performance Targets

| Metric | Target |
|---|---|
| Cold app launch to interactive | ≤1.5s on devices from last 3 generations |
| On-device enhancement, 1-min clip | ≤3s (flagship), ≤6s (mid-range) |
| On-device enhancement, 5-min clip | ≤8s (flagship), ≤20s (mid-range) |
| Cloud (Studio Quality) enhancement, 30-min clip | ≤90s end-to-end (upload + process + download) on broadband/LTE+ |
| Real-time call enhancement added latency | ≤30ms |
| Waveform rendering (60-min file) | ≤500ms to render scrollable waveform view |
| App memory footprint during processing | ≤350MB peak on-device (avoid OS termination on constrained devices) |
| Crash-free session rate | ≥99.5% |
| API p95 latency (non-processing endpoints) | ≤300ms |
| Cloud processing job pickup latency (queue to worker start) | ≤5s at baseline load, ≤30s at 50x burst load |

---

## 30. Technical Stack

**Mobile**
- iOS: Swift 6, SwiftUI, AVFoundation, Core ML, Combine
- Android: Kotlin, Jetpack Compose, Oboe, TensorFlow Lite, Coroutines/Flow
- Shared DSP core: C++17 (compiled to both platforms via platform bridges)

**Backend**
- Language/runtime: Go (API services, job orchestration) for performance and concurrency; Python (inference services, model serving) where ML framework compatibility dictates
- API layer: REST (primary) + gRPC for streaming/real-time call-enhancement signaling
- Job queue: managed message queue (e.g., SQS/Pub-Sub class service) with dead-letter queue handling
- Inference serving: containerized GPU workers (NVIDIA T4/L4 class) orchestrated via Kubernetes with autoscaling on queue depth
- Object storage: S3-compatible, regional buckets, lifecycle policies for original-file retention tiers by plan

**Data**
- Primary database: PostgreSQL (managed, multi-AZ) for user/account/subscription/library metadata
- Cache/session layer: Redis (session tokens, rate limiting, job status cache)
- Analytics warehouse: columnar data warehouse (e.g., BigQuery/Snowflake-class) fed via event pipeline

**Infrastructure**
- Cloud provider: multi-region deployment (US, EU, APAC) on a major cloud provider (AWS or GCP)
- CI/CD: automated build/test/deploy pipelines per platform (Fastlane for mobile release automation, standard container CI for backend)
- Observability: centralized logging, distributed tracing, metrics dashboards, alerting on SLO breach (uptime, latency, error rate)

**Third-party services**
- Payments: StoreKit 2 (iOS), Google Play Billing (Android), Stripe (web/Team billing)
- Push notifications: APNs / FCM
- Crash reporting & analytics: dedicated mobile crash reporting SDK + first-party event pipeline (avoid over-reliance on a single vendor for core product analytics given audio-privacy sensitivity)

---

## 31. API Structure

Base URL: `https://api.cleanaudio.app/v1`

**Authentication**
```
POST   /auth/signup
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/link-guest        # link local guest-mode work to new account
DELETE /auth/account
```

**Library**
```
GET    /library                      # list user's files (paginated, filterable)
GET    /library/{fileId}
POST   /library                      # create entry (post-upload registration)
PATCH  /library/{fileId}             # rename, tag, metadata update
DELETE /library/{fileId}
GET    /library/{fileId}/versions    # version history
```

**Upload**
```
POST   /uploads/signed-url           # request signed direct-to-storage upload URL
POST   /uploads/{uploadId}/complete  # confirm upload finished, triggers registration
```

**Processing**
```
POST   /processing/jobs              # submit enhancement job {fileId, preset, options, quality_tier}
GET    /processing/jobs/{jobId}      # poll job status
DELETE /processing/jobs/{jobId}      # cancel in-progress job
GET    /processing/presets           # list available presets (system + user custom)
POST   /processing/presets           # create custom preset
```

**Export**
```
POST   /export                       # {fileId, format, quality, loudnessTarget, destination}
GET    /export/{exportId}            # status + signed download URL when ready
```

**Real-time (gRPC streaming service, not REST)**
```
rpc StreamEnhance(stream AudioChunk) returns (stream EnhancedAudioChunk)
```

**Subscription/Billing**
```
GET    /billing/plans
GET    /billing/subscription         # current plan, usage, renewal date
POST   /billing/iap/validate         # validate Apple/Google receipt, sync entitlement
POST   /billing/portal-session       # web billing portal (Team/Business)
```

**Account/Settings**
```
GET    /account/profile
PATCH  /account/profile
GET    /account/usage                # processing minutes used vs. quota
POST   /account/data-export          # GDPR data export request
```

All endpoints require `Authorization: Bearer <JWT>` except `/auth/signup`, `/auth/login`. All mutating endpoints require an `Idempotency-Key` header. Standard error envelope:
```json
{
  "error": {
    "code": "PROCESSING_QUOTA_EXCEEDED",
    "message": "Monthly processing minutes exhausted.",
    "details": { "quota": 300, "used": 300, "resetsAt": "2026-08-01T00:00:00Z" }
  }
}
```

---

## 32. Database Schema

```sql
-- Users
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             TEXT UNIQUE,
    auth_provider     TEXT NOT NULL,        -- 'apple' | 'google' | 'email'
    provider_user_id  TEXT,
    display_name      TEXT,
    persona           TEXT,                 -- 'podcaster' | 'remote_worker' | 'real_estate' | 'teacher' | 'social_creator'
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at    TIMESTAMPTZ,
    is_guest          BOOLEAN NOT NULL DEFAULT false,
    mfa_enabled       BOOLEAN NOT NULL DEFAULT false
);

-- Subscriptions
CREATE TABLE subscriptions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan              TEXT NOT NULL,        -- 'free' | 'pro' | 'studio' | 'team'
    status            TEXT NOT NULL,        -- 'active' | 'trialing' | 'canceled' | 'past_due'
    billing_provider  TEXT NOT NULL,        -- 'apple_iap' | 'google_play' | 'stripe'
    provider_ref_id   TEXT,
    current_period_end TIMESTAMPTZ,
    seats             INT DEFAULT 1,        -- for team plans
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audio Files (library entries)
CREATE TABLE audio_files (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_object_key TEXT NOT NULL,      -- storage path for original file
    filename          TEXT NOT NULL,
    duration_seconds  NUMERIC NOT NULL,
    source_type       TEXT NOT NULL,        -- 'recorded' | 'imported'
    detected_type     TEXT,                 -- 'podcast' | 'call' | 'field' | 'classroom' | 'social'
    speaker_count     INT DEFAULT 1,
    storage_bytes     BIGINT NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ
);

-- Enhancement Jobs / Versions
CREATE TABLE enhancement_versions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_file_id     UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
    preset_id         UUID REFERENCES presets(id),
    settings          JSONB NOT NULL,       -- {noise_reduction, warmth, deess, dereverb, loudness_target, ...}
    model_version      TEXT NOT NULL,        -- e.g. "denoise-v3.2, dereverb-v1.4"
    processing_route  TEXT NOT NULL,        -- 'on_device' | 'cloud_standard' | 'cloud_studio'
    result_object_key TEXT,
    lufs_measured     NUMERIC,
    true_peak_db      NUMERIC,
    status            TEXT NOT NULL,        -- 'queued' | 'processing' | 'completed' | 'failed'
    processing_ms     INT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at      TIMESTAMPTZ
);

-- Presets
CREATE TABLE presets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = system preset
    name              TEXT NOT NULL,
    settings          JSONB NOT NULL,
    is_system_default BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exports
CREATE TABLE exports (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enhancement_version_id UUID NOT NULL REFERENCES enhancement_versions(id),
    format            TEXT NOT NULL,        -- 'mp3_320' | 'wav24' | 'aac' | ...
    loudness_target   TEXT,                 -- 'spotify' | 'youtube' | 'broadcast' | 'custom'
    destination       TEXT NOT NULL,        -- 'files' | 'share_sheet' | 'spotify' | 'youtube'
    object_key        TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage tracking (for quota enforcement)
CREATE TABLE usage_ledger (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start      DATE NOT NULL,
    minutes_used      NUMERIC NOT NULL DEFAULT 0,
    UNIQUE (user_id, period_start)
);

CREATE INDEX idx_audio_files_user ON audio_files(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_enhancement_versions_file ON enhancement_versions(audio_file_id);
CREATE INDEX idx_usage_ledger_user_period ON usage_ledger(user_id, period_start);
```

---

## 33. Analytics Events

All events follow `object_action` naming convention and carry `user_id` (or anonymous `device_id` pre-signup), `timestamp`, `session_id`, and relevant properties.

| Event | Key Properties |
|---|---|
| `app_launched` | is_first_launch, source (organic/referral/campaign) |
| `demo_played` | sample_id |
| `permission_mic_requested` | — |
| `permission_mic_granted` / `permission_mic_denied` | — |
| `onboarding_persona_selected` | persona |
| `recording_started` | preset_default |
| `recording_completed` | duration_seconds, was_interrupted |
| `import_completed` | source (files/photos/share_extension), format, duration_seconds |
| `preset_selected` | preset_id, was_auto_suggested |
| `enhancement_started` | preset_id, processing_route, duration_seconds |
| `enhancement_completed` | processing_route, processing_ms, model_version, lufs_result |
| `enhancement_failed` | error_code, processing_route |
| `before_after_toggled` | toggle_count_in_session |
| `fine_tune_adjusted` | parameter, value |
| `custom_preset_saved` | — |
| `export_started` | format, destination, loudness_target |
| `export_completed` | format, destination, file_size_bytes |
| `paywall_shown` | trigger_reason, plan_shown |
| `paywall_dismissed` | trigger_reason |
| `subscription_started` | plan, billing_cycle, trial |
| `subscription_canceled` | plan, reason (if provided) |
| `subscription_renewed` | plan |
| `realtime_mode_enabled` / `realtime_mode_disabled` | — |
| `library_searched` | query_length, result_count |
| `crash_occurred` | screen, error_signature |
| `quota_warning_shown` | percent_used |
| `quota_exceeded` | plan |

Event pipeline feeds both the real-time product dashboards (funnel/activation/WEM tracking) and the analytics warehouse for cohort/retention analysis. PII-sensitive properties (raw audio, transcripts) are never included in analytics events — only metadata.

---

## 34. Future Roadmap

**Near-term (V1.x, 0-6 months post-launch)**
- Real-time call enhancement (Android parity)
- Direct publish integrations: Spotify for Podcasters, YouTube, Riverside import
- Custom preset auto-tuning from user fine-tune history (lightweight personalization model)

**Mid-term (V2, 6-12 months)**
- Transcript-based editing: remove filler words/silences by editing text, auto-syncs to audio edits
- Team/Business collaboration workspace with shared libraries and approval workflows
- Desktop/web companion app for long-form editing sessions
- Music bed auto-ducking (for creators mixing voice with background music)

**Long-term (V3+, 12+ months)**
- Multi-language voice clarity models tuned per-language (beyond language-agnostic waveform processing)
- Live streaming platform integrations (real-time enhancement piped into OBS/streaming tools)
- API/SDK offering for third-party apps to embed CleanAudio enhancement (B2B licensing model)
- On-device voice isolation for video calls with visual "who's talking" speaker framing tie-in (adjacent video feature)

---

## 35. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| On-device model quality insufficient on low/mid-end devices, damaging "studio quality" brand promise | High | Tiered model routing (device-capability-aware); cloud fallback; continuous device-lab QA testing across a representative hardware matrix before each release |
| Over-processing produces "robotic"/artifact-heavy audio, eroding trust | High | Automated artifact-detection QA pass; conservative default intensity with easy manual pull-back; blind A/B testing gate before shipping any model update |
| Platform policy risk (Apple/Google) around real-time call audio interception | Medium-High | Engage Apple/Google developer relations early; design real-time feature strictly within documented Voice Processing/Call Extension APIs; have an in-app-only (non-system-wide) fallback ready |
| Cloud inference cost scaling faster than subscription revenue at high usage tiers (Studio/unlimited) | Medium | Usage analytics-driven cost modeling before unlimited-tier pricing finalization; soft fair-use caps with clear ToS; aggressive on-device routing to minimize cloud dependency |
| Competitive response from Adobe/Descript shipping mobile-native one-tap tools | Medium | Speed of execution on vertical-specific presets (real estate/education) as a moat competitors are less likely to prioritize; community/brand around the "one tap" simplicity promise |
| Privacy concerns around uploading personal/professional audio to cloud (client calls, sensitive interviews) | Medium-High | On-device-first default; explicit, granular consent for any cloud processing; zero-human-access policy prominently communicated; SOC 2 compliance roadmap |
| App Store/Play Store subscription fee (15-30%) compressing margins | Medium | Web-based billing path for Team/Business plans where policy permits; pricing modeled with platform fee baked in from day one |
| Diarization/speaker-leveling errors on difficult audio (overlapping speech, similar voices) causing visible quality failures | Medium | Conservative auto-leveling thresholds with manual override always available; clear "detected speakers" confirmation step before applying aggressive per-speaker changes |

---

## 36. Milestones

| Milestone | Target Timeline | Key Deliverables |
|---|---|---|
| **M0 — Foundation** | Weeks 1-6 | Backend core services (auth, library, job queue) scaffolded; mobile app shells (iOS/Android) with navigation; on-device DSP core integrated |
| **M1 — Core Enhancement Alpha** | Weeks 7-14 | Noise suppression + leveling + basic EQ pipeline functional on-device; Record/Import/Enhance/Review flow working end-to-end (internal testing only) |
| **M2 — Enhancement Quality Bar** | Weeks 15-20 | Dereverb, mastering/LUFS normalization, full preset library complete; blind A/B testing shows target quality bar met vs. competitors |
| **M3 — Closed Beta** | Weeks 21-26 | Export flow, account/auth, subscription/paywall, cloud sync complete; closed beta with target persona group (100-300 users) across all five personas |
| **M4 — Public Launch (MVP)** | Weeks 27-30 | App Store/Play Store launch; P0 feature set live; monitoring/analytics/support infrastructure live |
| **M5 — Fast Follow** | Weeks 31-42 | Real-time call enhancement, batch processing, manual fine-tune, multi-speaker leveling shipped (P1 feature set) |
| **M6 — V2 Kickoff** | Week 43+ | Transcript editing, Team plans, desktop companion planning begins based on post-launch retention/usage data |

---

## 37. MVP Definition

The MVP is the smallest complete version of CleanAudio that fully delivers the mission — *"Professional studio-quality audio in one tap"* — for at least the podcaster and social-creator personas, with a credible path for the remaining three.

**MVP includes:**
- Record and Import flows (single-file, no batch)
- Auto Enhance: noise suppression, dereverberation, EQ, dynamics, LUFS mastering — fully on-device for clips up to 30 minutes
- 5 core presets (Podcast, Call, Field, Classroom, Social) with auto-detection
- Before/After review with A-B toggle
- Basic manual fine-tune (noise reduction intensity + loudness target only — full slider suite is P1)
- Export to MP3/WAV with platform loudness presets, via Files and native share sheet
- Guest mode + soft account-gate at export
- Free / Pro / Studio subscription tiers with native IAP
- Cloud library sync (Pro/Studio only)
- Core accessibility (VoiceOver/TalkBack, Dynamic Type, WCAG AA)

**MVP explicitly excludes** (deferred to P1/V2): real-time call enhancement, multi-speaker auto-leveling, batch processing, direct publish integrations, custom presets, transcript editing, Team plans, desktop app.

**MVP success bar:** a podcaster or social creator can go from a raw, noisy phone recording to a platform-ready, correctly-mastered exported file in under 60 seconds of total user interaction time (excluding processing wait), with output quality that wins a blind A/B test against Adobe Podcast and CapCut for the same source clip at least 70% of the time.

---

## 38. V2 Features

- **Transcript-based editing** — full text-based editing of audio (remove filler words, pauses, mistakes by deleting text), tightly integrated with the enhancement pipeline so edits and enhancement compose correctly.
- **Real-time call enhancement (Android parity)** and expanded platform integration for system-wide call audio.
- **Batch processing at scale** — apply a preset to unlimited files with a shared review queue.
- **Multi-speaker auto-leveling** — full diarization-driven per-speaker normalization with a visual speaker timeline editor.
- **Direct publish integrations** — Spotify for Podcasters, YouTube, Descript import/export, one-tap publish from the Export screen.
- **Custom AI preset training** — personalized enhancement tuning learned from a user's manual fine-tune history over time.
- **Team/Business workspace** — shared library, seat-based billing, admin console, approval workflows for agencies/schools/real estate teams.
- **Desktop/web companion app** — for long-form, multi-hour episode editing sessions where mobile screen size is limiting.
- **Music bed auto-ducking** — automatic background music level reduction under speech for creators mixing voice-over with music.
- **Live streaming integration** — real-time enhancement piped into OBS/streaming software for live podcast recording or live-streamed content.

---

*End of Document — CleanAudio PRD v1.0*
