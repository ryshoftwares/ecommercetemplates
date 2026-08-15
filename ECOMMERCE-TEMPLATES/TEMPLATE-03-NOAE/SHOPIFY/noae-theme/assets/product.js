/* ==========================================================================
   NOAÉ (Shopify theme) — Product Detail Page: variant selection, gallery +
   zoom, tabs, FAQ accordion, and recently-viewed (localStorage). Ported from
   the demo's js/product.js, rewired onto the real product JSON emitted by
   snippets/product-form.liquid (data-product-json) instead of a static
   dataset, and onto Shopify's /products/{handle}.js endpoint for recently
   viewed cards.

   Related products and the FAQ/FAQPage JSON-LD block are both rendered
   server-side by sections/main-product.liquid from real Liquid objects and
   need no client-side work here.
   ========================================================================== */

(function (global) {
  "use strict";

  var RECENT_KEY = "noae_recently_viewed_v1";

  function fmt(cents) {
    return (global.Noae && global.Noae.formatMoney) ? global.Noae.formatMoney(cents) : "₹" + Math.round(cents / 100);
  }

  /* ---------------------------------------------------------------------
     Gallery: thumbnail switching + hover-zoom
  --------------------------------------------------------------------- */
  function initGallery() {
    var main = document.querySelector("[data-pdp-main-media]");
    var mainImg = document.getElementById("pdpMainImg");
    var thumbs = document.querySelectorAll("[data-pdp-thumbs] .noae-pdp__thumb");
    if (!main || !mainImg) return;

    thumbs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        mainImg.src = btn.getAttribute("data-src");
        thumbs.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
      });
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    main.addEventListener("mousemove", function (e) {
      var rect = main.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      mainImg.style.transformOrigin = x + "% " + y + "%";
      mainImg.style.transform = "scale(1.5)";
    });
    main.addEventListener("mouseleave", function () {
      mainImg.style.transform = "scale(1)";
    });
  }

  /* ---------------------------------------------------------------------
     Variant selection (Size chips) + qty stepper — updates price, stock
     message, hidden variant id input, and Add to Cart / Buy Now state.
  --------------------------------------------------------------------- */
  function initProductForm() {
    var form = document.querySelector("[data-product-form-el]");
    var jsonEl = document.querySelector("[data-product-json]");
    if (!form || !jsonEl) return;

    var product;
    try { product = JSON.parse(jsonEl.textContent); } catch (e) { return; }

    var selected = {};
    product.options.forEach(function (name, i) {
      var group = form.querySelector('[data-option-index="' + i + '"]');
      var activeChip = group ? group.querySelector(".is-selected") : null;
      selected[i] = activeChip ? activeChip.getAttribute("data-value") : (product.variants[0].options[i]);
    });

    function findVariant() {
      return product.variants.filter(function (v) {
        return Object.keys(selected).every(function (i) { return v.options[i] === selected[i]; });
      })[0];
    }

    function updateUI() {
      var variant = findVariant();
      if (!variant) return;

      var variantInput = form.querySelector("[data-variant-id-input]");
      if (variantInput) variantInput.value = variant.id;

      var priceRow = document.querySelector(".noae-pdp__price-row");
      if (priceRow) {
        var current = priceRow.querySelector("[data-price-current]");
        var compare = priceRow.querySelector("[data-price-compare]");
        if (current) current.textContent = fmt(variant.price);
        if (compare) {
          if (variant.compare_at_price > variant.price) {
            compare.textContent = fmt(variant.compare_at_price);
            compare.classList.remove("noae-hide");
          } else {
            compare.classList.add("noae-hide");
          }
        }
      }

      var stockEl = document.getElementById("pdpStock");
      if (stockEl) {
        if (variant.available) {
          stockEl.textContent = "In Stock — ships in 1-2 business days";
        } else {
          stockEl.textContent = "Currently Out of Stock";
        }
      }

      var addBtn = form.querySelector("[data-pdp-add]");
      if (addBtn) {
        addBtn.disabled = !variant.available;
        var addText = addBtn.querySelector("[data-add-text]");
        if (addText) addText.textContent = variant.available ? "Add to Cart" : "Sold Out";
      }
    }

    form.querySelectorAll("[data-option-values]").forEach(function (group) {
      var index = group.closest("[data-option-index]").getAttribute("data-option-index");
      group.querySelectorAll("[data-option-value]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          group.querySelectorAll("[data-option-value]").forEach(function (c) { c.classList.remove("is-selected"); });
          chip.classList.add("is-selected");
          selected[index] = chip.getAttribute("data-value");
          updateUI();
        });
      });
    });

    var qtyWrap = form.querySelector("[data-pdp-qty]");
    if (qtyWrap) {
      var qtyInput = qtyWrap.querySelector("[data-qty-input]");
      var incBtn = qtyWrap.querySelector("[data-qty-inc]");
      var decBtn = qtyWrap.querySelector("[data-qty-dec]");
      if (incBtn) incBtn.addEventListener("click", function () { qtyInput.value = parseInt(qtyInput.value, 10) + 1; });
      if (decBtn) decBtn.addEventListener("click", function () { qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1); });
    }
  }

  /* ---------------------------------------------------------------------
     Tabs (Overview / Key Ingredients / How to Use / Skin Type / Shipping /
     Storage) — sourced from custom.* metafields, only rendered when present.
  --------------------------------------------------------------------- */
  function initTabs() {
    var tabList = document.getElementById("pdpTabList");
    var panelWrap = document.getElementById("pdpTabPanels");
    if (!tabList || !panelWrap) return;
    tabList.querySelectorAll(".noae-tabs__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabList.querySelectorAll(".noae-tabs__btn").forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
        panelWrap.querySelectorAll(".noae-tabs__panel").forEach(function (p) { p.classList.remove("is-active"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        var target = document.getElementById("tab-" + btn.getAttribute("data-tab"));
        if (target) target.classList.add("is-active");
      });
    });
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------------------- */
  function initFaq() {
    var el = document.getElementById("pdpFaq");
    if (!el) return;
    el.querySelectorAll(".noae-faq__question").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".noae-faq__item");
        var isOpen = item.classList.contains("is-open");
        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }

  /* ---------------------------------------------------------------------
     Recently viewed — localStorage of product handles, rendered client-side
     from Shopify's live /products/{handle}.js JSON (mirrors the demo's
     recently-viewed behaviour, since Shopify has no server-side "recently
     viewed" object).
  --------------------------------------------------------------------- */
  function getRecentlyViewed() {
    try {
      var raw = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }
  function pushRecentlyViewed(handle) {
    var list = getRecentlyViewed().filter(function (h) { return h !== handle; });
    list.unshift(handle);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6))); } catch (e) {}
  }

  function recentCardHTML(p) {
    var variant = p.variants && p.variants[0];
    return (
      '<article class="noae-product-card" data-product-handle="' + p.handle + '">' +
        '<div class="noae-product-card__media">' +
          '<a href="' + p.url + '" class="noae-product-card__link" aria-label="View ' + p.title + '">' +
            '<img class="noae-product-card__img noae-product-card__img--main" src="' + (p.featured_image || "") + '" alt="' + p.title + '" width="400" height="480" loading="lazy">' +
          "</a>" +
        "</div>" +
        '<div class="noae-product-card__body">' +
          '<p class="noae-product-card__category">' + (p.type || p.product_type || "") + "</p>" +
          '<h3 class="noae-product-card__name"><a href="' + p.url + '">' + p.title + "</a></h3>" +
          '<div class="noae-product-card__price"><span class="noae-price">' + (variant ? fmt(variant.price) : "") + "</span></div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderRecentlyViewed(currentHandle) {
    var section = document.getElementById("pdpRecentlyViewedSection");
    var grid = document.getElementById("pdpRecentlyViewed");
    if (!section || !grid) return;
    var handles = getRecentlyViewed().filter(function (h) { return h !== currentHandle; }).slice(0, 4);
    if (!handles.length) { section.classList.add("noae-hide"); return; }
    Promise.all(handles.map(function (h) {
      return fetch("/products/" + h + ".js").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    })).then(function (products) {
      products = products.filter(Boolean);
      if (!products.length) { section.classList.add("noae-hide"); return; }
      section.classList.remove("noae-hide");
      grid.innerHTML = products.map(recentCardHTML).join("");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var pdp = document.querySelector("[data-pdp]");
    if (!pdp) return;
    var handle = pdp.getAttribute("data-product-handle");

    initGallery();
    initProductForm();
    initTabs();
    initFaq();
    renderRecentlyViewed(handle);
    if (handle) pushRecentlyViewed(handle);
  });
})(window);
