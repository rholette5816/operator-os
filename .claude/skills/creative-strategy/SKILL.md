---
name: creative-strategy
description: Diagnose a market with Eugene Schwartz's two dials - Market Awareness and Market Sophistication - to set creative direction before angles are written. Reads a market-research file (or inline context) and returns the awareness stage, the sophistication stage, the evidence, and the single job of the creative. Saves a markdown file that constrains the angles step.
---

# Skill: creative-strategy

Eugene Schwartz diagnosis layer. Sits between research and angles: **Research -> creative-strategy -> Angles -> Copy**.

Core truth from Breakthrough Advertising: you cannot create desire, only channel the mass desire that already exists onto the product. The two dials decide how to channel it.

## Trigger
- `/creative-strategy`
- "diagnose this market" / "where is this market's awareness" / "make the angles stage-correct"

## Inputs
Prefer a saved `market-research` file. If none, take inline context: product, audience, USO, business type, stage. If thin, run `market-research` first. Context is PH market, cold-to-warm Facebook/Messenger traffic unless stated otherwise.

## Dial 1 - Market Awareness (where the prospect's head is before the ad)
1. **Unaware** - lead with story/callout, never the product.
2. **Problem Aware** - lead with the pain in their words.
3. **Solution Aware** - lead with the result plus the mechanism.
4. **Product Aware** - lead with proof, differentiation, offer.
5. **Most Aware** - lead with price, offer, urgency.
Rule: colder traffic and earlier stage means lead more with problem/desire, less with the product.

## Dial 2 - Market Sophistication (how many claims the market has heard)
1. First to market - plain direct claim.
2. Claim copied - enlarge it (bigger, faster, guaranteed).
3. Claims maxed out - introduce a mechanism (why it works).
4. Mechanism copied - make yours better/easier/faster.
5. Market numb - sell identity and experience.
Rule: most PH ecom niches (skincare, supplements, jewelry, shoes) sit at Stage 3 to 4 on cold traffic. A named mechanism beats a louder claim.

## How to diagnose
1. Read the research pains, desires, fears, current solutions.
2. Awareness call: raw problem language and no named solutions means Problem Aware; listing tried products/brands means Solution or Product Aware. State the evidence.
3. Sophistication call: many players making the same promise means Stage 3+; everyone already naming a mechanism means Stage 4+. State the evidence.
4. Cross the two dials to get the single job of the ad.

## Output (save a copy as `creative-strategy-<YYYY-MM-DD>.md`, no em dashes)
```
## MARKET AWARENESS: [stage]  (secondary: [stage] if mixed)
Reasoning: [specific evidence from the research]
What the ad must do: [what to lead with, what to hold back]

## MARKET SOPHISTICATION: [stage]
Reasoning: [claim saturation, mechanism presence]
What the ad must do: [plain / enlarge / name mechanism / better mechanism / identity]

## THE SINGLE JOB OF THE CREATIVE
One sentence crossing both dials. Name the mechanism to lead with if the stage calls for one.
```

## Handoff
The diagnosis is the constraint for `angles`. Feed this file in so every angle is built for the diagnosed stage.

## Cost note
Reasoning only. No spend, no ads created.
