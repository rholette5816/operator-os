const crmApp = document.querySelector("#crm-app");
const panelMessage = document.querySelector("#panel-message");
const leadRows = document.querySelector("#lead-rows");
const emptyState = document.querySelector("#empty-state");
const leadDialog = document.querySelector("#lead-dialog");
const editForm = document.querySelector("#lead-edit-form");
const refreshButton = document.querySelector("#refresh-button");
let currentLeads = [];
let currentStatusFilter = "";

const statusLabels = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  site_visit_booked: "Site visit booked",
  quotation_sent: "Quotation sent",
  follow_up: "Follow up",
  won: "Won",
  lost: "Lost"
};

const filterTags = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "site_visit_booked", label: "Site visit" },
  { value: "quotation_sent", label: "Quotation" },
  { value: "follow_up", label: "Follow up" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" }
];

const pipelineStages = [
  { label: "New", statuses: ["new"] },
  { label: "Contacted", statuses: ["contacted", "follow_up"] },
  { label: "Qualified", statuses: ["qualified"] },
  { label: "Site visit", statuses: ["site_visit_booked"] },
  { label: "Quotation", statuses: ["quotation_sent"] },
  { label: "Won", statuses: ["won"] }
];

function text(value, fallback = "-") {
  const result = String(value ?? "").trim();
  return result || fallback;
}

function humanize(value) {
  return text(value).replaceAll("-", " ").replaceAll("_", " ");
}

function initials(value) {
  return text(value, "S").split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function formatDate(value, includeTime = false, fallback = "Not scheduled") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-PH", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
}

function localDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

