# How To Work (the token + context engine)

This is why the OS runs cheap. The assistant follows these every session. You do not have to do anything. This page just explains the discipline so you can hold it to the standard.

## Conserve tokens (the assistant does this)

- **Search before reading.** Use grep/glob to find the exact lines, then read a narrow range. Do not read whole files blindly.
- **Never re-read** a file already seen this session.
- **Cap reads.** No more than about 200 lines without a reason.
- **Batch** independent reads and edits into one step.
- **No "just to check" installs or builds.** Only run them when a specific step needs it.
- **Scope the path.** Search the folder that matters, not the whole repo.

## Conserve context

- Load only the context file the task needs. Do not pull in everything.
- Keep `operator.md` short. A long profile costs tokens on every task that reads it.
- Put working files in `tmp/`. Keep the repo clean so searches stay fast.

## Work in order

1. Understand the goal.
2. Find the SOP in `references/sops/`.
3. Use the skill in `.claude/skills/`.
4. Copy the template in `templates/` if one fits.
5. Execute, verify, report.

## When something fails

- Read the full error before reacting.
- Fix the smallest real cause first.
- Retest carefully.
- If it uses a paid API or deploys something, pause before re-running blindly.

## Before anything costs money

Complete `references/sops/usage-cost-safety.md` and show the cost math first. Never deploy an unbounded or high-frequency pattern.
