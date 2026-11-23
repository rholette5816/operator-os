---
name: ad-pipeline
description: One command, full-auto ad creative pipeline for Philippine Meta Ads. Takes a product and runs all four stages end to end without stopping - market research, Eugene Schwartz creative-strategy diagnosis, stage-correct angles, then ad copy - passing each stage's saved file into the next. Produces a bundle of markdown files plus a final summary.
---

# Skill: ad-pipeline

Full-auto orchestrator. Product in, research + strategy + angles + copy out. Runs the whole funnel without stopping between stages:

**market-research -> creative-strategy -> angles -> copy**

Each stage is an existing skill. This skill chains them, passing the saved file from one stage as the input to the next. The fixed section headings are the handoff contract.

## Trigger
- `/ad-pipeline`
- "run the full pipeline for [product]" / "give me everything for [product]" / "research to copy for [brand]"

## Inputs
Minimum: the product/service. Better: business name, target audience, USO, business type, stage, language. If only a product is given, infer sensible PH defaults and state the assumptions at the top. Do not stop to ask (this is the full-auto path). Market is Philippines, language default Taglish.

Pick a brand slug. Output folder: `tmp/ad-pipeline-<brand-slug>-<YYYY-MM-DD>/` (or a brand project folder if one exists).

## Run order (do not stop between stages)
Run each stage by following its SKILL.md. Save each file, then feed it forward.

1. **market-research** -> `research-<date>.md`. Ground the targeting with live Meta data + an Ad Library scan if the MCP is available.
2. **Quality gate (automatic, do not pause).** Check the research has real, specific pains and named current solutions, not filler. If thin, re-run once with a sharper prompt. If still thin, continue but flag it at the top of the summary. Never let empty research flow downstream silently.
3. **creative-strategy** -> `creative-strategy-<date>.md`. Two-dial Schwartz diagnosis from the research.
4. **angles** -> `angles-<date>.md`. 5 stage-correct angles constrained by the diagnosis.
5. **copy** (final stage, inline) -> `copy-<date>.md`. For the 2 strongest angles, write 2 caption variations each using the angle's formula (PAS / BAB / AIDA / Story). Each caption: hook first, benefit body, one line of proof, clear CTA. 3 to 6 lines, natural emojis, mobile-clean, matched to the diagnosed stage. Each with a HEADLINE (max 40 chars) and a CTA BUTTON (Message Now / Learn More / Shop Now / Order Now). Buyer's language. No em dashes.

Image generation is out of this chain. End with a handoff line to the creative step.

## Output
A single tight summary: (1) brand, product, assumptions if input was thin; (2) the diagnosis line (awareness + sophistication + single job); (3) the 5 angle names with one-line core messages; (4) the strongest 2 angles' captions ready to paste; (5) the output folder path with all files listed; (6) next step line. Full detail lives in the saved files.

## Autonomy
Full auto, no checkpoints. The only built-in stop is the research quality gate's single retry. If a stage cannot run (for example the Meta MCP is unavailable for targeting), note it, degrade to reasoning-only, and keep going.

## Cost note
All Meta MCP calls are free reads. No ads created, no spend. The pipeline is text generation plus free reads. Safe to run full auto.
