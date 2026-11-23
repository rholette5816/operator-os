const gridEl = document.querySelector("#grid");
const filterEl = document.querySelector("#phase-filter");
const tilesEl = document.querySelector("#stat-tiles");
const msgEl = document.querySelector("#msg");
const modal = document.querySelector("#modal");
const modalRender = document.querySelector("#modal-render");
const mbKick = document.querySelector("#mb-kick");
const mbSubj = document.querySelector("#mb-subj");
const nameInput = document.querySelector("#name-input");

const MESSENGER_URL = "https://m.me/brandFounder";
let emails = [];
let counts = {};
let phaseFilter = "";
let openEmail = null;

function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

function renderBody(body) {
  return String(body || "").split(/\n\s*\n/).map((block) => {
    const blines = block.split(/\n/).filter((l) => l.length);
    if (!blines.length) return "";
    const indented = blines.every((l) => /^\s{3,}/.test(l));
    if (indented) return '<div class="eb-indent">' + blines.map((l) => "<div>" + esc(l.trim()) + "</div>").join("") + "</div>";
    return "<p>" + esc(blines.join(" ")) + "</p>";
  }).join("");
}

function emailHtml(email) {
  const firstName = (nameInput.value || "there").trim() || "there";
  return `<div class="email-card">
    <div class="eb-head"><img src="assets/brand-emblem.png" alt="Brand Clean Energy" /><span>Brand Clean Energy</span></div>
    <div class="eb-hero empty">
      <img src="assets/sequence/${esc(email.id)}.jpg" alt="${esc(email.id)} topic visual" onload="this.parentElement.classList.remove('empty')" onerror="this.remove()" />
      <span class="eb-hero-label">Image placeholder (${esc(email.id)})</span>
    </div>
    <div class="eb-body"><p>Hi ${esc(firstName)},</p>${renderBody(email.body)}</div>
    <div class="eb-cta">
      <img src="assets/Founder-president.jpg" alt="Founder, President of Brand Clean Energy" />
      <div class="name">Founder</div>
      <div class="role">President, Brand Clean Energy</div>
      <a href="${MESSENGER_URL}" target="_blank" rel="noopener">Message me on Messenger</a>
    </div>
    <div class="eb-foot"><strong>Brand Clean Energy</strong><br />Operated by [Your Company] &middot; Marketing &amp; Referral Partner of Partner Cebu<br /><a href="#">Unsubscribe</a></div>
  </div>`;
}

function openModal(email) {
  openEmail = email;
  const day = emails.indexOf(email) + 1;
  mbKick.textContent = `${email.id} · Day ${day} · ${email.phase}`;
  mbSubj.textContent = email.subject;
  modalRender.innerHTML = emailHtml(email);
  if (!modal.open) modal.showModal();
}

function cardCounts(id) {
  const c = counts[id];
  if (!c || !c.sent) return "<span>Not sent yet</span>";
  return `<span><b>${c.sent}</b> sent · <b>${c.clicked}</b> clk</span>`;
}

function renderCards() {
  const list = phaseFilter ? emails.filter((e) => e.phase === phaseFilter) : emails;
  gridEl.replaceChildren();
  list.forEach((email) => {
    const day = emails.indexOf(email) + 1;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "seq-card";
    card.innerHTML =
      `<div class="top"><span class="eid">${esc(email.id)}</span><span class="phase">${esc(email.phase)}</span></div>` +
      `<div class="subj">${esc(email.subject)}</div>` +
      `<div class="foot"><span class="day">Day ${day}</span><span class="counts">${cardCounts(email.id)}</span></div>`;
    card.addEventListener("click", () => openModal(email));
    gridEl.append(card);
  });
}

function renderFilter() {
  const phases = [...new Set(emails.map((e) => e.phase))];
  filterEl.replaceChildren();
  for (const p of ["", ...phases]) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-tag" + (phaseFilter === p ? " active" : "");
    chip.textContent = p || "All";
    chip.addEventListener("click", () => { phaseFilter = p; renderFilter(); renderCards(); });
    filterEl.append(chip);
  }
}

function tile(label, value, note) {
  return `<div class="stat"><span>${label}</span><strong>${value}</strong>${note ? `<small>${note}</small>` : ""}</div>`;
}

function renderTiles(data) {
  const o = (data && data.email_overall) || {};
  const sent = Number(o.email_sent) || 0;
  const clicks = (Number(o.email_click) || 0) + (Number(o.partner_click) || 0);
  tilesEl.innerHTML =
    tile("Emails in sequence", emails.length, "1 per day") +
    tile("Leads", data && data.total_leads != null ? data.total_leads : "-") +
    tile("Emails sent", sent, sent ? `${Number(o.email_open) || 0} opened` : "") +
    tile("Messenger clicks", clicks);
}

async function loadAnalytics() {
  try {
    const res = await fetch("/api/analytics");
    const body = await res.json();
    if (!body.ok) throw new Error();
    const data = body.data || {};
    counts = {};
    for (const r of data.email_by_id || []) counts[r.email_id] = { sent: +r.sent || 0, opened: +r.opened || 0, clicked: +r.clicked || 0 };
    renderTiles(data);
    renderCards();
  } catch {
    renderTiles(null);
    msgEl.textContent = "Live send stats load on the deployed CRM (not on local preview).";
  }
}

document.querySelector("#modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
nameInput.addEventListener("input", () => { if (modal.open && openEmail) modalRender.innerHTML = emailHtml(openEmail); });

fetch("sequence-emails.json")
  .then((r) => r.json())
  .then((data) => { emails = data; renderFilter(); renderTiles(null); renderCards(); loadAnalytics(); })
  .catch((err) => { msgEl.textContent = "Could not load emails: " + esc(err.message); });
