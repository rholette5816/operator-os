# Video Editing Framework and Workflow

The house system for turning raw footage into finished video (reels, talking-head, clean cuts). The `video-studio` skill runs this. This doc is the shared playbook so results are consistent.

How to use it: send a clip + a plain-English request. The assistant runs the workflow below.

---

## PART 1 - The 6 principles (the why)

Every good edit obeys these.

1. **The first 3 seconds decide everything.** Hook in 3 seconds or nothing else matters. Open on the strongest moment, a bold claim, or a question. Never a slow intro.
2. **Structure beats chaos.** Hook -> build -> payoff. The viewer should always feel something is coming. No skeleton means people scroll away.
3. **Captions are non-negotiable.** Most people watch on mute. Captions equal retention. Word-synced, bold, high-contrast, in the safe zone (not under the face, not where the app UI sits).
4. **Cut on meaning, not on a timer.** Remove dead air and mistakes. Cut between phrases, never inside a word. Keep natural breaths. Vary the rhythm so it does not feel frantic.
5. **Sound effects punctuate, never fill.** 10 to 20 well-placed hits across a video. If every cut has a whoosh, it is noise. Voice stays dominant.
6. **The voice is king.** The spoken line is the spine. Music sits 14 to 20 dB under the voice, or leave it off and add trending audio at upload. Graphics show the thing being talked about, they do not repeat the words.

---

## PART 2 - The templates (pick one per video)

### Template A - Short-Form Reel (9:16, 15 to 40 sec)
For IG Reels, TikTok, FB, YouTube Shorts.

| Beat | Time | What |
|---|---|---|
| Hook | 0-3s | Strongest line or visual + bold on-screen hook text |
| Setup | 3-10s | Context: who, what, where |
| Body | 10-80% | The content, tightened, dead air cut |
| Payoff | last 15% | Best shot, punchline, or emotional peak |

- **Framing:** source is usually landscape, so reframe per shot to keep the subject in frame. Never blind center-crop (faces get sliced).
- **Captions:** 2 to 3 word chunks, bold, pop-in, bottom-center safe zone.
- **Music:** none baked in; add trending audio at upload.

### Template B - Split-Screen Talking-Head (the default for talking-head content)
Format: 9:16, 20 to 45 sec, energetic.

Layout:
- **Bottom ~55%** = the talking head (to camera, clean background, consistent framing).
- **Top ~45%** = a supporting visual (screen recording, website, product shot) that illustrates the current sentence.
- When a visual is strong, go full-frame b-roll while the voice continues, then cut back to the face.

Captions (keyword-pop):
- Position at the seam between the two halves (~47 to 50% height).
- Bold condensed all-caps, white by default, 1 to 2 emphasis words per line in a bright accent, thin dark outline + soft shadow.
- 2 to 4 word chunks, tightly word-synced, a new caption roughly every 1 to 1.5s.

Pacing (the signature): change the top visual every ~1.3 to 1.5s to match narration (about 15 to 20 visual changes per 30s). Zero dead air.

What you must supply: the b-roll. This style lives on a relevant visual for almost every sentence. Record the screen-captures, or name what each point is about so the assistant sources them. No good b-roll means the style collapses to a plain talking head.

### Template C - Clean Talking-Head Cut (any ratio, minimal)
For tutorials, pitches, VSLs. Transcribe -> cut silences -> cut mistakes -> keep the payoff -> captions. Tight, clear, no gimmicks.

---

## PART 3 - The workflow (start to finish)

- **Step 0 - Brief.** Send the clip path + format + vibe in plain words.
- **Step 1 - Inspect + transcribe.** Probe the file (resolution, length, audio). Transcribe with word-level timestamps. Flag non-English for review.
- **Step 2 - Plan the cut (LOCK FIRST).** Choose template. Map keep segments, dead air, the hook, the payoff. Approve the cut before any polish. Changing the cut later rebuilds everything.
- **Step 3 - Reframe** (if going vertical). Per-shot framing. Check hero frames.
- **Step 4 - Captions.** Word-synced, correct text, safe-zone placement.
- **Step 5 - SFX + graphics.** Effects per moment. Hooks, tags, end cards.
- **Step 6 - Intro / outro.** Branded cards where the template calls for them.
- **Step 7 - Review.** Watch hero frames, listen, fix the weakest beats.
- **Step 8 - Export + package.** Final MP4. For YouTube add title, thumbnail, description, chapters.

Checkpoints (do not skip): approve the CUT (step 2), the CAPTIONS (step 4), and the FINAL (step 7).

---

## PART 4 - Your job (how to get great results)

The edit can only be as good as the raw material and the direction.

When recording:
- Shoot a strong first line.
- Leave a beat of silence between thoughts (makes clean cuts easy).
- Good light on the face. Keep framing roughly consistent.
- Film a little extra at the start and end for breathing room.

When briefing, say: format (reel / talking-head / clean cut), vibe (warm / funny / professional), platform (sets ratio + caption style), any must-keep moments, and the one line you want as the hook.

When reviewing, check in order: (1) first 3 seconds, does it hook? (2) do captions read and match audio? (3) any dead stretch? (4) do SFX land or feel forced? (5) does the ending pay off?

---

## PART 5 - Tools

- **Edit kit:** installed separately, path set as `VIDEO_KIT_PATH` in `.env`. See `.claude/skills/video-studio/SKILL.md` for install.
- **Transcription:** ElevenLabs (key `ELEVENLABS_API_KEY`).
- **SFX:** use the kit's sound library. Never synthesize effects.
- **Saved projects:** each edit lives in its own project folder inside the kit.

---

## PART 6 - Quick-start phrases (just say one)
- "Make this a 9:16 reel, warm vibe."
- "Cut the dead air and my mistakes, keep it clean."
- "Talking-head split-screen, energetic."
- "15-sec branded showreel."
- "Caption this."
