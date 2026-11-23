// Brand email sequence: content + renderer + Resend sender.
// Dormant until BRAND_SEQUENCE_ENABLED=true (enforced by the cron, not here).

const EMAILS = require("../sequence-emails.json");

const SITE_URL = (process.env.BRAND_SITE_URL || "https://yourbrand.com").replace(/\/$/, "");
const FROM = process.env.BRAND_SEQUENCE_FROM || "Founder - Brand Clean Energy <hello@yourbrand.com>";
const REPLY_TO = process.env.BRAND_EMAIL_REPLY_TO || "you@yourbrand.com";
const MESSENGER_URL = process.env.BRAND_MESSENGER_URL || "https://m.me/brandFounder";

function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

function firstName(fullName) {
  const name = String(fullName || "").trim().split(/\s+/)[0];
  return name || "there";
}

function renderBodyHtml(body) {
  return String(body || "").split(/\n\s*\n/).map((block) => {
    const blines = block.split(/\n/).filter((l) => l.length);
    if (!blines.length) return "";
    const indented = blines.every((l) => /^\s{3,}/.test(l));
    if (indented) {
      return '<div style="margin:0 0 13px;padding:12px 14px;background:#f3f7f5;border-left:3px solid #16865B;border-radius:8px;">' +
        blines.map((l) => '<div style="padding:2px 0;color:#34433b;">' + esc(l.trim()) + "</div>").join("") + "</div>";
    }
    return '<p style="margin:0 0 13px;">' + esc(blines.join(" ")) + "</p>";
  }).join("");
}

function bodyText(body) {
  return String(body || "").split(/\n/).map((l) => l.trim()).join("\n").replace(/\n{3,}/g, "\n\n");
}

function buildEmail(lead, index) {
  const email = EMAILS[index];
  if (!email) return null;
  const name = firstName(lead.full_name);
  const token = encodeURIComponent(lead.submission_id || "");
  const msgUrl = `${SITE_URL}/api/msg?lead=${token}&email=${email.id}`;
  const unsubUrl = `${SITE_URL}/api/unsubscribe?lead=${token}`;
  const pixelUrl = `${SITE_URL}/api/track?t=email_open&c=email&lead=${token}&email=${email.id}`;
  const imageUrl = `${SITE_URL}/assets/sequence/${email.id}.jpg`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#e6ebee;padding:24px 10px;font-family:Arial,Helvetica,sans-serif;color:#2a3630;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(email.subject)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfe6e3;">

      <tr><td style="background:#0B2341;padding:19px 24px;text-align:center;">
        <img src="${esc(SITE_URL)}/assets/brand-emblem.png" alt="Brand Clean Energy" width="44" height="44" style="border-radius:50%;display:inline-block;vertical-align:middle;" />
        <span style="display:inline-block;vertical-align:middle;margin-left:10px;color:#ffffff;font-size:15px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Brand Clean Energy</span>
      </td></tr>

      <tr><td style="font-size:0;line-height:0;"><img src="${esc(imageUrl)}" alt="" width="600" style="display:block;width:100%;height:auto;" /></td></tr>

      <tr><td style="padding:28px 32px 10px;font-size:16px;line-height:1.6;color:#2a3630;">
        <p style="margin:0 0 14px;">Hi ${esc(name)},</p>
        ${renderBodyHtml(email.body)}
      </td></tr>

      <tr><td style="padding:12px 24px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;background:#e9f5ef;">
          <tr><td style="padding:24px 18px;text-align:center;">
            <img src="${esc(SITE_URL)}/assets/Founder-president.jpg" alt="Founder, President of Brand Clean Energy" width="80" height="80" style="width:80px;height:80px;border-radius:50%;border:3px solid #fff;" />
            <div style="margin-top:10px;font-size:17px;font-weight:bold;color:#0B2341;">Founder</div>
            <div style="font-size:13px;color:#2f6b55;">President, Brand Clean Energy</div>
            <a href="${esc(msgUrl)}" style="display:inline-block;margin-top:16px;padding:14px 30px;border-radius:10px;background:#0866ff;color:#fff;text-decoration:none;font-weight:bold;font-size:15px;">Message me on Messenger</a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="background:#f2f6f5;border-top:1px solid #e6ebe9;padding:22px 28px;text-align:center;color:#8a938e;font-size:12px;line-height:1.7;">
        <strong style="color:#5a6b63;">Brand Clean Energy</strong><br />
        Operated by [Your Company] &middot; Marketing &amp; Referral Partner of Partner Cebu<br />
        <a href="${esc(unsubUrl)}" style="color:#8a938e;text-decoration:underline;">Unsubscribe</a>
      </td></tr>
    </table>
    <img src="${esc(pixelUrl)}" width="1" height="1" alt="" style="display:none;" />
  </td></tr></table>
</body></html>`;

  const text = [
    `Hi ${name},`, "",
    bodyText(email.body), "",
    `Message me on Messenger: ${msgUrl}`, "",
    "Founder, President, Brand Clean Energy",
    "Operated by [Your Company] | Marketing & Referral Partner of Partner Cebu",
    `Unsubscribe: ${unsubUrl}`
  ].join("\n");

  return { id: email.id, subject: email.subject, html, text };
}

async function sendResend({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");
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

module.exports = { EMAILS, buildEmail, sendResend, MESSENGER_URL };
