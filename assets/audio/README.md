# assets/audio

## `demo-original.mp3` / `demo-enhanced.mp3`

Placeholder audio for the first-launch "Hear the difference" demo
(`src/app/(onboarding)/demo.tsx`, `prompts/04-demo-onboarding-persona.md`).

**These are not the final marketing sample.** They are synthetically
generated so the demo screen's playback UI (segmented Original/Enhanced
control, play/pause, progress) is genuinely functional and testable:

- `demo-original.mp3` — a synthesized tone mixed with white noise.
- `demo-enhanced.mp3` — the **same** source tone with a real FFT-based
  noise-reduction filter applied (`afftdn` + highpass), not a copy of the
  original. The two files are audibly and byte-wise different (verified via
  checksum), so the "before/after" contrast is genuine, not fabricated —
  but it demonstrates a synthetic denoise filter, not CleanAudio's actual
  product-grade enhancement pipeline (that pipeline doesn't exist yet; see
  `prompts/15-audio-domain-and-adapters.md`).

**Before release**, replace both files with a real recorded before/after
pair (per PRD §11.1) produced by an actual human voice recording and a
genuine CleanAudio (or reference) enhancement pass, so the demo reflects the
product's real perceptual quality bar rather than a synthetic placeholder.

Regenerate the placeholders with:

```bash
ffmpeg -y -f lavfi -i "sine=frequency=220:duration=6" \
  -f lavfi -i "anoisesrc=color=white:amplitude=0.18:duration=6:seed=42" \
  -filter_complex "[0]tremolo=f=3:d=0.5[voice];[voice][1]amix=inputs=2:duration=first:weights=1 1,volume=0.9" \
  -ar 44100 -ac 1 -codec:a libmp3lame -b:a 96k demo-original.mp3

ffmpeg -y -f lavfi -i "sine=frequency=220:duration=6" \
  -f lavfi -i "anoisesrc=color=white:amplitude=0.18:duration=6:seed=42" \
  -filter_complex "[0]tremolo=f=3:d=0.5[voice];[voice][1]amix=inputs=2:duration=first:weights=1 1,volume=0.9,afftdn=nf=-30:nr=24,highpass=f=120,volume=1.15" \
  -ar 44100 -ac 1 -codec:a libmp3lame -b:a 96k demo-enhanced.mp3
```
