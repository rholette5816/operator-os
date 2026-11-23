(function (root) {
  const MESSENGER_URL = "https://m.me/brandFounder";
  const REDIRECT_SECONDS = 10;
  const PACKAGE_IMAGES = new Set([6, 8, 10, 12]);

  function packageImage(recommendation) {
    const kw = Number(recommendation && recommendation.kw);
    return `assets/packages/package-${PACKAGE_IMAGES.has(kw) ? kw : 8}kw.png`;
  }

  function storageKey(prefix, submissionId) {
    return `${prefix}:${submissionId || "latest"}`;
  }

  function readSession(key) {
    try { return root.sessionStorage.getItem(key); } catch { return null; }
  }

  function writeSession(key, value) {
    try { root.sessionStorage.setItem(key, value); } catch { /* Continue without persistence. */ }
  }

  function celebrateOnce(submissionId) {
    const key = storageKey("brandCelebrated", submissionId);
    if (readSession(key) || root.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    writeSession(key, "1");
    const layer = document.querySelector("#confetti-layer");
    const colors = ["#f8bd32", "#0b7a57", "#1d75bd", "#f36f45", "#6e55a4"];
    for (let index = 0; index < 28; index += 1) {
      const piece = document.createElement("i");
      piece.style.setProperty("--x", `${Math.round(Math.random() * 100)}vw`);
      piece.style.setProperty("--delay", `${(Math.random() * .45).toFixed(2)}s`);
      piece.style.setProperty("--drift", `${Math.round((Math.random() - .5) * 180)}px`);
      piece.style.setProperty("--spin", `${Math.round(240 + Math.random() * 520)}deg`);
      piece.style.background = colors[index % colors.length];
      layer.append(piece);
    }
    root.setTimeout(() => layer.replaceChildren(), 2600);
  }

  function startMessengerCountdown(submissionId) {
    const countdown = document.querySelector("#redirect-countdown");
    const progress = document.querySelector("#countdown-progress");
    const button = document.querySelector("#messenger-now");
    const redirectKey = storageKey("brandMessengerRedirected", submissionId);
    button.addEventListener("click", () => {
      writeSession(redirectKey, "1");
      root.BrandTracking?.contact(false);
    });

    if (readSession(redirectKey)) {
      countdown.parentElement.textContent = "Messenger is ready when you are";
      progress.style.width = "0%";
      return;
    }

    let remaining = REDIRECT_SECONDS;
    progress.style.width = "100%";
    const timer = root.setInterval(() => {
      remaining -= 1;
      countdown.textContent = String(Math.max(remaining, 0));
      progress.style.width = `${Math.max(remaining, 0) / REDIRECT_SECONDS * 100}%`;
      if (remaining > 0) return;
      root.clearInterval(timer);
      writeSession(redirectKey, "1");
      root.BrandTracking?.contact(true);
      root.location.replace(MESSENGER_URL);
    }, 1000);
  }

  function init() {
    root.BrandTracking?.page("thank_you");
    let assessment = null;
    const storedResult = readSession("brandAssessmentResult");
    if (storedResult) {
      try {
        assessment = JSON.parse(storedResult);
        const firstName = String(assessment.fullName || "").trim().split(/\s+/)[0];
        if (firstName) document.querySelector("#thank-you-name").textContent = `, ${firstName}`;

        if (assessment.recommendation) {
          document.querySelector("#thank-you-badge").textContent = assessment.result?.badge || "Package of interest";
          document.querySelector("#thank-you-package").textContent = assessment.recommendation.label || "Package review ready";
          document.querySelector("#thank-you-price").textContent = assessment.recommendation.price
            ? `${assessment.recommendation.price} starting package for technical confirmation`
            : "Final specifications require a free site assessment.";
          const image = document.querySelector("#thank-you-product-image");
          image.src = packageImage(assessment.recommendation);
          image.alt = `${assessment.recommendation.label || "Recommended hybrid solar package"} components and accessories`;
          image.hidden = false;
          document.querySelector("#thank-you-result").hidden = false;
          celebrateOnce(assessment.submissionId);
        }
      } catch {
        try { root.sessionStorage.removeItem("brandAssessmentResult"); } catch { /* Nothing to clear. */ }
      }
    }
    startMessengerCountdown(assessment && assessment.submissionId);
  }

  if (typeof document !== "undefined") init();
  if (typeof module !== "undefined" && module.exports) module.exports = { packageImage, storageKey, REDIRECT_SECONDS };
})(typeof window !== "undefined" ? window : globalThis);
