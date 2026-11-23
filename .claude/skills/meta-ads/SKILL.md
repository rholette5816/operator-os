---
name: meta-ads
description: Pull live Meta Ads performance data via the Marketing API and show account + campaign metrics. Use when the operator wants to see how their ads are doing.
---

# Skill: meta-ads

Pull live performance data from a Meta Ads account via the Marketing API.

## Trigger
- `/meta-ads`
- "pull my ad data" / "how are my ads doing" / "show my campaign performance"

## Prerequisites
- `.env` with:
  - `META_ACCESS_TOKEN` - a long-lived user or system token with `ads_read`
  - `META_AD_ACCOUNT_ID` (optional) - `act_XXXXXXXXXX`, if you want to pin one account
- Python with `requests` and `python-dotenv`:
  ```bash
  pip install -r scripts/requirements.txt
  ```

The script auto-discovers active ad accounts on the token, so a single token is enough.

## How to run
```bash
python scripts/meta-ads.py last_7d        # account + campaign breakdown
python scripts/meta-ads.py today
python scripts/meta-ads.py last_7d "BRAND" # filter to accounts whose name contains BRAND
```

## What it pulls
- **Account overview** - spend, reach, clicks, CTR, CPC, landing-page views, purchases, leads, and cost per result.
- **Campaign breakdown** - per campaign: spend, clicks, CTR, hook rate, LP views, purchases, cost per purchase (spend > 0 only, sorted by spend).

Currency is read from each account (PHP or USD).

## Usage notes
- Tokens expire. On an auth error, generate a new one at developers.facebook.com/tools/explorer.
- These are free API reads. No ads are created, no spend.
- Never commit `.env`. Never paste the token into chat.
- To extend: add fields (reach, frequency, roas) or change `level` to `ad` for ad-level data in `scripts/meta-ads.py`.
