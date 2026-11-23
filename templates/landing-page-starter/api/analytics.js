// Returns the landing + email funnels as aggregated JSON (via the
// brand_analytics() Postgres function). Read-only, no PII.

const { supabaseRequest } = require("./_supabase");

async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed." });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const data = await supabaseRequest("rpc/brand_analytics", { method: "POST", body: {}, signal: controller.signal });
    return res.status(200).json({ ok: true, data: data || {} });
  } catch (error) {
    console.error("analytics failed", error.message);
    return res.status(502).json({ ok: false, error: "Analytics is temporarily unavailable." });
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = handler;
