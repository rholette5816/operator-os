const form = document.querySelector("#assessment-form");
const steps = [...document.querySelectorAll(".form-step")];
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const submitButton = document.querySelector("#submit-button");
const errorBox = document.querySelector("#form-error");
const resultSection = document.querySelector("#result");
const progressBar = document.querySelector("#progress-bar");
const progressTrack = document.querySelector(".progress-track");
const stepLabel = document.querySelector("#step-label");
const stepName = document.querySelector("#step-name");
const assessmentDialog = document.querySelector("#assessment-dialog");
const heroVideo = document.querySelector(".hero-video");
const heroAudioToggle = document.querySelector("#hero-audio-toggle");
const stepNames = ["Your home", "Electricity use", "Your priorities", "Contact details"];
let currentStep = 1;
let currentPayload = null;
let closeTimer = null;
let assessmentOpenedTracked = false;
let assessmentStartedTracked = false;

window.BrandTracking?.page("landing");

function syncHeroAudioButton() {
  const soundOn = !heroVideo.muted;
  heroAudioToggle.setAttribute("aria-pressed", String(soundOn));
  heroAudioToggle.setAttribute("aria-label", soundOn ? "Turn video sound off" : "Turn video sound on");
  heroAudioToggle.querySelector(".audio-icon").textContent = soundOn ? "🔊" : "🔇";
  heroAudioToggle.querySelector(".audio-label").textContent = soundOn ? "Sound off" : "Sound on";
}

heroAudioToggle.addEventListener("click", async () => {
  const soundOn = heroVideo.muted;
  heroVideo.muted = !soundOn;
  if (soundOn) {
    try {
      await heroVideo.play();
    } catch {
      heroVideo.muted = true;
    }
  }
  syncHeroAudioButton();
});

heroVideo.addEventListener("volumechange", syncHeroAudioButton);

const projectFeature = document.querySelector(".project-feature");
const projectFeatureImage = document.querySelector("#project-feature-image");
const projectFeatureEyebrow = document.querySelector("#project-feature-eyebrow");
const projectFeatureTitle = document.querySelector("#project-feature-title");
const projectFeatureDescription = document.querySelector("#project-feature-description");

document.querySelectorAll(".project-thumb").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    document.querySelectorAll(".project-thumb").forEach((item) => {
      item.classList.toggle("active", item === thumb);
      item.setAttribute("aria-pressed", String(item === thumb));
    });
    projectFeatureImage.src = thumb.dataset.projectImage;
    projectFeatureImage.alt = thumb.dataset.projectAlt;
    projectFeatureEyebrow.textContent = thumb.dataset.projectEyebrow;
    projectFeatureTitle.textContent = thumb.dataset.projectTitle;
    projectFeatureDescription.textContent = thumb.dataset.projectDescription;
    projectFeature.setAttribute("aria-label", `Open ${thumb.dataset.projectEyebrow.toLowerCase()} photo`);
  });
});

function showStep(number) {
  const previousStep = currentStep;
  currentStep = number;
  steps.forEach((step) => {
    const isActive = Number(step.dataset.step) === number;
    step.classList.toggle("active", isActive);
    step.classList.remove("step-forward", "step-backward");
    if (isActive && number !== previousStep) {
      step.classList.add(number > previousStep ? "step-forward" : "step-backward");
    }
  });
  backButton.hidden = number === 1;
  nextButton.hidden = number === steps.length;
  submitButton.hidden = number !== steps.length;
  stepLabel.textContent = `${number} of ${steps.length}`;
  stepName.textContent = stepNames[number - 1];
  progressBar.style.width = `${(number / steps.length) * 100}%`;
  progressTrack.setAttribute("aria-valuenow", String(number));
  errorBox.hidden = true;
  if (assessmentDialog.open) {
    window.BrandTracking?.step(number);
    assessmentDialog.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function openAssessment() {
  clearTimeout(closeTimer);
  assessmentDialog.classList.remove("is-closing");
  if (!assessmentDialog.open) assessmentDialog.showModal();
  document.body.classList.add("modal-open");
  if (!assessmentOpenedTracked) {
    window.BrandTracking?.assessmentOpened();
    assessmentOpenedTracked = true;
  }
  requestAnimationFrame(() => assessmentDialog.scrollTo({ top: 0, behavior: "smooth" }));
}

function closeAssessment() {
  if (!assessmentDialog.open || assessmentDialog.classList.contains("is-closing")) return;
  assessmentDialog.classList.add("is-closing");
  closeTimer = window.setTimeout(() => {
    assessmentDialog.close();
    assessmentDialog.classList.remove("is-closing");
    document.body.classList.remove("modal-open");
  }, 300);
}

document.querySelectorAll("[data-open-assessment]").forEach((button) => button.addEventListener("click", openAssessment));
document.querySelectorAll("[data-close-assessment]").forEach((button) => button.addEventListener("click", closeAssessment));
assessmentDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeAssessment();
});
assessmentDialog.addEventListener("click", (event) => {
  if (event.target === assessmentDialog) closeAssessment();
});
if (location.hash === "#assessment") openAssessment();

