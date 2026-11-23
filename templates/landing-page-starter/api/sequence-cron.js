// Daily email-sequence cron. Enrolls new leads, then sends each due lead their
// next email. DORMANT until BRAND_SEQUENCE_ENABLED=true: with the flag unset it
// returns immediately and sends nothing, even though Vercel fires it daily.

const { supabaseRequest } = require("./_supabase");
const { EMAILS, buildEmail, sendResend } = require("./_sequence");

const DAILY_CAP = Math.max(1, Math.min(Number(process.env.BRAND_SEQUENCE_DAILY_CAP) || 80, 95));
const QUIET_START = 8;   // PH local hour, inclusive
const QUIET_END = 20;    // PH local hour, exclusive

function phHour() {
  return (new Date().getUTCHours() + 8) % 24; // GMT+8
}

async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (process.env.BRAND_SEQUENCE_ENABLED !== "true") {
    return res.status(200).json({ ok: true, skipped: "disabled" });
  }

  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: "Unauthorized." });
  }

  const hour = phHour();
  if (hour < QUIET_START || hour >= QUIET_END) {
    return res.status(200).json({ ok: true, skipped: "quiet-hours", phHour: hour });
  }

  const nowIso = new Date().toISOString();
  let enrolled = 0;

  // 1. Enroll any lead not yet in the sequence (and not opted out) with an email.
  try {
    const rows = await supabaseRequest(
      "brand_crm_leads?sequence_enrolled=is.false&sequence_unsubscribed=is.false&email=not.is.null&select=submission_id",
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: { sequence_enrolled: true, sequence_position: 0, sequence_next_send_at: nowIso }
      }
    );
    enrolled = Array.isArray(rows) ? rows.length : 0;
  } catch (error) {
    console.error("Sequence enroll failed", error.message);
  }

  // 2. Send to everyone due, up to the daily cap.
  let sent = 0, failed = 0;
  try {
    const due = await supabaseRequest(
      "brand_crm_leads?sequence_enrolled=is.true&sequence_unsubscribed=is.false" +
      `&sequence_position=lt.${EMAILS.length}&sequence_next_send_at=lte.${encodeURIComponent(nowIso)}` +
      `&select=*&order=sequence_next_send_at.asc&limit=${DAILY_CAP}`
    );
    for (const lead of Array.isArray(due) ? due : []) {
      const index = Number(lead.sequence_position) || 0;
      const email = buildEmail(lead, index);
      if (!email || !lead.email) continue;
      try {
        await sendResend({ to: lead.email, subject: email.subject, html: email.html, text: email.text });
        const next = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await supabaseRequest(`brand_crm_leads?submission_id=eq.${encodeURIComponent(lead.submission_id)}`, {
          method: "PATCH",
          body: { sequence_position: index + 1, sequence_last_sent_at: nowIso, sequence_next_send_at: next }
        });
        supabaseRequest("brand_events", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: { event: "email_sent", channel: "email", email_id: email.id, lead_id: lead.submission_id }
        }).catch((e) => console.error("sent log failed", e.message));
        sent++;
      } catch (error) {
        failed++;
        console.error("Sequence send failed", lead.submission_id, error.message);
      }
    }
  } catch (error) {
    console.error("Sequence due query failed", error.message);
    return res.status(502).json({ ok: false, error: "Sequence run failed.", enrolled });
  }

  return res.status(200).json({ ok: true, enrolled, sent, failed, phHour: hour });
}

module.exports = handler;
