// script.js
(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function safeText(str) {
    const div = document.createElement("div");
    div.textContent = String(str ?? "");
    return div.textContent;
  }

  function bulletHTML(text) {
    return `
      <div class="bullet">
        <div class="dot" aria-hidden="true"></div>
        <div>${safeText(text)}</div>
      </div>
    `.trim();
  }

  // ---------- Mobile nav ----------
  const navToggle = $(".nav-toggle");
  const navList = $("#navList");
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    // close on link click (mobile)
    $$(".nav-link", navList).forEach(a => {
      a.addEventListener("click", () => {
        if (navList.classList.contains("open")) {
          navList.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "Open menu");
        }
      });
    });
  }

  // ---------- Active nav highlighting ----------
  const sections = ["home", "process", "will-generator", "glossary"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navLinks = $$(".nav-link");
  const idToLink = new Map(navLinks.map(a => [a.getAttribute("href")?.slice(1), a]));

  const sectionObserver = new IntersectionObserver((entries) => {
    // Choose the most visible entry to mark active
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => (b.intersectionRatio - a.intersectionRatio))[0];

    if (!visible) return;

    const id = visible.target.id;
    navLinks.forEach(a => a.classList.remove("active"));
    const link = idToLink.get(id);
    if (link) link.classList.add("active");
  }, { threshold: [0.25, 0.4, 0.6], rootMargin: "-20% 0px -65% 0px" });

  sections.forEach(sec => sectionObserver.observe(sec));

  // ---------- Reveal on scroll ----------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });

  $$(".reveal").forEach(el => revealObserver.observe(el));

  // ---------- Stepper ----------
  const stepData = [
    {
      title: "Drafting",
      body:
        "Start with clarity: name an executor (estate trustee), list beneficiaries, and describe gifts. " +
        "For minor children, name a guardian. Keep language specific and consistent.",
      bullets: [
        "Choose your executor (and a backup). Confirm they’re willing.",
        "List beneficiaries and define the residue (what’s left after specific gifts).",
        "If you have minor children, consider guardianship wording.",
        "Make a simple asset map: accounts, property, vehicles, valuables, digital assets.",
        "Avoid vague gifts like “my jewelry” unless you define what that means."
      ]
    },
    {
      title: "Execution (Signing)",
      body:
        "Most Ontario Wills must be signed by the testator in the presence of two witnesses who are present at the same time, " +
        "and the witnesses must sign in the testator’s presence. If you can’t arrange witnesses, a holograph Will may be an option.",
      bullets: [
        "Use two independent witnesses (not beneficiaries, and not a beneficiary’s spouse).",
        "Sign at the end of the Will; witnesses sign after watching you sign/acknowledge.",
        "Everyone should be together (or use permitted audio-visual witnessing rules).",
        "If remote witnessing: typically requires one witness to be an Ontario lawyer/paralegal.",
        "If your situation is complex, get advice before signing."
      ]
    },
    {
      title: "Storage",
      body:
        "Your Will only works if the original can be found. Store it securely, and make sure your executor knows where it is.",
      bullets: [
        "Store the original in a safe place (lawyer’s office, safe deposit box, home safe).",
        "Tell your executor how to access it; leave clear instructions.",
        "Keep a scanned copy for reference, but preserve the original.",
        "Avoid altering the signed original (no casual edits—use a proper codicil/new Will).",
        "Review after major life events: new spouse, separation, children, major assets."
      ]
    }
  ];

  let activeStep = 0;
  const stepButtons = $$(".step");
  const stepperTitle = $("#stepperTitle");
  const stepperBody = $("#stepperBody");
  const stepperBullets = $("#stepperBullets");
  const stepPrev = $("#stepPrev");
  const stepNext = $("#stepNext");

  function renderStepper(index) {
    activeStep = clamp(index, 0, stepData.length - 1);
    const data = stepData[activeStep];

    stepButtons.forEach((b, i) => {
      const isActive = i === activeStep;
      b.classList.toggle("is-active", isActive);
      b.setAttribute("aria-selected", String(isActive));
    });

    if (stepperTitle) stepperTitle.textContent = data.title;
    if (stepperBody) stepperBody.textContent = data.body;
    if (stepperBullets) stepperBullets.innerHTML = data.bullets.map(bulletHTML).join("");

    if (stepPrev) stepPrev.disabled = activeStep === 0;
    if (stepNext) stepNext.disabled = activeStep === stepData.length - 1;
  }

  stepButtons.forEach(btn => {
    btn.addEventListener("click", () => renderStepper(Number(btn.dataset.step)));
  });
  if (stepPrev) stepPrev.addEventListener("click", () => renderStepper(activeStep - 1));
  if (stepNext) stepNext.addEventListener("click", () => renderStepper(activeStep + 1));
  renderStepper(0);

  // ---------- Glossary ----------
  const glossaryItems = [
    {
      title: "Testator",
      body: "The person who makes the Will.",
      tag: "Basics"
    },
    {
      title: "Executor (Estate Trustee)",
      body: "The person who administers the estate: pays debts/taxes, gathers assets, and distributes gifts according to the Will.",
      tag: "Roles"
    },
    {
      title: "Beneficiary",
      body: "A person or organization who receives a gift under the Will.",
      tag: "Basics"
    },
    {
      title: "Witness (Attesting Witness)",
      body: "A person who watches the testator sign/acknowledge the Will and signs to confirm proper execution. In Ontario, most Wills require two witnesses present at the same time.",
      tag: "Execution"
    },
    {
      title: "Holograph Will",
      body: "A Will that is wholly handwritten and signed by the testator. In Ontario, it can be valid without witnesses if it meets the handwriting requirement.",
      tag: "Types"
    },
    {
      title: "Codicil",
      body: "A legal document that amends a Will. It must be executed with the same formalities as a Will (or be a valid holograph codicil).",
      tag: "Updates"
    },
    {
      title: "Residue",
      body: "Everything left in the estate after debts, taxes, expenses, and specific gifts are handled.",
      tag: "Drafting"
    },
    {
      title: "Probate (Certificate of Appointment)",
      body: "A court process that confirms the executor’s authority to deal with estate assets (often needed for banks and land transfers).",
      tag: "Court"
    },
    {
      title: "Intestacy",
      body: "Dying without a valid Will. Ontario’s default distribution rules apply, which may not match your preferences.",
      tag: "Risk"
    },
    {
      title: "Dependent Support",
      body: "In Ontario, certain dependants may have claims for support even if the Will does not provide adequately.",
      tag: "Risk"
    },
    {
      title: "Guardianship (Minor Children)",
      body: "A Will can express who you want to act as guardian for minor children. The court may still consider the child’s best interests.",
      tag: "Family"
    },
    {
      title: "Capacity (Testamentary Capacity)",
      body: "The legal ability to make a Will: generally understanding what a Will is, the nature of your assets, and who might reasonably expect to benefit.",
      tag: "Risk"
    },
    {
      title: "Undue Influence",
      body: "Pressure that overwhelms the testator’s free will. It can lead to disputes and possible invalidation of gifts or the Will.",
      tag: "Risk"
    },
    {
      title: "Remote Witnessing",
      body: "Ontario permits remote signing/witnessing by audio-visual communication technology in certain situations (commonly requiring one witness to be an Ontario lawyer or paralegal).",
      tag: "Execution"
    },
    {
      title: "Substantial Compliance (Court Validation)",
      body: "Ontario courts have limited authority to validate certain imperfect documents that show testamentary intention, but it is not guaranteed—best practice is to execute correctly.",
      tag: "Court"
    }
  ];

  const glossaryGrid = $("#glossaryGrid");
  const glossarySearch = $("#glossarySearch");
  const glossaryCount = $("#glossaryCount");

  function renderGlossary(list) {
    if (!glossaryGrid) return;
    glossaryGrid.innerHTML = list.map(item => `
      <article class="term" data-title="${safeText(item.title).toLowerCase()}" data-body="${safeText(item.body).toLowerCase()}">
        <h3 class="term-title">${safeText(item.title)}</h3>
        <p class="term-body">${safeText(item.body)}</p>
        <div class="term-tag">${safeText(item.tag)}</div>
      </article>
    `).join("");

    if (glossaryCount) {
      const n = list.length;
      glossaryCount.textContent = `${n} term${n === 1 ? "" : "s"}`;
    }
  }

  renderGlossary(glossaryItems);

  if (glossarySearch) {
    glossarySearch.addEventListener("input", () => {
      const q = glossarySearch.value.trim().toLowerCase();
      if (!q) return renderGlossary(glossaryItems);

      const filtered = glossaryItems.filter(it => {
        return it.title.toLowerCase().includes(q) || it.body.toLowerCase().includes(q) || it.tag.toLowerCase().includes(q);
      });

      renderGlossary(filtered);
    });
  }

  // ---------- Will-I-Nator Simulation ----------
  const simCard = $("#simCard");
  const simBack = $("#simBack");
  const simNext = $("#simNext");
  const simStatus = $("#simStatus");
  const resetSim = $("#resetSim");

  const progressFill = $("#progressFill");
  const progressText = $("#progressText");

  const results = $("#results");
  const resultsPath = $("#resultsPath");
  const resultsChecklist = $("#resultsChecklist");
  const resultsRisks = $("#resultsRisks");
  const resultsStorage = $("#resultsStorage");
  const copySummary = $("#copySummary");

  // Question schema (one-at-a-time)
  const questions = [
    {
      id: "age18",
      title: "Are you 18 or older?",
      subtitle: "In Ontario, most people must be 18+ to make a Will (with limited exceptions).",
      options: [
        { value: "yes", label: "Yes, I’m 18+", hint: "Standard adult Will rules apply." },
        { value: "no", label: "No, I’m under 18", hint: "There are limited exceptions—next question checks one." }
      ]
    },
    {
      id: "minorException",
      title: "If you’re under 18: are you married (or have you been married) OR on active military service?",
      subtitle: "Ontario allows limited exceptions for minors in specific situations.",
      dependsOn: { id: "age18", value: "no" },
      options: [
        { value: "yes", label: "Yes (exception applies)", hint: "You may be able to make a Will—still follow execution rules." },
        { value: "no", label: "No", hint: "You likely can’t make a valid Will yet—get legal advice for your specific case." }
      ]
    },
    {
      id: "specificGifts",
      title: "Do you have specific items you want to leave to specific people?",
      subtitle: "Example: a watch to a sibling, a laptop to a friend, a collection to a cousin.",
      options: [
        { value: "yes", label: "Yes", hint: "You’ll want a ‘specific gifts’ section plus a residue clause." },
        { value: "no", label: "No", hint: "You can keep the Will simpler (mostly residue-based)." }
      ]
    },
    {
      id: "minorKids",
      title: "Do you have minor children (under 18) you’re responsible for?",
      subtitle: "A Will can express who you want as guardian if something happens to you.",
      options: [
        { value: "yes", label: "Yes", hint: "Strongly consider guardianship wording and backup guardians." },
        { value: "no", label: "No", hint: "You can skip guardianship sections." }
      ]
    },
    {
      id: "spouseStatus",
      title: "What best describes your relationship status?",
      subtitle: "Ontario treats ‘spouse’ differently depending on the legal context (e.g., intestacy vs. separation).",
      options: [
        { value: "single", label: "Single", hint: "Your Will controls who gets what." },
        { value: "married", label: "Legally married", hint: "Review after major changes (marriage, separation, divorce)." },
        { value: "commonlaw", label: "Common-law", hint: "Common-law partners may not inherit on intestacy—having a Will matters." }
      ]
    },
    {
      id: "canWitness",
      title: "Can you arrange 2 independent witnesses to be present at the same time for signing?",
      subtitle: "Best practice: witnesses should NOT be beneficiaries (or a beneficiary’s spouse).",
      options: [
        { value: "yes", label: "Yes", hint: "You can likely execute a standard formal Will." },
        { value: "no", label: "No", hint: "A holograph Will (wholly handwritten) might be an option, or use remote witnessing with a licensee." }
      ]
    },
    {
      id: "remoteOption",
      title: "If you can’t sign in person: could you use video witnessing with an Ontario lawyer/paralegal as a witness?",
      subtitle: "Ontario law permits remote witnessing by audio-visual technology in certain cases (commonly requiring one witness to be a licensee).",
      dependsOn: { id: "canWitness", value: "no" },
      options: [
        { value: "yes", label: "Yes", hint: "This may allow a formal Will without meeting in person." },
        { value: "no", label: "No", hint: "Consider a holograph Will or professional help." }
      ]
    },
    {
      id: "handwrite",
      title: "If needed, could you write your Will entirely by hand and sign it (no typing)?",
      subtitle: "A holograph Will must be wholly in your handwriting and signed.",
      dependsOnAny: [{ id: "canWitness", value: "no" }, { id: "remoteOption", value: "no" }],
      options: [
        { value: "yes", label: "Yes", hint: "This can be a valid approach in Ontario if properly handwritten and signed." },
        { value: "no", label: "No", hint: "Strongly consider getting legal help to avoid an invalid Will." }
      ]
    },
    {
      id: "storagePlan",
      title: "Do you have a plan to store the original Will and tell your executor where it is?",
      subtitle: "A Will is only useful if it can be found and produced when needed.",
      options: [
        { value: "yes", label: "Yes", hint: "Great—keep the original safe and communicate access details." },
        { value: "no", label: "Not yet", hint: "You’ll want a storage plan: lawyer’s office, safe deposit, home safe, etc." }
      ]
    }
  ];

  const state = {
    idx: 0,
    answers: {},
    visibleQ: [], // computed list of question indices that should be asked
    currentVisiblePos: 0
  };

  function computeVisibleQuestions() {
    const visible = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      // dependsOn: show only if answer matches
      if (q.dependsOn) {
        const v = state.answers[q.dependsOn.id];
        if (v !== q.dependsOn.value) continue;
      }

      // dependsOnAny: show if any dependency satisfied
      if (q.dependsOnAny) {
        const ok = q.dependsOnAny.some(dep => state.answers[dep.id] === dep.value);
        if (!ok) continue;
      }

      visible.push(i);
    }

    state.visibleQ = visible;
    state.currentVisiblePos = clamp(state.currentVisiblePos, 0, Math.max(0, visible.length - 1));
  }

  function currentQuestion() {
    const qIndex = state.visibleQ[state.currentVisiblePos];
    return typeof qIndex === "number" ? questions[qIndex] : null;
  }

  function setFadeIn(el) {
    if (!el) return;
    el.classList.remove("is-in");
    requestAnimationFrame(() => el.classList.add("is-in"));
  }

  function setSimStatus(text) {
    if (!simStatus) return;
    simStatus.textContent = text;
  }

  function setProgress() {
    const total = Math.max(1, state.visibleQ.length);
    const pos = state.currentVisiblePos + 1;
    const pct = Math.round((pos / total) * 100);

    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${pct}%`;
  }

  function renderSim() {
    computeVisibleQuestions();
    const q = currentQuestion();

    if (!q || !simCard) return;

    const selected = state.answers[q.id];

    const optionHTML = q.options.map(opt => {
      const isSelected = selected === opt.value;
      return `
        <div class="option ${isSelected ? "is-selected" : ""}" role="button" tabindex="0"
             data-value="${safeText(opt.value)}" aria-pressed="${isSelected ? "true" : "false"}">
          <div class="radio" aria-hidden="true"></div>
          <div>
            <div class="label">${safeText(opt.label)}</div>
            <div class="hint">${safeText(opt.hint)}</div>
          </div>
        </div>
      `;
    }).join("");

    const note = `
      <div class="note">
        <strong>Privacy:</strong> Answers stay in your browser. This is not legal advice.
      </div>
    `;

    simCard.innerHTML = `
      <h4 class="q-title">${safeText(q.title)}</h4>
      <p class="q-sub">${safeText(q.subtitle)}</p>
      <div class="option-grid" role="list">${optionHTML}</div>
      ${note}
    `;

    // interactions
    const optionEls = $$(".option", simCard);
    optionEls.forEach(el => {
      const choose = () => {
        const value = el.getAttribute("data-value");
        state.answers[q.id] = value;
        setSimStatus("In progress");
        renderSim();
      };

      el.addEventListener("click", choose);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          choose();
        }
      });
    });

    if (simBack) simBack.disabled = state.currentVisiblePos === 0;
    if (simNext) simNext.disabled = !state.answers[q.id];

    setProgress();
    setFadeIn(simCard);
  }

  function goNext() {
    if (!state.visibleQ.length) computeVisibleQuestions();
    if (state.currentVisiblePos < state.visibleQ.length - 1) {
      state.currentVisiblePos += 1;
      renderSim();
      return;
    }
    // End reached => build summary
    buildSummary();
  }

  function goBack() {
    state.currentVisiblePos = clamp(state.currentVisiblePos - 1, 0, state.visibleQ.length - 1);
    renderSim();
  }

  function reset() {
    state.idx = 0;
    state.answers = {};
    state.visibleQ = [];
    state.currentVisiblePos = 0;

    if (results) results.hidden = true;
    setSimStatus("Ready");
    renderSim();
  }

  function summarizePath(a) {
    // Eligibility
    const isAdult = a.age18 === "yes";
    const minorException = a.minorException === "yes";

    const eligible = isAdult || minorException;

    // Execution route
    const canWitness = a.canWitness === "yes";
    const remote = a.remoteOption === "yes";
    const handwrite = a.handwrite === "yes";

    let route = {
      headline: "",
      bullets: []
    };

    if (!eligible) {
      route.headline = "You may not be able to make a valid Will yet.";
      route.bullets.push(
        "Ontario generally requires you to be 18+ to make a Will, with limited exceptions.",
        "If you need planning now, consult a licensed Ontario lawyer about your options."
      );
      return { route, flags: ["eligibility"] };
    }

    if (canWitness) {
      route.headline = "Recommended: Standard formal Will (two-witness execution).";
      route.bullets.push(
        "Draft a clear Will, then sign in front of two independent witnesses present at the same time.",
        "Have the two witnesses sign in your presence right after you sign/acknowledge your signature."
      );
      return { route, flags: [] };
    }

    if (!canWitness && remote) {
      route.headline = "Recommended: Formal Will using remote witnessing (where permitted).";
      route.bullets.push(
        "Use audio-visual communication technology with two witnesses present (virtually) at the same time.",
        "Typically, at least one witness should be an Ontario lawyer or paralegal (licensee).",
        "Follow a disciplined signing sequence to avoid execution defects."
      );
      return { route, flags: ["remote"] };
    }

    if (!canWitness && !remote && handwrite) {
      route.headline = "Possible fallback: Holograph (handwritten) Will.";
      route.bullets.push(
        "Write the entire Will by hand (no typing) and sign it.",
        "Be extremely clear and specific—ambiguity creates litigation risk.",
        "Consider upgrading to a formal Will when you can arrange proper witnessing."
      );
      return { route, flags: ["holograph"] };
    }

    route.headline = "High risk: Execution path unclear — get help before you sign.";
    route.bullets.push(
      "If you can’t arrange two witnesses (in person or remote) and can’t create a holograph Will, you should consult a licensed professional.",
      "An invalid Will can cause intestacy and delays in administering your estate."
    );
    return { route, flags: ["highRisk"] };
  }

  function buildChecklist(a) {
    const list = [];

    list.push("Confirm you have testamentary capacity and are acting voluntarily.");
    list.push("Choose an executor (and backup) and confirm they’re willing.");

    if (a.specificGifts === "yes") list.push("List specific gifts precisely (what, to whom) and define your residue.");
    else list.push("Use a clear residue clause (who gets what’s left).");

    if (a.minorKids === "yes") list.push("Include guardianship intentions for minor children and consider backups.");

    // Execution essentials (SLRA-aligned)
    list.push("Sign at the end of the Will (or acknowledge your signature) as required for proper execution.");
    list.push("Use two witnesses present at the same time; have them sign in your presence.");
    list.push("Avoid beneficiaries (and their spouses) as witnesses to reduce risk that gifts are void.");

    // Relationship updates
    if (a.spouseStatus === "married") {
      list.push("Review after major life changes (marriage, separation, divorce). Separation can affect spousal gifts/appointments.");
    } else if (a.spouseStatus === "commonlaw") {
      list.push("Common-law partners may not inherit on intestacy in Ontario—having a Will matters.");
    }

    return list;
  }

  function buildRisks(a, flags) {
    const risks = [];

    // Core risks
    risks.push("Execution errors (wrong witnesses, wrong sequence) can invalidate a Will or void gifts.");
    risks.push("Ambiguous wording increases the chance of estate litigation and delay.");

    // Beneficiary-witness warning
    risks.push("If a beneficiary (or a beneficiary’s spouse) witnesses, that beneficiary’s gift may be void.");

    // Conditional risks
    if (a.canWitness === "no" && a.remoteOption !== "yes") {
      risks.push("If you’re relying on a holograph Will, it must be wholly handwritten and signed—mixed typing/handwriting can be problematic.");
    }
    if (flags.includes("remote")) {
      risks.push("Remote witnessing must follow Ontario rules; consider professional supervision to prevent defects.");
    }
    if (a.storagePlan === "no") {
      risks.push("If the original Will can’t be located, administering the estate may be slower and more complicated.");
    }
    if (flags.includes("highRisk") || flags.includes("eligibility")) {
      risks.push("Your situation suggests a higher chance of an invalid Will—professional advice is strongly recommended.");
    }

    // Modern note (marriage revocation changed; separation matters)
    risks.push("Wills should be reviewed after major life events; rules about spouses can change based on marriage, separation, or divorce.");

    return risks;
  }

  function buildStorage(a) {
    const list = [];
    list.push("Store the original Will securely (lawyer’s office, safe deposit box, home safe).");
    list.push("Tell your executor where the original is and how to access it.");
    list.push("Keep a scanned copy for reference, but protect the original from damage or casual edits.");
    list.push("If you update anything significant, use a new Will or properly executed codicil (don’t hand-edit the signed original).");

    if (a.storagePlan === "no") {
      list.unshift("Priority: choose a storage location and document the access instructions today.");
    }

    return list;
  }

  function buildSummary() {
    const a = state.answers;
    const { route, flags } = summarizePath(a);

    const checklist = buildChecklist(a);
    const risks = buildRisks(a, flags);
    const storage = buildStorage(a);

    if (results) results.hidden = false;

    if (resultsPath) {
      resultsPath.innerHTML = `
        <div><strong>${safeText(route.headline)}</strong></div>
        <ul>${route.bullets.map(x => `<li>${safeText(x)}</li>`).join("")}</ul>
      `;
    }

    if (resultsChecklist) {
      resultsChecklist.innerHTML = `<ul>${checklist.map(x => `<li>${safeText(x)}</li>`).join("")}</ul>`;
    }

    if (resultsRisks) {
      resultsRisks.innerHTML = `<ul>${risks.map(x => `<li>${safeText(x)}</li>`).join("")}</ul>`;
    }

    if (resultsStorage) {
      resultsStorage.innerHTML = `<ul>${storage.map(x => `<li>${safeText(x)}</li>`).join("")}</ul>`;
    }

    setSimStatus("Complete");
    if (progressFill) progressFill.style.width = "100%";
    if (progressText) progressText.textContent = "100%";

    // scroll to results smoothly and briefly highlight
    results?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Add a small UX cue
    results?.classList.add("pulse");
    setTimeout(() => results?.classList.remove("pulse"), 600);
  }

  // Copy summary
  function getPlainSummary() {
    const a = state.answers;
    const { route, flags } = summarizePath(a);
    const checklist = buildChecklist(a);
    const risks = buildRisks(a, flags);
    const storage = buildStorage(a);

    return [
      "SELF-HELP LEGAL CLINIC — ONTARIO WILLS (STUDENT GUIDE)",
      "",
      "RECOMMENDED PATH",
      `- ${route.headline}`,
      ...route.bullets.map(b => `  • ${b}`),
      "",
      "EXECUTION CHECKLIST",
      ...checklist.map(x => `- ${x}`),
      "",
      "RISK FLAGS",
      ...risks.map(x => `- ${x}`),
      "",
      "STORAGE PLAN",
      ...storage.map(x => `- ${x}`),
      "",
      "Reminder: Educational only — not legal advice."
    ].join("\n");
  }

  if (copySummary) {
    copySummary.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(getPlainSummary());
        copySummary.textContent = "Copied";
        setTimeout(() => (copySummary.textContent = "Copy Summary"), 1100);
      } catch {
        // fallback
        const t = document.createElement("textarea");
        t.value = getPlainSummary();
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        document.body.removeChild(t);
        copySummary.textContent = "Copied";
        setTimeout(() => (copySummary.textContent = "Copy Summary"), 1100);
      }
    });
  }

  if (simBack) simBack.addEventListener("click", goBack);
  if (simNext) simNext.addEventListener("click", goNext);
  if (resetSim) resetSim.addEventListener("click", reset);

  // Next button should also work with keyboard focus after selecting option
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.activeElement?.classList?.contains("option")) {
      // do nothing; option handler manages selection
      return;
    }
  });

  // Enable/disable Next depending on selection after render
  const simMutation = new MutationObserver(() => {
    const q = currentQuestion();
    if (!q) return;
    if (simNext) simNext.disabled = !state.answers[q.id];
  });
  if (simCard) simMutation.observe(simCard, { childList: true, subtree: true });

  // Initial paint
  if (simCard) {
    simCard.classList.add("fade");
    simCard.classList.add("is-in");
  }
  reset();

  // ---------- Micro UX: soft section fade on anchor nav ----------
  // (Purely cosmetic; still accessible)
  $$(".nav-link, .btn").forEach(a => {
    if (!a.getAttribute("href")?.startsWith("#")) return;
    a.addEventListener("click", () => {
      const targetId = a.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target) target.classList.add("flash");
      setTimeout(() => target?.classList.remove("flash"), 420);
    });
  });

  // Tiny CSS-less pulse helper class injection (optional)
  const style = document.createElement("style");
  style.textContent = `
    .flash{ outline: 2px solid rgba(59,130,246,0.25); outline-offset: 6px; border-radius: 16px; }
    .pulse{ animation: pulseRing 520ms ease-out; }
    @keyframes pulseRing{
      0%{ box-shadow: 0 0 0 0 rgba(59,130,246,0.25); }
      100%{ box-shadow: 0 0 0 18px rgba(59,130,246,0.0); }
    }
  `;
  document.head.appendChild(style);

})();
