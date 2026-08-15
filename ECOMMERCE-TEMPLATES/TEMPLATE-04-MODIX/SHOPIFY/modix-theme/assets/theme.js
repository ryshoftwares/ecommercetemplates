/* ==========================================================================
   MODIX — assets/theme.js
   Global chrome, ported from the demo's js/app.js: header collapse-on-
   scroll, announcement-bar rotation, mega-dropdown nav, mobile drawer,
   generic panel open/close (cart drawer / filter drawer / mobile drawer),
   quick view modal (Shopify's native /products/{handle}.js JSON endpoint),
   toasts, scroll-reveal (IntersectionObserver, prefers-reduced-motion
   aware), collection filter UX, account icon toast, and the wishlist
   localStorage helpers that snippets/product-card.liquid,
   snippets/product-form.liquid and sections/header.liquid all key off of.

   GLOBAL NAMESPACE: exposes window.Modix.toast / window.Modix.app /
   window.Modix.wishlist, matching config/settings_schema.json's Wishlist
   info text.

   WISHLIST STORAGE: localStorage key "modix_wishlist_v1", an array of
   product handles (not numeric IDs — Shopify product URLs and the native
   /products/{handle}.js JSON endpoint are handle-keyed).
   ========================================================================== */

(function (global) {
  "use strict";

  var prefersReducedMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  global.Modix = global.Modix || {};

  /* ---------------------------------------------------------------------
     Toasts
     --------------------------------------------------------------------- */
  function ensureToastContainer() {
    var el = document.querySelector("[data-toast-container]");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast-container";
      el.setAttribute("data-toast-container", "");
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    return el;
  }
  var TOAST_ICONS = {
    success: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
    info: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
  };
  function showToast(opts) {
    if (typeof opts === "string") opts = { title: opts, type: arguments[1] || "info" };
    opts = opts || {};
    var type = opts.type || "info";
    var container = ensureToastContainer();
    var toast = document.createElement("div");
    toast.className = "toast toast--" + type;
    toast.innerHTML =
      (TOAST_ICONS[type] || TOAST_ICONS.info) +
      '<div><div class="toast__title">' + (opts.title || "Notice") + "</div>" +
      (opts.message ? '<div class="toast__msg">' + opts.message + "</div>" : "") + "</div>" +
      '<button class="toast__close" type="button" aria-label="Dismiss notification"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';
    container.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("is-visible"); });
    var timer = setTimeout(dismiss, opts.duration || 3200);
    function dismiss() {
      clearTimeout(timer);
      toast.classList.remove("is-visible");
      setTimeout(function () { toast.remove(); }, 260);
    }
    toast.querySelector(".toast__close").addEventListener("click", dismiss);
  }
  global.Modix.toast = showToast;

  /* ---------------------------------------------------------------------
     Header: collapse-on-scroll (utility strip stays visible per the
     master demo — only .header-bar height / logo / nav-link height shrink)
     --------------------------------------------------------------------- */
  function initHeaderCollapse() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-scrolled", global.scrollY > 24);
      ticking = false;
    }
    global.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------
     Mega-dropdown nav (desktop) — hover + keyboard accessible
     --------------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------------
     Mobile drawer
     --------------------------------------------------------------------- */
  function initMobileDrawer() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var drawer = document.querySelector("[data-mobile-drawer]");
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

    global.Modix.closeMobileDrawer = close;
  }

  /* ---------------------------------------------------------------------
     Announcement bar rotation
     --------------------------------------------------------------------- */
  function initAnnouncementBar() {
    var items = document.querySelectorAll(".announcement-bar__item");
    if (items.length < 2 || prefersReducedMotion) return;
    var index = 0;
    setInterval(function () {
      items[index].classList.remove("is-active");
      index = (index + 1) % items.length;
      items[index].classList.add("is-active");
    }, 4200);
  }

  /* ---------------------------------------------------------------------
     Scroll reveal via IntersectionObserver
     --------------------------------------------------------------------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in global)) {
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

  /* ---------------------------------------------------------------------
     Accordion (PDP FAQ, etc.) — event-delegated so it also works for
     accordions injected after DOMContentLoaded.
     --------------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------------
     Generic drawer/panel scrim + escape handling (cart drawer, filters,
     search overlay are each handled by their own module; this covers the
     shared scrim + Escape-to-close behavior).
     --------------------------------------------------------------------- */
  function initModalDismiss() {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-scrim.is-open").forEach(function (m) { m.classList.remove("is-open"); });
      }
    });
  }

  /* ---------------------------------------------------------------------
     Quick View modal — fetches the real product from Shopify's native
     /products/{handle}.js JSON endpoint (no fabricated content).
     --------------------------------------------------------------------- */
  function money(cents) {
    if (global.Shopify && typeof global.Shopify.formatMoney === "function" && global.Shopify.money_format) {
      return global.Shopify.formatMoney(cents, global.Shopify.money_format);
    }
    return "₹" + (cents / 100).toFixed(2).replace(/\.00$/, "");
  }

  function buildQuickViewMarkup(product) {
    var variant = product.variants[0];
    var discount = variant.compare_at_price && variant.compare_at_price > variant.price
      ? Math.round(((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100)
      : 0;
    var img = (product.featured_image || (product.images && product.images[0])) || "";
    var colorOption = product.options && product.options.indexOf("Color") !== -1 ? product.options.indexOf("Color") : -1;
    return (
      '<button class="icon-btn modal__close" type="button" data-modal-close aria-label="Close quick view">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      "</button>" +
      '<div class="modal__body">' +
        '<div class="modal__media">' + (img ? '<img src="' + img + '" alt="' + product.title + '" width="400" height="400">' : "") + "</div>" +
        "<div>" +
          '<span class="product-card__category">' + (product.type || "") + "</span>" +
          "<h3>" + product.title + "</h3>" +
          '<p style="margin:12px 0;">' + (product.description || "").replace(/<[^>]*>/g, "").slice(0, 200) + "</p>" +
          '<div class="pdp-info__price"><span class="price price--lg">' + money(variant.price) + "</span>" +
          (discount > 0 ? '<span class="price--compare">' + money(variant.compare_at_price) + "</span>" : "") + "</div>" +
          '<div class="pdp-actions" style="margin-top:16px;">' +
            '<button class="btn btn-primary" type="button" data-quick-view-add data-variant-id="' + variant.id + '">Add to Cart</button>' +
            '<a href="/products/' + product.handle + '" class="btn btn-ghost">Full Details</a>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function ensureQuickViewModal() {
    return document.querySelector("[data-quick-view-modal]");
  }

  function initQuickView() {
    var modal = ensureQuickViewModal();
    if (!modal) return;

    function close() { modal.classList.remove("is-open"); document.body.style.overflow = ""; }

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-quickview]");
      if (trigger) {
        var handle = trigger.getAttribute("data-handle");
        if (!handle) return;
        fetch("/products/" + handle + ".js")
          .then(function (res) { return res.json(); })
          .then(function (product) {
            modal.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="Quick view: ' + product.title + '">' + buildQuickViewMarkup(product) + "</div>";
            modal.classList.add("is-open");
            document.body.style.overflow = "hidden";
            syncWishlistButtonsUI();
          })
          .catch(function () { showToast({ type: "error", title: "Couldn't load that product right now." }); });
      }
      if (e.target === modal || e.target.closest("[data-modal-close]")) close();

      var quickAddBtn = e.target.closest("[data-quick-view-add]");
      if (quickAddBtn && global.ModixCart) {
        var variantId = quickAddBtn.getAttribute("data-variant-id");
        global.ModixCart.addToCart(variantId, 1).then(function () {
          close();
          if (global.Modix.app) global.Modix.app.openCartDrawer();
        });
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  }

  /* ---------------------------------------------------------------------
     Account icon — Shopify has real customer accounts, but this theme's
     demo parity note: show a clear toast pointing to routes.account_url
     rather than assuming a customer login modal exists.
     --------------------------------------------------------------------- */
  function initAccountTrigger() {
    document.querySelectorAll("[data-account-trigger]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        global.location.href = (global.ModixSettings && global.ModixSettings.routes.rootUrl ? global.ModixSettings.routes.rootUrl : "/") + "account";
      });
    });
  }

  /* ---------------------------------------------------------------------
     Wishlist (localStorage, keyed by product handle)
     --------------------------------------------------------------------- */
  var WISHLIST_KEY = "modix_wishlist_v1";

  function readWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); } catch (e) { return []; }
  }
  function writeWishlist(list) {
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list)); } catch (e) {}
    updateWishlistCount();
    document.dispatchEvent(new CustomEvent("modix:wishlist-updated", { detail: { list: list } }));
  }
  function isSaved(handle) { return readWishlist().indexOf(handle) !== -1; }
  function toggleWishlist(handle) {
    var list = readWishlist();
    var idx = list.indexOf(handle);
    var added;
    if (idx === -1) { list.push(handle); added = true; }
    else { list.splice(idx, 1); added = false; }
    writeWishlist(list);
    return added;
  }
  function removeFromWishlist(handle) {
    writeWishlist(readWishlist().filter(function (h) { return h !== handle; }));
  }
  function updateWishlistCount() {
    var count = readWishlist().length;
    document.querySelectorAll("[data-wishlist-count]").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "" : "none";
    });
  }
  function syncWishlistButtonsUI() {
    var list = readWishlist();
    document.querySelectorAll("[data-wishlist-toggle]").forEach(function (btn) {
      var handle = btn.getAttribute("data-handle");
      var active = list.indexOf(handle) !== -1;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-wishlist-toggle]");
    if (!btn) return;
    e.preventDefault();
    var handle = btn.getAttribute("data-handle");
    if (!handle) return;
    var added = toggleWishlist(handle);
    syncWishlistButtonsUI();
    fetch("/products/" + handle + ".js").then(function (r) { return r.json(); }).then(function (product) {
      showToast({ type: added ? "success" : "info", title: added ? "Added to wishlist" : "Removed from wishlist", message: product.title });
    }).catch(function () {
      showToast({ type: added ? "success" : "info", title: added ? "Added to wishlist" : "Removed from wishlist" });
    });
    document.dispatchEvent(new CustomEvent("modix:wishlist-toggled", { detail: { handle: handle, added: added } }));
    if (document.querySelector("[data-wishlist-page]") && global.ModixWishlistPage) global.ModixWishlistPage.render();
  });

  global.Modix.wishlist = {
    STORAGE_KEY: WISHLIST_KEY,
    read: readWishlist,
    isSaved: isSaved,
    toggle: toggleWishlist,
    remove: removeFromWishlist,
    syncButtonsUI: syncWishlistButtonsUI,
    updateCount: updateWishlistCount
  };

  /* ---------------------------------------------------------------------
     Collection filters (sections/main-collection.liquid): collapsible
     groups, mobile filter drawer, swatch links (native <a> navigation, no
     JS required for the swatches themselves — progressive enhancement
     only closes the drawer / toggles groups).
     --------------------------------------------------------------------- */
  function initCollectionFilters() {
    document.querySelectorAll("[data-filter-group-toggle]").forEach(function (title) {
      title.addEventListener("click", function () {
        title.closest("[data-filter-group]").classList.toggle("is-collapsed");
      });
    });

    var sidebar = document.querySelector("[data-filters-sidebar]");
    var mobileToggle = document.querySelector("[data-mobile-filter-toggle]");
    var drawerClose = document.querySelector("[data-filters-drawer-close]");
    var drawerScrim = document.querySelector("[data-filters-scrim]");
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener("click", function () {
        sidebar.classList.add("is-open");
        if (drawerScrim) drawerScrim.classList.add("is-visible");
        document.body.style.overflow = "hidden";
      });
      function closeDrawer() {
        sidebar.classList.remove("is-open");
        if (drawerScrim) drawerScrim.classList.remove("is-visible");
        document.body.style.overflow = "";
      }
      if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
      if (drawerScrim) drawerScrim.addEventListener("click", closeDrawer);
    }

    var form = document.querySelector("[data-collection-filter-form]");
    if (form) {
      form.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(function (input) {
        input.addEventListener("change", function () { form.requestSubmit ? form.requestSubmit() : form.submit(); });
      });
      form.querySelectorAll('input[type="number"]').forEach(function (input) {
        input.addEventListener("change", function () { form.requestSubmit ? form.requestSubmit() : form.submit(); });
      });
    }
  }

  /* ---------------------------------------------------------------------
     Toast-on-load: server-rendered forms (newsletter, contact) flag a
     success message via a hidden element with data-toast-on-load="type:msg"
     — fired once on page load.
     --------------------------------------------------------------------- */
  function initToastOnLoad() {
    document.querySelectorAll("[data-toast-on-load]").forEach(function (el) {
      var raw = el.getAttribute("data-toast-on-load") || "";
      var sep = raw.indexOf(":");
      if (sep === -1) return;
      showToast({ type: raw.slice(0, sep), title: raw.slice(sep + 1) });
    });
  }

  global.Modix.app = {
    showToast: showToast
  };

  /* ---------------------------------------------------------------------
     Init
     --------------------------------------------------------------------- */
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
    initCollectionFilters();
    initToastOnLoad();
    updateWishlistCount();
    syncWishlistButtonsUI();
    document.addEventListener("modix:wishlist-updated", syncWishlistButtonsUI);
  });
})(window);
