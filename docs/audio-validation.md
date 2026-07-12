# Real enhancement validation

Date: 2026-07-12. Provider: ElevenLabs Voice Isolator. This is a controlled engineering check, not a claim that every recording will be enhanced perfectly.

## Method

1. Generated a 7.34-second local speech reference with the macOS Samantha voice.
2. Mixed deterministic white noise into the speech and encoded the input as mono 44.1 kHz MP3 at 128 kbps.
3. Sent that noisy input to the real ElevenLabs `/v1/audio-isolation` endpoint using the server-only local environment key.
4. Saved the returned bytes separately and validated both files with FFprobe/FFmpeg.
5. Measured a known speech-free interval (4.36–4.52 seconds) and a speech interval (1–2 seconds) with FFmpeg `astats`.

## Results

| Check | Noisy input | Enhanced output | Result |
|---|---:|---:|---|
| Provider response | — | HTTP 200, `audio/mpeg` | pass |
| File size | 118,326 bytes | 295,750 bytes | pass; non-empty |
| SHA-256 prefix | `4976f2798c9a9cff` | `ea6c98e1efab0980` | pass; distinct output |
| Duration | 7.3356 s | 7.3154 s | pass; speech duration preserved within 21 ms |
| Decode | MP3, mono, 44.1 kHz | MP3, mono, 44.1 kHz | pass |
| Silence-window RMS | -35.42 dB | -89.71 dB | 54.29 dB lower residual noise |
| Speech-window RMS | -20.47 dB | -19.13 dB | speech energy retained, +1.34 dB |

The test demonstrates genuine noise removal on the controlled sample: the speech-free noise floor dropped substantially while speech-region energy remained present. The output is not a copied or renamed original.

## Honest limits

- This single synthetic-voice/white-noise test does not cover traffic, wind, reverb, music, overlapping speakers, clipping, low sample rates, or different languages and voices.
- Listening-panel naturalness, intelligibility, artifact rate, and competitor comparisons have not been completed.
- ElevenLabs Voice Isolator is noise/speech isolation. It does not prove the PRD's separate EQ, compression, dereverb, true-peak, or BS.1770 LUFS mastering requirements.
- Production validation still needs a licensed representative corpus, objective metrics plus human listening, and physical-device end-to-end testing through the deployed authenticated API.

## Deployment evidence

- EAS Hosting production URL: `https://cleanaudio.expo.app`
- Route: `POST /api/enhance`
- Production unauthenticated upload result: HTTP 401 with `AUTHENTICATION_REQUIRED` (expected fail-closed behavior).
- EAS production environment contains the server-only Clerk and ElevenLabs variables as sensitive values; their values are not stored in tracked files or verification output.
