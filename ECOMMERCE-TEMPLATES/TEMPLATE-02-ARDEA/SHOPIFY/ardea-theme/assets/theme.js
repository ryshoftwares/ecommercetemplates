/* ==========================================================================
   ARDEA — assets/theme.js
   Global chrome, ported from the demo's js/app.js: sticky header,
   announcement rotation, mega-menu, mobile drawer, generic panel
   open/close (cart drawer / filter drawer / mobile drawer), quick view
   modal (Shopify's native /products/{handle}.js JSON endpoint), toasts,
   scroll-reveal (IntersectionObserver, prefers-reduced-motion aware),
   collection filter form UX, and the wishlist localStorage helpers that
   snippets/product-card.liquid, snippets/product-form.liquid and
   sections/header.liquid all key off of.

   GLOBAL NAMESPACE: exposes window.ArdeaToast, window.ArdeaApp and
   window.ArdeaWishlist (matching config/settings_schema.json's Wishlist
   info text), and mirrors the wishlist API at window.Ardea.wishlist
   (matching the comment in sections/header.liquid) so either reference
   resolves to the same object.

   WISHLIST STORAGE: localStorage key "ardea_wishlist_v1", an array of
   product handles (not numeric IDs — Shopify product URLs and the native
   /products/{handle}.js JSON endpoint are handle-keyed, so every other
   asset file that needs real product data can fetch it directly from that
   handle with no extra ID-to-handle lookup table).
   ========================================================================== */

