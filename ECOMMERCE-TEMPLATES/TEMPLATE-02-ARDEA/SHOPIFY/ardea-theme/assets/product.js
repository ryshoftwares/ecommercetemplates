/* ==========================================================================
   ARDEA — assets/product.js
   Product Detail Page: variant/finish selection (against the real product
   + variants JSON already embedded by snippets/product-form.liquid),
   gallery + zoom, qty stepper wiring, tabs, FAQ accordion, related
   products (progressive enhancement over the SSR fallback in
   sections/main-product.liquid via Shopify's native product
   recommendations endpoint), and recently viewed (localStorage handles,
   each resolved through Shopify's real /products/{handle}.js JSON
   endpoint — never hardcoded).
   ========================================================================== */

(function (global) {
  "use strict";

  var MONEY_FORMAT = (global.ArdeaSettings && global.ArdeaSettings.moneyFormat) || "₹{{amount}}";

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = precision >= 0 ? precision : 2;
    thousands = thousands === undefined ? "," : thousands;
    decimal = decimal === undefined ? "." : decimal;
    if (isNaN(number) || number == null) return "0";
    number = (number / 100.0).toFixed(precision);
    var parts = number.split(".");
    var dollars = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + thousands);
    var cents = parts[1] ? decimal + parts[1] : "";
    return dollars + cents;
  }
  function formatMoney(cents) {
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var match = MONEY_FORMAT.match(placeholderRegex);
    var token = match ? match[1] : "amount";
    var value;
    switch (token) {
      case "amount_no_decimals": value = formatWithDelimiters(cents, 0); break;
      case "amount_with_comma_separator": value = formatWithDelimiters(cents, 2, ".", ","); break;
      case "amount_no_decimals_with_comma_separator": value = formatWithDelimiters(cents, 0, ".", ","); break;
      default: value = formatWithDelimiters(cents, 2);
    }
    return MONEY_FORMAT.replace(placeholderRegex, value);
  }
  function resizeImage(src, width) {
    if (!src) return src;
    return src + (src.indexOf("?") !== -1 ? "&" : "?") + "width=" + width;
  }

  function init() {
    var root = document.querySelector("[data-pdp]");
    if (!root) return;
    var dataScript = root.querySelector("[data-product-json]");
    if (!dataScript) return;
    var product = JSON.parse(dataScript.textContent);
    var handle = root.getAttribute("data-product-handle");

    bindVariantSelector(root, product);
    bindGallery(root, product);
    bindZoom(root);
    bindQtyStepper(root);
    bindTabs(root);
    bindFAQ(root);
    loadRelated(root);
    loadRecentlyViewed(root, handle);

    if (global.ArdeaApp && global.ArdeaApp.trackRecentlyViewed && handle) {
      global.ArdeaApp.trackRecentlyViewed(handle);
    }
  }

  /* ---------------------------------------------------------------------
     Variant / finish selection
     --------------------------------------------------------------------- */
  function bindVariantSelector(root, product) {
    var form = root.querySelector("[data-product-form-el]");
    if (!form) return;
    var optionGroups = form.querySelectorAll("[data-option-index]");
    if (!optionGroups.length) return;

    var selected = Array.prototype.map.call(optionGroups, function (group, i) {
      var pressed = group.querySelector('[aria-pressed="true"]');
      var first = group.querySelector("[data-option-value]");
      return (pressed || first) ? (pressed || first).getAttribute("data-value") : null;
    });

    function findVariant() {
      return product.variants.find(function (v) {
        var opts = [v.option1, v.option2, v.option3];
        return selected.every(function (val, i) { return val == null || opts[i] === val; });
      });
    }

    function isCombinationAvailable(optionIndex, value) {
      var trial = selected.slice();
      trial[optionIndex] = value;
      return product.variants.some(function (v) {
        var opts = [v.option1, v.option2, v.option3];
        return trial.every(function (val, i) { return val == null || opts[i] === val; }) && v.available;
      });
    }

    function paint() {
      var variant = findVariant();

      optionGroups.forEach(function (group) {
        var index = Number(group.getAttribute("data-option-index"));
        group.querySelectorAll("[data-option-value]").forEach(function (btn) {
          var value = btn.getAttribute("data-value");
          var isSelected = value === selected[index];
          btn.setAttribute("aria-pressed", String(isSelected));
          var available = isCombinationAvailable(index, value);
          btn.disabled = !available;
        });
        var label = group.closest(".option-group").querySelector("[data-option-selected-value]");
        if (label) label.textContent = selected[index];
      });

      if (!variant) return;

      var idInput = form.querySelector("[data-variant-id-input]");
      if (idInput) idInput.value = variant.id;

      var priceRow = root.querySelector(".pdp__price-row");
      if (priceRow) {
        var onSale = variant.compare_at_price > variant.price;
        var discountPct = onSale ? Math.round(((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100) : 0;
        priceRow.innerHTML =
          '<div class="product-card__price"><span class="price-current">' + formatMoney(variant.price) + "</span>" +
          (onSale ? '<span class="price-compare">' + formatMoney(variant.compare_at_price) + "</span><span class=\"badge badge--sale\">-" + discountPct + "%</span>" : "") +
          "</div>";
      }

      var addBtn = form.querySelector("[data-pdp-add]");
      var addText = form.querySelector("[data-add-text]");
      var buyNowBtn = root.querySelector("[data-pdp-buy-now]");
      if (addBtn) {
        addBtn.disabled = !variant.available;
        if (addText) addText.textContent = variant.available ? "Add to Cart" : "Sold Out";
      }
      if (buyNowBtn) buyNowBtn.style.display = variant.available ? "" : "none";

      var stockNote = root.querySelector(".stock-note");
      if (stockNote) {
        stockNote.textContent = variant.available
          ? (variant.inventory_management && variant.inventory_quantity > 0 && variant.inventory_quantity <= 5
              ? "Only " + variant.inventory_quantity + " left in stock"
              : "In stock, ready to ship")
          : "Currently out of stock";
      }

      if (variant.featured_image) {
        var mediaIndex = findMediaIndexById(product, variant.featured_image.id);
        if (mediaIndex !== -1) selectThumb(root, mediaIndex, product);
      }
    }

    optionGroups.forEach(function (group) {
      group.querySelectorAll("[data-option-value]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (btn.disabled) return;
          var index = Number(btn.getAttribute("data-option-index"));
          selected[index] = btn.getAttribute("data-value");
          paint();
        });
      });
    });

    paint();
  }

  function findMediaIndexById(product, mediaId) {
    if (!product.media) return -1;
    for (var i = 0; i < product.media.length; i++) {
      if (product.media[i].id === mediaId) return i;
    }
    return -1;
  }

  /* ---------------------------------------------------------------------
     Gallery + thumbnails
     --------------------------------------------------------------------- */
  function selectThumb(root, index, product) {
    var thumbs = root.querySelectorAll("[data-thumb-index]");
    thumbs.forEach(function (t) { t.classList.toggle("is-active", Number(t.getAttribute("data-thumb-index")) === index); });
    var mainImg = root.querySelector("[data-pdp-image]");
    var media = product.media && product.media[index];
    if (mainImg && media && media.preview_image) {
      mainImg.src = resizeImage(media.preview_image.src, 700);
      mainImg.srcset = resizeImage(media.preview_image.src, 700) + " 700w, " + resizeImage(media.preview_image.src, 1200) + " 1200w";
      mainImg.setAttribute("data-media-id", media.id);
    }
  }

  function bindGallery(root, product) {
    root.querySelectorAll("[data-thumb-index]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectThumb(root, Number(btn.getAttribute("data-thumb-index")), product);
      });
    });
  }

  function bindZoom(root) {
    var mainImage = root.querySelector("[data-pdp-main-image]");
    if (!mainImage) return;
    mainImage.addEventListener("click", function () {
      mainImage.classList.toggle("is-zoomed");
    });
    mainImage.addEventListener("mousemove", function (e) {
      if (!mainImage.classList.contains("is-zoomed")) return;
      var rect = mainImage.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      var inner = mainImage.querySelector("img");
      if (inner) inner.style.transformOrigin = x + "% " + y + "%";
    });
  }

  /* ---------------------------------------------------------------------
     Qty stepper (buttons only — the number input already has native +/-)
     --------------------------------------------------------------------- */
  function bindQtyStepper(root) {
    var wrap = root.querySelector("[data-pdp-qty]");
    if (!wrap) return;
    var input = wrap.querySelector("[data-qty-input]");
    var dec = wrap.querySelector("[data-qty-dec]");
    var inc = wrap.querySelector("[data-qty-inc]");
    if (dec) dec.addEventListener("click", function () { input.value = Math.max(1, (Number(input.value) || 1) - 1); });
    if (inc) inc.addEventListener("click", function () { input.value = (Number(input.value) || 1) + 1; });

    var buyNowBtn = root.querySelector("[data-pdp-buy-now]");
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", function () {
        var form = root.querySelector("[data-product-form-el]");
        var idInput = form && form.querySelector("[data-variant-id-input]");
        if (!idInput) return;
        var qty = Number(input.value) || 1;
        if (global.ArdeaCart) {
          global.ArdeaCart.addToCart(idInput.value, qty).then(function () {
            window.location.href = "/cart";
          });
        }
      });
    }
  }

  /* ---------------------------------------------------------------------
     Tabs
     --------------------------------------------------------------------- */
  function bindTabs(root) {
    var buttons = root.querySelectorAll(".pdp-tabs__btn");
    var panels = root.querySelectorAll(".pdp-tabs__panel");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        panels.forEach(function (p) { p.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var panel = root.querySelector('[data-tab-panel="' + btn.getAttribute("data-tab") + '"]');
        if (panel) panel.classList.add("is-active");
      });
    });
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------------------- */
  function bindFAQ(root) {
    var wrap = root.querySelector("[data-pdp-faq]");
    if (!wrap) return;
    wrap.querySelectorAll(".faq-item__q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var open = item.classList.contains("is-open");
        wrap.querySelectorAll(".faq-item.is-open").forEach(function (i) {
          i.classList.remove("is-open");
          i.querySelector(".faq-item__q").setAttribute("aria-expanded", "false");
        });
        if (!open) { item.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Related products — progressive enhancement over the SSR fallback,
     via Shopify's native product recommendations endpoint.
     --------------------------------------------------------------------- */
  function loadRelated(root) {
    var section = root.querySelector("#related-products") || document.querySelector("#related-products");
    if (!section) return;
    var url = section.getAttribute("data-url");
    if (!url) return;
    fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var freshGrid = doc.querySelector("[data-related-grid]");
        var currentGrid = section.querySelector("[data-related-grid]");
        if (freshGrid && currentGrid && freshGrid.innerHTML.trim()) {
          currentGrid.innerHTML = freshGrid.innerHTML;
          if (global.ArdeaWishlist) global.ArdeaWishlist.syncButtonsUI();
        }
      })
      .catch(function () {});
  }

  /* ---------------------------------------------------------------------
     Recently viewed — localStorage handles, resolved via the real
     /products/{handle}.js endpoint.
     --------------------------------------------------------------------- */
  function recentCardHTML(product) {
    var variant = product.variants[0];
    var img = product.featured_image || (product.images && product.images[0]);
    var onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
    return (
      '<article class="product-card">' +
        '<div class="product-card__media">' +
          '<a href="/products/' + product.handle + '" class="product-card__link">' +
            (img ? '<img class="product-card__img product-card__img--primary" src="' + resizeImage(img, 600) + '" alt="" width="600" height="750" loading="lazy">' : "") +
          "</a>" +
        "</div>" +
        '<div class="product-card__body">' +
          '<p class="product-card__category">' + (product.type || "") + "</p>" +
          '<h3 class="product-card__name"><a href="/products/' + product.handle + '">' + product.title + "</a></h3>" +
          '<div class="product-card__price"><span class="price-current">' + formatMoney(variant.price) + "</span>" +
          (onSale ? '<span class="price-compare">' + formatMoney(variant.compare_at_price) + "</span>" : "") +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function loadRecentlyViewed(root, currentHandle) {
    var section = document.querySelector("[data-recently-viewed-section]");
    var grid = document.querySelector("[data-recently-viewed-grid]");
    if (!section || !grid) return;
    var handles = [];
    try { handles = JSON.parse(localStorage.getItem("ardea_recently_viewed") || "[]"); } catch (e) {}
    handles = handles.filter(function (h) { return h !== currentHandle; }).slice(0, 4);
    if (!handles.length) { section.style.display = "none"; return; }

    Promise.all(handles.map(function (h) {
      return fetch("/products/" + h + ".js").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    })).then(function (products) {
      products = products.filter(Boolean);
      if (!products.length) { section.style.display = "none"; return; }
      section.style.display = "";
      grid.innerHTML = products.map(recentCardHTML).join("");
      if (global.ArdeaWishlist) global.ArdeaWishlist.syncButtonsUI();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})(window);
