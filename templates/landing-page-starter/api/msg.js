// Tracked Messenger link used by sequence emails. Flags the lead as
// unsubscribed from the sequence, then redirects to Messenger. Always redirects,
// even if the database update fails, so the person is never blocked.

const { supabaseRequest } = require("./_supabase");

const MESSENGER_URL = process.env.BRAND_MESSENGER_URL || "https://m.me/brandFounder";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function handler(req, res) {
  const lead = String((req.query && req.query.lead) || "");
  const emailId = String((req.query && req.query.email) || "").slice(0, 12);
  const clickEvent = String((req.query && req.query.cta) || "") === "partner" ? "partner_click" : "email_click";
  if (UUID_RE.test(lead)) {
    try {
      await supabaseRequest(`brand_crm_leads?submission_id=eq.${encodeURIComponent(lead)}`, {
        method: "PATCH",
        body: { sequence_unsubscribed: true }
      });
    } catch (error) {
      console.error("msg unsubscribe failed", error.message);
    }
    try {
      await supabaseRequest("brand_events", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: { event: clickEvent, channel: "email", email_id: emailId || null, lead_id: lead }
      });
    } catch (error) {
      console.error("msg click log failed", error.message);
    }
  }
  res.writeHead(302, { Location: MESSENGER_URL, "Cache-Control": "no-store" });
  res.end();
}

module.exports = handler;
