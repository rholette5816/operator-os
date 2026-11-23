const { supabaseRequest } = require("./_supabase");

const STATUSES = new Set(["new", "contacted", "qualified", "site_visit_booked", "quotation_sent", "won", "lost", "follow_up"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clean(value, max = 5000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normalizePatch(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid update.");
  const id = clean(body.id, 40);
  if (!UUID_RE.test(id)) throw new Error("Invalid lead ID.");
  const patch = {};
  if (body.status !== undefined) {
    const status = clean(body.status, 40);
    if (!STATUSES.has(status)) throw new Error("Invalid lead status.");
    patch.status = status;
  }
  if (body.assignedTo !== undefined) patch.assigned_to = clean(body.assignedTo, 120) || null;
  if (body.internalNotes !== undefined) patch.internal_notes = clean(body.internalNotes, 5000) || null;
  if (body.nextFollowUp !== undefined) {
    const date = body.nextFollowUp ? new Date(body.nextFollowUp) : null;
    if (date && Number.isNaN(date.getTime())) throw new Error("Invalid follow-up date.");
    patch.next_follow_up = date ? date.toISOString() : null;
  }
  if (body.markContacted === true) patch.last_contacted_at = new Date().toISOString();
  if (!Object.keys(patch).length) throw new Error("No changes supplied.");
  return { id, patch };
}

async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  try {
    if (req.method === "GET") {
      const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 100);
      const params = new URLSearchParams({ select: "*", order: "created_at.desc", limit: String(limit) });
      const status = clean(req.query.status, 40);
      if (status && STATUSES.has(status)) params.set("status", `eq.${status}`);
      const query = clean(req.query.q, 100).replace(/[^a-z0-9@+._\-\s]/gi, "");
      if (query) params.set("or", `(full_name.ilike.*${query}*,phone.ilike.*${query}*,email.ilike.*${query}*,city.ilike.*${query}*)`);
      const leads = await supabaseRequest(`brand_crm_leads?${params}`);
      return res.status(200).json({ ok: true, leads: Array.isArray(leads) ? leads : [] });
    }

    if (req.method === "PATCH") {
      const { id, patch } = normalizePatch(req.body);
      const leads = await supabaseRequest(`brand_crm_leads?id=eq.${encodeURIComponent(id)}&select=*`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: patch
      });
      if (!Array.isArray(leads) || !leads.length) return res.status(404).json({ ok: false, error: "Lead not found." });
      return res.status(200).json({ ok: true, lead: leads[0] });
    }

    if (req.method === "DELETE") {
      const id = clean((req.query && req.query.id) || (req.body && req.body.id), 40);
      if (!UUID_RE.test(id)) throw new Error("Invalid lead ID.");
      const rows = await supabaseRequest(`brand_crm_leads?id=eq.${encodeURIComponent(id)}&select=id`, {
        method: "DELETE",
        headers: { Prefer: "return=representation" }
      });
      if (!Array.isArray(rows) || !rows.length) return res.status(404).json({ ok: false, error: "Lead not found." });
      return res.status(200).json({ ok: true, id });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CRM request failed.";
    const clientError = /Invalid|No changes/.test(message);
    if (!clientError) console.error("Brand CRM request failed", error);
    return res.status(clientError ? 400 : 502).json({ ok: false, error: clientError ? message : "The CRM is temporarily unavailable." });
  }
}

module.exports = handler;
module.exports.normalizePatch = normalizePatch;