async function api(path = "", options = {}) {
  const response = await fetch(`/api/crm${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) throw new Error(body.error || "CRM request failed.");
  return body;
}

function renderFilterTags() {
  const container = document.querySelector("#filter-tags");
  container.replaceChildren();
  for (const tag of filterTags) {
    const count = tag.value
      ? currentLeads.filter(lead => (lead.status || "new") === tag.value).length
      : currentLeads.length;
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-tag" + (currentStatusFilter === tag.value ? " active" : "");
    chip.dataset.status = tag.value || "all";
    const label = document.createElement("span");
    label.className = "filter-tag-label";
    label.textContent = tag.label;
    const badge = document.createElement("span");
    badge.className = "filter-tag-count";
    badge.textContent = count;
    chip.append(label, badge);
    chip.addEventListener("click", () => {
      currentStatusFilter = tag.value;
      renderFilterTags();
      applyFilters();
    });
    container.append(chip);
  }
}

function cell(content, className = "") {
  const element = document.createElement("td");
  if (className) element.className = className;
  if (content instanceof Node) element.append(content);
  else element.textContent = content;
  return element;
}

function statusPill(statusValue) {
  const status = document.createElement("span");
  status.className = "status-pill";
  status.dataset.status = statusValue || "new";
  status.textContent = statusLabels[statusValue] || humanize(statusValue);
  return status;
}

function leadName(lead) {
  const wrapper = document.createElement("div");
  wrapper.className = "lead-name";
  const avatar = document.createElement("span");
  avatar.className = "lead-initial";
  avatar.textContent = initials(lead.full_name);
  const copy = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = text(lead.full_name);
  const meta = document.createElement("span");
  meta.textContent = `${text(lead.phone)} | ${formatDate(lead.created_at, false, "Date unavailable")}`;
  copy.append(name, meta);
  wrapper.append(avatar, copy);
  return wrapper;
}

function interestCell(lead) {
  const wrapper = document.createElement("div");
  wrapper.className = "interest-cell";
  const name = document.createElement("strong");
  name.textContent = text(lead.recommended_package, "Pending review");
  const price = document.createElement("span");
  price.textContent = text(lead.recommended_price, humanize(lead.bill_band));
  wrapper.append(name, price);
  return wrapper;
}

function filteredLeads() {
  const query = document.querySelector("#search-input").value.trim().toLowerCase();
  const status = currentStatusFilter;
  return currentLeads.filter(lead => {
    if (status && lead.status !== status) return false;
    if (!query) return true;
    return [lead.full_name, lead.phone, lead.email, lead.city, lead.province, lead.recommended_package]
      .some(value => String(value || "").toLowerCase().includes(query));
  });
}

function renderRows(leads) {
  leadRows.replaceChildren();
  emptyState.hidden = leads.length !== 0;
  document.querySelector("#record-count").textContent = `${leads.length} ${leads.length === 1 ? "record" : "records"}`;

  for (const lead of leads) {
    const row = document.createElement("tr");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "view-button";
    button.textContent = "Open record";
    button.addEventListener("click", () => openLead(lead.id));

    row.append(
      cell(leadName(lead)),
      cell(`${text(lead.city)}, ${text(lead.province)}`),
      cell(interestCell(lead)),
      cell(statusPill(lead.status)),
      cell(formatDate(lead.next_follow_up, true)),
      cell(text(lead.assigned_to, "Unassigned"), "cell-muted"),
      cell(button)
    );
    leadRows.append(row);
  }
}

function countStatus(...statuses) {
  return currentLeads.filter(lead => statuses.includes(lead.status)).length;
}

function renderStats() {
  const openLeads = currentLeads.filter(lead => !["won", "lost"].includes(lead.status));
  document.querySelector("#stat-all").textContent = openLeads.length;
  document.querySelector("#stat-new").textContent = countStatus("new");
  document.querySelector("#stat-qualified").textContent = countStatus("qualified");
  document.querySelector("#stat-booked").textContent = countStatus("site_visit_booked");
  document.querySelector("#stat-won").textContent = countStatus("won");

  const largestStage = Math.max(1, ...pipelineStages.map(stage => countStatus(...stage.statuses)));
  const pipeline = document.querySelector("#pipeline-stages");
  pipeline.replaceChildren();
  for (const stage of pipelineStages) {
    const count = countStatus(...stage.statuses);
    const item = document.createElement("article");
    item.className = "pipeline-stage";
    const heading = document.createElement("div");
    const label = document.createElement("span");
    label.textContent = stage.label;
    const total = document.createElement("strong");
    total.textContent = count;
    const track = document.createElement("div");
    track.className = "stage-track";
    const fill = document.createElement("i");
    fill.style.width = `${Math.round((count / largestStage) * 100)}%`;
    track.append(fill);
    heading.append(label, total);
    item.append(heading, track);
    pipeline.append(item);
  }
}

function renderPriorities() {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const open = currentLeads.filter(lead => !["won", "lost"].includes(lead.status));
  const due = open.filter(lead => lead.next_follow_up && new Date(lead.next_follow_up) <= endOfToday);
  const unassigned = open.filter(lead => !lead.assigned_to);
  document.querySelector("#stat-due").textContent = due.length;
  document.querySelector("#stat-unassigned").textContent = unassigned.length;

  const priorities = [...open].sort((left, right) => {
    const leftDate = left.next_follow_up ? new Date(left.next_follow_up).getTime() : left.status === "new" ? 0 : Infinity;
    const rightDate = right.next_follow_up ? new Date(right.next_follow_up).getTime() : right.status === "new" ? 0 : Infinity;
    return leftDate - rightDate;
  }).slice(0, 4);

  const list = document.querySelector("#priority-list");
  list.replaceChildren();
  if (!priorities.length) {
    const empty = document.createElement("div");
    empty.className = "priority-empty";
    empty.textContent = "No follow-ups are waiting. New assessments will appear here automatically.";
    list.append(empty);
    return;
  }

  for (const lead of priorities) {
    const item = document.createElement("article");
    item.className = "priority-item";
    const name = document.createElement("strong");
    name.textContent = text(lead.full_name);
    const schedule = document.createElement("span");
    schedule.textContent = lead.next_follow_up ? formatDate(lead.next_follow_up, true) : "New lead - contact now";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Open";
    button.addEventListener("click", () => openLead(lead.id));
    item.append(name, button, schedule);
    list.append(item);
  }
}

function applyFilters() {
  renderRows(filteredLeads());
  panelMessage.textContent = "";
}

async function loadLeads() {
  panelMessage.textContent = "Loading leads...";
  refreshButton.disabled = true;
  refreshButton.textContent = "Refreshing...";
  try {
    // shortcut: the dashboard shows the latest 100 leads; add pagination when lead volume exceeds this.
    const body = await api("?limit=100");
    currentLeads = body.leads;
    renderStats();
    renderPriorities();
    renderFilterTags();
    applyFilters();
    document.querySelector("#last-updated").textContent = `Updated ${new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit" }).format(new Date())}`;
    if (currentLeads.length === 100) panelMessage.textContent = "Showing the latest 100 leads.";
  } catch (error) {
    panelMessage.textContent = error.message;
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = "Refresh";
  }
}

function detailItem(label, value) {
  const item = document.createElement("div");
  item.className = "detail-item";
  const caption = document.createElement("span");
  caption.textContent = label;
  const detail = document.createElement("strong");
  detail.textContent = text(value);
  item.append(caption, detail);
  return item;
}

function openLead(id) {
  const lead = currentLeads.find(item => item.id === id);
  if (!lead) return;
  const leadStatus = lead.status || "new";
  document.querySelector("#detail-name").textContent = text(lead.full_name);
  document.querySelector("#record-name").textContent = text(lead.full_name);
  document.querySelector("#record-meta").textContent = `${text(lead.city)}, ${text(lead.province)} | Added ${formatDate(lead.created_at)}`;
  document.querySelector("#detail-avatar").textContent = initials(lead.full_name);
  const recordStatus = document.querySelector("#record-status");
  recordStatus.textContent = statusLabels[leadStatus] || humanize(leadStatus);
  recordStatus.dataset.status = leadStatus;

  const phone = document.querySelector("#detail-phone");
  phone.href = `tel:${text(lead.phone, "")}`;
  phone.textContent = `Call ${text(lead.phone)}`;
  const email = document.querySelector("#detail-email");
  email.href = lead.email ? `mailto:${lead.email}` : "#";
  email.textContent = lead.email ? "Send email" : "No email provided";
  email.toggleAttribute("aria-disabled", !lead.email);
  email.onclick = lead.email ? null : event => event.preventDefault();

  document.querySelector("#detail-grid").replaceChildren(
    detailItem("Property", `${humanize(lead.property_type)} | ${humanize(lead.ownership)}`),
    detailItem("Electric bill", humanize(lead.bill_band)),
    detailItem("Recommended", `${text(lead.recommended_package, "Pending review")} | ${text(lead.recommended_price)}`),
    detailItem("Primary goals", Array.isArray(lead.goals) ? lead.goals.map(humanize).join(", ") : humanize(lead.goals)),
    detailItem("Backup loads", Array.isArray(lead.backup_loads) ? lead.backup_loads.map(humanize).join(", ") : humanize(lead.backup_loads)),
    detailItem("Daytime use", humanize(lead.daytime_use)),
    detailItem("Timeline", humanize(lead.timeline)),
    detailItem("Budget", humanize(lead.budget)),
    detailItem("Payment", humanize(lead.payment_preference)),
    detailItem("Preferred contact", humanize(lead.contact_method))
  );

  document.querySelector("#lead-id").value = lead.id;
  document.querySelector("#lead-status").value = leadStatus;
  document.querySelector("#lead-assigned").value = lead.assigned_to || "";
  document.querySelector("#lead-follow-up").value = localDateTime(lead.next_follow_up);
  document.querySelector("#lead-notes").value = lead.internal_notes || "";
  document.querySelector("#mark-contacted").checked = false;
  document.querySelector("#edit-message").textContent = "";
  leadDialog.showModal();
}

editForm.addEventListener("submit", async event => {
  event.preventDefault();
  const saveButton = editForm.querySelector('button[type="submit"]');
  saveButton.disabled = true;
  document.querySelector("#edit-message").textContent = "Saving record...";
  try {
    await api("", {
      method: "PATCH",
      body: JSON.stringify({
        id: document.querySelector("#lead-id").value,
        status: document.querySelector("#lead-status").value,
        assignedTo: document.querySelector("#lead-assigned").value,
        nextFollowUp: document.querySelector("#lead-follow-up").value || null,
        internalNotes: document.querySelector("#lead-notes").value,
        markContacted: document.querySelector("#mark-contacted").checked
      })
    });
    leadDialog.close();
    await loadLeads();
  } catch (error) {
    document.querySelector("#edit-message").textContent = error.message;
  } finally {
    saveButton.disabled = false;
  }
});

document.querySelector("#delete-lead").addEventListener("click", async () => {
  const id = document.querySelector("#lead-id").value;
  const lead = currentLeads.find(item => item.id === id);
  const name = lead ? text(lead.full_name, "this lead") : "this lead";
  if (!window.confirm(`Delete ${name}? This permanently removes the lead and cannot be undone.`)) return;
  const deleteButton = document.querySelector("#delete-lead");
  deleteButton.disabled = true;
  document.querySelector("#edit-message").textContent = "Deleting record...";
  try {
    await api(`?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    leadDialog.close();
    await loadLeads();
  } catch (error) {
    document.querySelector("#edit-message").textContent = error.message;
  } finally {
    deleteButton.disabled = false;
  }
});

document.querySelector("#filter-button").addEventListener("click", applyFilters);
document.querySelector("#search-input").addEventListener("keydown", event => { if (event.key === "Enter") applyFilters(); });
document.querySelector("#search-input").addEventListener("search", applyFilters);
refreshButton.addEventListener("click", loadLeads);
document.querySelector("#close-detail").addEventListener("click", () => leadDialog.close());
document.querySelectorAll(".sidebar-nav a[href^='#']").forEach(link => link.addEventListener("click", () => {
  document.querySelectorAll(".sidebar-nav .nav-link").forEach(item => item.classList.remove("active"));
  link.classList.add("active");
}));

loadLeads();
