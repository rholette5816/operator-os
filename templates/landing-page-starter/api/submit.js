const { randomUUID } = require("node:crypto");
const { supabaseRequest } = require("./_supabase");
const { sendTelegramLead } = require("./_telegram");
const { sendLeadEmail } = require("./_email");

const MAX_BODY_BYTES = 16 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const COVERED_PROVINCES = new Set(["Cebu", "Bohol", "Negros Oriental", "Siquijor", "Negros Occidental", "Leyte", "Southern Leyte", "Biliran"]);
const recentRequests = new Map();

class ClientError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function text(value, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Normalize a PH mobile to +63 E.164, even when entered as 09XXXXXXXXX.
function formatPhPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (/^09\d{9}$/.test(digits)) return "+63" + digits.slice(1);
  if (/^639\d{9}$/.test(digits)) return "+" + digits;
  if (/^9\d{9}$/.test(digits)) return "+63" + digits;
  return String(value || "").trim();
}

function list(value, maxItems = 12) {
  return (Array.isArray(value) ? value : []).slice(0, maxItems).map((item) => text(item, 80)).filter(Boolean);
}

function normalizeSource(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    utm_source: text(source.utm_source, 100), utm_medium: text(source.utm_medium, 100),
    utm_campaign: text(source.utm_campaign, 120), utm_content: text(source.utm_content, 120),
    utm_term: text(source.utm_term, 120), fbclid: text(source.fbclid, 240),
    gclid: text(source.gclid, 240), referrer: text(source.referrer, 500),
    landingPath: text(source.landingPath, 200)
  };
}

function normalizeLead(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ClientError("Invalid submission.");
  if (text(body.website, 120)) return { spam: true };

  const fullName = text(body.fullName, 120);
  const phone = text(body.phone, 40);
  const email = text(body.email, 160).toLowerCase();
  const province = text(body.province, 40);
  const city = text(body.city, 100);

  if (!fullName || !phone || !email || !province || !city) throw new ClientError("Name, mobile number, email, and location are required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ClientError("Enter a valid email address.");
  if (!/^(?:09\d{9}|639\d{9})$/.test(phone.replace(/\D/g, ""))) throw new ClientError("Enter a valid Philippine mobile number.");
  if (!body.assessmentConsent) throw new ClientError("Assessment consent is required.");
  if (!COVERED_PROVINCES.has(province)) throw new ClientError("Choose a province within the confirmed Cebu and nearby-island service area.");

  const preliminaryResult = body.preliminaryResult && typeof body.preliminaryResult === "object" ? body.preliminaryResult : {};
  const recommendedPackage = body.recommendedPackage && typeof body.recommendedPackage === "object" ? body.recommendedPackage : {};

  return {
    submissionId: randomUUID(),
    submittedAt: new Date().toISOString(),
    fullName,
    phone: formatPhPhone(phone),
    email,
    contactMethod: text(body.contactMethod, 30),
    province,
    city,
    ownership: text(body.ownership, 40),
    propertyType: text(body.propertyType, 50),
    utility: text(body.utility, 60),
    billBand: text(body.billBand, 30),
    daytimeUse: text(body.daytimeUse, 30),
    goals: list(body.goals),
    backupLoads: list(body.backupLoads),
    timeline: text(body.timeline, 30),
    budget: text(body.budget, 30),
    paymentPreference: text(body.paymentPreference, 40),
    assessmentConsent: true,
    marketingConsent: Boolean(body.marketingConsent),
    preliminaryResult: {
      key: text(preliminaryResult.key, 30),
      badge: text(preliminaryResult.badge, 100),
      title: text(preliminaryResult.title, 240),
      copy: text(preliminaryResult.copy, 600),
      next: text(preliminaryResult.next, 600)
    },
    recommendedPackage: {
      kw: Number.isFinite(Number(recommendedPackage.kw)) ? Number(recommendedPackage.kw) : null,
      label: text(recommendedPackage.label, 100),
      price: text(recommendedPackage.price, 40),
      framing: text(recommendedPackage.framing, 40)
    },
    source: normalizeSource(body.source),
    tracking: {
      fbp: text(body.fbp, 180),
      fbc: text(body.fbc, 180),
      eventSourceUrl: text(body.eventSourceUrl, 500)
    }
  };
}

function isRateLimited(ip) {
  const now = Date.now();
  const active = (recentRequests.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (active.length >= RATE_LIMIT) return true;
  active.push(now);
  recentRequests.set(ip, active);

  if (recentRequests.size > 5000) {
    for (const [key, times] of recentRequests) {
      if (!times.some((time) => now - time < RATE_WINDOW_MS)) recentRequests.delete(key);
    }
    if (recentRequests.size > 5000) recentRequests.clear();
  }
  return false;
}

async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed." });
  if (Number(req.headers["content-length"] || 0) > MAX_BODY_BYTES) return res.status(413).json({ ok: false, error: "Submission is too large." });

  const ip = text((req.headers["x-forwarded-for"] || "unknown").split(",")[0], 80) || "unknown";
  if (isRateLimited(ip)) return res.status(429).json({ ok: false, error: "Please wait before submitting again." });

  try {
    const lead = normalizeLead(req.body);
    if (lead.spam) return res.status(200).json({ ok: true });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const rows = await supabaseRequest("brand_crm_leads?on_conflict=submission_id&select=submission_id", {
        method: "POST",
        headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
        body: {
          submission_id: lead.submissionId,
          created_at: lead.submittedAt,
          full_name: lead.fullName,
          phone: lead.phone,
          email: lead.email || null,
          contact_method: lead.contactMethod || "messenger",
          province: lead.province,
          city: lead.city,
          ownership: lead.ownership || null,
          property_type: lead.propertyType || null,
          utility: lead.utility || null,
          bill_band: lead.billBand || null,
          daytime_use: lead.daytimeUse || null,
          goals: lead.goals,
          backup_loads: lead.backupLoads,
          timeline: lead.timeline || null,
          budget: lead.budget || null,
          payment_preference: lead.paymentPreference || null,
          assessment_consent: lead.assessmentConsent,
          marketing_consent: lead.marketingConsent,
          result_key: lead.preliminaryResult.key || null,
          result_badge: lead.preliminaryResult.badge || null,
          result_title: lead.preliminaryResult.title || null,
          result_copy: lead.preliminaryResult.copy || null,
          result_next_step: lead.preliminaryResult.next || null,
          recommended_kw: lead.recommendedPackage.kw,
          recommended_package: lead.recommendedPackage.label || null,
          recommended_price: lead.recommendedPackage.price || null,
          recommendation_framing: lead.recommendedPackage.framing || null,
          lead_source: lead.source
        },
        signal: controller.signal
      });
      const submissionId = Array.isArray(rows) && rows[0]?.submission_id ? rows[0].submission_id : lead.submissionId;
      const [telegramNotification, leadEmail] = await Promise.allSettled([
        sendTelegramLead(lead, submissionId),
        sendLeadEmail(lead)
      ]);
      if (telegramNotification.status === "rejected") console.error("Telegram lead alert failed", telegramNotification.reason?.message);
      if (leadEmail.status === "rejected") console.error("Lead email failed", leadEmail.reason?.message);
      return res.status(201).json({ ok: true, submissionId });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error instanceof ClientError) return res.status(error.status).json({ ok: false, error: error.message });
    console.error("Lead submission failed", error);
    return res.status(502).json({ ok: false, error: "We could not save your assessment. Please try again." });
  }
}

module.exports = handler;
module.exports.normalizeLead = normalizeLead;
module.exports.normalizeSource = normalizeSource;
