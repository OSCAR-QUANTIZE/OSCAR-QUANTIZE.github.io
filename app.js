/**
 * OSCAR project page — pipeline animation, particles, scroll reveals
 */
(function () {
  "use strict";

  const STEP_LABELS = [
    "Calibrate",
    "Build R",
    "Cache layout",
    "Quantize & pack",
    "Decode merge",
  ];

  const STEP_INTERVAL_MS = 4500;
  let currentStep = 0;
  let autoTimer = null;
  let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Pipeline ---
  const panels = document.querySelectorAll(".pipe-panel");
  const pipeBtns = document.querySelectorAll(".pipe-btn");
  const stepIndicator = document.getElementById("stepIndicator");
  const autoPlayCheckbox = document.getElementById("autoPlay");

  function setStep(step) {
    currentStep = ((step % panels.length) + panels.length) % panels.length;
    panels.forEach((p, i) => p.classList.toggle("active", i === currentStep));
    pipeBtns.forEach((b, i) => b.classList.toggle("active", i === currentStep));
    if (stepIndicator) {
      stepIndicator.textContent = `Step ${currentStep + 1} / ${panels.length} — ${STEP_LABELS[currentStep]}`;
    }
    runStepEffects(currentStep);
  }

  function runStepEffects(step) {
    if (reducedMotion) return;

    if (step === 3) {
      animateBitCells();
    }
  }

  function animateBitCells() {
    const cells = document.querySelectorAll(".bit-cell");
    cells.forEach((cell, i) => {
      setTimeout(() => {
        const level = Math.floor(Math.random() * 4);
        cell.setAttribute("data-level", String(level));
        cell.style.transform = "scale(1.15)";
        setTimeout(() => { cell.style.transform = ""; }, 200);
      }, i * 120);
    });
  }

  function nextStep() {
    setStep(currentStep + 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (!autoPlayCheckbox?.checked || reducedMotion) return;
    autoTimer = setInterval(nextStep, STEP_INTERVAL_MS);
  }

  function stopAutoPlay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  pipeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.dataset.step, 10);
      setStep(step);
      startAutoPlay();
    });
  });

  autoPlayCheckbox?.addEventListener("change", () => {
    if (autoPlayCheckbox.checked) startAutoPlay();
    else stopAutoPlay();
  });

  setStep(0);
  startAutoPlay();

  // --- Scroll reveal ---
  const revealEls = document.querySelectorAll(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  // --- Mobile nav ---
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  navToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  navLinks?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => navLinks.classList.remove("open"));
  });

  // --- Cite modal & copy bibtex ---
  const citeModal = document.getElementById("citeModal");
  const bibtexEl = document.getElementById("bibtex");
  const bibtexModalEl = document.getElementById("bibtexModal");
  const copyBibModal = document.getElementById("copyBibModal");
  let citeModalLastFocus = null;

  function getBibtexText() {
    return (bibtexModalEl?.textContent || bibtexEl?.textContent || "").trim();
  }

  async function copyBibtex(btn) {
    const text = getBibtexText();
    const defaultLabel = btn.dataset.defaultLabel || "Copy citation";
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = defaultLabel; }, 2000);
    } catch {
      btn.textContent = "Copy failed — select text manually";
      setTimeout(() => { btn.textContent = defaultLabel; }, 2500);
    }
  }

  function openCiteModal() {
    if (!citeModal) return;
    citeModalLastFocus = document.activeElement;
    citeModal.hidden = false;
    citeModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("cite-modal-open");
    const closeBtn = citeModal.querySelector(".cite-modal-close");
    closeBtn?.focus();
  }

  function closeCiteModal() {
    if (!citeModal) return;
    citeModal.hidden = true;
    citeModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cite-modal-open");
    if (citeModalLastFocus?.focus) citeModalLastFocus.focus();
  }

  document.querySelectorAll(".cite-trigger").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openCiteModal();
    });
  });

  citeModal?.querySelectorAll("[data-cite-close]").forEach((el) => {
    el.addEventListener("click", closeCiteModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && citeModal && !citeModal.hidden) closeCiteModal();
  });

  if (copyBibModal) {
    copyBibModal.addEventListener("click", () => copyBibtex(copyBibModal));
  }

  const copyBibSection = document.getElementById("copyBibSection");
  if (copyBibSection) {
    copyBibSection.addEventListener("click", () => copyBibtex(copyBibSection));
  }

  // --- Efficiency bars animate on scroll ---
  const effFills = document.querySelectorAll(".eff-fill");
  if (!reducedMotion && effFills.length && "IntersectionObserver" in window) {
    const effIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const w = e.target.style.getPropertyValue("--w");
            e.target.style.width = "0";
            requestAnimationFrame(() => {
              e.target.style.width = w;
            });
            effIo.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    effFills.forEach((f) => effIo.observe(f));
  }

  // --- Particle canvas ---
  const canvas = document.getElementById("particles");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animId = null;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initParticles() {
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 18000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 0.5,
          gold: Math.random() > 0.3,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(184, 134, 11, ${0.22 + Math.random() * 0.28})`
          : `rgba(59, 125, 216, ${0.12 + Math.random() * 0.15})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        draw();
      }
    });
  }

  // Pause pipeline when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoPlay();
    else if (autoPlayCheckbox?.checked) startAutoPlay();
  });
})();
