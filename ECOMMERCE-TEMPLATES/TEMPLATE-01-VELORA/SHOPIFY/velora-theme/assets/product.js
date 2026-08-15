/* ==========================================================================
   VELORA (Shopify theme) — Product Detail Page controller
   Ported from the demo's js/product.js. Reads the full product/variant
   dataset from the JSON blob injected by snippets/product-form.liquid
   ({{ product | json }}) and drives: variant selection (updates the hidden
   variant id input, price, availability, and main image), gallery
   thumbnails + click-to-zoom, tabs, the FAQ accordion, and "recently
   viewed" (localStorage, mirrors the demo's convention — see also
   window.Velora.wishlist in assets/theme.js for the sibling pattern).
   ========================================================================== */

(function (global) {
  "use strict";

  var RECENT_KEY = "velora_recent_v1";

  function readRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (e) { return []; }
  }
  function pushRecent(handle) {
    var list = readRecent().filter(function (h) { return h !== handle; });
    list.unshift(handle);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8))); } catch (e) {}
  }

  function fmt(cents) {
    return (global.Velora && global.Velora.formatMoney) ? global.Velora.formatMoney(cents) : "₹" + Math.round(cents / 100);
  }

  /* ---------------------------------------------------------------------
     Variant selection
  --------------------------------------------------------------------- */
  function initVariantPicker(root, product) {
    var form = root.querySelector("[data-product-form-el]");
    if (!form || !product) return;
    var variantInput = form.querySelector('[name="id"]');
    var optionGroups = form.querySelectorAll("[data-option-index]");
    var addBtn = form.querySelector("[data-pdp-add]");
    var addText = form.querySelector("[data-add-text]");

    function selectedOptions() {
      var selected = [];
      optionGroups.forEach(function (group) {
        var idx = parseInt(group.getAttribute("data-option-index"), 10);
        var active = group.querySelector(".is-selected");
        selected[idx] = active ? active.getAttribute("data-value") : null;
      });
      return selected;
    }

    function findVariant(options) {
      return product.variants.find(function (v) {
        return options.every(function (val, i) { return val == null || v.options[i] === val; });
      });
    }

    function updatePrice(variant) {
      var priceWrap = root.querySelector(".pdp-info .product-price");
      if (!priceWrap) return;
      var onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
      var html = '<span class="price-current">' + fmt(variant.price) + "</span>";
      if (onSale) {
        var pct = Math.round(((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100);
        html += '<span class="price-compare">' + fmt(variant.compare_at_price) + "</span>";
        html += '<span class="price-discount">-' + pct + "%</span>";
      }
      priceWrap.innerHTML = html;
    }

    function updateStock(variant) {
      var stockEl = root.querySelector("[data-pdp] .stock-msg") || root.querySelector(".stock-msg");
      if (!stockEl) return;
      if (variant.available) {
        stockEl.textContent = "In stock — ready to ship";
        stockEl.className = "stock-msg in-stock";
      } else {
        stockEl.textContent = "Currently out of stock";
        stockEl.className = "stock-msg";
      }
    }

    function updateMainImage(variant) {
      if (!variant.featured_image) return;
      var mainImg = root.querySelector("[data-pdp-main-img]");
      if (mainImg) mainImg.src = variant.featured_image.src ? resizeShopifyImage(variant.featured_image.src, 900) : mainImg.src;
      var matchThumb = root.querySelector('[data-pdp-thumbs] img[data-full-src*="' + (variant.featured_image.id || "") + '"]');
      if (matchThumb) {
        root.querySelectorAll("[data-pdp-thumbs] img").forEach(function (t) { t.classList.remove("is-active"); });
        matchThumb.classList.add("is-active");
      }
    }

    function resizeShopifyImage(src, width) {
      return src.replace(/(\.[a-zA-Z0-9]+)(\?.*)?$/, "_" + width + "x$1$2");
    }

    function applyVariant(variant) {
      if (!variant) return;
      variantInput.value = variant.id;
      updatePrice(variant);
      updateStock(variant);
      updateMainImage(variant);
      if (addBtn) {
        if (variant.available) {
          addBtn.removeAttribute("disabled");
          if (addText) addText.textContent = "Add to Cart";
        } else {
          addBtn.setAttribute("disabled", "disabled");
          if (addText) addText.textContent = "Sold Out";
        }
      }
      optionGroups.forEach(function (group) {
        var idx = parseInt(group.getAttribute("data-option-index"), 10);
        var labelWrap = group.closest(".variant-group").querySelector("[data-option-selected-value]");
        if (labelWrap) labelWrap.textContent = variant.options[idx];
      });
    }

    optionGroups.forEach(function (group) {
      group.querySelectorAll("[data-option-value]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          group.querySelectorAll("[data-option-value]").forEach(function (b) { b.classList.remove("is-selected"); });
          btn.classList.add("is-selected");
          var variant = findVariant(selectedOptions());
          if (variant) applyVariant(variant);
        });
      });
    });

    /* Qty stepper */
    var qtyWrap = form.querySelector("[data-pdp-qty]");
    if (qtyWrap) {
      var qtyInput = qtyWrap.querySelector("[data-qty-input]");
      qtyWrap.querySelector("[data-qty-inc]").addEventListener("click", function () { qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1; });
      qtyWrap.querySelector("[data-qty-dec]").addEventListener("click", function () { qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1); });
    }
  }

  /* ---------------------------------------------------------------------
     Gallery thumbnails + zoom
  --------------------------------------------------------------------- */
  function initGallery(root) {
    var mainMedia = root.querySelector("[data-pdp-main-media]");
    var mainImg = root.querySelector("[data-pdp-main-img]");
    var thumbs = root.querySelectorAll("[data-pdp-thumbs] img");
    if (!mainMedia || !mainImg) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        thumbs.forEach(function (t) { t.classList.remove("is-active"); });
        thumb.classList.add("is-active");
        mainImg.src = thumb.getAttribute("data-full-src");
        mainImg.alt = thumb.alt;
      });
    });

    mainMedia.addEventListener("click", function () { mainMedia.classList.toggle("is-zoomed"); });
    mainMedia.addEventListener("mousemove", function (e) {
      if (!mainMedia.classList.contains("is-zoomed")) return;
      var rect = mainMedia.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      mainImg.style.transformOrigin = x + "% " + y + "%";
    });
    mainMedia.addEventListener("mouseleave", function () { mainMedia.classList.remove("is-zoomed"); });
  }

  /* ---------------------------------------------------------------------
     Tabs
  --------------------------------------------------------------------- */
  function initTabs(root) {
    var nav = root.querySelector(".tab-nav");
    if (!nav) return;
    var buttons = nav.querySelectorAll("button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        root.querySelectorAll(".tab-panel").forEach(function (panel) { panel.classList.remove("is-active"); });
        var target = root.querySelector("[data-tab-panel='" + btn.getAttribute("data-tab") + "']");
        if (target) target.classList.add("is-active");
      });
    });
    document.querySelectorAll("[data-tab-link]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var key = a.getAttribute("data-tab-link");
        var btn = nav.querySelector("button[data-tab='" + key + "']");
        if (btn) { btn.click(); btn.scrollIntoView({ behavior: "smooth", block: "center" }); }
      });
    });
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------------------- */
  function initFaqAccordion(root) {
    var faqWrap = root.querySelector("[data-pdp-faqs]");
    if (!faqWrap) return;
    faqWrap.querySelectorAll("[data-faq-item]").forEach(function (item) {
      var btn = item.querySelector(".faq-question");
      var answer = item.querySelector(".faq-answer");
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        faqWrap.querySelectorAll("[data-faq-item]").forEach(function (other) {
          other.classList.remove("is-open");
          other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-answer").style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Recently viewed
  --------------------------------------------------------------------- */
  function recentCardHTML(p) {
    return (
      '<article class="product-card" data-product-handle="' + p.handle + '">' +
        '<div class="product-media">' +
          '<a href="' + p.url + '" aria-label="View ' + p.title + '">' +
            '<img class="img-primary" src="' + (p.featured_image || "") + '" alt="' + p.title + '" width="600" height="800" loading="lazy">' +
          "</a>" +
        "</div>" +
        '<div class="product-info">' +
          '<h3 class="product-name"><a href="' + p.url + '">' + p.title + "</a></h3>" +
          '<div class="product-price">' + fmt(p.variants[0].price) + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function initRecentlyViewed(root, currentHandle) {
    pushRecent(currentHandle);
    var section = root.querySelector("[data-recent-section]");
    var grid = root.querySelector("[data-recent-grid]");
    if (!section || !grid) return;
    var handles = readRecent().filter(function (h) { return h !== currentHandle; }).slice(0, 4);
    if (!handles.length) { section.style.display = "none"; return; }
    Promise.all(handles.map(function (h) {
      return fetch("/products/" + h + ".js").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    })).then(function (products) {
      products = products.filter(Boolean);
      if (!products.length) { section.style.display = "none"; return; }
      section.style.display = "";
      grid.innerHTML = products.map(recentCardHTML).join("");
      if (global.Velora && global.Velora.wishlist) global.Velora.wishlist.sync();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.querySelector("[data-pdp]");
    if (!root) return;
    var jsonEl = root.querySelector("[data-product-json]");
    var product = null;
    if (jsonEl) {
      try { product = JSON.parse(jsonEl.textContent); } catch (e) { product = null; }
    }
    initVariantPicker(root, product);
    initGallery(root);
    initTabs(root);
    initFaqAccordion(root);
    initRecentlyViewed(root, root.getAttribute("data-product-handle"));
  });
})(window);
