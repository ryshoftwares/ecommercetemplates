/* ==========================================================================
   ARDEA — js/app.js
   Global chrome: sticky header, announcement rotation, mega-menu, mobile
   drawer, cart/wishlist drawer open/close, quick view modal, toasts,
   scroll-reveal, newsletter, promo countdown.
   ========================================================================== */

(function (global) {
  "use strict";

  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  var ICONS = {
    success: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 6"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v5"/></svg>',
    error: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.01"/></svg>'
  };
  function showToast(message, type) {
    type = type || "success";
    var region = ensureToastRegion();
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = (ICONS[type] || ICONS.success) + "<span>" + message + "</span>";
    region.appendChild(el);
    var timer = setTimeout(function () { remove(); }, 3200);
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
  function openWishlistDrawer() {
    var el = document.querySelector("[data-wishlist-drawer]");
    if (el) openPanel(el);
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-cart-open]");
    if (opener) { e.preventDefault(); openCartDrawer(); }

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
      var filters = document.querySelector(".filters");
      if (filters) openPanel(filters);
    }

    var accountBtn = e.target.closest("[data-account-trigger]");
    if (accountBtn) {
      e.preventDefault();
      showToast("Account sign-in is not part of this static demo.", "info");
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllPanels();
      var hamburger = document.querySelector("[data-mobile-nav-open]");
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    }
  });

  global.ArdeaApp = { openCartDrawer: openCartDrawer, openWishlistDrawer: openWishlistDrawer, closeAllPanels: closeAllPanels, showToast: showToast };

  /* ---------------------------------------------------------------------
     Sticky header
     --------------------------------------------------------------------- */
  function initStickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var lastState = false;
    function onScroll() {
      var stuck = window.scrollY > 8;
      if (stuck !== lastState) {
        header.classList.toggle("is-stuck", stuck);
        lastState = stuck;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     Announcement bar rotation
     --------------------------------------------------------------------- */
  function initAnnouncementRotation() {
    var msgs = document.querySelectorAll(".topbar__msg");
    if (msgs.length < 2) return;
    var index = 0;
    if (prefersReducedMotion) return;
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
    var items = document.querySelectorAll(".main-nav__item[data-has-mega]");
    items.forEach(function (item) {
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
          if (e.key === "Enter" || e.key === " ") {
            if (!item.classList.contains("is-open")) { e.preventDefault(); open(); }
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
     Filter drawer close buttons (mobile) — closing handled by data-panel-close
     --------------------------------------------------------------------- */
  function initFilterDrawerClose() {
    document.querySelectorAll(".filters__close").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = btn.closest(".filters");
        if (panel) closePanel(panel);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal (IntersectionObserver)
     --------------------------------------------------------------------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
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
     Quick View modal
     --------------------------------------------------------------------- */
  function buildQuickViewMarkup(product) {
    var data = global.ArdeaData;
    var discount = data.discountPercent(product);
    return (
      '<div class="modal__panel" role="dialog" aria-modal="true" aria-label="Quick view: ' + product.name + '">' +
        '<button type="button" class="icon-btn modal__close" data-quick-view-close aria-label="Close quick view">' +
          '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>' +
        "</button>" +
        '<div class="modal__media"><img src="' + product.image + '" alt="' + product.name + '" width="600" height="750"></div>' +
        '<div class="modal__body">' +
          '<p class="product-card__category">' + product.category.replace("-", " ") + "</p>" +
          "<h3>" + product.name + "</h3>" +
          '<div class="product-card__rating" aria-label="Rated ' + product.rating + ' out of 5">' +
            '<span class="stars">' + data.renderStars(product.rating) + "</span>" +
            '<span class="rating-count">(' + product.reviewCount + " reviews)</span>" +
          "</div>" +
          '<div class="modal__price">' +
            '<span class="price-current">' + data.formatINR(product.price) + "</span>" +
            (product.comparePrice ? '<span class="price-compare">' + data.formatINR(product.comparePrice) + "</span>" : "") +
            (discount > 0 ? '<span class="badge badge--sale">-' + discount + "%</span>" : "") +
          "</div>" +
          '<p class="modal__desc">' + product.description + "</p>" +
          (product.colors && product.colors.length ? '<p style="font-size:0.85rem;font-weight:700;margin-bottom:0.4rem;">Finish: <span style="font-weight:400;color:var(--color-text-muted);">' + product.colors[0] + "</span></p>" : "") +
          '<p style="font-size:0.85rem;color:var(--color-text-muted);">' + product.dimensions + "</p>" +
          '<div class="modal__actions">' +
            '<button type="button" class="btn btn--primary" data-quick-view-add data-product-id="' + product.id + '">Add to Cart</button>' +
            '<button type="button" class="icon-btn product-card__wishlist" data-wishlist-toggle data-product-id="' + product.id + '" aria-label="Add to wishlist"><svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-10-9.6C.4 7.6 2 4 5.6 4c2 0 3.6 1.2 4.4 2.6C10.8 5.2 12.4 4 14.4 4 18 4 19.6 7.6 18 10.9c-2.5 5-10 9.6-10 9.6z"/></svg></button>' +
          "</div>" +
          '<a class="modal__link" href="product.html?slug=' + product.slug + '">View full details →</a>' +
        "</div>" +
      "</div>"
    );
  }

  function initQuickView() {
    var modal = document.querySelector("[data-quick-view-modal]");
    if (!modal) return;
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-quick-view]");
      if (trigger) {
        var id = Number(trigger.getAttribute("data-product-id"));
        var product = global.ArdeaData.getAllProducts().find(function (p) { return p.id === id; });
        if (!product) return;
        modal.innerHTML = buildQuickViewMarkup(product);
        modal.classList.add("is-open");
        document.body.classList.add("no-scroll");
        if (global.ArdeaWishlist) global.ArdeaWishlist.syncButtonsUI();
      }
      if (e.target.closest("[data-quick-view-close]") || (e.target === modal)) {
        modal.classList.remove("is-open");
        document.body.classList.remove("no-scroll");
      }
      var quickAddBtn = e.target.closest("[data-quick-view-add]");
      if (quickAddBtn) {
        var pid = Number(quickAddBtn.getAttribute("data-product-id"));
        var p = global.ArdeaData.getAllProducts().find(function (x) { return x.id === pid; });
        if (global.ArdeaCart) global.ArdeaCart.addToCart(pid, 1, p && p.colors ? p.colors[0] : null);
        showToast((p ? p.name : "Item") + " added to cart", "success");
        modal.classList.remove("is-open");
        document.body.classList.remove("no-scroll");
        openCartDrawer();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        modal.classList.remove("is-open");
        document.body.classList.remove("no-scroll");
      }
    });
  }

  /* ---------------------------------------------------------------------
     Newsletter (demo only — no backend)
     --------------------------------------------------------------------- */
  function initNewsletter() {
    document.querySelectorAll("[data-newsletter-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input[type='email']");
        if (input && input.value) {
          showToast("Thanks — you're on the list.", "success");
          form.reset();
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Promo countdown (decorative demo countdown to a fixed future date)
     --------------------------------------------------------------------- */
  function initPromoCountdown() {
    var el = document.querySelector("[data-promo-countdown]");
    if (!el) return;
    var target = new Date();
    target.setDate(target.getDate() + 5);
    target.setHours(23, 59, 59, 0);
    function render() {
      var diff = Math.max(0, target - new Date());
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      el.innerHTML =
        "<div><strong>" + d + "</strong><span>Days</span></div>" +
        "<div><strong>" + h + "</strong><span>Hours</span></div>" +
        "<div><strong>" + m + "</strong><span>Mins</span></div>";
    }
    render();
    setInterval(render, 60000);
  }

  /* ---------------------------------------------------------------------
     Homepage: Shop by Room / Best Sellers / New Arrivals / Reviews render
     --------------------------------------------------------------------- */
  function initHomeGrids() {
    var data = global.ArdeaData;
    if (!data) return;

    var roomGrid = document.querySelector("[data-room-grid]");
    if (roomGrid) {
      roomGrid.innerHTML = data.ROOMS.map(function (room) {
        return (
          '<a class="room-card" href="category.html?room=' + room.slug + '">' +
            '<img class="room-card__img" src="' + room.image + '" alt="' + room.tagline + '" loading="lazy" width="800" height="600">' +
            '<div class="room-card__overlay">' +
              "<h3>" + room.label + "</h3>" +
              "<p>" + room.tagline + "</p>" +
              '<span class="room-card__cta">Shop ' + room.label + "</span>" +
            "</div>" +
          "</a>"
        );
      }).join("");
    }

    var newArrivals = document.querySelector("[data-new-arrivals]");
    if (newArrivals) {
      var arrivals = data.getAllProducts().filter(function (p) { return p.badge === "New"; }).slice(0, 4);
      newArrivals.innerHTML = arrivals.map(function (p) { return data.productCardHTML(p); }).join("");
    }

    var bestSellers = document.querySelector("[data-best-sellers]");
    if (bestSellers) {
      var sellers = data.getAllProducts().filter(function (p) { return p.badge === "Bestseller"; })
        .concat(data.getAllProducts().sort(function (a, b) { return b.reviewCount - a.reviewCount; }))
        .filter(function (p, i, arr) { return arr.findIndex(function (x) { return x.id === p.id; }) === i; })
        .slice(0, 4);
      bestSellers.innerHTML = sellers.map(function (p) { return data.productCardHTML(p); }).join("");
    }

    var reviewGrid = document.querySelector("[data-review-grid]");
    if (reviewGrid) {
      reviewGrid.innerHTML = data.REVIEWS.slice(0, 6).map(function (r) {
        return (
          '<div class="review-card" data-reveal>' +
            '<div class="review-card__stars stars">' + data.renderStars(r.rating) + "</div>" +
            '<h4 class="review-card__title">' + r.title + "</h4>" +
            '<p class="review-card__body">' + r.body + "</p>" +
            '<div class="review-card__meta"><strong>' + r.name + "</strong><span>" + r.location + "</span></div>" +
            '<p class="review-card__product" style="margin-top:0.5rem;font-size:0.8rem;">On ' + r.product + "</p>" +
          "</div>"
        );
      }).join("");
    }
  }

  /* ---------------------------------------------------------------------
     Recently viewed tracking (any page with a product)
     --------------------------------------------------------------------- */
  function trackRecentlyViewed(productId) {
    try {
      var list = JSON.parse(localStorage.getItem("ardea_recently_viewed") || "[]");
      list = list.filter(function (id) { return id !== productId; });
      list.unshift(productId);
      list = list.slice(0, 8);
      localStorage.setItem("ardea_recently_viewed", JSON.stringify(list));
    } catch (e) {}
  }
  global.ArdeaApp.trackRecentlyViewed = trackRecentlyViewed;

  /* ---------------------------------------------------------------------
     Init
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initStickyHeader();
    initAnnouncementRotation();
    initMegaMenu();
    initMobileDrawer();
    initFilterDrawerClose();
    initScrollReveal();
    initQuickView();
    initNewsletter();
    initPromoCountdown();
    initHomeGrids();
  });
})(window);
