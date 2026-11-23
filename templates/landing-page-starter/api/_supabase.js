function config() {
  const url = process.env.BRAND_SUPABASE_URL;
  const key = process.env.BRAND_SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Brand CRM storage is not configured.");
  return { url: url.replace(/\/$/, ""), key };
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = config();
  const headers = {
    apikey: key,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;

  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body && typeof body === "object" && body.message ? String(body.message) : response.statusText;
    throw new Error(`Brand CRM storage request failed: ${detail}`);
  }
  return body;
}

module.exports = { supabaseRequest };

