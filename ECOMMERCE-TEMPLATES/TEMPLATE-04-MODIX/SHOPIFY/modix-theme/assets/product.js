/* ==========================================================================
   MODIX — assets/product.js
   Product Detail Page behavior: variant/color selection (updates the
   hidden variant id input + price + stock text from the real
   product JSON embedded by snippets/product-form.liquid), gallery + zoom
   (ported from the demo's js/product.js click-to-zoom with transform-origin
   at the cursor position), tab switching, qty stepper, native dynamic
   checkout "Buy Now" trigger, and Recently Viewed (localStorage of product
   handles, rendered from Shopify's real /products/{handle}.js JSON — never
   hardcoded).
   Loaded only on the product template (see layout/theme.liquid).
   ========================================================================== */

(function (global) {
  "use strict";

  var RECENT_KEY = "modix_recently_viewed";

  /* ------------------------------------------------------------------
     Gallery + zoom
     ------------------------------------------------------------------ */
  function initGallery() {
    var mainWrap = document.querySelector("[data-gallery-main]");
    var thumbsWrap = document.querySelector("[data-gallery-thumbs]");
    if (!mainWrap) return;

    thumbsWrap && thumbsWrap.querySelectorAll("[data-thumb-index]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var img = mainWrap.querySelector("img");
        if (img) {
          img.src = btn.getAttribute("data-full-src");
          img.alt = btn.querySelector("img") ? btn.querySelector("img").alt : img.alt;
        }
        thumbsWrap.querySelectorAll(".pdp-gallery__thumb").forEach(function (t) { t.classList.remove("is-active"); });
        btn.classList.add("is-active");
      });
    });

    mainWrap.addEventListener("click", function (e) {
      var isZoomed = mainWrap.classList.toggle("is-zoomed");
      var img = mainWrap.querySelector("img");
      if (!img) return;
      if (isZoomed) {
        var rect = mainWrap.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        img.style.transformOrigin = x + "% " + y + "%";
      } else {
        img.style.transformOrigin = "center";
      }
    });
  }

  /* ------------------------------------------------------------------
     Variant / color / storage-size selection
     ------------------------------------------------------------------ */
  function initVariantPicker() {
    var form = document.querySelector("[data-product-form-el]");
    var jsonEl = document.querySelector("[data-product-json]");
    if (!form || !jsonEl) return;
    var product;
    try { product = JSON.parse(jsonEl.textContent); } catch (e) { return; }

    var optionGroups = form.querySelectorAll(".option-group");
    var selections = product.options.map(function (_, i) {
      var group = optionGroups[i];
      var active = group ? group.querySelector(".is-active[data-option-value]") : null;
      return active ? active.getAttribute("data-value") : null;
    });

    function findVariant() {
      return product.variants.filter(function (v) {
        return v.options.every(function (opt, i) { return opt === selections[i]; });
      })[0];
    }

    function updateUI(variant) {
      var idInput = form.querySelector("[data-variant-id-input]");
      if (idInput && variant) idInput.value = variant.id;

      var addBtn = form.querySelector("[data-pdp-add]");
      var addText = form.querySelector("[data-add-text]");
      var buyBtn = document.querySelector("[data-pdp-buy-now]");
      if (variant) {
        var available = variant.available;
        if (addBtn) addBtn.disabled = !available;
        if (addText) addText.textContent = available ? "Add to Cart" : "Sold Out";
        if (buyBtn) buyBtn.style.display = available ? "" : "none";

        var priceEl = document.querySelector(".pdp-info__price .price--lg");
        var compareEl = document.querySelector(".pdp-info__price .price--compare");
        var discountEl = document.querySelector(".pdp-info__price .price--discount");
        if (priceEl && global.ModixCart) priceEl.textContent = global.ModixCart.formatMoney(variant.price);
        if (variant.compare_at_price > variant.price) {
          if (compareEl && global.ModixCart) { compareEl.style.display = ""; compareEl.textContent = global.ModixCart.formatMoney(variant.compare_at_price); }
          if (discountEl) discountEl.textContent = "Save " + Math.round(((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100) + "%";
        } else {
          if (compareEl) compareEl.style.display = "none";
          if (discountEl) discountEl.textContent = "";
        }

        var stockEl = document.querySelector(".pdp-stock");
        if (stockEl) {
          if (available) {
            stockEl.classList.remove("is-low");
            stockEl.innerHTML = '<span class="dot"></span> In Stock — ships in 1-2 business days';
          } else {
            stockEl.classList.add("is-low");
            stockEl.innerHTML = '<span class="dot"></span> Currently out of stock';
          }
        }
      } else {
        if (addBtn) addBtn.disabled = true;
        if (addText) addText.textContent = "Unavailable";
      }
    }

    optionGroups.forEach(function (group, index) {
      group.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-option-value]");
        if (!btn) return;
        group.querySelectorAll("[data-option-value]").forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        selections[index] = btn.getAttribute("data-value");
        var selectedLabel = group.querySelector("[data-option-selected-value]");
        if (selectedLabel) selectedLabel.textContent = selections[index];
        updateUI(findVariant());
      });
    });

    /* Qty stepper */
    var qtyStepper = form.querySelector("[data-pdp-qty]");
    if (qtyStepper) {
      var input = qtyStepper.querySelector("[data-qty-input]");
      qtyStepper.querySelectorAll("[data-qty-dec]").forEach(function (btn) {
        btn.addEventListener("click", function () { input.value = Math.max(1, Number(input.value) - 1); });
      });
      qtyStepper.querySelectorAll("[data-qty-inc]").forEach(function (btn) {
        btn.addEventListener("click", function () { input.value = Number(input.value) + 1; });
      });
    }

    /* Buy Now — trigger Shopify's native dynamic checkout button rendered
       (hidden) by {{ form | payment_button }} in snippets/product-form.liquid,
       after first submitting the Add to Cart form via AJAX so quantity/variant
       are respected exactly like the visible Add to Cart flow. */
    var buyNowBtn = document.querySelector("[data-pdp-buy-now]");
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", function () {
        var idInput = form.querySelector("[data-variant-id-input]");
        var qtyInput = form.querySelector("[data-qty-input]");
        if (global.ModixCart && idInput) {
          global.ModixCart.addToCart(idInput.value, Number(qtyInput ? qtyInput.value : 1)).then(function () {
            global.location.href = "/cart/checkout";
          });
        }
      });
    }

    /* Add to cart via AJAX so the drawer opens with a toast, matching the
       rest of the theme, instead of a full navigation to /cart/add. */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var idInput = form.querySelector("[data-variant-id-input]");
      var qtyInput = form.querySelector("[data-qty-input]");
      if (global.ModixCart && idInput) {
        global.ModixCart.addToCart(idInput.value, Number(qtyInput ? qtyInput.value : 1)).then(function () {
          if (global.Modix && global.Modix.openCartDrawer) global.Modix.openCartDrawer();
        }).catch(function () {});
      }
    });
  }

  /* ------------------------------------------------------------------
     Tabs: Overview / Key Features / Specifications / Box / Warranty / Shipping
     ------------------------------------------------------------------ */
  function initTabs() {
    var tabButtons = document.querySelectorAll(".tabs-nav button");
    var tabPanels = document.querySelectorAll(".tab-panel");
    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabButtons.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
        tabPanels.forEach(function (p) { p.classList.remove("is-active"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (panel) panel.classList.add("is-active");
      });
    });
  }

  /* ------------------------------------------------------------------
     Recently viewed — track this product, render others from real
     Shopify product JSON (never hardcoded).
     ------------------------------------------------------------------ */
  function readRecentlyViewed() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch (e) { return []; }
  }
  function trackRecentlyViewed(handle) {
    var list = readRecentlyViewed().filter(function (h) { return h !== handle; });
    list.unshift(handle);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  }

  function money(cents) {
    if (global.ModixCart) return global.ModixCart.formatMoney(cents);
    return "₹" + (cents / 100).toFixed(0);
  }

  function recentCardHTML(product) {
    var variant = product.variants[0];
    var img = product.featured_image || (product.images && product.images[0]) || "";
    return (
      '<article class="product-card">' +
        '<div class="product-card__media">' +
          '<a href="/products/' + product.handle + '" aria-label="View ' + product.title + '">' +
            (img ? '<img class="img-primary" src="' + img + '" alt="' + product.title + '" width="400" height="400" loading="lazy">' : "") +
          "</a>" +
        "</div>" +
        '<div class="product-card__body">' +
          '<span class="product-card__category">' + (product.type || "") + "</span>" +
          '<h3 class="product-card__name"><a href="/products/' + product.handle + '">' + product.title + "</a></h3>" +
          '<div class="price-row"><span class="price">' + money(variant.price) + "</span></div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderRecentlyViewed(currentHandle) {
    var wrap = document.querySelector("[data-recently-viewed]");
    var grid = document.querySelector("[data-recently-viewed-grid]");
    if (!wrap || !grid) return;
    var handles = readRecentlyViewed().filter(function (h) { return h !== currentHandle; }).slice(0, 4);
    if (!handles.length) { wrap.style.display = "none"; return; }
    Promise.all(handles.map(function (h) { return fetch("/products/" + h + ".js").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }))
      .then(function (products) {
        products = products.filter(Boolean);
        if (!products.length) { wrap.style.display = "none"; return; }
        wrap.style.display = "";
        grid.innerHTML = products.map(recentCardHTML).join("");
      });
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.querySelector("[data-pdp]");
    if (!root) return;
    initGallery();
    initVariantPicker();
    initTabs();

    var jsonEl = document.querySelector("[data-product-json]");
    var currentHandle = null;
    if (jsonEl) {
      try { currentHandle = JSON.parse(jsonEl.textContent).handle; } catch (e) {}
    }
    if (currentHandle) {
      trackRecentlyViewed(currentHandle);
      renderRecentlyViewed(currentHandle);
    }
  });
})(window);