(function (global) {
  "use strict";

  var prefersReducedMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Toasts
     --------------------------------------------------------------------- */
  var toastRegion;
  function ensureToastRegion() {
    if (toastRegion) return toastRegion;
    toastRegion = document.createElement("div");
    toastRegion.className = "toast-region";
    toastRegion.setAttribute("role", "status");
    toastRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(toastRegion);
    return toastRegion;
  }
  var TOAST_ICONS = {
    success: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 6"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v5"/></svg>',
    error: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.01"/></svg>'
  };
  function showToast(message, type) {
    type = type || "success";
    var region = ensureToastRegion();
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = (TOAST_ICONS[type] || TOAST_ICONS.success) + "<span>" + message + "</span>";
    region.appendChild(el);
    var timer = setTimeout(remove, 3200);
    function remove() {
      clearTimeout(timer);
      el.classList.add("is-leaving");
      setTimeout(function () { el.remove(); }, 200);
    }
  }
  global.ArdeaToast = { show: showToast };

  /* ---------------------------------------------------------------------
     Scrim + generic panel open/close
     --------------------------------------------------------------------- */
  var scrim;
  function ensureScrim() {
    if (scrim) return scrim;
    scrim = document.querySelector("[data-scrim]");
    if (!scrim) {
      scrim = document.createElement("div");
      scrim.className = "scrim";
      scrim.setAttribute("data-scrim", "");
      document.body.appendChild(scrim);
    }
    scrim.addEventListener("click", closeAllPanels);
    return scrim;
  }

  function openPanel(panel) {
    ensureScrim().classList.add("is-visible");
    panel.classList.add("is-open");
    document.body.classList.add("no-scroll");
  }
  function closePanel(panel) {
    panel.classList.remove("is-open");
    if (!document.querySelector(".mobile-drawer.is-open, .side-drawer.is-open, .filters.is-open")) {
      if (scrim) scrim.classList.remove("is-visible");
      document.body.classList.remove("no-scroll");
    }
  }
  function closeAllPanels() {
    document.querySelectorAll(".mobile-drawer.is-open, .side-drawer.is-open, .filters.is-open").forEach(function (p) {
      p.classList.remove("is-open");
    });
    if (scrim) scrim.classList.remove("is-visible");
    document.body.classList.remove("no-scroll");
  }
  function openCartDrawer() {
    var el = document.querySelector("[data-cart-drawer]");
    if (el) openPanel(el);
  }

  document.addEventListener("click", function (e) {
    var cartOpener = e.target.closest("[data-cart-open]");
    if (cartOpener) { e.preventDefault(); openCartDrawer(); }

    var closer = e.target.closest("[data-panel-close]");
    if (closer) {
      var panel = closer.closest(".mobile-drawer, .side-drawer, .filters");
      if (panel) closePanel(panel);
    }

    var mobileNavOpener = e.target.closest("[data-mobile-nav-open]");
    if (mobileNavOpener) {
      e.preventDefault();
      var drawer = document.querySelector("[data-mobile-drawer]");
      if (drawer) {
        openPanel(drawer);
        mobileNavOpener.setAttribute("aria-expanded", "true");
      }
    }

    var filterOpener = e.target.closest("[data-filter-drawer-open]");
    if (filterOpener) {
      e.preventDefault();
      var filters = document.querySelector("[data-filters]");
      if (filters) openPanel(filters);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllPanels();
      var hamburger = document.querySelector("[data-mobile-nav-open]");
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    }
  });

  global.ArdeaApp = {
    openCartDrawer: openCartDrawer,
    closeAllPanels: closeAllPanels,
    openPanel: openPanel,
    closePanel: closePanel,
    showToast: showToast
  };

  /* ---------------------------------------------------------------------
     Sticky header
     --------------------------------------------------------------------- */
  function initStickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var lastState = false;
    function onScroll() {
      var stuck = global.scrollY > 8;
      if (stuck !== lastState) {
        header.classList.toggle("is-stuck", stuck);
        lastState = stuck;
      }
    }
    global.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     Announcement bar rotation
     --------------------------------------------------------------------- */
  function initAnnouncementRotation() {
    var msgs = document.querySelectorAll(".topbar__msg");
    if (msgs.length < 2 || prefersReducedMotion) return;
    var index = 0;
    setInterval(function () {
      msgs[index].classList.remove("is-active");
      index = (index + 1) % msgs.length;
      msgs[index].classList.add("is-active");
    }, 4200);
  }

  /* ---------------------------------------------------------------------
     Mega menu (desktop hover + keyboard)
     --------------------------------------------------------------------- */
  function initMegaMenu() {
    document.querySelectorAll(".main-nav__item[data-has-mega]").forEach(function (item) {
      var closeTimer;
      function open() { clearTimeout(closeTimer); item.classList.add("is-open"); }
      function close() { closeTimer = setTimeout(function () { item.classList.remove("is-open"); }, 140); }
      item.addEventListener("mouseenter", open);
      item.addEventListener("mouseleave", close);
      item.addEventListener("focusin", open);
      item.addEventListener("focusout", function (e) {
        if (!item.contains(e.relatedTarget)) close();
      });
      var link = item.querySelector(".main-nav__link");
      if (link) {
        link.addEventListener("keydown", function (e) {
          if ((e.key === "Enter" || e.key === " ") && !item.classList.contains("is-open")) {
            e.preventDefault(); open();
          }
        });
      }
    });
  }

  /* ---------------------------------------------------------------------
     Mobile hamburger drawer
     --------------------------------------------------------------------- */
  function initMobileDrawer() {
    var hamburger = document.querySelector(".hamburger");
    var drawer = document.querySelector("[data-mobile-drawer]");
    if (!hamburger || !drawer) return;
    hamburger.addEventListener("click", function () {
      var expanded = hamburger.getAttribute("aria-expanded") === "true";
      if (expanded) { closePanel(drawer); hamburger.setAttribute("aria-expanded", "false"); }
      else { openPanel(drawer); hamburger.setAttribute("aria-expanded", "true"); }
    });
    drawer.querySelectorAll(".mobile-nav__toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var item = toggle.closest(".mobile-nav__item");
        var wasOpen = item.classList.contains("is-open");
        drawer.querySelectorAll(".mobile-nav__item.is-open").forEach(function (i) { i.classList.remove("is-open"); });
        if (!wasOpen) item.classList.add("is-open");
      });
    });
  }

  /* ---------------------------------------------------------------------
     Filter drawer (sections/main-collection.liquid): close button,
     collapsible groups, swatch aria-pressed toggle, auto-submit.
     --------------------------------------------------------------------- */
  function initCollectionFilters() {
    document.querySelectorAll(".filters__close").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = btn.closest(".filters");
        if (panel) closePanel(panel);
      });
    });

    document.querySelectorAll("[data-filter-group-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.closest("[data-filter-group]");
        if (group) group.classList.toggle("is-collapsed");
      });
    });

    var form = document.querySelector("[data-collection-filter-form]");
    if (!form) return;

    form.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(function (input) {
      input.addEventListener("change", function () { form.requestSubmit ? form.requestSubmit() : form.submit(); });
    });
    form.querySelectorAll('input[type="number"]').forEach(function (input) {
      input.addEventListener("change", function () { form.requestSubmit ? form.requestSubmit() : form.submit(); });
    });
    form.querySelectorAll("[data-filter-swatch]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pressed = btn.getAttribute("aria-pressed") === "true";
        var params = new URLSearchParams(global.location.search);
        var paramName = btn.getAttribute("data-param-name");
        var value = btn.getAttribute("data-value");
        if (pressed) { params.delete(paramName); }
        else { params.set(paramName, value); }
        global.location.href = form.getAttribute("action") + "?" + params.toString();
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal (IntersectionObserver)
     --------------------------------------------------------------------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in global)) {
      targets.forEach(function (t) { t.classList.add("is-revealed"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ---------------------------------------------------------------------
     Wishlist (localStorage, keyed by product handle)
     --------------------------------------------------------------------- */
  var WISHLIST_KEY = "ardea_wishlist_v1";

  function readWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); } catch (e) { return []; }
  }
  function writeWishlist(list) {
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list)); } catch (e) {}
    updateWishlistCount();
    document.dispatchEvent(new CustomEvent("ardea:wishlist-updated", { detail: { list: list } }));
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
      el.style.display = count > 0 ? "flex" : "none";
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
    var handle = btn.getAttribute("data-handle");
    if (!handle) return;
    var added = toggleWishlist(handle);
    syncWishlistButtonsUI();
    showToast(added ? "Added to wishlist" : "Removed from wishlist", "success");
    document.dispatchEvent(new CustomEvent("ardea:wishlist-toggled", { detail: { handle: handle, added: added } }));
  });

  global.ArdeaWishlist = {
    STORAGE_KEY: WISHLIST_KEY,
    read: readWishlist,
    isSaved: isSaved,
    toggle: toggleWishlist,
    remove: removeFromWishlist,
    syncButtonsUI: syncWishlistButtonsUI,
    updateCount: updateWishlistCount
  };
  global.Ardea = global.Ardea || {};
  global.Ardea.wishlist = global.ArdeaWishlist;

  /* ---------------------------------------------------------------------
     Recently viewed tracking (product handles, any product page)
     --------------------------------------------------------------------- */
  function trackRecentlyViewed(handle) {
    try {
      var list = JSON.parse(localStorage.getItem("ardea_recently_viewed") || "[]");
      list = list.filter(function (h) { return h !== handle; });
      list.unshift(handle);
      list = list.slice(0, 8);
      localStorage.setItem("ardea_recently_viewed", JSON.stringify(list));
    } catch (e) {}
  }
  global.ArdeaApp.trackRecentlyViewed = trackRecentlyViewed;

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
    return (
      '<div class="modal__panel" role="dialog" aria-modal="true" aria-label="Quick view: ' + product.title + '">' +
        '<button type="button" class="icon-btn modal__close" data-quick-view-close aria-label="Close quick view">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg>' +
        "</button>" +
        '<div class="modal__media">' + (img ? '<img src="' + img + '" alt="' + product.title + '">' : "") + "</div>" +
        '<div class="modal__body">' +
          '<p class="product-card__category">' + (product.type || "") + "</p>" +
          "<h3>" + product.title + "</h3>" +
          '<div class="modal__price">' +
            '<span class="price-current">' + money(variant.price) + "</span>" +
            (variant.compare_at_price > variant.price ? '<span class="price-compare">' + money(variant.compare_at_price) + "</span>" : "") +
            (discount > 0 ? '<span class="badge badge--sale">-' + discount + "%</span>" : "") +
          "</div>" +
          '<p class="modal__desc">' + (product.description || "").replace(/<[^>]*>/g, "").slice(0, 200) + "</p>" +
          '<div class="modal__actions">' +
            '<button type="button" class="btn btn--primary" data-quick-view-add data-variant-id="' + variant.id + '">Add to Cart</button>' +
            '<button type="button" class="icon-btn product-card__wishlist" data-wishlist-toggle data-handle="' + product.handle + '" aria-label="Add to wishlist">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20.5s-7.5-4.6-10-9.6C.4 7.6 2 4 5.6 4c2 0 3.6 1.2 4.4 2.6C10.8 5.2 12.4 4 14.4 4 18 4 19.6 7.6 18 10.9c-2.5 5-10 9.6-10 9.6z"/></svg>' +
            "</button>" +
          "</div>" +
          '<a class="modal__link" href="/products/' + product.handle + '">View full details →</a>' +
        "</div>" +
      "</div>"
    );
  }

  function initQuickView() {
    var modal = document.querySelector("[data-quick-view-modal]");
    if (!modal) return;

    function close() {
      modal.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
    }

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-quickview]");
      if (trigger) {
        var handle = trigger.getAttribute("data-handle");
        if (!handle) return;
        fetch("/products/" + handle + ".js")
          .then(function (res) { return res.json(); })
          .then(function (product) {
            modal.innerHTML = buildQuickViewMarkup(product);
            modal.classList.add("is-open");
            document.body.classList.add("no-scroll");
            syncWishlistButtonsUI();
          })
          .catch(function () { showToast("Couldn't load that product right now.", "error"); });
      }
      if (e.target.closest("[data-quick-view-close]") || e.target === modal) close();

      var quickAddBtn = e.target.closest("[data-quick-view-add]");
      if (quickAddBtn && global.ArdeaCart) {
        var variantId = quickAddBtn.getAttribute("data-variant-id");
        global.ArdeaCart.addToCart(variantId, 1).then(function () {
          close();
          openCartDrawer();
        });
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  }

  /* ---------------------------------------------------------------------
     Toast-on-load: server-rendered forms (newsletter, contact) flag a
     success message via a hidden element with data-toast-on-load="type:msg"
     (see sections/footer.liquid's newsletter block and
     sections/main-page.liquid's contact form) — fired once on page load.
     --------------------------------------------------------------------- */
  function initToastOnLoad() {
    document.querySelectorAll("[data-toast-on-load]").forEach(function (el) {
      var raw = el.getAttribute("data-toast-on-load") || "";
      var sep = raw.indexOf(":");
      if (sep === -1) return;
      showToast(raw.slice(sep + 1), raw.slice(0, sep));
    });
  }

  /* ---------------------------------------------------------------------
     Init
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initStickyHeader();
    initAnnouncementRotation();
    initMegaMenu();
    initMobileDrawer();
    initCollectionFilters();
    initScrollReveal();
    initQuickView();
    updateWishlistCount();
    syncWishlistButtonsUI();
    initToastOnLoad();
    document.addEventListener("ardea:wishlist-updated", syncWishlistButtonsUI);
  });
})(window);
