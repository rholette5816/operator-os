---
name: ads-report
description: Pull live Meta Ads performance and generate a weekly summary with specific, actionable recommendations. Use when the operator wants a weekly ads review, not just raw numbers.
---

# Skill: ads-report

Turn live Meta Ads data into a weekly report with analysis and clear next actions.

## Trigger
- `/ads-report`
- "ads report" / "weekly ads performance" / "how are my ads doing"

## Step 1 - Pull data
Use the `meta-ads` skill to fetch the last 7 days: spend, impressions, reach, clicks, CTR, cost per result, ROAS, frequency, per campaign.

## Step 2 - Generate the report

```
## Meta Ads Weekly Report
Period: [DATE RANGE]
Total Spend: [AMOUNT]
Total Results: [NUMBER]
Avg Cost/Result: [AMOUNT]
ROAS: [X.Xx]

### Campaign Breakdown
| Campaign | Spend | Results | CPR | CTR | Status |

### Top Performers
[Top 2 to 3 by ROAS or lowest CPR] - why it is working (1 to 2 lines).

### Underperformers
[High CPR or low CTR] - recommendation (pause, scale, new creative).

### Creative Insights
[Which creatives drive results - note hook style, format, angle.]

### Recommended Actions This Week
1. [specific action]
2. [specific action]
3. [specific action]
```

## Benchmarks (PH eCommerce COD)
- Good CTR: above 2%
- Good cost per result: below PHP 150 for COD products
- Good ROAS: above 2.5x
- Frequency above 3.0: refresh creative

## Voice
- Direct. No fluff. Flag problems clearly, do not soften bad news.
- Every recommendation must be specific and actionable.
- Use the account's currency. If converting, state the rate you used.
