// Automated lead email (Resend). Fired non-blocking from submit.js after the
// Supabase save. Missing RESEND_API_KEY makes this a no-op so submissions never
// break. Transactional: the lead requested this assessment, so it sends
// regardless of the marketing-consent checkbox.

const SITE_URL = (process.env.BRAND_SITE_URL || "https://yourbrand.com").replace(/\/$/, "");
const FROM = process.env.BRAND_EMAIL_FROM || "Brand Clean Energy <hello@yourbrand.com>";
const REPLY_TO = process.env.BRAND_EMAIL_REPLY_TO || "you@yourbrand.com";
const MESSENGER_URL = process.env.BRAND_MESSENGER_URL || "https://m.me/brandFounder";

// Per-email cooldown guard against repeat sends to the same address (best-effort
// in-memory, same approach as the IP limiter in submit.js; Resend's daily cap is
// the hard backstop).
const EMAIL_COOLDOWN_MS = 10 * 60 * 1000;
const recentEmails = new Map();

const PACKAGES = {
  6: { panels: 6, battery: "1 Dyness 314Ah battery" },
  8: { panels: 8, battery: "1 Dyness 314Ah battery" },
  10: { panels: 8, battery: "1 Dyness 314Ah battery" },
  12: { panels: 20, battery: "1 Dyness 314Ah battery" }
};

const CONTACT_LABELS = { sms: "SMS", call: "a phone call", email: "email", messenger: "Messenger" };

function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

function firstName(fullName) {
  const name = String(fullName || "").trim().split(/\s+/)[0];
  return name || "there";
}

function isOnCooldown(email) {
  const now = Date.now();
  const last = recentEmails.get(email);
  if (last && now - last < EMAIL_COOLDOWN_MS) return true;
  recentEmails.set(email, now);
  if (recentEmails.size > 5000) {
    for (const [key, time] of recentEmails) {
      if (now - time >= EMAIL_COOLDOWN_MS) recentEmails.delete(key);
    }
    if (recentEmails.size > 5000) recentEmails.clear();
  }
  return false;
}

