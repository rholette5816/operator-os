(function (root) {
  function scoreAssessment(data) {
    const bill = { "under-4k": 0, "4k-8k": 1, "8k-12k": 2, "12k-20k": 3, "20k-plus": 4 }[data.billBand] || 0;
    const ownership = { owner: 3, "decision-maker": 2, family: 2, renter: 0 }[data.ownership] || 0;
    const timeline = { "30-days": 3, "1-3-months": 3, "3-6-months": 2, later: 1, researching: 0 }[data.timeline] || 0;
    const budget = { "under-250": 0, "250-400": 2, "400-550": 3, "550-plus": 4, guidance: 1 }[data.budget] || 0;
    const property = { detached: 2, townhouse: 1, condominium: 0, "home-business": 2, "rental-property": 1, other: 0 }[data.propertyType] || 0;
    const daytime = { high: 2, medium: 1, low: 0 }[data.daytimeUse] || 0;
    const goalFit = data.goals && data.goals.some((goal) => ["savings", "backup", "savings-backup"].includes(goal)) ? 1 : 0;
    const score = bill + ownership + timeline + budget + property + daytime + goalFit;

    if (score >= 12) {
      return {
        key: "strong",
        score,
        badge: "Strong preliminary fit",
        title: "Your home may be a good candidate for a detailed assessment.",
        copy: "Your answers show a useful combination of electricity demand, decision readiness, and potential solar or backup need.",
        next: "Brand will review your answers within one business day and connect you with Partner Cebu for the free technical site assessment if appropriate."
      };
    }

    if (score >= 7) {
      return {
        key: "review",
        score,
        badge: "Technical review needed",
        title: "A short conversation can clarify the best next step.",
        copy: "Your home may still benefit from solar, but the roof, budget, usage, or backup requirements need more context before a recommendation.",
        next: "Brand will confirm the missing details with you and connect you with Partner Cebu to discuss whether a site assessment, smaller option, or future plan makes sense."
      };
    }

    return {
      key: "explore",
      score,
      badge: "Explore a simpler route",
      title: "A large hybrid system may not be the best first option right now.",
      copy: "That does not mean solar is unsuitable. A smaller, on-grid, efficiency-first, or future-ready approach may be more appropriate.",
      next: "Ask the Brand team about lower-entry options or what to prepare before reassessing later."
    };
  }

  var PACKAGES = [
    { kw: 6, price: "₱319,000", panels: 6, battery: "1 Dyness 314Ah battery" },
    { kw: 8, price: "₱357,000", panels: 8, battery: "1 Dyness 314Ah battery" },
    { kw: 10, price: "₱397,800", panels: 8, battery: "1 Dyness 314Ah battery" },
    { kw: 12, price: "₱549,000", panels: 20, battery: "1 Dyness 314Ah battery" }
  ];

  function recommendPackage(data, fit) {
    var billIndex = { "under-4k": 0, "4k-8k": 0, "8k-12k": 1, "12k-20k": 2, "20k-plus": 3 };
    var index = billIndex[data.billBand];
    if (index === undefined) index = 0;

    var heavy = (data.backupLoads || []).filter(function (load) {
      return ["one-aircon", "water-pump", "business"].includes(load);
    }).length;
    var wantsBackup = (data.goals || []).some(function (goal) {
      return ["backup", "savings-backup"].includes(goal);
    });
    var bumpedUp = false;
    if (heavy >= 2 && wantsBackup && index < PACKAGES.length - 1) {
      index += 1;
      bumpedUp = true;
    }

    var entryCapped = data.budget === "under-250" || data.ownership === "renter";
    if (entryCapped) index = 0;

    var pkg = PACKAGES[index];
    var framing = fit && fit.key === "explore" ? "starting-point" : "recommended";

    var note = "";
    if (entryCapped) note = "Shown as an entry option to confirm with Partner Cebu.";
    else if (bumpedUp) note = "Sized up to support your backup priorities.";
    else if (framing === "starting-point") note = "A starting point for discussion, not a final system size.";

    return {
      kw: pkg.kw,
      price: pkg.price,
      panels: pkg.panels,
      battery: pkg.battery,
      label: pkg.kw + "kW Hybrid Package",
      spec: pkg.panels + " TrinaSolar 630W panels · Sungrow, Solis, or Deye inverter · " + pkg.battery,
      image: "assets/packages/package-" + pkg.kw + "kw.png",
      framing: framing,
      note: note
    };
  }

  root.BrandScoring = { scoreAssessment: scoreAssessment, recommendPackage: recommendPackage };
  if (typeof module !== "undefined" && module.exports) module.exports = { scoreAssessment: scoreAssessment, recommendPackage: recommendPackage };
})(typeof window !== "undefined" ? window : globalThis);
