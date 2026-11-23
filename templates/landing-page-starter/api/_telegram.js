function clean(value, max = 180) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

const LABELS = {
  "under-4k": "Under PHP 4,000", "4k-8k": "PHP 4,000-8,000", "8k-12k": "PHP 8,000-12,000",
  "12k-20k": "PHP 12,000-20,000", "20k-plus": "PHP 20,000+", "30-days": "Within 30 days",
  "1-3-months": "1-3 months", "3-6-months": "3-6 months", later: "Later", researching: "Researching",
  "under-250": "Under PHP 250,000", "250-400": "PHP 250,000-400,000", "400-550": "PHP 400,000-550,000",
  "550-plus": "PHP 550,000+", guidance: "Needs guidance", "full-payment": "Full payment",
  "credit-card": "Credit card", "in-house-financing": "In-house financing"
};

function label(value) {
  const key = clean(value, 80);
  return LABELS[key] || key.replace(/-/g, " ") || "Not provided";
}

function sourceSummary(source = {}) {
  if (source.gclid) return "Google Ads";
  if (source.fbclid && !source.utm_source) return "Facebook click (page/ad not tagged)";
  const parts = [source.utm_source, source.utm_medium, source.utm_campaign, source.utm_content]
    .map((value) => clean(value, 100)).filter(Boolean);
  if (parts.length) return parts.join(" / ");
  const referrer = clean(source.referrer, 300);
  if (/facebook\.com|fb\.com|messenger\.com/i.test(referrer)) return "Facebook referral (page not tagged)";
  if (/google\./i.test(referrer)) return "Google organic/referral";
  return referrer ? `Referral: ${referrer}` : "Direct / unknown";
}

function buildLeadMessage(lead, submissionId) {
  return [
    "NEW BRAND SOLAR LEAD", "",
    `Name: ${clean(lead.fullName)}`,
    `Mobile: ${clean(lead.phone)}`,
    `Email: ${clean(lead.email)}`,
    `Location: ${clean(lead.city)}, ${clean(lead.province)}`,
    `Property: ${label(lead.propertyType)} / ${label(lead.ownership)}`,
    `Monthly bill: ${label(lead.billBand)}`,
    `Goals: ${lead.goals.map(label).join(", ") || "Not provided"}`,
    `Backup loads: ${lead.backupLoads.map(label).join(", ") || "Not provided"}`,
    `Timeline: ${label(lead.timeline)}`,
    `Budget: ${label(lead.budget)}`,
    `Payment: ${label(lead.paymentPreference)}`, "",
    `Assessment: ${clean(lead.preliminaryResult.badge) || "Preliminary review"}`,
    `Recommended: ${clean(lead.recommendedPackage.label) || "Technical review"}`,
    `Package price: ${clean(lead.recommendedPackage.price) || "To be confirmed"}`, "",
    `Source: ${sourceSummary(lead.source)}`,
    `Meta click ID: ${lead.source.fbclid ? "Captured" : "Not captured"}`,
    `Lead ID: ${clean(submissionId, 80)}`,
    "CRM: https://yourbrand.com/crm.html"
  ].join("\n");
}

async function sendTelegramLead(lead, submissionId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { skipped: true };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: buildLeadMessage(lead, submissionId), disable_web_page_preview: true }),
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.description || `Telegram returned ${response.status}`);
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { buildLeadMessage, sendTelegramLead, sourceSummary };
