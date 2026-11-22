(function () {
  "use strict";

  // Current year in footer
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile navigation toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Contact form: compose a mailto message so the page works without a backend.
  // Replace this handler with a form service (e.g. Formspree, Netlify Forms) when available.
  var form = document.getElementById("contact-form");
  var note = document.getElementById("form-note");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var subject = "Scoping note: " + (data.get("service") || "General enquiry");
      var body =
        "Name: " + data.get("name") + "\n" +
        "Institution: " + data.get("institution") + "\n" +
        "Email: " + data.get("email") + "\n" +
        "Area of interest: " + data.get("service") + "\n\n" +
        data.get("message");
      var href = "mailto:contact@proximaurban.eu" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      window.location.href = href;
      if (note) note.textContent = "Your email client should open with the message prepared. If it does not, write to contact@proximaurban.eu directly.";
    });
  }
})();