function validateStep(number) {
  const step = steps[number - 1];
  const controls = [...step.querySelectorAll("input, select")];
  let firstInvalid = null;

  controls.forEach((control) => {
    control.removeAttribute("aria-invalid");
    if (!control.checkValidity()) {
      control.setAttribute("aria-invalid", "true");
      firstInvalid ||= control;
    }
  });

  step.querySelectorAll("[data-required-group]").forEach((group) => {
    const checked = group.querySelector("input:checked");
    group.style.outline = checked ? "" : "2px solid rgba(180,35,24,.32)";
    group.style.outlineOffset = checked ? "" : "8px";
    firstInvalid ||= checked ? null : group.querySelector("input");
  });

  if (firstInvalid) {
    errorBox.textContent = "Please complete the required information before continuing.";
    errorBox.hidden = false;
    firstInvalid.focus();
    return false;
  }

  return true;
}

function formToObject() {
  const formData = new FormData(form);
  const payload = {};
  for (const [key, value] of formData.entries()) {
    if (payload[key]) payload[key] = Array.isArray(payload[key]) ? [...payload[key], value] : [payload[key], value];
    else payload[key] = value;
  }
  payload.goals = formData.getAll("goals");
  payload.backupLoads = formData.getAll("backupLoads");
  payload.assessmentConsent = formData.has("assessmentConsent");
  payload.marketingConsent = formData.has("marketingConsent");
  payload.source = {
    ...Object.fromEntries(new URLSearchParams(location.search)),
    referrer: document.referrer,
    landingPath: `${location.pathname}${location.hash}`
  };
  payload.submittedAt = new Date().toISOString();
  return payload;
}

function buildSummary(payload, result) {
  const recommendation = window.BrandScoring.recommendPackage(payload, result);
  return [
    "BRAND CLEAN ENERGY: SOLAR INQUIRY",
    `Result: ${result.badge}`,
    `Package of interest: ${recommendation.label} (${recommendation.price})`,
    `Name: ${payload.fullName}`,
    `Email: ${payload.email || "Not provided"}`,
    `Phone: ${payload.phone}`,
    `Location: ${payload.city}, ${payload.province}`,
    `Property: ${payload.propertyType} / ${payload.ownership}`,
    `Monthly bill: ${payload.billBand}`,
    `Goals: ${payload.goals.join(", ")}`,
    `Backup loads: ${payload.backupLoads.join(", ")}`,
    `Timeline: ${payload.timeline}`,
    `Budget: ${payload.budget}`,
    `Preferred payment: ${payload.paymentPreference || "Not sure yet"}`,
    "",
    "This is general information only, not a technical recommendation or quotation. Partner Cebu confirms the final system and price after their assessment."
  ].join("\n");
}

nextButton.addEventListener("click", () => {
  if (validateStep(currentStep)) {
    if (!assessmentStartedTracked) {
      window.BrandTracking?.assessmentStarted();
      assessmentStartedTracked = true;
    }
    showStep(currentStep + 1);
  }
});

backButton.addEventListener("click", () => showStep(currentStep - 1));

form.addEventListener("input", (event) => {
  event.target.removeAttribute("aria-invalid");
  const group = event.target.closest("[data-required-group]");
  if (group && group.querySelector("input:checked")) {
    group.style.outline = "";
    group.style.outlineOffset = "";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateStep(currentStep)) return;

  currentPayload = formToObject();
  const result = window.BrandScoring.scoreAssessment(currentPayload);
  const recommendation = window.BrandScoring.recommendPackage(currentPayload, result);

  submitButton.disabled = true;
  submitButton.textContent = "Saving assessment...";
  errorBox.hidden = true;

  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentPayload,
        preliminaryResult: result,
        recommendedPackage: recommendation,
        ...window.BrandTracking?.metaContext()
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.error || "We could not save your assessment.");

    window.BrandTracking?.lead(body.submissionId, recommendation);

    sessionStorage.setItem("brandAssessmentResult", JSON.stringify({
      submissionId: body.submissionId,
      fullName: currentPayload.fullName,
      result,
      recommendation
    }));
    location.assign("thank-you.html");
  } catch (error) {
    errorBox.textContent = `${error.message} Please try again, or message Brand directly for help.`;
    errorBox.hidden = false;
    errorBox.focus();
    submitButton.disabled = false;
    submitButton.textContent = "See my result";
  }
});

