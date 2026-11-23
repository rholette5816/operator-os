# SOP: Lead-Gen Funnel + Email Nurture System

Reusable playbook to spin up a lead-generation funnel for any brand. Pairs with the `landing-page` skill.

**Template to copy:** `templates/landing-page-starter/`
**Stack:** Vercel (static site + `api/*.js` Node serverless functions), Supabase (Postgres via PostgREST), Resend (email), Telegram (alerts), Meta Pixel + Conversions API (ads).
**Deploy:** from the project folder, `vercel deploy --prod --yes` (add `--scope <your-team>` if you deploy under a team).

---

## What the system does

1. **Landing page** with a multi-step assessment/quiz (`index.html` + `app.js` + `scoring.js`).
2. On submit -> `/api/submit`: validates, normalizes PH phone to +63, saves the lead to Supabase, fires a Telegram alert, and sends a branded result email (Resend). The lead is captured HERE, before any Messenger step, so you always keep name, phone, and email.
3. **Thank-you page** (`thank-you.html` + `thank-you.js`): shows the recommendation and auto-opens Messenger (`m.me`) after a short countdown.
4. **CRM** (`crm.html/.js/.css` + `api/crm.js`): a login-protected dashboard to list, search, filter, and delete leads.
5. **Email nurture engine** (dormant behind an env flag): a daily cron sends a value-email sequence; auto-unsubscribe on CTA click.
6. **First-party analytics**: the landing funnel (page view -> steps -> lead -> Messenger) and the email funnel (sent / open / click), shown in the CRM.

---

## Build steps (new brand)

### 1. Copy + rebrand
- Copy `templates/landing-page-starter/` to your project folder.
- Swap: logo/emblem, colors, brand name, legal disclosure, m.me handle, domain.
- Rewrite `scoring.js` (fit logic + recommendation) and the form fields in `index.html` for your offer.
- The starter ships with a working example (a home-assessment funnel) so you can see the shape. Replace all of its copy, questions, and recommendations with your own.

### 2. Supabase
- Create a free Supabase project. Run the migrations in `supabase/migrations/` in the SQL editor (leads/CRM table, sequence columns, events table + analytics function). Rename the table prefix if you want.

### 3. Email sequence (optional, start dormant)
- Write the email content and parse it to `sequence-emails.json` (the skill explains the parser).
- Add hero images, optimized to about 160 KB JPG.
- `_sequence.js` renders each email (header band, hero, body, Messenger CTA, footer).

### 4. Env vars (you add these in Vercel; the agent cannot write platform secrets)
`BRAND_SUPABASE_URL`, `BRAND_SUPABASE_SECRET_KEY`, `RESEND_API_KEY` (needs a verified sending domain), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `META_PIXEL_ID`, `META_CAPI_TOKEN`, `BRAND_EMAIL_FROM`, `BRAND_EMAIL_REPLY_TO`, `BRAND_MESSENGER_URL`, `BRAND_SITE_URL`, `BRAND_CRM_USERNAME`, `BRAND_CRM_PASSWORD`, optional `CRON_SECRET`. Leave `BRAND_SEQUENCE_ENABLED` UNSET until launch.

### 5. Deploy + preview
- Deploy. Preview emails via `email-preview.html` and check the CRM.
- Test-send one email to your own inbox before launch.

### 6. Launch
- Set `BRAND_SEQUENCE_ENABLED=true` in Vercel. The daily cron enrolls leads and starts sending within quiet hours and a daily cap.

---

## Gotchas and rules

- **Sending is always gated behind an env flag.** Build and deploy dormant. Flip the flag to go live.
- **The agent cannot write platform secrets.** It lists the env vars; you add them in the dashboard.
- **Resend needs a verified sending domain** or it rejects sends. Open tracking is approximate; treat Messenger clicks and replies as the real intent signal.
- **An m.me personal profile has no bot or auto-greeting.** People land in a blank chat and often do not type. A Facebook Page + Botcake auto-greets and captures the `?ref=`. The form submit is the real conversion; Messenger is secondary.
- **Analytics endpoint:** wrap the Supabase call in a short timeout; the client should read text then `JSON.parse`, so an HTML error page shows a friendly message instead of crashing.
- **Usage-cost safety:** complete `references/sops/usage-cost-safety.md` before enabling the metered cron.
