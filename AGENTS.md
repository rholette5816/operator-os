# AGENTS.md

Rules for Codex CLI (and any coding agent) working in this repo. This mirrors `CLAUDE.md`. If the two ever differ, `CLAUDE.md` wins.

## What this repo is

Operator OS: a lean starter system for running a PH eCommerce + Meta Ads business. Three core jobs (video, landing pages, Botcake prompts) plus ads tooling. Built to stay small and cheap on tokens.

## How to operate

- Reuse before building. Check `references/sops/`, `.claude/skills/`, and `templates/` first.
- Skills are instruction sets in `.claude/skills/<name>/SKILL.md`. Follow the matching one.
- Templates in `templates/` are starting points you copy, not edit in place.

## Token and context conservation (hard rules)

- Do not read more than ~200 lines without a reason. Prefer `grep -n` to find lines, then read a narrow range.
- Never re-read a file already in context this session.
- Use search (grep/glob) before reading whole files. Scope the path.
- Batch independent reads/edits together.
- Never run installs or builds "just to check." Only when a specific step needs it.
- Do not open every file in a folder. Read what the task touches.

## Secrets and safety

- All keys come from `.env` (template: `.env.example`). Never commit `.env`. Never print a real key.
- You cannot write platform secrets (Vercel, Supabase env). List them for the operator to add.
- Before deploying anything hosted, scheduled, or metered, complete `references/sops/usage-cost-safety.md` and report the cost math. Never ship unbounded or high-frequency usage.

## Code conventions

- No em dashes in any output or copy.
- Match the existing style of the file you are editing.
- Make mutations explicit. A read or a dashboard load must never write or refresh provider data.
- Keep changes minimal and on-task. Report what you changed and what you did not.

## Git

- Do not commit unless asked. Never commit `.env` or anything with secrets.
- Keep commits focused. State clearly what the change does.
