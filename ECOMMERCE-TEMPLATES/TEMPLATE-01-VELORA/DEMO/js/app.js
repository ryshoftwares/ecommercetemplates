/* ==========================================================================
   VELORA — Global App Behaviour
   Handles: announcement bar rotation, header shrink-on-scroll, mobile nav
   drawer, toast notifications, scroll-reveal (IntersectionObserver).
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Announcement bar rotation
  --------------------------------------------------------------------- */
  function initAnnouncementBar() {
    var items = document.querySelectorAll(".announce-item");
    if (!items.length) return;
    var i = 0;
    items[0].classList.add("is-active");
    if (items.length < 2 || prefersReducedMotion) return;
    setInterval(function () {
      items[i].classList.remove("is-active");
      i = (i + 1) % items.length;
      items[i].classList.add("is-active");
    }, 4200);
  }

  /* ---------------------------------------------------------------------
     Header shrink-on-scroll
  --------------------------------------------------------------------- */
  function initHeaderShrink() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-shrunk", window.scrollY > 40);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    });
    update();
  }

  /* ---------------------------------------------------------------------
     Mobile nav drawer
  --------------------------------------------------------------------- */
  function initMobileDrawer() {
    var hamburger = document.querySelector("[data-drawer-open]");
    var drawer = document.querySelector(".mobile-drawer");
    var backdrop = document.querySelector(".mobile-drawer-backdrop");
    var closeBtn = document.querySelector("[data-drawer-close]");
    if (!hamburger || !drawer || !backdrop) return;

    function open() {
      drawer.classList.add("is-open");
      backdrop.classList.add("is-open");
      hamburger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function close() {
      drawer.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    hamburger.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------------------------------------------------------------------
     Scroll-reveal entrance animations
  --------------------------------------------------------------------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ---------------------------------------------------------------------
     Toast notification system — window.VeloraToast.show(msg, type)
  --------------------------------------------------------------------- */
  function initToasts() {
    var stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("role", "status");
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }

    var icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12" y2="16.01"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="7" x2="12" y2="7.01"/></svg>'
    };

    function show(message, type) {
      type = type || "info";
      var toast = document.createElement("div");
      toast.className = "toast toast-" + type;
      toast.innerHTML = (icons[type] || icons.info) + "<span>" + message + "</span>";
      stack.appendChild(toast);
      requestAnimationFrame(function () { toast.classList.add("is-visible"); });
      setTimeout(function () {
        toast.classList.remove("is-visible");
        setTimeout(function () { toast.remove(); }, 320);
      }, 3200);
    }

    window.VeloraToast = { show: show };
  }

  /* ---------------------------------------------------------------------
     Active nav link highlighting
  --------------------------------------------------------------------- */
  function initActiveNav() {
    var page = (location.pathname.split("/").pop() || "index.html");
    document.querySelectorAll(".primary-nav a, .mobile-drawer nav a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.split("?")[0] === page) a.classList.add("is-active");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initToasts();
    initAnnouncementBar();
    initHeaderShrink();
    initMobileDrawer();
    initScrollReveal();
    initActiveNav();
  });
})();
