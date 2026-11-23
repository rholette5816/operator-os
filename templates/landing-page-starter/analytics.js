const msgEl = document.querySelector("#msg");
let emailRows = [];
let sortKey = "email_num";
let sortDir = 1;

const LANDING_STEPS = [
  ["page_view", "Page view"],
  ["assessment_start", "Started assessment"],
  ["step_1", "Step 1"],
  ["step_2", "Step 2"],
  ["step_3", "Step 3"],
  ["step_4", "Step 4"],
  ["lead_submit", "Submitted lead"],
  ["mme_click", "Messenger click"]
];

function pct(part, whole) {
  if (!whole) return "0%";
  return Math.round((part / whole) * 100) + "%";
}

function renderLanding(landing) {
  const el = document.querySelector("#landing-funnel");
  el.replaceChildren();
  const top = Number(landing.page_view) || 0;
  const maxVal = Math.max(top, 1);
  for (const [key, label] of LANDING_STEPS) {
    const count = Number(landing[key]) || 0;
    const row = document.createElement("div");
    row.className = "funnel-row";
    row.innerHTML =
      `<div class="label">${label}</div>` +
      `<div class="bar"><i style="width:${Math.round((count / maxVal) * 100)}%"></i></div>` +
      `<div class="val"><b>${count}</b> <span>${pct(count, top)}</span></div>`;
    el.append(row);
  }
}

function renderEmailStats(overall, unsub) {
  const sent = Number(overall.email_sent) || 0;
  const opened = Number(overall.email_open) || 0;
  const clicked = Number(overall.email_click) || 0;
  const cards = [
    ["Emails sent", sent, ""],
    ["Opened", opened, sent ? pct(opened, sent) + " open rate" : ""],
    ["Messenger clicks", clicked, sent ? pct(clicked, sent) + " click rate" : ""],
    ["Unsubscribed", unsub || 0, ""]
  ];
  const el = document.querySelector("#email-stats");
  el.replaceChildren();
  for (const [label, value, note] of cards) {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `<span>${label}</span><strong>${value}</strong>${note ? `<small>${note}</small>` : ""}`;
    el.append(stat);
  }
}

function renderEmailTable() {
  const cols = [
    ["email_num", "Email", false],
    ["sent", "Sent", true],
    ["opened", "Opened", true],
    ["clicked", "Clicks", true],
    ["ctr", "Click rate", true]
  ];
  const thead = document.querySelector("#email-table thead");
  thead.innerHTML = "<tr>" + cols.map(([k, label, num]) =>
    `<th class="${num ? "num" : ""}" data-key="${k}">${label}${sortKey === k ? (sortDir > 0 ? " ▲" : " ▼") : ""}</th>`
  ).join("") + "</tr>";
  thead.querySelectorAll("th").forEach((th) => th.addEventListener("click", () => {
    const k = th.dataset.key;
    if (sortKey === k) sortDir *= -1; else { sortKey = k; sortDir = k === "email_num" ? 1 : -1; }
    renderEmailTable();
  }));

  const sorted = [...emailRows].sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir);
  const tbody = document.querySelector("#email-table tbody");
  tbody.replaceChildren();
  if (!sorted.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:#66746f;padding:16px 10px;">No sends yet. Numbers appear once the sequence is live.</td></tr>`;
    return;
  }
  for (const r of sorted) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td>${r.email_id}</td>` +
      `<td class="num">${r.sent}</td>` +
      `<td class="num">${r.opened}</td>` +
      `<td class="num">${r.clicked}</td>` +
      `<td class="num"><span class="pill">${r.sent ? pct(r.clicked, r.sent) : "0%"}</span></td>`;
    tbody.append(tr);
  }
}

async function load() {
  msgEl.textContent = "Loading…";
  try {
    const res = await fetch("/api/analytics", { cache: "no-store" });
    const raw = await res.text();
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      throw new Error("Analytics is waking up. Please tap Refresh in a moment.");
    }
    if (!res.ok || !body.ok) throw new Error(body.error || `Analytics unavailable (${res.status}).`);
    const d = body.data || {};
    renderLanding(d.landing || {});
    renderEmailStats(d.email_overall || {}, d.unsubscribed);
    emailRows = (d.email_by_id || []).map((r) => ({
      email_id: r.email_id,
      email_num: Number(String(r.email_id).replace(/\D/g, "")) || 0,
      sent: Number(r.sent) || 0,
      opened: Number(r.opened) || 0,
      clicked: Number(r.clicked) || 0,
      ctr: (Number(r.sent) ? (Number(r.clicked) / Number(r.sent)) : 0)
    }));
    renderEmailTable();
    msgEl.textContent = `Total leads: ${d.total_leads || 0} · updated ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    msgEl.textContent = error.message;
  }
}

document.querySelector("#refresh").addEventListener("click", load);
load();
