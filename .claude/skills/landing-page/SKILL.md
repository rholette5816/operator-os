---
name: landing-page
description: Spin up a complete lead-gen funnel for a new brand - assessment landing page, lead capture (Supabase + Telegram + Resend email), thank-you page, CRM dashboard, optional daily email nurture engine, and first-party analytics. Use when the operator wants a landing page or funnel for a brand or offer. Copies the landing-page-starter template.
---

# Skill: landing-page

Spin up a full lead/sale funnel for a brand. Full playbook: `references/sops/lead-funnel-build.md`. Read it before building.

## Trigger
- `/landing-page`
- "build a landing page for [brand]" / "spin up a funnel for [offer]" / "lead funnel for [brand]"

## Inputs
Ask for: brand name, what the offer is, the Messenger handle (m.me/...), and the domain (if any). Collect in one message.

## Template
Copy `templates/landing-page-starter/` to a new project folder. It is a static site + `api/*.js` Vercel serverless functions. It ships with a working example funnel so the shape is visible. Replace every piece of its copy, the assessment questions in `scoring.js`, and the content in `index.html` for the new brand.

## What it builds
- **Landing assessment:** `index.html` + `app.js` + `scoring.js`. Submit -> `/api/submit` (saves lead to Supabase, normalizes PH phone to +63, Telegram alert, result email via Resend). The lead is captured at submit, before Messenger.
- **Thank-you:** `thank-you.html` + `thank-you.js` (recommendation + auto-redirect to m.me).
- **CRM:** `crm.html/.js/.css` + `api/crm.js` - login-protected dashboard to list, search, filter, delete leads.
- **Email nurture (dormant behind `BRAND_SEQUENCE_ENABLED`):** `sequence-emails.json` + `_sequence.js` rendered daily by `sequence-cron.js`, with quiet hours and a daily cap; `msg.js` + `unsubscribe.js` handle clicks.
- **Analytics:** events table + analytics function; `api/track.js` + `api/analytics.js`; dashboards `analytics.html` + `email-preview.html`.

## Steps
1. Copy template, rebrand (logo, colors, name, disclosure, m.me handle, domain). Rewrite `scoring.js` + form fields for the offer.
2. Create a Supabase project. Run the migrations in `supabase/migrations/` in the SQL editor.
3. (Optional) Write the email sequence and parse it to `sequence-emails.json`. Add hero images (~160 KB JPG).
4. List the env vars for the operator to add in Vercel (see the SOP). The agent cannot write platform secrets. Keep `BRAND_SEQUENCE_ENABLED` unset.
5. Deploy dormant. Preview emails and the CRM. Test-send one email to the operator.
6. Launch only when the operator sets `BRAND_SEQUENCE_ENABLED=true`.

## Email parser (emails.md -> sequence-emails.json)
Split on `^### (E\d+) - (title)`, read `**Subject:**`, body = lines until `---`. Phase from `## PHASE n - name`. Preserve 4-space indent blocks (they render as callout boxes).

## Rules
- Build and deploy DORMANT. The operator flips the env flag to launch. Never enable sending yourself.
- The agent cannot write platform secrets. Always hand env vars to the operator.
- Resend needs a verified sending domain. Open tracking is approximate.
- Run `references/sops/usage-cost-safety.md` before enabling the metered cron.
- No em dashes in any copy.
