---
name: angles
description: Generate 5 distinct, stage-correct marketing angles for a Philippine Meta Ads product, constrained by an Eugene Schwartz diagnosis. Reads a market-research file and a creative-strategy diagnosis, then outputs angles with core message, a 3C hook line, copy formula, why it works, and the unique selling offer. Saves a markdown file that feeds the copy step.
---

# Skill: angles

Generate 5 angles that are correct for where the market's head is, not generic. Third in the funnel: **Research -> creative-strategy -> angles -> Copy**.

## Trigger
- `/angles`
- "generate angles for [product]" / "find the angle" / "stage-correct angles"

## Inputs
Prefer the saved files: the `market-research` output and the `creative-strategy` diagnosis. If the strategy file is missing, run `creative-strategy` first. Angles without the diagnosis are guessing.

Pull from research: TOP 5 PAINS, DESIRES, FEARS, INTERNAL DIALOGUES, CURRENT SOLUTIONS.
Pull from strategy: the awareness stage, the sophistication stage, the single job of the creative.

## The Schwartz constraint (do this first)
Restate the diagnosis in one line and let it govern every angle:
- **Awareness** decides what each angle leads with (Unaware -> story; Problem Aware -> the pain; Solution Aware -> result + mechanism; Product Aware -> proof + differentiation; Most Aware -> offer + urgency).
- **Sophistication** decides how the claim is made (Stage 1-2 plain/enlarged; Stage 3 name a mechanism; Stage 4 better mechanism; Stage 5 identity).
No angle may violate the diagnosis.

## Output (exactly 5 angles, buyer's real language, Taglish default, no em dashes)
```
ANGLE [n]: [NAME]  (type: Problem / Solution / Transformation / Story / Testimonial)
- Awareness/Sophistication fit: [which stage this serves]
- Core Message: one sentence, the single idea
- Hook Line: the opening line, using the 3C formula -
  Context (who/what situation) + Curiosity (something unresolved) + Clarity (what they get).
  Punchy, scroll-stopping, in the buyer's language.
- Formula: PAS / BAB / AIDA / Story
- Why It Works: one sentence tied to a specific research insight
- Unique Selling Offer: the offer that makes it compelling + a reason to act now
```
Spread the 5 across different pains/desires and awareness entry points where the diagnosis allows, so there is real variety to test.

## Save and hand off
Save as `angles-<YYYY-MM-DD>.md` next to the research file. Top of file: the brand, the diagnosis line used, the research file it drew from. The chosen angle (hook + formula + offer) is the input to the copy step.

## Cost note
Reasoning only. No spend, no ads created.
