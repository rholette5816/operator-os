const { createHash } = require("node:crypto");

const GRAPH_VERSION = "v27.0";
const ALLOWED_SOURCE_HOSTS = new Set(["yourbrand.com", "brandpartner.vercel.app"]);

function hash(value) {
  return createHash("sha256").update(String(value).trim().toLowerCase()).digest("hex");
}

function clean(value, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function phone(value) {
  const digits = clean(value, 40).replace(/\D/g, "");
  return digits.startsWith("0") ? `63${digits.slice(1)}` : digits;
}

function sourceUrl(value) {
  try {
    const url = new URL(clean(value, 500));
    return url.protocol === "https:" && ALLOWED_SOURCE_HOSTS.has(url.hostname)
      ? url.toString()
      : "https://yourbrand.com/";
  } catch {
    return "https://yourbrand.com/";
  }
}

function cookieId(value, prefix) {
  const id = clean(value, 180);
  return id.startsWith(prefix) && /^[A-Za-z0-9._-]+$/.test(id) ? id : "";
}

function buildLeadEvent({ req, lead, eventId, tracking = {} }) {
  const names = lead.fullName.trim().split(/\s+/);
  const clientIp = clean(String(req.headers["x-forwarded-for"] || "").split(",")[0], 80);
  const userData = {
    em: [hash(lead.email)],
    ph: [hash(phone(lead.phone))],
    fn: [hash(names[0])],
    ln: [hash(names.slice(1).join(" ") || names[0])],
    ct: [hash(lead.city.replace(/[^a-z0-9]/gi, ""))],
    st: [hash(lead.province.replace(/[^a-z0-9]/gi, ""))],
    country: [hash("ph")],
    external_id: [hash(eventId)],
    client_user_agent: clean(req.headers["user-agent"], 500)
  };

  if (clientIp) userData.client_ip_address = clientIp;
  const fbp = cookieId(tracking.fbp, "fb.1.");
  const fbc = cookieId(tracking.fbc, "fb.1.");
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  return {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: sourceUrl(tracking.eventSourceUrl),
    user_data: userData,
    custom_data: {
      content_name: lead.recommendedPackage.label || "Solar assessment",
      content_category: "Solar assessment",
      content_ids: lead.recommendedPackage.kw ? [`brand-${lead.recommendedPackage.kw}kw`] : [],
      currency: "PHP"
    }
  };
}

async function sendMetaLead(context) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return { skipped: true };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [buildLeadEvent(context)] }),
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.error) throw new Error(body.error?.message || `Meta CAPI returned ${response.status}`);
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { buildLeadEvent, sendMetaLead };
