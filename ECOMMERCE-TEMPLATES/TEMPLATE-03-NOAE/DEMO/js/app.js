/* =========================================================================
   NOAÉ — App glue: header, drawers, announcement rotation, toasts,
   scroll-reveal, quick view modal, quick-add / wishlist delegation.
   ========================================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------- Sticky header ---------------------- */
  function initStickyHeader() {
    var header = document.querySelector(".noae-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------- Announcement bar rotation ---------------------- */
  function initAnnouncement() {
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

  /* ---------------------- Generic drawer/overlay helpers ---------------------- */
  function openDrawer(drawer, overlay) {
    if (overlay) overlay.classList.add("is-open");
    if (drawer) drawer.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer(drawer, overlay) {
    if (overlay) overlay.classList.remove("is-open");
    if (drawer) drawer.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function initMobileNav() {
    var hamburger = document.querySelector(".noae-hamburger");
    var drawer = document.getElementById("mobileNavDrawer");
    var overlay = document.getElementById("navOverlay");
    var closeBtn = document.getElementById("mobileNavClose");
    if (!hamburger || !drawer) return;
    hamburger.addEventListener("click", function () { openDrawer(drawer, overlay); });
    if (closeBtn) closeBtn.addEventListener("click", function () { closeDrawer(drawer, overlay); });
    if (overlay) overlay.addEventListener("click", function () { closeDrawer(drawer, overlay); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer(drawer, overlay);
    });
  }

  function initCartDrawer() {
    var drawer = document.getElementById("cartDrawer");
    var overlay = document.getElementById("cartOverlay");
    var closeBtn = document.getElementById("cartDrawerClose");
    var triggers = document.querySelectorAll(".js-cart-open");
    triggers.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        openDrawer(drawer, overlay);
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", function () { closeDrawer(drawer, overlay); });
    if (overlay) overlay.addEventListener("click", function () { closeDrawer(drawer, overlay); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer(drawer, overlay);
    });
  }

  window.NoaeUI = { openDrawer: openDrawer, closeDrawer: closeDrawer };

  /* ---------------------- Toasts ---------------------- */
  function ensureToastRegion() {
    var region = document.getElementById("toastRegion");
    if (!region) {
      region = document.createElement("div");
      region.id = "toastRegion";
      region.className = "noae-toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    return region;
  }

  function showToast(message, type) {
    var region = ensureToastRegion();
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

  window.NoaeToast = { show: showToast };

  /* ---------------------- Scroll reveal ---------------------- */
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

  /* ---------------------- Quick View Modal ---------------------- */
  function buildQuickViewMarkup(product) {
    var products = window.NoaeProducts;
    return (
      '<button class="noae-modal__close" type="button" id="quickViewClose" aria-label="Close quick view">✕</button>' +
      '<div class="noae-modal__grid">' +
        '<div class="noae-modal__media"><img src="' + product.image + '" alt="' + product.name + ' — ' + product.category + '" width="500" height="600"></div>' +
        '<div>' +
          '<p class="noae-pdp__category">' + product.category + '</p>' +
          '<h2 class="noae-pdp__title">' + product.name + '</h2>' +
          '<div class="noae-pdp__rating">' + products.renderStars(product.rating) + '<span>(' + product.reviewCount + ' reviews)</span></div>' +
          '<div class="noae-pdp__price-row"><span class="noae-price">' + products.formatPrice(product.price) + '</span>' + (product.comparePrice ? '<span class="noae-price noae-price--compare">' + products.formatPrice(product.comparePrice) + '</span>' : '') + '</div>' +
          '<p class="noae-pdp__desc">' + product.description + '</p>' +
          '<a href="product.html?slug=' + product.slug + '" class="noae-btn noae-btn--dark noae-btn--full">View Full Details</a>' +
          '<button class="noae-btn noae-btn--outline noae-btn--full noae-mt-6 js-quickview-add" data-product-id="' + product.id + '" style="margin-top:12px;">Quick Add to Bag</button>' +
        '</div>' +
      '</div>'
    );
  }

  function ensureQuickViewOverlay() {
    var overlay = document.getElementById("quickViewOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "quickViewOverlay";
      overlay.className = "noae-modal-overlay";
      overlay.innerHTML = '<div class="noae-modal" id="quickViewModal"></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeQuickView();
      });
    }
    return overlay;
  }

  function openQuickView(productId) {
    if (!window.NoaeProducts) return;
    var product = window.NoaeProducts.getProductById(productId);
    if (!product) return;
    var overlay = ensureQuickViewOverlay();
    var modal = document.getElementById("quickViewModal");
    modal.innerHTML = buildQuickViewMarkup(product);
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    document.getElementById("quickViewClose").addEventListener("click", closeQuickView);
    var addBtn = modal.querySelector(".js-quickview-add");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        window.NoaeCart.addItem(product.id, product.variants[0].size, 1);
        window.NoaeToast.show(product.name + " added to your bag", "success");
        closeQuickView();
      });
    }
  }

  function closeQuickView() {
    var overlay = document.getElementById("quickViewOverlay");
    if (overlay) overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ---------------------- Global delegated actions ---------------------- */
  function initGlobalDelegation() {
    document.body.addEventListener("click", function (e) {
      var wishlistBtn = e.target.closest(".noae-wishlist-toggle");
      if (wishlistBtn) {
        var id = wishlistBtn.dataset.productId;
        var nowActive = window.NoaeWishlist.toggle(id);
        var product = window.NoaeProducts.getProductById(id);
        window.NoaeToast.show(
          nowActive ? (product ? product.name + " added to wishlist" : "Added to wishlist") : "Removed from wishlist",
          nowActive ? "success" : "default"
        );
        return;
      }
      var quickAddBtn = e.target.closest(".noae-quick-add");
      if (quickAddBtn) {
        var qid = quickAddBtn.dataset.productId;
        var qproduct = window.NoaeProducts.getProductById(qid);
        if (qproduct) {
          window.NoaeCart.addItem(qid, qproduct.variants[0].size, 1);
          window.NoaeToast.show(qproduct.name + " added to your bag", "success");
        }
        return;
      }
      var quickViewBtn = e.target.closest(".noae-btn--quickview");
      if (quickViewBtn) {
        openQuickView(quickViewBtn.dataset.productId);
        return;
      }
      var accountBtn = e.target.closest(".js-account-btn");
      if (accountBtn) {
        e.preventDefault();
        window.NoaeToast.show("Account sign-in is coming soon in the full build.", "default");
        return;
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeQuickView();
    });
  }

  /* ---------------------- Newsletter form (visual demo) ---------------------- */
  function initNewsletterForms() {
    document.querySelectorAll(".js-newsletter-form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        window.NoaeToast.show("Welcome to the ritual — check your inbox for 10% off.", "success");
        form.reset();
      });
    });
  }

  /* ---------------------- Set current year, active nav ---------------------- */
  function initMisc() {
    document.querySelectorAll(".js-current-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initStickyHeader();
    initAnnouncement();
    initMobileNav();
    initCartDrawer();
    initScrollReveal();
    initGlobalDelegation();
    initNewsletterForms();
    initMisc();
  });
})();
