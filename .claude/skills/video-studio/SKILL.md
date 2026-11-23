---
name: video-studio
description: Turn a raw clip into a finished short-form video (9:16 reel, split-screen talking-head, or clean cut) with word-synced captions and well-placed SFX. Use when the operator sends a clip and wants it edited for Reels, TikTok, FB, or YouTube Shorts. Runs the house video-editing framework on top of an installed edit kit.
---

# Skill: video-studio

Turn a clip into a finished short-form video. This skill runs the house framework in `references/sops/video-editing-framework.md`. Read that SOP for the principles, templates, and step-by-step workflow. This file covers setup and how to run.

## Trigger
- `/video-studio`
- "make this a reel" / "edit this clip" / "cut the dead air" / "caption this"

## One-time setup (required before first use)

This skill drives an external edit kit (a Node project). It is not bundled because it is large. Install it once:

1. Obtain the edit kit (a Node + ffmpeg video toolkit). Place it anywhere on disk.
2. Install its dependencies once:
   ```bash
   cd <path-to-kit> && npm install
   ```
3. Install ffmpeg if you do not have it (ffmpeg.org, or `choco install ffmpeg` / `brew install ffmpeg`).
4. In the OS `.env`, set:
   - `VIDEO_KIT_PATH` = absolute path to the kit
   - `ELEVENLABS_API_KEY` = your ElevenLabs key (used for transcription)

If `VIDEO_KIT_PATH` is not set, ask the operator to complete setup before editing.

## How to run

1. **Brief.** Get the clip path, the target format (reel / talking-head / clean cut), the vibe, and the platform.
2. **Pick the template** from the SOP (A reel, B split-screen talking-head, C clean cut).
3. **Transcribe** the clip (word-level timestamps). Verify the word times against the real audio before cutting.
4. **Plan the cut and get it approved** before any polish. This is the lock point.
5. **Reframe, caption, add SFX** per the SOP. Pull SFX from the kit's sound library, never synthesize them.
6. **Review** the hero frames and the first 3 seconds. Fix the weakest beats.
7. **Export** the final MP4 into a project folder inside the kit.

## Checkpoints (do not skip)
Approve the CUT, then the CAPTIONS, then the FINAL. Changing the cut after polish rebuilds everything.

## Rules
- Captions on every video. Word-synced, bold, safe zone.
- Voice is the spine. Music sits 14 to 20 dB under it, or off (add trending audio at upload).
- SFX punctuate, never fill. 10 to 20 across a video.
- Ask before any long render or re-render. "Continue" is not approval to burn a render.
- No em dashes in any on-screen text.
