---
name: market-research
description: Run deep Philippine-market customer research for a product before writing ads - customer profile, pains, desires, fears, internal dialogues, current solutions, competitor gap, and validated targeting. Grounds the targeting with live Meta audience data and Ad Library scans when available. Saves a reusable markdown file that feeds the angles and copy steps.
---

# Skill: market-research

Deep buyer-psychology research for the Philippine market, before a single ad is written. First step of the funnel: **Research -> Strategy -> Angles -> Copy -> Creative**. The output feeds `creative-strategy` and `angles`.

## Trigger
- `/market-research`
- "research this market" / "who is the customer for [product]" / "validate this niche"

## Core principle
The Unique Selling Offer (USO) shapes everything. Frame the pains, desires, and targeting so the offer feels like the answer the customer is already looking for. Stay specific to the Philippine market: real buyer language, real price sensitivity, Facebook/Messenger first.

## Inputs
Business name, product/service, target audience (who they think the buyer is), Unique Selling Offer (the anchor), business type (physical/service/digital), stage (new/scaling/established). If only a product is given, infer sensible PH defaults and state the assumptions. Default language Taglish unless told Bisaya or English.

## Step 1 - Ground the targeting with live data (if the Meta MCP is available)
Pull real signals so targeting is validated, not guessed:
1. `search_interests` for 6 to 10 seed terms. Keep the ones with real audience size.
2. `estimate_audience_size` for the proposed PH targeting to confirm a healthy 500K to 5M range.
3. `search_behaviors` (optional) if purchase/device behavior is relevant.
4. `search_ads_archive` (country PH) for the niche/competitors. Note running angles and the gap nobody fills.

Keep it lean. If the Meta MCP is not configured, say so and produce the report from reasoning, flagging the targeting block as unvalidated.

## Step 2 - Write the report (exact structure, no em dashes)
```
## CUSTOMER PROFILE
- Demographics (age, gender, PH location, income level)
- Psychographics (values, lifestyle, platforms they live on)

## TOP 5 PAINS
## TOP 5 DESIRES   (the end result, not the product)
## TOP 5 FEARS     (what stops them: price, trust, past bad experience, "baka scam")

## INTERNAL DIALOGUES
3 first-person monologues in their real language (Taglish). Vivid and specific.

## CURRENT SOLUTIONS & WHY THEY FAIL

## COMPETITOR GAP (from Ad Library)
Running angles/offers, and the opening nobody uses. Omit cleanly if no data pulled.

## TARGETING SUGGESTIONS (validated)
- Age range, gender
- 10 to 15 Facebook interests, each with live audience size
- Estimated total audience size
- Advantage+ recommendation
```
Tie pains/desires/fears back to the USO so they set up the offer as the answer.

## Step 3 - Save
Save to `tmp/market-research-<slug>-<YYYY-MM-DD>.md` (or a brand project folder if one exists). Top of file: the inputs used + whether targeting was live-validated. Tell the operator the path.

## Downstream
Keep the section headings intact. They are the handoff contract for `creative-strategy` and `angles`.

## Cost note
Meta MCP reads are free. No ads created, no spend.