const messengerHandoff = document.querySelector("#messenger-handoff");
const messengerStatus = document.querySelector("#messenger-status");
const copySummaryButton = document.querySelector("#copy-summary");

messengerHandoff.addEventListener("click", async () => {
  const result = window.BrandScoring.scoreAssessment(currentPayload);
  try {
    await navigator.clipboard.writeText(buildSummary(currentPayload, result));
    messengerStatus.textContent = "Messenger opened. Paste the copied assessment summary and press Send.";
    copySummaryButton.hidden = true;
  } catch {
    messengerStatus.textContent = "Messenger opened, but automatic copying was blocked. Use the copy button, then paste the summary in Messenger.";
    copySummaryButton.hidden = false;
  }
  messengerHandoff.textContent = "Open Messenger again";
  resultSection.dataset.handoff = "started";
});

document.querySelector("#copy-summary").addEventListener("click", async (event) => {
  const result = window.BrandScoring.scoreAssessment(currentPayload);
  try {
    await navigator.clipboard.writeText(buildSummary(currentPayload, result));
    event.currentTarget.textContent = "Summary copied";
  } catch {
    event.currentTarget.textContent = "Copy unavailable in this browser";
  }
});

document.querySelector("#restart-button").addEventListener("click", () => {
  form.reset();
  currentPayload = null;
  form.hidden = false;
  document.querySelector(".progress-wrap").hidden = false;
  resultSection.hidden = true;
  copySummaryButton.textContent = "Copy assessment summary";
  copySummaryButton.hidden = true;
  messengerHandoff.textContent = "Copy result and continue to Messenger";
  messengerStatus.textContent = "";
  delete resultSection.dataset.handoff;
  showStep(1);
});

const profileDialog = document.querySelector("#company-profile-dialog");
const profilePages = document.querySelector("[data-profile-pages]");
const profilePageLabel = document.querySelector("#profile-page-label");
let profilePage = 0;

function showProfilePage(page) {
  profilePage = Math.max(0, Math.min(1, page));
  profilePages.scrollTo({ left: profilePage * profilePages.clientWidth, behavior: "smooth" });
  profilePageLabel.textContent = `Page ${profilePage + 1} of 2`;
}

document.querySelectorAll("[data-open-profile]").forEach((button) => button.addEventListener("click", () => {
  profileDialog.showModal();
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => showProfilePage(0));
}));
document.querySelector("[data-profile-prev]").addEventListener("click", () => showProfilePage(profilePage - 1));
document.querySelector("[data-profile-next]").addEventListener("click", () => showProfilePage(profilePage + 1));
profilePages.addEventListener("scroll", () => {
  profilePage = Math.round(profilePages.scrollLeft / Math.max(profilePages.clientWidth, 1));
  profilePageLabel.textContent = `Page ${profilePage + 1} of 2`;
});
profilePages.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showProfilePage(profilePage + (event.key === "ArrowRight" ? 1 : -1));
  }
});
document.querySelector("[data-close-profile]").addEventListener("click", () => profileDialog.close());
profileDialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
profileDialog.addEventListener("click", (event) => {
  if (event.target === profileDialog) profileDialog.close();
});

const projectDialog = document.querySelector("#project-dialog");
projectFeature.addEventListener("click", () => {
  const dialogImage = document.querySelector("#project-dialog-image");
  dialogImage.src = projectFeatureImage.src;
  dialogImage.alt = projectFeatureImage.alt;
  document.querySelector("#project-dialog-title").textContent = projectFeatureTitle.textContent;
  projectDialog.showModal();
  document.body.classList.add("modal-open");
});
document.querySelector("[data-close-project]").addEventListener("click", () => projectDialog.close());
projectDialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});

const privacyDialog = document.querySelector("#privacy-dialog");
document.querySelectorAll("[data-open-privacy]").forEach((button) => button.addEventListener("click", () => privacyDialog.showModal()));
document.querySelectorAll("[data-close-privacy]").forEach((button) => button.addEventListener("click", () => privacyDialog.close()));
privacyDialog.addEventListener("click", (event) => {
  if (event.target === privacyDialog) privacyDialog.close();
});

const termsDialog = document.querySelector("#terms-dialog");
document.querySelectorAll("[data-open-terms]").forEach((button) => button.addEventListener("click", () => termsDialog.showModal()));
document.querySelectorAll("[data-close-terms]").forEach((button) => button.addEventListener("click", () => termsDialog.close()));
termsDialog.addEventListener("click", (event) => {
  if (event.target === termsDialog) termsDialog.close();
});
