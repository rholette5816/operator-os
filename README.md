# Operator OS

A ready-to-run AI operating system for building a product and ads business. You talk to it in plain words, and it does the work: edits your videos, builds your landing pages, writes your Messenger chatbot, and checks your ads.

Built for the Philippine market (COD funnels, Facebook and Messenger first). Works with **Claude Code** or **Codex CLI**. No coding required to use it.

---

## Who this is for

Beginners. If you are new to AI tools and new to running an online business, this is for you. You do not need to know how to code. You just need to be able to copy a folder, fill in a few keys, and type what you want.

---

## What it can do (day one)

| You want to... | You say... | It uses... |
|---|---|---|
| Edit a raw clip into a reel | "make this a 9:16 reel" | `video-studio` |
| Launch a landing page / funnel | "build a landing funnel for my brand" | `landing-page` |
| Write a Messenger sales bot | "build a botcake prompt for my product" | `botcake` |
| See how your ads are doing | "how are my ads doing?" | `meta-ads` |
| Get a weekly ads report | "give me my ads report" | `ads-report` |
| Go from product to ready ad copy | "run the full pipeline for my product" | `ad-pipeline` |

Behind those, there are also deeper skills for research (`market-research`), strategy (`creative-strategy`), and angles (`angles`).

---

## Why it is different

- **It stays cheap.** The OS is built to use as few AI tokens as possible. It reads only what a task needs instead of loading everything. That keeps your cost and your bill low.
- **It is safe by default.** It never spends money or publishes anything without showing you the cost first. It never puts your secret keys anywhere they do not belong.
- **It is yours to brand.** There is no one else's name, logo, or data inside. You fill in your own.

---

## Get your own copy (2 minutes)

This is a GitHub **template**. You do not fork it, you copy it.

1. Click the green **Use this template** button at the top of this page.
2. Choose **Create a new repository**.
3. Give it a name (for example, `my-business-os`) and create it.
4. On your new repo, click **Code** and download it, or clone it if you know how.

Now you have your own private copy to fill in.

---

## First-time setup (about 10 minutes)

1. **Install a tool to run it.** Either:
   - [Claude Code](https://claude.com/claude-code) (terminal, desktop app, or VS Code extension), or
   - Codex CLI.

   Open your copy of the `operator-os` folder inside it.

2. **Make your secrets file.** In the folder, copy the example:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in only the keys for the job you are doing. Each line tells you where to get that key. You do not need all of them at once. For example, to pull ad data you only need `META_ACCESS_TOKEN`.

3. **Never share your `.env` file.** It holds your private keys. It is already ignored by git, so it will not be uploaded by accident.

4. **For video only:** install the edit kit once (see `.claude/skills/video-studio/SKILL.md`) and set `VIDEO_KIT_PATH` in `.env`. The kit is not included here because it is very large.

Read [`START_HERE.md`](START_HERE.md) for the friendly walkthrough, then [`context/operator.md`](context/operator.md) to tell it about your brand.

---

## How to use it

Just ask. Some examples:

- "Make this clip a 9:16 reel, warm vibe."
- "Build a lead funnel for AquaGlow, a water-heater brand."
- "Write a botcake prompt for my collagen product, 2 bundles, COD, J&T courier."
- "Pull my ad data for the last 7 days."
- "Give me everything for this product: research, angles, and copy."

It will ask for anything it needs, do the work, and tell you where the result is.

---

## What is inside

```
operator-os/
  README.md                 you are here
  START_HERE.md             beginner first-run guide
  CLAUDE.md                 the brain + rules (for Claude Code)
  AGENTS.md                 the same rules (for Codex)
  .env.example              copy to .env, fill in your keys
  context/
    operator.md             tell it about you and your brand
    how-to-work.md          the rules that keep it cheap to run
  .claude/skills/           the skills (one folder each)
    video-studio/           turn clips into finished videos
    landing-page/           build a full lead/sale funnel
    botcake/                write Messenger chatbot prompts
    meta-ads/               pull live Meta Ads numbers
    ads-report/             weekly ads report + recommendations
    ad-pipeline/            research to copy, one command
    market-research/        deep buyer research
    creative-strategy/      Eugene Schwartz diagnosis
    angles/                 5 stage-correct ad angles
  references/sops/          step-by-step playbooks
  templates/
    landing-page-starter/   funnel code you copy per brand
  scripts/
    meta-ads.py             the live ads data puller
```

---

## The three main skills, explained

### 1. Video (`video-studio`)
Send a raw clip and say what you want. It transcribes the audio, plans the cut, reframes for vertical, adds word-synced captions, and places sound effects. Follows a proven framework (hook in the first 3 seconds, cut the dead air, captions on everything). The actual editing runs on a free, separate edit kit you install once.

### 2. Landing page (`landing-page`)
Spins up a complete funnel for a brand: an assessment landing page, lead capture that saves every lead, a thank-you page that opens Messenger, a simple CRM dashboard, an optional email follow-up engine, and first-party analytics. It copies the `landing-page-starter` template and rebrands it for you. You add your own keys and deploy it free on Vercel.

### 3. Botcake (`botcake`)
Writes a complete, paste-ready Messenger chatbot instruction. Two modes: **ecom** (a COD product, built to close the sale) and **service** (a booked service, built to qualify the lead then book). You answer a few questions, it writes the full prompt, you paste it into Botcake.

---

## A note on cost and safety

Some jobs use paid services (Supabase, Resend email, the Meta API, AI models). This OS always shows you the cost math before deploying anything that runs on a timer or calls a paid service, and it refuses to ship anything that could run out of control. If you want to understand the rule, it is in [`references/sops/usage-cost-safety.md`](references/sops/usage-cost-safety.md).

---

## License and credit

Use it, change it, make it your own. The video edit kit it builds on is a separate open-source (MIT) project you install yourself.
