/* ==========================================================================
   NOAÉ (Shopify theme) — Global App Behaviour
   Ported from the demo's js/app.js + js/wishlist.js, adapted to Shopify's
   section/DOM structure and native endpoints. Handles: announcement bar
   rotation, sticky header shadow, mobile nav drawer, mobile filter drawer,
   toast notifications, scroll-reveal (IntersectionObserver, respects
   prefers-reduced-motion), the wishlist (localStorage), and the quick view
   modal (built from Shopify's live /products/{handle}.js JSON).

   WISHLIST: Shopify has no native wishlist object/API. NoaeWishlist below
   stores an array of PRODUCT HANDLES (not numeric ids, since handles are
   stable and human-readable) in localStorage under "noae_wishlist_v1". This
   is per-browser only — it is not synced to the customer's account or
   across devices. Referenced consistently from sections/header.liquid,
   snippets/product-card.liquid, snippets/product-form.liquid and
   sections/main-wishlist.liquid.
   ========================================================================== */

(function (global) {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Announcement bar rotation
  --------------------------------------------------------------------- */
  function initAnnouncementBar() {
    var items = document.querySelectorAll(".noae-announcement__item");
    if (items.length < 2) return;
    var idx = 0;
    if (prefersReducedMotion) return;
    setInterval(function () {
      items[idx].classList.remove("is-active");
      idx = (idx + 1) % items.length;
      items[idx].classList.add("is-active");
    }, 4200);
  }

  /* ---------------------------------------------------------------------
     Sticky header shadow-on-scroll
  --------------------------------------------------------------------- */
  function initStickyHeader() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-stuck", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------
     Mobile nav drawer
  --------------------------------------------------------------------- */
  function initMobileDrawer() {
    var hamburger = document.querySelector("[data-drawer-open]");
    var drawer = document.querySelector("[data-mobile-drawer]");
    var backdrop = document.querySelectorAll("[data-drawer-backdrop]")[0];
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
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------------------------------------------------------------------
     Mobile filter drawer (collection page) — see sections/main-collection.liquid
  --------------------------------------------------------------------- */
  function initFilterDrawer() {
    var openBtn = document.querySelector("[data-filter-drawer-open]");
    var closeBtn = document.querySelector("[data-filter-drawer-close]");
    var aside = document.querySelector("[data-filters-aside]");
    var backdrop = document.querySelector("[data-filter-drawer-backdrop]");
    if (!openBtn || !aside) return;
    function open() {
      aside.classList.add("is-open");
      if (backdrop) backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      aside.classList.remove("is-open");
      if (backdrop) backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);

    document.querySelectorAll("[data-filter-toggle]").forEach(function (h) {
      h.addEventListener("click", function () {
        h.closest("[data-filter-group]").classList.toggle("is-collapsed");
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll-reveal entrance animations
  --------------------------------------------------------------------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll(".noae-reveal");
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
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ---------------------------------------------------------------------
     Toast notification system — window.NoaeToast.show(msg, type)
  --------------------------------------------------------------------- */
  function initToasts() {
    var region = document.getElementById("toastRegion");
    if (!region) {
      region = document.createElement("div");
      region.id = "toastRegion";
      region.className = "noae-toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }

    function show(message, type) {
      var toast = document.createElement("div");
      toast.className = "noae-toast" + (type === "success" ? " noae-toast--success" : type === "error" ? " noae-toast--error" : "");
      toast.textContent = message;
      region.appendChild(toast);
      setTimeout(function () {
        toast.style.transition = "opacity 220ms ease";
        toast.style.opacity = "0";
        setTimeout(function () { toast.remove(); }, 240);
      }, 2600);
    }

    global.NoaeToast = { show: show };
  }

  /* ---------------------------------------------------------------------
     Wishlist — window.NoaeWishlist
  --------------------------------------------------------------------- */
  function initWishlist() {
    var STORAGE_KEY = "noae_wishlist_v1";

    function read() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }
    function write(handles) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(handles)); } catch (e) {}
      updateBadges();
      syncToggles();
    }
    function has(handle) { return read().indexOf(handle) !== -1; }
    function toggle(handle) {
      var handles = read();
      var idx = handles.indexOf(handle);
      var added;
      if (idx === -1) { handles.push(handle); added = true; }
      else { handles.splice(idx, 1); added = false; }
      write(handles);
      return added;
    }
    function remove(handle) { write(read().filter(function (h) { return h !== handle; })); }
    function count() { return read().length; }

    function updateBadges() {
      var n = count();
      document.querySelectorAll("[data-wishlist-count]").forEach(function (el) {
        el.textContent = n;
        el.style.display = n > 0 ? "inline-flex" : "none";
      });
    }
    function syncToggles() {
      var handles = read();
      document.querySelectorAll("[data-wishlist-toggle]").forEach(function (btn) {
        var handle = btn.getAttribute("data-handle");
        var active = handles.indexOf(handle) !== -1;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    document.body.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-wishlist-toggle]");
      if (!btn) return;
      e.preventDefault();
      var handle = btn.getAttribute("data-handle");
      if (!handle) return;
      var added = toggle(handle);
      if (global.NoaeToast) {
        global.NoaeToast.show(added ? "Added to wishlist" : "Removed from wishlist", added ? "success" : "default");
      }
      if (document.querySelector("[data-wishlist-page]")) renderWishlistPage();
    });

    function fmt(cents) { return formatMoney(cents); }

    function wishlistCardHTML(p) {
      return (
        '<article class="noae-product-card" data-product-handle="' + p.handle + '">' +
          '<div class="noae-product-card__media">' +
            '<a href="' + p.url + '" class="noae-product-card__link" aria-label="View ' + p.title + '">' +
              '<img class="noae-product-card__img noae-product-card__img--main" src="' + (p.featured_image || "") + '" alt="' + p.title + '" width="400" height="480" loading="lazy">' +
            "</a>" +
            '<button type="button" class="noae-icon-btn noae-wishlist-toggle is-active" data-wishlist-toggle data-handle="' + p.handle + '" aria-label="Remove ' + p.title + ' from wishlist" aria-pressed="true">' +
              '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.1 2 4.5 5.6 3.7 8 3.2 10.2 4.3 12 6.7 13.8 4.3 16 3.2 18.4 3.7 22 4.5 23.5 8.1 22 11.7 19.5 16.3 12 21 12 21z" fill="currentColor"/></svg>' +
            "</button>" +
          "</div>" +
          '<div class="noae-product-card__body">' +
            '<h3 class="noae-product-card__name"><a href="' + p.url + '">' + p.title + "</a></h3>" +
            '<div class="noae-product-card__price"><span class="noae-price">' + fmt(p.price) + "</span></div>" +
            '<button type="button" class="noae-btn noae-btn--outline noae-btn--full" data-move-to-cart data-variant-id="' + (p.variants && p.variants[0] ? p.variants[0].id : "") + '">' + "Move to Bag" + "</button>" +
          "</div>" +
        "</article>"
      );
    }

    function renderWishlistPage() {
      var container = document.getElementById("wishlistGrid");
      var emptyEl = document.getElementById("wishlistEmptyState");
      if (!container) return;
      var handles = read();
      if (!handles.length) {
        container.innerHTML = "";
        if (emptyEl) emptyEl.style.display = "";
        return;
      }
      Promise.all(handles.map(function (h) {
        return fetch("/products/" + h + ".js").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
      })).then(function (products) {
        products = products.filter(Boolean);
        if (!products.length) {
          container.innerHTML = "";
          if (emptyEl) emptyEl.style.display = "";
          return;
        }
        if (emptyEl) emptyEl.style.display = "none";
        container.innerHTML = products.map(wishlistCardHTML).join("");
      });
    }

    document.body.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-move-to-cart]");
      if (!btn) return;
      var variantId = btn.getAttribute("data-variant-id");
      if (!variantId || !global.Noae.cart) return;
      global.Noae.cart.addItem(variantId, 1).then(function () {
        var card = btn.closest("[data-product-handle]");
        var handle = card && card.getAttribute("data-product-handle");
        if (handle) remove(handle);
        renderWishlistPage();
        if (global.NoaeToast) global.NoaeToast.show("Moved to bag", "success");
      });
    });

    updateBadges();
    syncToggles();
    if (document.querySelector("[data-wishlist-page]")) renderWishlistPage();

    global.Noae = global.Noae || {};
    global.Noae.wishlist = {
      has: has, toggle: toggle, remove: remove, count: count,
      getHandles: read, renderPage: renderWishlistPage, sync: syncToggles
    };
  }

  /* ---------------------------------------------------------------------
     Money formatting helper (uses window.Noae.moneyFormat from theme.liquid)
  --------------------------------------------------------------------- */
  function formatMoney(cents) {
    var format = (global.Noae && global.Noae.moneyFormat) || "₹{{amount}}";
    var amount = (cents / 100).toFixed(2);
    var withoutDecimals = amount.split(".")[0];
    var value = format.indexOf("amount_no_decimals") !== -1 ? withoutDecimals : amount;
    return format.replace(/\{\{\s*amount[a-z_]*\s*\}\}/, addCommas(value));
  }
  function addCommas(numStr) {
    var parts = numStr.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  /* ---------------------------------------------------------------------
     Quick view modal — fetches live product JSON, mirrors demo's
     js/app.js openQuickView(), sourced from Shopify's real
     /products/{handle}.js endpoint instead of a static dataset.
  --------------------------------------------------------------------- */
  function initQuickView() {
    var overlay = document.getElementById("quickViewOverlay");
    if (!overlay) return;
    var body = overlay.querySelector("[data-qv-body]");

    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    function open(handle) {
      fetch("/products/" + handle + ".js").then(function (r) { return r.json(); }).then(function (p) {
        renderQuickView(p);
        overlay.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    }

    function renderQuickView(p) {
      var variant = p.variants[0];
      body.innerHTML =
        '<button class="noae-modal__close" type="button" data-qv-close aria-label="Close quick view">✕</button>' +
        '<div class="noae-modal__grid">' +
          '<div class="noae-modal__media"><img src="' + (p.featured_image || "") + '" alt="' + p.title + '" width="500" height="600"></div>' +
          "<div>" +
            '<p class="noae-pdp__category">' + (p.type || "") + "</p>" +
            "<h2 class=\"noae-pdp__title\">" + p.title + "</h2>" +
            '<div class="noae-pdp__price-row"><span class="noae-price" data-qv-price>' + formatMoney(variant.price) + "</span>" +
            (variant.compare_at_price > variant.price ? '<span class="noae-price noae-price--compare">' + formatMoney(variant.compare_at_price) + "</span>" : "") + "</div>" +
            '<p class="noae-pdp__desc">' + (p.description || "").replace(/<[^>]*>/g, "").slice(0, 220) + "</p>" +
            (p.options_with_values && p.options_with_values.length ? '<div class="noae-variant-group"><span class="noae-variant-label">' + p.options_with_values[0].name + '</span><div class="noae-variant-options" data-qv-options>' +
              p.options_with_values[0].values.map(function (v, i) { return '<button type="button" class="noae-variant-chip' + (i === 0 ? " is-selected" : "") + '" data-value="' + v + '">' + v + "</button>"; }).join("") + "</div></div>" : "") +
            '<div class="noae-pdp__actions">' +
              '<button type="button" class="noae-btn noae-btn--dark" data-qv-add>Add to Bag</button>' +
            "</div>" +
            '<a href="' + p.url + '" class="noae-btn noae-btn--outline noae-mt-6">View Full Details</a>' +
          "</div>" +
        "</div>";

      overlay.querySelector("[data-qv-close]").addEventListener("click", close);

      function currentVariant() {
        var selectedChip = body.querySelector("[data-qv-options] .is-selected");
        if (!selectedChip) return variant;
        var val = selectedChip.getAttribute("data-value");
        return p.variants.filter(function (v) { return v.options.indexOf(val) !== -1; })[0] || variant;
      }

      body.querySelectorAll("[data-qv-options] button").forEach(function (b) {
        b.addEventListener("click", function () {
          body.querySelectorAll("[data-qv-options] button").forEach(function (x) { x.classList.remove("is-selected"); });
          b.classList.add("is-selected");
          body.querySelector("[data-qv-price]").textContent = formatMoney(currentVariant().price);
        });
      });

      body.querySelector("[data-qv-add]").addEventListener("click", function () {
        var v = currentVariant();
        if (global.Noae.cart) {
          global.Noae.cart.addItem(v.id, 1).then(function () {
            if (global.NoaeToast) global.NoaeToast.show(p.title + " added to your bag", "success");
            close();
          });
        }
      });
    }

    document.body.addEventListener("click", function (e) {
      var qvBtn = e.target.closest("[data-quickview]");
      if (qvBtn) { e.preventDefault(); open(qvBtn.getAttribute("data-handle")); }
    });

    global.Noae = global.Noae || {};
    global.Noae.quickView = { open: open, close: close };
  }

  /* ---------------------------------------------------------------------
     Quick add — first available variant, straight to bag (AJAX)
  --------------------------------------------------------------------- */
  function initQuickAdd() {
    document.body.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-quickadd]");
      if (!btn || !global.Noae.cart) return;
      e.preventDefault();
      var variantId = btn.getAttribute("data-variant-id");
      if (!variantId) return;
      global.Noae.cart.addItem(variantId, 1).then(function () {
        if (global.NoaeToast) global.NoaeToast.show("Added to your bag", "success");
      }).catch(function () {
        if (global.NoaeToast) global.NoaeToast.show("Couldn't add that item — it may be sold out.", "error");
      });
    });
  }

  /* ---------------------------------------------------------------------
     Newsletter form success toast (native customer form posts back)
  --------------------------------------------------------------------- */
  function initMisc() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("customer_posted") === "true" && global.NoaeToast) {
      global.NoaeToast.show("Welcome to the ritual — check your inbox for 10% off.", "success");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initToasts();
    initAnnouncementBar();
    initStickyHeader();
    initMobileDrawer();
    initFilterDrawer();
    initScrollReveal();
    initWishlist();
    initQuickView();
    initQuickAdd();
    initMisc();
  });

  global.Noae = global.Noae || {};
  global.Noae.formatMoney = formatMoney;
})(window);
