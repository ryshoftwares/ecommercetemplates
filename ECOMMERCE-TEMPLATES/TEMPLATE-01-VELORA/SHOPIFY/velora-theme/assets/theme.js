/* ==========================================================================
   VELORA (Shopify theme) — Global App Behaviour
   Ported from the demo's js/app.js + js/wishlist.js + parts of js/product.js
   (quick view), adapted to Shopify's DOM/section structure and native
   endpoints. Handles: announcement bar rotation, header shrink-on-scroll,
   mobile nav drawer, toast notifications, scroll-reveal (IntersectionObserver,
   respects prefers-reduced-motion), the wishlist (localStorage), and the
   quick view modal (built from Shopify's live /products/{handle}.js JSON).

   WISHLIST: Shopify has no native wishlist object/API. VeloraWishlist below
   stores an array of PRODUCT HANDLES (not Shopify IDs, since handles are
   stable and human-readable) in localStorage under "velora_wishlist_v1".
   This is per-browser only — it is not synced to the customer's account or
   across devices. This mirrors the demo's js/wishlist.js exactly, except the
   demo keyed off numeric ids from its static js/products.js dataset.
   ========================================================================== */

(function (global) {
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
    var header = document.querySelector("[data-site-header]");
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
    var drawer = document.querySelector("[data-mobile-drawer]");
    var backdrop = document.querySelector("[data-drawer-backdrop]");
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
     Filter drawer (collection page, mobile) — see sections/main-collection.liquid
  --------------------------------------------------------------------- */
  function initFilterDrawer() {
    var openBtn = document.querySelector("[data-filter-drawer-open]");
    var closeBtn = document.querySelector("[data-filter-drawer-close]");
    var aside = document.querySelector("[data-filters-aside]");
    var backdrop = document.querySelector("[data-filter-drawer-backdrop]");
    if (!openBtn || !aside) return;
    function open() {
      aside.classList.add("is-drawer-open");
      if (backdrop) backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      aside.classList.remove("is-drawer-open");
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
     Toast notification system — window.Velora.toast.show(msg, type)
  --------------------------------------------------------------------- */
  function initToasts() {
    var stack = document.querySelector("[data-toast-stack]");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("data-toast-stack", "");
      stack.setAttribute("role", "status");
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }

    var icons = {
      success: "check-circle",
      error: "alert-circle",
      info: "info-circle"
    };
    var svgs = {
      "check-circle": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>',
      "alert-circle": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12" y2="16.01"/></svg>',
      "info-circle": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="7" x2="12" y2="7.01"/></svg>'
    };

    function show(message, type) {
      type = type || "info";
      var toast = document.createElement("div");
      toast.className = "toast toast-" + type;
      toast.innerHTML = (svgs[icons[type]] || svgs["info-circle"]) + "<span>" + message + "</span>";
      stack.appendChild(toast);
      requestAnimationFrame(function () { toast.classList.add("is-visible"); });
      setTimeout(function () {
        toast.classList.remove("is-visible");
        setTimeout(function () { toast.remove(); }, 320);
      }, 3200);
    }

    global.Velora = global.Velora || {};
    global.Velora.toast = { show: show };

    /* Fire a toast for any element rendered with data-toast-on-load="type:message"
       (used by newsletter form success states — see sections/newsletter.liquid
       and sections/footer.liquid). */
    document.querySelectorAll("[data-toast-on-load]").forEach(function (el) {
      var parts = el.getAttribute("data-toast-on-load").split(":");
      var type = parts.shift();
      var msg = parts.join(":");
      if (msg) show(msg, type);
    });
  }

  /* ---------------------------------------------------------------------
     Wishlist — window.Velora.wishlist
  --------------------------------------------------------------------- */
  function initWishlist() {
    var STORAGE_KEY = "velora_wishlist_v1";

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
        el.style.display = n > 0 ? "flex" : "none";
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
      if (global.Velora.toast) {
        global.Velora.toast.show(added ? "Added to wishlist" : "Removed from wishlist", "success");
      }
      if (document.querySelector("[data-wishlist-page]")) renderWishlistPage();
    });

    function wishlistCardHTML(p) {
      var price = formatMoney(p.price);
      return (
        '<article class="product-card" data-product-handle="' + p.handle + '">' +
          '<div class="product-media">' +
            '<a href="' + p.url + '" aria-label="View ' + p.title + '">' +
              '<img class="img-primary" src="' + (p.featured_image || "") + '" alt="' + p.title + '" width="600" height="800" loading="lazy">' +
            "</a>" +
            '<button type="button" class="wishlist-toggle is-active" data-wishlist-toggle data-handle="' + p.handle + '" aria-label="Remove ' + p.title + ' from wishlist" aria-pressed="true">' +
              '<svg viewBox="0 0 24 24" stroke-width="1.6" fill="none" stroke="currentColor"><path d="M12 21s-7.5-4.6-10-9.2C0.3 8.3 2 4.5 5.7 4c2-.3 3.7.7 4.9 2.3C11.8 4.7 13.5 3.7 15.5 4c3.7.5 5.4 4.3 3.7 7.8C20 16.4 12 21 12 21z"/></svg>' +
            "</button>" +
          "</div>" +
          '<div class="product-info">' +
            '<h3 class="product-name"><a href="' + p.url + '">' + p.title + "</a></h3>" +
            '<div class="product-price">' + price + "</div>" +
            '<button type="button" class="btn btn-outline btn-sm btn-block" style="margin-top:12px" data-move-to-cart data-variant-id="' + (p.variants && p.variants[0] ? p.variants[0].id : "") + '">Move to Cart</button>' +
          "</div>" +
        "</article>"
      );
    }

    function renderWishlistPage() {
      var container = document.querySelector("[data-wishlist-grid]");
      var emptyEl = document.querySelector("[data-wishlist-empty]");
      var countEl = document.querySelector("[data-wishlist-page-count]");
      if (!container) return;
      var handles = read();
      if (countEl) countEl.textContent = handles.length;
      if (!handles.length) {
        container.style.display = "none";
        if (emptyEl) emptyEl.style.display = "";
        return;
      }
      Promise.all(handles.map(function (h) {
        return fetch("/products/" + h + ".js").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
      })).then(function (products) {
        products = products.filter(Boolean);
        if (!products.length) {
          container.style.display = "none";
          if (emptyEl) emptyEl.style.display = "";
          return;
        }
        container.style.display = "";
        if (emptyEl) emptyEl.style.display = "none";
        container.innerHTML = products.map(wishlistCardHTML).join("");
      });
    }

    document.body.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-move-to-cart]");
      if (!btn) return;
      var variantId = btn.getAttribute("data-variant-id");
      if (!variantId || !global.Velora.cart) return;
      global.Velora.cart.addItem(variantId, 1).then(function () {
        var card = btn.closest("[data-product-handle]");
        var handle = card && card.getAttribute("data-product-handle");
        if (handle) remove(handle);
        renderWishlistPage();
        if (global.Velora.toast) global.Velora.toast.show("Moved to cart", "success");
      });
    });

    updateBadges();
    syncToggles();
    if (document.querySelector("[data-wishlist-page]")) renderWishlistPage();

    global.Velora = global.Velora || {};
    global.Velora.wishlist = {
      has: has,
      toggle: toggle,
      remove: remove,
      count: count,
      getHandles: read,
      renderPage: renderWishlistPage,
      sync: syncToggles
    };
  }

  /* ---------------------------------------------------------------------
     Money formatting helper (uses window.Velora.moneyFormat from theme.liquid)
  --------------------------------------------------------------------- */
  function formatMoney(cents) {
    var format = (global.Velora && global.Velora.moneyFormat) || "₹{{amount}}";
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
     js/product.js initQuickView(), but sourced from Shopify's real
     /products/{handle}.js endpoint instead of a static dataset.
  --------------------------------------------------------------------- */
  function initQuickView() {
    var backdrop = document.querySelector("[data-quickview-modal]");
    if (!backdrop) return;
    var body = backdrop.querySelector("[data-qv-body]");

    function close() {
      backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
    var closeBtn = backdrop.querySelector("[data-qv-close]");
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    function open(handle) {
      fetch("/products/" + handle + ".js").then(function (r) { return r.json(); }).then(function (p) {
        renderQuickView(p);
        backdrop.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    }

    function renderQuickView(p) {
      var variant = p.variants[0];
      var colorOption = p.options_with_values ? p.options_with_values.find(function (o) { return /colou?r/i.test(o.name); }) : null;
      var sizeOption = p.options_with_values ? p.options_with_values.find(function (o) { return /size/i.test(o.name); }) : null;

      body.innerHTML =
        '<div class="qv-media"><img src="' + (p.featured_image || "") + '" alt="' + p.title + '" width="600" height="800"></div>' +
        '<div class="qv-body">' +
          "<h2>" + p.title + "</h2>" +
          '<div class="product-price" data-qv-price>' + formatMoney(variant.price) + "</div>" +
          '<p class="desc">' + (p.description || "").replace(/<[^>]*>/g, "").slice(0, 220) + "</p>" +
          (colorOption ? '<div class="variant-group"><div class="variant-label">Colour <span class="selected-value" data-qv-color-label>' + colorOption.values[0] + '</span></div><div class="swatch-row" data-qv-colors>' +
            colorOption.values.map(function (v, i) { return '<button type="button" class="swatch-color ' + (i === 0 ? "is-selected" : "") + '" data-color="' + v + '" aria-label="' + v + '"></button>'; }).join("") + "</div></div>" : "") +
          (sizeOption ? '<div class="variant-group"><div class="variant-label">Size <span class="selected-value" data-qv-size-label>' + sizeOption.values[0] + '</span></div><div class="swatch-row" data-qv-sizes>' +
            sizeOption.values.map(function (v, i) { return '<button type="button" class="swatch-size ' + (i === 0 ? "is-selected" : "") + '" data-size="' + v + '">' + v + "</button>"; }).join("") + "</div></div>" : "") +
          '<div class="pdp-actions">' +
            '<div class="qty-stepper" data-qv-qty><button type="button" data-qty-dec>-</button><input type="text" value="1" readonly><button type="button" data-qty-inc>+</button></div>' +
            '<button type="button" class="btn btn-primary" data-qv-add>Add to Cart</button>' +
          "</div>" +
          '<a href="' + p.url + '" class="btn-text">View full product &rarr;</a>' +
        "</div>";

      function currentVariant() {
        var color = colorOption ? body.querySelector("[data-qv-colors] .is-selected").getAttribute("data-color") : null;
        var size = sizeOption ? body.querySelector("[data-qv-sizes] .is-selected").getAttribute("data-size") : null;
        var match = p.variants.find(function (v) {
          var okColor = !color || v.options.indexOf(color) !== -1;
          var okSize = !size || v.options.indexOf(size) !== -1;
          return okColor && okSize;
        });
        return match || variant;
      }

      body.querySelectorAll("[data-qv-colors] button").forEach(function (b) {
        b.addEventListener("click", function () {
          body.querySelectorAll("[data-qv-colors] button").forEach(function (x) { x.classList.remove("is-selected"); });
          b.classList.add("is-selected");
          body.querySelector("[data-qv-color-label]").textContent = b.getAttribute("data-color");
          body.querySelector("[data-qv-price]").textContent = formatMoney(currentVariant().price);
        });
      });
      body.querySelectorAll("[data-qv-sizes] button").forEach(function (b) {
        b.addEventListener("click", function () {
          body.querySelectorAll("[data-qv-sizes] button").forEach(function (x) { x.classList.remove("is-selected"); });
          b.classList.add("is-selected");
          body.querySelector("[data-qv-size-label]").textContent = b.getAttribute("data-size");
          body.querySelector("[data-qv-price]").textContent = formatMoney(currentVariant().price);
        });
      });
      var qtyInput = body.querySelector("[data-qv-qty] input");
      body.querySelector("[data-qv-qty] [data-qty-inc]").addEventListener("click", function () { qtyInput.value = parseInt(qtyInput.value, 10) + 1; });
      body.querySelector("[data-qv-qty] [data-qty-dec]").addEventListener("click", function () { qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1); });

      body.querySelector("[data-qv-add]").addEventListener("click", function () {
        var v = currentVariant();
        var qty = parseInt(qtyInput.value, 10);
        if (global.Velora.cart) {
          global.Velora.cart.addItem(v.id, qty).then(function () {
            if (global.Velora.toast) global.Velora.toast.show(p.title + " added to cart", "success");
            close();
          });
        }
      });
    }

    document.body.addEventListener("click", function (e) {
      var qvBtn = e.target.closest("[data-quickview]");
      if (qvBtn) { e.preventDefault(); open(qvBtn.getAttribute("data-handle")); }
    });

    global.Velora = global.Velora || {};
    global.Velora.quickView = { open: open, close: close };
  }

  /* ---------------------------------------------------------------------
     Quick add — first available variant, straight to cart (AJAX)
  --------------------------------------------------------------------- */
  function initQuickAdd() {
    document.body.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-quickadd]");
      if (!btn || !global.Velora.cart) return;
      e.preventDefault();
      var variantId = btn.getAttribute("data-variant-id");
      if (!variantId) return;
      global.Velora.cart.addItem(variantId, 1).then(function () {
        if (global.Velora.toast) global.Velora.toast.show("Added to cart", "success");
      }).catch(function () {
        if (global.Velora.toast) global.Velora.toast.show("Couldn't add that item — it may be sold out.", "error");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initToasts();
    initAnnouncementBar();
    initHeaderShrink();
    initMobileDrawer();
    initFilterDrawer();
    initScrollReveal();
    initWishlist();
    initQuickView();
    initQuickAdd();
  });

  global.Velora = global.Velora || {};
  global.Velora.formatMoney = formatMoney;
})(window);
