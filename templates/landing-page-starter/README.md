# Landing Page Starter

A complete lead-gen funnel you copy per brand. Static site + Vercel serverless functions. The `landing-page` skill drives the build; full playbook in `references/sops/lead-funnel-build.md`.

This starter ships with a working EXAMPLE funnel (a home-assessment quiz) so you can see the real shape. Replace all of it for your brand.

## Stack
- Vercel (static site + `api/*.js` Node functions)
- Supabase (leads + CRM)
- Resend (emails, needs a verified domain)
- Telegram (new-lead alert)
- Meta Pixel + Conversions API (ad tracking)

## What to customize (in order)
1. **Branding** - logo, colors, name, legal disclosure in `index.html` and `styles.css`.
2. **The assessment** - `scoring.js` (the questions, the fit logic, the recommendation) and the form fields in `index.html`.
3. **Thank-you page** - `thank-you.html` / `thank-you.js` (recommendation text + your `m.me` handle).
4. **Emails (optional)** - `sequence-emails.json` and the render in `api/_sequence.js`. Keep sending off until launch.
5. **Assets** - add your own images to an `assets/` folder and update the references. The example's assets are not included.

## Setup
1. Create a Supabase project. Run the SQL files in `supabase/migrations/` in its SQL editor.
2. Copy the OS `.env.example` and fill the `BRAND_*`, `RESEND_API_KEY`, `TELEGRAM_*`, and `META_*` keys.
3. Add the same env vars in your Vercel project settings (the agent cannot write platform secrets).
4. Deploy: `vercel deploy --prod --yes` (add `--scope <your-team>` if needed).

## Rules
- Email sending stays OFF until you set `BRAND_SEQUENCE_ENABLED=true`.
- Run the usage-cost safety review (`references/sops/usage-cost-safety.md`) before enabling the daily cron.
- Never commit `.env`.
