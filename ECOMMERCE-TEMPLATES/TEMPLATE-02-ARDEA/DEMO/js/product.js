/* ==========================================================================
   ARDEA — js/product.js
   Product Detail Page: gallery/zoom, variant + qty selection, tabs, FAQ
   accordion, related products, recently viewed, structured data sync.

   NOTE (architecture): this is a single static product.html enhanced by
   query string (?slug=<product-slug>). The file ships with full static
   SEO content (H1, meta tags, breadcrumb, specs, FAQ, JSON-LD) for the
   canonical example product "ardea-oak-lounge-chair" baked directly into
   the HTML, so a non-JS crawler always indexes one complete, correct
   product page. When a shopper follows an in-site link with a different
   ?slug=, this script re-renders every dynamic section — including the
   JSON-LD blocks — to match. In the WordPress/Shopify ports each product
   gets its own physically distinct URL and statically rendered SEO
   content; this query-string pattern is a demo-only simplification.
   ========================================================================== */

(function (global) {
  "use strict";

  var DEFAULT_SLUG = "ardea-oak-lounge-chair";

  function getSlug() {
    var params = new URLSearchParams(window.location.search);
    return params.get("slug") || DEFAULT_SLUG;
  }

  function init() {
    var root = document.querySelector("[data-pdp]");
    if (!root) return;
    var data = global.ArdeaData;
    var product = data.getProductBySlug(getSlug()) || data.getProductBySlug(DEFAULT_SLUG);
    if (!product) return;

    var state = { image: 0, variant: product.colors ? product.colors[0] : null, qty: 1 };

    renderMeta(product);
    renderGallery(product, state);
    renderInfo(product, state);
    renderTabs(product);
    renderFAQ(product);
    renderStructuredData(product);
    renderRelated(product);
    renderRecentlyViewed(product);
    bindZoom(root);

    if (global.ArdeaApp && global.ArdeaApp.trackRecentlyViewed) {
      global.ArdeaApp.trackRecentlyViewed(product.id);
    }
  }

  function renderMeta(product) {
    document.title = product.name + " | Modern Furniture | ARDEA";
    var breadcrumbCat = document.querySelector("[data-breadcrumb-category]");
    if (breadcrumbCat) {
      breadcrumbCat.textContent = product.category.replace("-", " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      breadcrumbCat.setAttribute("href", "category.html?room=" + product.category);
    }
    var breadcrumbName = document.querySelector("[data-breadcrumb-product]");
    if (breadcrumbName) breadcrumbName.textContent = product.name;
  }

  function renderGallery(product, state) {
    var mainWrap = document.querySelector("[data-pdp-main-image]");
    var thumbsWrap = document.querySelector("[data-pdp-thumbs]");
    var badgesWrap = document.querySelector("[data-pdp-badges]");
    if (!mainWrap || !thumbsWrap) return;
    var data = global.ArdeaData;

    function paint() {
      var img = product.gallery[state.image];
      mainWrap.innerHTML = '<img src="' + img.src + '" alt="' + img.alt + '" width="700" height="875">';
      thumbsWrap.querySelectorAll(".pdp__thumb").forEach(function (t, i) {
        t.classList.toggle("is-active", i === state.image);
      });
    }

    thumbsWrap.innerHTML = product.gallery.map(function (img, i) {
      return '<button type="button" class="pdp__thumb' + (i === 0 ? " is-active" : "") + '" data-thumb-index="' + i + '" aria-label="View image ' + (i + 1) + ' of ' + product.name + '"><img src="' + img.src + '" alt="" width="88" height="88"></button>';
    }).join("");
    thumbsWrap.querySelectorAll("[data-thumb-index]").forEach(function (btn) {
      btn.addEventListener("click", function () { state.image = Number(btn.getAttribute("data-thumb-index")); paint(); });
    });

    if (badgesWrap) {
      var discount = data.discountPercent(product);
      var html = "";
      if (product.badge) html += '<span class="badge badge--' + product.badge.toLowerCase().replace(/\s+/g, "-") + '">' + product.badge + "</span>";
      if (discount > 0) html += '<span class="badge badge--sale">-' + discount + "%</span>";
      badgesWrap.innerHTML = html;
    }
    paint();
  }

  function bindZoom(root) {
    root.addEventListener("click", function (e) {
      var img = e.target.closest("[data-pdp-main-image]");
      if (!img) return;
      img.classList.toggle("is-zoomed");
    });
    root.addEventListener("mousemove", function (e) {
      var img = e.target.closest("[data-pdp-main-image]");
      if (!img || !img.classList.contains("is-zoomed")) return;
      var rect = img.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      var inner = img.querySelector("img");
      if (inner) inner.style.transformOrigin = x + "% " + y + "%";
    });
  }

  function renderInfo(product, state) {
    var data = global.ArdeaData;
    var el = document.querySelector("[data-pdp-info]");
    if (!el) return;

    el.querySelector("[data-pdp-category]").textContent = product.category.replace("-", " ");
    el.querySelector("[data-pdp-title]").textContent = product.name;
    el.querySelector("[data-pdp-stars]").innerHTML = data.renderStars(product.rating);
    el.querySelector("[data-pdp-review-count]").textContent = "(" + product.reviewCount + " reviews)";
    var reviewLink = el.querySelector("[data-pdp-review-link]");
    if (reviewLink) reviewLink.setAttribute("href", "#reviews-faq");

    var priceRow = el.querySelector("[data-pdp-price-row]");
    var discount = data.discountPercent(product);
    priceRow.innerHTML =
      '<span class="price-current">' + data.formatINR(product.price) + "</span>" +
      (product.comparePrice ? '<span class="price-compare">' + data.formatINR(product.comparePrice) + "</span>" : "") +
      (discount > 0 ? '<span class="badge badge--sale">-' + discount + "% off</span>" : "");

    el.querySelector("[data-pdp-desc]").textContent = product.description;

    var stockNote = el.querySelector("[data-pdp-stock]");
    if (stockNote) {
      stockNote.textContent = product.stock > 5 ? "In stock, ready to ship" : (product.stock > 0 ? "Only " + product.stock + " left in stock" : "Currently out of stock");
    }

    var optionWrap = el.querySelector("[data-pdp-options]");
    if (optionWrap) {
      if (product.colors && product.colors.length) {
        optionWrap.innerHTML =
          '<div class="option-group">' +
            '<div class="option-group__label"><span>Finish</span><span class="value" data-selected-variant>' + product.colors[0] + "</span></div>" +
            '<div class="swatch-list">' +
              product.colors.map(function (c, i) {
                return '<button type="button" class="swatch" data-variant="' + c + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' + c + "</button>";
              }).join("") +
            "</div>" +
          "</div>";
        optionWrap.querySelectorAll(".swatch").forEach(function (btn) {
          btn.addEventListener("click", function () {
            optionWrap.querySelectorAll(".swatch").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
            btn.setAttribute("aria-pressed", "true");
            state.variant = btn.getAttribute("data-variant");
            optionWrap.querySelector("[data-selected-variant]").textContent = state.variant;
          });
        });
      } else {
        optionWrap.innerHTML = "";
      }
    }

    var dimsEl = el.querySelector("[data-pdp-dimensions]");
    if (dimsEl) dimsEl.textContent = "Dimensions: " + product.dimensions;

    var qtyInput = el.querySelector("[data-pdp-qty] input");
    var qtyWrap = el.querySelector("[data-pdp-qty]");
    if (qtyWrap) {
      qtyWrap.querySelector("[data-qty-dec]").addEventListener("click", function () {
        state.qty = Math.max(1, state.qty - 1); qtyInput.value = state.qty;
      });
      qtyWrap.querySelector("[data-qty-inc]").addEventListener("click", function () {
        state.qty = state.qty + 1; qtyInput.value = state.qty;
      });
      qtyInput.addEventListener("change", function () { state.qty = Math.max(1, Number(qtyInput.value) || 1); qtyInput.value = state.qty; });
    }

    var addBtn = el.querySelector("[data-pdp-add-to-cart]");
    if (addBtn) {
      addBtn.setAttribute("data-product-id", product.id);
      addBtn.addEventListener("click", function () {
        global.ArdeaCart.addToCart(product.id, state.qty, state.variant);
        global.ArdeaToast.show(product.name + " added to cart", "success");
        if (global.ArdeaApp) global.ArdeaApp.openCartDrawer();
      });
    }
    var buyNowBtn = el.querySelector("[data-pdp-buy-now]");
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", function () {
        global.ArdeaCart.addToCart(product.id, state.qty, state.variant);
        window.location.href = "checkout.html";
      });
    }
    var wishlistBtn = el.querySelector("[data-wishlist-toggle]");
    if (wishlistBtn) wishlistBtn.setAttribute("data-product-id", product.id);

    var specTable = document.querySelector("[data-pdp-spec-table]");
    if (specTable) {
      specTable.innerHTML =
        "<tr><th>SKU</th><td>" + product.sku + "</td></tr>" +
        "<tr><th>Brand</th><td>" + product.brand + "</td></tr>" +
        "<tr><th>Dimensions</th><td>" + product.dimensions + "</td></tr>" +
        "<tr><th>Materials</th><td>" + product.materials + "</td></tr>" +
        "<tr><th>Finish Options</th><td>" + (product.colors || []).join(", ") + "</td></tr>" +
        "<tr><th>Availability</th><td>" + (product.stock > 0 ? "In stock (" + product.stock + " units)" : "Out of stock") + "</td></tr>";
    }
  }

  function renderTabs(product) {
    var featuresEl = document.querySelector("[data-tab-features]");
    if (featuresEl) featuresEl.innerHTML = "<ul>" + product.features.map(function (f) { return "<li>" + f + "</li>"; }).join("") + "</ul>";
    var materialsEl = document.querySelector("[data-tab-materials]");
    if (materialsEl) materialsEl.textContent = product.materials;
    var dimsEl = document.querySelector("[data-tab-dimensions]");
    if (dimsEl) dimsEl.textContent = "Overall dimensions: " + product.dimensions + ". Please allow up to 1–2 cm of natural variation, typical of handmade and solid-wood construction.";
    var careEl = document.querySelector("[data-tab-care]");
    if (careEl) careEl.textContent = product.careInstructions;
    var overviewEl = document.querySelector("[data-tab-overview]");
    if (overviewEl) overviewEl.textContent = product.description;

    var tabButtons = document.querySelectorAll(".pdp-tabs__btn");
    var tabPanels = document.querySelectorAll(".pdp-tabs__panel");
    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabButtons.forEach(function (b) { b.classList.remove("is-active"); });
        tabPanels.forEach(function (p) { p.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var panel = document.querySelector('[data-tab-panel="' + btn.getAttribute("data-tab") + '"]');
        if (panel) panel.classList.add("is-active");
      });
    });
  }

  function renderFAQ(product) {
    var wrap = document.querySelector("[data-pdp-faq]");
    if (!wrap) return;
    wrap.innerHTML = product.faqs.map(function (f, i) {
      return (
        '<div class="faq-item' + (i === 0 ? " is-open" : "") + '">' +
          '<button type="button" class="faq-item__q" aria-expanded="' + (i === 0 ? "true" : "false") + '">' + f.q +
            '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg>' +
          "</button>" +
          '<div class="faq-item__a"><p>' + f.a + "</p></div>" +
        "</div>"
      );
    }).join("");
    wrap.querySelectorAll(".faq-item__q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var open = item.classList.contains("is-open");
        wrap.querySelectorAll(".faq-item.is-open").forEach(function (i) { i.classList.remove("is-open"); i.querySelector(".faq-item__q").setAttribute("aria-expanded", "false"); });
        if (!open) { item.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
      });
    });
  }

  function renderStructuredData(product) {
    var data = global.ArdeaData;
    var productScript = document.querySelector("#product-jsonld");
    if (productScript) {
      var jsonld = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [window.location.origin + "/" + product.image],
        "description": product.description,
        "sku": product.sku,
        "brand": { "@type": "Brand", "name": product.brand },
        "offers": {
          "@type": "Offer",
          "url": window.location.origin + "/product.html?slug=" + product.slug,
          "priceCurrency": "INR",
          "price": product.price,
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        },
        /* Demo-only aggregate rating derived from this file's static sample
           data (js/products.js). In production this MUST be sourced from a
           real, live reviews system — do not ship sample ratings as-is. */
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.reviewCount
        }
      };
      productScript.textContent = JSON.stringify(jsonld, null, 2);
    }
    var faqScript = document.querySelector("#faq-jsonld");
    if (faqScript) {
      var faqld = {
        "@context": "https://schema.org/",
        "@type": "FAQPage",
        "mainEntity": product.faqs.map(function (f) {
          return { "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } };
        })
      };
      faqScript.textContent = JSON.stringify(faqld, null, 2);
    }
    var breadcrumbScript = document.querySelector("#breadcrumb-jsonld");
    if (breadcrumbScript) {
      var bcld = {
        "@context": "https://schema.org/",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin + "/index.html" },
          { "@type": "ListItem", "position": 2, "name": "Shop", "item": window.location.origin + "/shop.html" },
          { "@type": "ListItem", "position": 3, "name": product.category.replace("-", " "), "item": window.location.origin + "/category.html?room=" + product.category },
          { "@type": "ListItem", "position": 4, "name": product.name, "item": window.location.origin + "/product.html?slug=" + product.slug }
        ]
      };
      breadcrumbScript.textContent = JSON.stringify(bcld, null, 2);
    }
  }

  function renderRelated(product) {
    var grid = document.querySelector("[data-related-grid]");
    if (!grid) return;
    var data = global.ArdeaData;
    var related = data.getRelatedProducts(product, 4);
    grid.innerHTML = related.map(function (p) { return data.productCardHTML(p); }).join("");
  }

  function renderRecentlyViewed(product) {
    var section = document.querySelector("[data-recently-viewed-section]");
    var grid = document.querySelector("[data-recently-viewed-grid]");
    if (!grid || !section) return;
    var data = global.ArdeaData;
    var ids = [];
    try { ids = JSON.parse(localStorage.getItem("ardea_recently_viewed") || "[]"); } catch (e) {}
    ids = ids.filter(function (id) { return id !== product.id; });
    if (!ids.length) { section.style.display = "none"; return; }
    var products = ids.map(function (id) { return data.getAllProducts().find(function (p) { return p.id === id; }); }).filter(Boolean).slice(0, 4);
    if (!products.length) { section.style.display = "none"; return; }
    section.style.display = "";
    grid.innerHTML = products.map(function (p) { return data.productCardHTML(p); }).join("");
  }

  document.addEventListener("DOMContentLoaded", init);
})(window);
