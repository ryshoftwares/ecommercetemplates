/* ==========================================================================
   MODIX — js/app.js
   Global site behavior: header collapse-on-scroll, mega-dropdown nav,
   mobile drawer, announcement bar rotation, toast notifications,
   scroll-reveal (IntersectionObserver, respects prefers-reduced-motion).
   Loaded on every page after products.js and before page-specific modules.
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Toast notifications — used by cart.js, wishlist.js, checkout, etc.
     ------------------------------------------------------------------ */
  function ensureToastContainer() {
    var el = document.querySelector(".toast-container");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast-container";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    return el;
  }

  var ICONS = {
    success: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
    info: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
  };

  function showToast(opts) {
    opts = opts || {};
    var type = opts.type || "info";
    var container = ensureToastContainer();
    var toast = document.createElement("div");
    toast.className = "toast toast--" + type;
    toast.innerHTML =
      (ICONS[type] || ICONS.info) +
      '<div><div class="toast__title">' + (opts.title || "Notice") + "</div>" +
      (opts.message ? '<div class="toast__msg">' + opts.message + "</div>" : "") + "</div>" +
      '<button class="toast__close" type="button" aria-label="Dismiss notification"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';
    container.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("is-visible"); });

    var timer = setTimeout(function () { dismiss(); }, opts.duration || 3200);
    function dismiss() {
      clearTimeout(timer);
      toast.classList.remove("is-visible");
      setTimeout(function () { toast.remove(); }, 260);
    }
    toast.querySelector(".toast__close").addEventListener("click", dismiss);
  }
  window.MODIX = window.MODIX || {};
  window.MODIX.toast = showToast;

  /* ------------------------------------------------------------------
     Header: collapse-on-scroll
     ------------------------------------------------------------------ */
  function initHeaderCollapse() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     Mega-dropdown nav (desktop) — hover + keyboard accessible
     ------------------------------------------------------------------ */
  function initMegaNav() {
    var items = document.querySelectorAll(".nav-item.has-mega");
    items.forEach(function (item) {
      var link = item.querySelector(".nav-link");
      var panel = item.querySelector(".mega-panel");
      var closeTimer;
      function open() {
        clearTimeout(closeTimer);
        items.forEach(function (i) { if (i !== item) i.classList.remove("is-open"); });
        item.classList.add("is-open");
      }
      function scheduleClose() {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(function () { item.classList.remove("is-open"); }, 160);
      }
      item.addEventListener("mouseenter", open);
      item.addEventListener("mouseleave", scheduleClose);
      if (link) {
        link.addEventListener("click", function (e) {
          if (panel) { e.preventDefault(); item.classList.toggle("is-open"); }
        });
        link.addEventListener("focus", open);
      }
      item.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { item.classList.remove("is-open"); link.focus(); }
      });
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-item.has-mega")) {
        items.forEach(function (i) { i.classList.remove("is-open"); });
      }
    });
  }

  /* ------------------------------------------------------------------
     Mobile drawer
     ------------------------------------------------------------------ */
  function initMobileDrawer() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var drawer = document.querySelector(".mobile-drawer");
    var scrim = document.querySelector("[data-drawer-scrim]");
    var closeBtn = document.querySelector("[data-mobile-drawer-close]");
    if (!toggle || !drawer) return;

    function open() {
      drawer.classList.add("is-open");
      if (scrim) scrim.classList.add("is-visible");
      document.body.style.overflow = "hidden";
      toggle.setAttribute("aria-expanded", "true");
    }
    function close() {
      drawer.classList.remove("is-open");
      if (scrim) scrim.classList.remove("is-visible");
      document.body.style.overflow = "";
      toggle.setAttribute("aria-expanded", "false");
    }
    toggle.addEventListener("click", function () {
      drawer.classList.contains("is-open") ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (scrim) scrim.addEventListener("click", close);

    drawer.querySelectorAll("[data-submenu-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sub = document.getElementById(btn.getAttribute("aria-controls"));
        var isOpen = sub.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    });

    window.MODIX.closeMobileDrawer = close;
  }

  /* ------------------------------------------------------------------
     Announcement bar rotation
     ------------------------------------------------------------------ */
  function initAnnouncementBar() {
    var items = document.querySelectorAll(".announcement-bar__item");
    if (items.length < 2) return;
    var index = 0;
    if (prefersReducedMotion) return;
    setInterval(function () {
      items[index].classList.remove("is-active");
      index = (index + 1) % items.length;
      items[index].classList.add("is-active");
    }, 4200);
  }

  /* ------------------------------------------------------------------
     Scroll reveal via IntersectionObserver
     ------------------------------------------------------------------ */
  function initScrollReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ------------------------------------------------------------------
     Accordion (used on product.html FAQ, footer help, etc.)
     Event-delegated on document so it also works for accordion items
     injected after DOMContentLoaded (e.g. the PDP FAQ, rendered by
     product.js's own DOMContentLoaded handler that runs after this one).
     ------------------------------------------------------------------ */
  function initAccordions() {
    document.addEventListener("click", function (e) {
      var header = e.target.closest(".accordion-item__header");
      if (!header) return;
      var item = header.closest(".accordion-item");
      var body = item.querySelector(".accordion-item__body");
      var isOpen = item.classList.contains("is-open");
      var group = item.closest("[data-accordion-group]");
      if (group) {
        group.querySelectorAll(".accordion-item.is-open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("is-open");
            other.querySelector(".accordion-item__body").style.maxHeight = null;
            other.querySelector(".accordion-item__header").setAttribute("aria-expanded", "false");
          }
        });
      }
      if (isOpen) {
        item.classList.remove("is-open");
        body.style.maxHeight = null;
        header.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("is-open");
        body.style.maxHeight = body.scrollHeight + "px";
        header.setAttribute("aria-expanded", "true");
      }
    });
  }

  /* ------------------------------------------------------------------
     Generic modal close-on-scrim / Escape helper used by quick view
     ------------------------------------------------------------------ */
  function initModalDismiss() {
    document.querySelectorAll("[data-modal-scrim]").forEach(function (scrim) {
      scrim.addEventListener("click", function (e) {
        if (e.target === scrim) scrim.classList.remove("is-open");
      });
      scrim.querySelectorAll("[data-modal-close]").forEach(function (btn) {
        btn.addEventListener("click", function () { scrim.classList.remove("is-open"); });
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-scrim.is-open").forEach(function (m) { m.classList.remove("is-open"); });
      }
    });
  }

  /* ------------------------------------------------------------------
     Quick View modal — built once, populated per-product on demand.
     Depends on window.MODIX.data (products.js) and, at click-time only,
     window.MODIX.cart / window.MODIX.wishlist (safe regardless of script
     order since those are only read inside the click handler).
     ------------------------------------------------------------------ */
  function ensureQuickViewModal() {
    var scrim = document.querySelector("[data-quick-view-modal]");
    if (scrim) return scrim;
    scrim = document.createElement("div");
    scrim.className = "modal-scrim";
    scrim.setAttribute("data-quick-view-modal", "");
    scrim.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="Quick view">' +
        '<button class="icon-btn modal__close" type="button" data-modal-close aria-label="Close quick view"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
        '<div class="modal__body" data-quick-view-body></div>' +
      "</div>";
    document.body.appendChild(scrim);
    scrim.addEventListener("click", function (e) { if (e.target === scrim) scrim.classList.remove("is-open"); });
    scrim.querySelector("[data-modal-close]").addEventListener("click", function () { scrim.classList.remove("is-open"); });
    return scrim;
  }

  function openQuickView(id) {
    var data = window.MODIX.data;
    if (!data) return;
    var product = data.getProductById(id);
    if (!product) return;
    var scrim = ensureQuickViewModal();
    var body = scrim.querySelector("[data-quick-view-body]");
    var discount = data.discountPercent(product);
    var colorHTML = product.colors.length
      ? '<div class="option-group"><div class="option-group__label">Color</div><div class="option-swatches">' +
          product.colors.map(function (c, i) { return '<span class="option-swatch ' + (i === 0 ? "is-active" : "") + '" style="background:' + c.hex + '" title="' + c.name + '"></span>'; }).join("") +
        "</div></div>"
      : "";
    body.innerHTML =
      '<div class="modal__media"><img src="' + product.image + '" alt="' + product.name + '" width="400" height="400"></div>' +
      "<div>" +
        '<span class="product-card__category">' + (data.getCategoryBySlug(product.category) || {}).name + "</span>" +
        "<h3>" + product.name + "</h3>" +
        data.ratingHTML(product) +
        '<p style="margin:12px 0;">' + product.description + "</p>" +
        '<div class="pdp-info__price"><span class="price price--lg">' + data.formatPrice(product.price) + "</span>" +
        (discount > 0 ? '<span class="price--compare">' + data.formatPrice(product.comparePrice) + "</span>" : "") + "</div>" +
        colorHTML +
        '<div class="pdp-actions" style="margin-top:16px;">' +
          '<button class="btn btn-primary" type="button" data-quick-add data-id="' + product.id + '">Add to Cart</button>' +
          '<a href="product.html?slug=' + product.slug + '" class="btn btn-ghost">Full Details</a>' +
        "</div>" +
      "</div>";
    scrim.classList.add("is-open");
  }

  function initQuickView() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-quick-view]");
      if (!btn) return;
      openQuickView(btn.dataset.id);
    });
  }

  /* ------------------------------------------------------------------
     Newsletter form (visual demo only)
     ------------------------------------------------------------------ */
  function initNewsletterForm() {
    document.querySelectorAll("[data-newsletter-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input[type=email]");
        if (input && input.value) {
          showToast({ type: "success", title: "You're subscribed", message: "Thanks for joining the Modix insider list." });
          form.reset();
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Contact form (visual demo only)
     ------------------------------------------------------------------ */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast({ type: "success", title: "Message sent", message: "Our support team will reply within one business day." });
      form.reset();
    });
  }

  /* ------------------------------------------------------------------
     Account icon — no account system in this static demo; surfaces a
     clear, honest toast instead of a dead link or fake sign-in form.
     ------------------------------------------------------------------ */
  function initAccountTrigger() {
    document.querySelectorAll("[data-account-trigger]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showToast({ type: "info", title: "Account sign-in", message: "Not enabled in this static demo — production build wires this to real customer accounts." });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeaderCollapse();
    initMegaNav();
    initMobileDrawer();
    initAnnouncementBar();
    initScrollReveal();
    initAccordions();
    initModalDismiss();
    initQuickView();
    initAccountTrigger();
    initNewsletterForm();
    initContactForm();
  });
})();
