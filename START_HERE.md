# START HERE

Welcome. This is your Operator OS: a small, ready-to-run system for building a product + ads business. It works with Claude Code and with Codex CLI.

You do not need to be technical. You talk in plain words. The OS does the work.

---

## What it can do (day one)

1. **Make a video** - drop a clip, get a captioned short-form video. Say: "make this a 9:16 reel."
2. **Build a landing page** - spin up a full funnel for a brand. Say: "build a landing funnel for [brand]."
3. **Write a chatbot** - a Messenger (Botcake) system prompt that sells or books. Say: "build a botcake prompt for [product]."
4. **Check your ads** - pull live Meta Ads numbers. Say: "how are my ads doing."
5. **Get ad creative** - research to angles to copy. Say: "run the full pipeline for [product]."

---

## First-time setup (10 minutes)

1. **Install a tool to run it.** Either:
   - Claude Code (CLI, desktop app, or VS Code extension), or
   - Codex CLI.
   Open this folder (`operator-os`) in it.

2. **Copy the secrets file.**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in only the keys you need for the job you are doing. Each line says where to get the key. You do not need all of them at once.

3. **For video only:** install the edit kit once (see `.claude/skills/video-studio/SKILL.md`), then set `VIDEO_KIT_PATH` in `.env`.

4. **Never share your `.env`.** It holds your private keys. It is already ignored by git.

---

## How to use it

Just ask. Examples:
- "Make this clip a 9:16 reel, warm vibe."
- "Build a lead funnel for AquaGlow, a water-heater brand."
- "Write a botcake prompt for my collagen product, 2 bundles, COD, J&T."
- "Pull my ad data for the last 7 days."
- "Give me everything for this product: research, angles, and copy."

The assistant will ask for anything it needs, do the work, and tell you where the output is.

---

## The golden rules this OS follows

- It keeps sessions cheap (reads only what it needs). See `context/how-to-work.md`.
- It never spends money or deploys anything without showing you the cost first.
- It never sends a real key anywhere or commits your secrets.

---

## Where things live

- `CLAUDE.md` / `AGENTS.md` - the brain and rules (Claude / Codex).
- `context/` - who you are operating as, and how the OS works.
- `.claude/skills/` - the skills (one folder each).
- `references/sops/` - the step-by-step playbooks.
- `templates/` - starter code you copy.
- `tmp/` - scratch space.

Read `context/operator.md` next to set your market, brand, and voice.
