// One-tap unsubscribe from the email sequence. Flags the lead and shows a simple
// confirmation page. The redirect link (msg.js) also unsubscribes.

const { supabaseRequest } = require("./_supabase");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function page(message) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Brand Clean Energy</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Arial,Helvetica,sans-serif;background:#eef2f1;color:#243027;padding:24px;}
.card{max-width:420px;text-align:center;background:#fff;border:1px solid #e8edea;border-radius:16px;padding:34px 28px;}
h1{font-size:19px;margin:0 0 10px;color:#0B2341;}p{font-size:14px;line-height:1.55;color:#4d5a54;margin:0;}
.brand{font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#16865B;margin-bottom:16px;}</style>
</head><body><div class="card"><div class="brand">Brand Clean Energy</div>${message}</div></body></html>`;
}

async function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  const lead = String((req.query && req.query.lead) || "");
  let done = false;
  if (UUID_RE.test(lead)) {
    try {
      await supabaseRequest(`brand_crm_leads?submission_id=eq.${encodeURIComponent(lead)}`, {
        method: "PATCH",
        body: { sequence_unsubscribed: true }
      });
      done = true;
    } catch (error) {
      console.error("unsubscribe failed", error.message);
    }
  }
  const message = done
    ? "<h1>You are unsubscribed</h1><p>You will no longer receive the solar tips series. You can still message us on Messenger anytime. Salamat.</p>"
    : "<h1>Request received</h1><p>If this email is on our list, it has been removed from the series. You can still message us on Messenger anytime.</p>";
  return res.status(200).send(page(message));
}

module.exports = handler;
