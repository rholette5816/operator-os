// First-party analytics beacon + email open pixel. Records events to
// brand_events. Never blocks: logging failures are swallowed.

const { supabaseRequest } = require("./_supabase");

const EVENTS = new Set([
  "page_view", "thankyou_view", "assessment_start", "assessment_started",
  "step_1", "step_2", "step_3", "step_4", "lead_submit", "mme_click",
  "email_open", "email_click", "partner_click", "email_sent"
]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function logEvent(row) {
  if (!EVENTS.has(row.event)) return;
  try {
    await supabaseRequest("brand_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: row });
  } catch (error) {
    console.error("track failed", error.message);
  }
}

async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const q = req.query || {};
  let row;
  if (req.method === "GET") {
    row = {
      event: clean(q.t, 40),
      channel: clean(q.c, 20) || "email",
      email_id: clean(q.email, 12) || null,
      lead_id: UUID_RE.test(clean(q.lead, 40)) ? clean(q.lead, 40) : null,
      session_id: clean(q.s, 80) || null,
      path: clean(q.p, 200) || null
    };
  } else if (req.method === "POST") {
    const b = req.body && typeof req.body === "object" ? req.body : {};
    row = {
      event: clean(b.event, 40),
      channel: clean(b.channel, 20) || "landing",
      email_id: clean(b.email, 12) || null,
      lead_id: UUID_RE.test(clean(b.lead, 40)) ? clean(b.lead, 40) : null,
      session_id: clean(b.session, 80) || null,
      path: clean(b.path, 200) || null
    };
  } else {
    return res.status(405).end();
  }

  await logEvent(row);

  // Email open pixel: always return a 1x1 gif.
  if (req.method === "GET") {
    res.setHeader("Content-Type", "image/gif");
    return res.status(200).send(PIXEL);
  }
  return res.status(204).end();
}

module.exports = handler;
