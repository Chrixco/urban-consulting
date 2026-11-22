(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  // Header hide on scroll down, show on scroll up; reading progress bar
  var header = document.getElementById("site-header");
  var bar = document.getElementById("progress-bar");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      if (y > lastY && y > 120 && !(nav && nav.classList.contains("is-open"))) header.classList.add("is-hidden");
      else header.classList.remove("is-hidden");
    }
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll reveal
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add("is-visible");
          io.unobserve(el);
          // Drop the transition once finished so revealed content is static for the compositor.
          var delay = parseFloat(getComputedStyle(el).transitionDelay) * 1000 || 0;
          setTimeout(function () { el.classList.add("is-done"); }, 800 + delay);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible", "is-done"); });
  }

  // Animated counters
  var counters = document.querySelectorAll(".count");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (reduceMotion) { el.textContent = target.toLocaleString("en-US"); return; }
    var start = null, duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = parseFloat(el.getAttribute("data-count")).toLocaleString("en-US"); });
  }

  // Active section highlight in navigation
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[href^='#']"));
  if ("IntersectionObserver" in window && sections.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { sio.observe(s); });
  }

  // Social links not yet configured: keep the page in place.
  document.querySelectorAll('a[data-placeholder]').forEach(function (a) {
    if (a.getAttribute("href") === "#") a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  // Contact form: compose a mailto message so the page works without a backend.
  var form = document.getElementById("contact-form");
  var note = document.getElementById("form-note");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var subject = "Scoping note: " + (data.get("service") || "General enquiry");
      var body = "Name: " + data.get("name") + "\nInstitution: " + data.get("institution") + "\nEmail: " + data.get("email") + "\nArea of interest: " + data.get("service") + "\n\n" + data.get("message");
      window.location.href = "mailto:contact@proximaurban.eu?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (note) note.textContent = "Your email client should open with the message prepared. If it does not, write to contact@proximaurban.eu directly.";
    });
  }
})();