function buildLeadEmail(lead) {
  const name = firstName(lead.fullName);
  const rec = lead.recommendedPackage || {};
  const result = lead.preliminaryResult || {};
  const kw = Number(rec.kw);
  const pkg = PACKAGES[kw] || null;
  const eyebrow = rec.framing === "starting-point" ? "A starting point to discuss" : "General information for your inquiry";
  const contact = CONTACT_LABELS[lead.contactMethod] || "your preferred method";
  const imageUrl = pkg ? `${SITE_URL}/assets/packages/package-${kw}kw.png` : "";
  const spec = pkg ? `${pkg.panels} TrinaSolar 630W panels, Sungrow, Solis, or Deye inverter, ${pkg.battery}` : "";

  const subject = `${name}, we received your Brand solar inquiry`;

  const recBlockHtml = rec.label ? `
    <tr><td style="padding:0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;overflow:hidden;background:#0c3557;background:linear-gradient(145deg,#0c3557,#0f6e74 60%,#1c7a4a);">
        ${imageUrl ? `<tr><td style="padding:14px 16px 0;background:#eef3f7;text-align:center;"><img src="${esc(imageUrl)}" alt="${esc(rec.label)}" width="300" style="max-width:100%;height:auto;display:inline-block;" /></td></tr>` : ""}
        <tr><td style="padding:18px 22px 22px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
          <div style="font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:#eafaf3;">${esc(eyebrow)}</div>
          <div style="margin-top:6px;font-size:22px;font-weight:bold;">${esc(rec.label)}${rec.price ? ` &middot; <span style="color:#ffd98a;">${esc(rec.price)}</span>` : ""}</div>
          ${spec ? `<div style="margin-top:8px;font-size:14px;color:rgba(255,255,255,.9);">${esc(spec)}</div>` : ""}
        </td></tr>
      </table>
    </td></tr>` : "";

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f5f7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1d1d1f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.08);">
      <tr><td style="padding:26px 28px 6px;text-align:center;">
        <img src="${esc(SITE_URL)}/assets/brand-emblem.png" alt="Brand Clean Energy" width="56" height="56" style="border-radius:50%;display:inline-block;" />
        <div style="margin-top:8px;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Brand Clean Energy</div>
      </td></tr>

      <tr><td style="padding:16px 28px 0;">
        <h1 style="margin:0;font-size:22px;line-height:1.25;">Hi ${esc(name)}, we received your inquiry.</h1>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#4d4d52;">
          Thank you for your solar inquiry with Brand${result.badge ? `. General information from your answers: <strong>${esc(result.badge)}</strong>` : ""}. Brand will connect you with Partner Cebu for the technical assessment.
        </p>
      </td></tr>

      <tr><td style="height:18px;"></td></tr>
      ${recBlockHtml}
      <tr><td style="height:18px;"></td></tr>

      <tr><td style="padding:0 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3efe9;border-radius:14px;background:#e9f7f1;">
          <tr><td style="padding:22px 18px;text-align:center;color:#0b3a2c;font-family:Arial,Helvetica,sans-serif;">
            <img src="${esc(SITE_URL)}/assets/Founder-president.jpg" alt="Your Name" width="84" height="84" style="width:84px;height:84px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,.14);display:inline-block;" />
            <div style="margin-top:10px;font-size:16px;font-weight:bold;">Your Name</div>
            <div style="font-size:13px;color:#2f6b55;">President, Brand Clean Energy</div>
            <p style="margin:14px auto 16px;max-width:360px;font-size:15px;line-height:1.5;">Your next step: message me on Messenger so Brand can connect you with Partner Cebu and give you the fastest response.</p>
            <a href="${esc(MESSENGER_URL)}" style="display:inline-block;background:#0866ff;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:13px 28px;border-radius:10px;">Message Founder on Messenger</a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:20px 28px 0;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:bold;">To make your consultation faster:</p>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#4d4d52;">Have a recent electricity bill ready. Cover your account number before sharing it. It helps Partner Cebu size your system accurately.</p>
      </td></tr>

      <tr><td style="padding:18px 28px 0;">
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6e6e73;">
          Solar systems are delivered by Partner Cebu under licensed engineer supervision, with a 10-year warranty and a replacement policy on covered equipment per Partner Cebu terms.
          This is general information only, not a final quotation. Partner Cebu confirms your exact package, capacity, and price after a free site assessment.
        </p>
      </td></tr>

      <tr><td style="padding:22px 28px 26px;border-top:1px solid #ececef;margin-top:18px;">
        <p style="margin:18px 0 0;font-size:12px;color:#8a8a8f;line-height:1.6;">
          Brand Clean Energy &middot; Operated by [Your Company] &middot; Marketing &amp; Referral Partner of Partner Cebu<br/>
          You received this because you submitted a free solar inquiry at ${esc(SITE_URL.replace(/^https?:\/\//, ""))}.
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const textLines = [
    `Hi ${name}, we received your inquiry.`,
    "",
    result.badge ? `General information from your answers: ${result.badge}` : "",
    rec.label ? `${eyebrow}: ${rec.label}${rec.price ? ` (${rec.price})` : ""}` : "",
    spec ? spec : "",
    "",
    "Your next step: message Founder on Messenger so Brand can connect you with Partner Cebu and respond fastest:",
    MESSENGER_URL,
    "",
    "To make your consultation faster, have a recent electricity bill ready (cover your account number before sharing).",
    "",
    "Solar systems are delivered by Partner Cebu under licensed engineer supervision, with a 10-year warranty and replacement policy on covered equipment per Partner Cebu terms. This is general information only, not a final quotation. Partner Cebu confirms your exact package, capacity, and price after a free site assessment.",
    "",
    "Brand Clean Energy - Operated by [Your Company] - Marketing & Referral Partner of Partner Cebu"
  ];
  const text = textLines.filter((line) => line !== null && line !== undefined).join("\n").replace(/\n{3,}/g, "\n\n");

  return { subject, html, text };
}

async function sendLeadEmail(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: "no_api_key" };
  const to = String(lead.email || "").trim().toLowerCase();
  if (!to) return { skipped: true, reason: "no_recipient" };
  if (isOnCooldown(to)) return { skipped: true, reason: "cooldown" };

  const { subject, html, text } = buildLeadEmail(lead);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, reply_to: REPLY_TO, subject, html, text }),
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body && body.message ? body.message : `Resend returned ${response.status}`);
    return { ok: true, id: body.id };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { buildLeadEmail, sendLeadEmail };
