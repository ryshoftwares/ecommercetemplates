/* ==========================================================================
   MODIX — js/product.js
   Product Detail Page: reads ?slug= from the URL and renders gallery/zoom,
   variant selection, qty, tabs, spec table, FAQ accordion, comparison strip,
   related products and recently viewed — all from the single product.js
   dataset so on-page content and injected JSON-LD never drift apart.

   NOTE FOR THE SHOPIFY PORT: this demo renders one product.html template
   client-side for every SKU (no backend). In production each product gets
   its own server-rendered URL/HTML from Shopify's Liquid templates, so the
   title/meta/canonical/JSON-LD below should move to server-side rendering
   rather than being written with JS as done here.
   ========================================================================== */

(function () {
  "use strict";

  var data = window.MODIX.data;
  var RECENT_KEY = "modix_recently_viewed";

  function initPDP() {
    var root = document.querySelector("[data-pdp]");
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("slug");
    var product = slug ? data.getProductBySlug(slug) : null;

    if (!product) {
      root.innerHTML =
        '<div class="empty-state">' +
          "<h3>We couldn't find that product</h3>" +
          '<p>It may have been removed or the link is out of date.</p>' +
          '<a href="shop.html" class="btn btn-primary">Browse All Products</a>' +
        "</div>";
      return;
    }

    document.body.dataset.productId = product.id;
    renderMeta(product);
    renderBreadcrumb(product);
    renderGallery(product);
    renderInfo(product);
    renderTabs(product);
    renderFAQ(product);
    renderCompareStrip(product);
    injectJSONLD(product);
    trackRecentlyViewed(product);
    renderRelated(product, "[data-related-strip]", "You May Also Like");
    renderRelated(product, "[data-recently-viewed]", "Recently Viewed", true);
  }

  function renderMeta(product) {
    var cat = data.getCategoryBySlug(product.category);
    document.title = product.name + " | Modix";
    setMeta('meta[name="description"]', "content", product.description);
    setMeta('link[rel="canonical"]', "href", absoluteUrl("product.html?slug=" + product.slug));
    setMeta('meta[property="og:title"]', "content", product.name + " | Modix");
    setMeta('meta[property="og:description"]', "content", product.description);
    setMeta('meta[property="og:url"]', "content", absoluteUrl("product.html?slug=" + product.slug));
    setMeta('meta[property="og:image"]', "content", absoluteUrl(product.image));
    setMeta('meta[name="twitter:title"]', "content", product.name + " | Modix");
    setMeta('meta[name="twitter:description"]', "content", product.description);
    setMeta('meta[name="twitter:image"]', "content", absoluteUrl(product.image));
  }
  function absoluteUrl(path) { return window.location.origin + window.location.pathname.replace(/[^/]+$/, "") + path; }
  function setMeta(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  function renderBreadcrumb(product) {
    var el = document.querySelector("[data-breadcrumb]");
    if (!el) return;
    var cat = data.getCategoryBySlug(product.category);
    el.innerHTML =
      '<a href="index.html">Home</a><span class="breadcrumb__sep">/</span>' +
      '<a href="shop.html">Shop</a><span class="breadcrumb__sep">/</span>' +
      '<a href="category.html?cat=' + product.category + '">' + (cat ? cat.name : product.category) + '</a><span class="breadcrumb__sep">/</span>' +
      '<span class="breadcrumb__current">' + product.name + "</span>";
  }

  /* ------------------------------------------------------------------
     Gallery + zoom
     ------------------------------------------------------------------ */
  function renderGallery(product) {
    var mainWrap = document.querySelector("[data-gallery-main]");
    var thumbsWrap = document.querySelector("[data-gallery-thumbs]");
    if (!mainWrap || !thumbsWrap) return;

    function setActive(index) {
      var item = product.gallery[index];
      mainWrap.querySelector("img").src = item.src;
      mainWrap.querySelector("img").alt = item.alt;
      thumbsWrap.querySelectorAll(".pdp-gallery__thumb").forEach(function (t, i) {
        t.classList.toggle("is-active", i === index);
      });
    }

    mainWrap.innerHTML = '<img src="' + product.gallery[0].src + '" alt="' + product.gallery[0].alt + '" width="600" height="600">';
    thumbsWrap.innerHTML = product.gallery.map(function (g, i) {
      return '<button type="button" class="pdp-gallery__thumb ' + (i === 0 ? "is-active" : "") + '" data-thumb-index="' + i + '" aria-label="View image ' + (i + 1) + '"><img src="' + g.src + '" alt="" width="84" height="84" loading="lazy"></button>';
    }).join("");

    thumbsWrap.querySelectorAll("[data-thumb-index]").forEach(function (btn) {
      btn.addEventListener("click", function () { setActive(Number(btn.dataset.thumbIndex)); });
    });

    mainWrap.addEventListener("click", function (e) {
      var isZoomed = mainWrap.classList.toggle("is-zoomed");
      if (isZoomed) {
        var rect = mainWrap.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        mainWrap.querySelector("img").style.transformOrigin = x + "% " + y + "%";
      } else {
        mainWrap.querySelector("img").style.transformOrigin = "center";
      }
    });
  }

  /* ------------------------------------------------------------------
     Info column: price, variants, qty, actions, stock, trust row
     ------------------------------------------------------------------ */
  function renderInfo(product) {
    var cat = data.getCategoryBySlug(product.category);
    var discount = data.discountPercent(product);

    setText("[data-pdp-category]", cat ? cat.name : product.category);
    setText("[data-pdp-title]", product.name);
    setHTML("[data-pdp-rating]", data.ratingHTML(product));
    setText("[data-pdp-sku]", "SKU: " + product.sku);
    setText("[data-pdp-price]", data.formatPrice(product.price));
    var compareEl = document.querySelector("[data-pdp-compare-price]");
    if (compareEl) {
      if (discount > 0) {
        compareEl.style.display = "";
        compareEl.textContent = data.formatPrice(product.comparePrice);
        setText("[data-pdp-discount]", "Save " + discount + "%");
      } else {
        compareEl.style.display = "none";
        setText("[data-pdp-discount]", "");
      }
    }
    setText("[data-pdp-description]", product.description);

    /* Color swatches */
    var colorGroup = document.querySelector("[data-pdp-colors]");
    var selectedColor = product.colors[0] ? product.colors[0].name : "";
    if (colorGroup) {
      if (!product.colors.length) {
        colorGroup.closest(".option-group").style.display = "none";
      } else {
        colorGroup.innerHTML = product.colors.map(function (c, i) {
          return '<button type="button" class="option-swatch ' + (i === 0 ? "is-active" : "") + '" data-color="' + c.name + '" style="background:' + c.hex + '" aria-label="Select color ' + c.name + '" title="' + c.name + '"></button>';
        }).join("");
        colorGroup.addEventListener("click", function (e) {
          var btn = e.target.closest(".option-swatch");
          if (!btn) return;
          colorGroup.querySelectorAll(".option-swatch").forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
          selectedColor = btn.dataset.color;
          setText("[data-pdp-color-selected]", selectedColor);
        });
        setText("[data-pdp-color-selected]", selectedColor);
      }
    }

    /* Storage/size variant pills */
    var variantGroup = document.querySelector("[data-pdp-variants]");
    var selectedVariant = product.variants[0] || "";
    var variantLabelEl = document.querySelector("[data-pdp-variant-label]");
    if (variantGroup) {
      if (!product.variants.length) {
        variantGroup.closest(".option-group").style.display = "none";
      } else {
        if (variantLabelEl) variantLabelEl.textContent = /gb|tb/i.test(product.variants[0]) ? "Storage" : "Size";
        variantGroup.innerHTML = product.variants.map(function (v, i) {
          return '<button type="button" class="option-pill ' + (i === 0 ? "is-active" : "") + '" data-variant="' + v + '">' + v + "</button>";
        }).join("");
        variantGroup.addEventListener("click", function (e) {
          var btn = e.target.closest(".option-pill");
          if (!btn) return;
          variantGroup.querySelectorAll(".option-pill").forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
          selectedVariant = btn.dataset.variant;
          setText("[data-pdp-variant-selected]", selectedVariant);
        });
        setText("[data-pdp-variant-selected]", selectedVariant);
      }
    }

    /* Qty stepper */
    var qtyInput = document.querySelector("[data-pdp-qty-input]");
    document.querySelectorAll("[data-pdp-qty-step]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var delta = Number(btn.dataset.pdpQtyStep);
        var next = Math.max(1, Math.min(product.stock || 10, Number(qtyInput.value) + delta));
        qtyInput.value = next;
      });
    });

    /* Stock */
    var stockEl = document.querySelector("[data-pdp-stock]");
    if (stockEl) {
      if (product.stock > 10) {
        stockEl.classList.remove("is-low");
        stockEl.innerHTML = '<span class="dot"></span> In Stock — ships in 1-2 business days';
      } else if (product.stock > 0) {
        stockEl.classList.add("is-low");
        stockEl.innerHTML = '<span class="dot"></span> Only ' + product.stock + " left in stock";
      } else {
        stockEl.classList.add("is-low");
        stockEl.innerHTML = '<span class="dot"></span> Currently out of stock';
      }
    }

    /* Wishlist button */
    var wishlistBtn = document.querySelector("[data-pdp-wishlist]");
    if (wishlistBtn) {
      wishlistBtn.dataset.id = product.id;
      wishlistBtn.setAttribute("data-wishlist-toggle", "");
    }

    /* Add to cart / buy now */
    var addBtn = document.querySelector("[data-pdp-add-to-cart]");
    var buyBtn = document.querySelector("[data-pdp-buy-now]");
    if (addBtn) {
      addBtn.disabled = product.stock === 0;
      addBtn.addEventListener("click", function () {
        var qty = Number(qtyInput ? qtyInput.value : 1);
        window.MODIX.cart.addToCart(product.id, qty, selectedColor, selectedVariant);
        window.MODIX.toast({ type: "success", title: "Added to cart", message: product.name });
        if (window.MODIX.openCartDrawer) window.MODIX.openCartDrawer();
      });
    }
    if (buyBtn) {
      buyBtn.disabled = product.stock === 0;
      buyBtn.addEventListener("click", function () {
        var qty = Number(qtyInput ? qtyInput.value : 1);
        window.MODIX.cart.addToCart(product.id, qty, selectedColor, selectedVariant);
        window.location.href = "checkout.html";
      });
    }
  }

  function setText(selector, text) { var el = document.querySelector(selector); if (el) el.textContent = text; }
  function setHTML(selector, html) { var el = document.querySelector(selector); if (el) el.innerHTML = html; }

  /* ------------------------------------------------------------------
     Tabs: Overview / Key Features / Specifications / Box / Warranty / Shipping
     ------------------------------------------------------------------ */
  function renderTabs(product) {
    var overviewDesc = document.querySelector("[data-tab-overview-desc]");
    if (overviewDesc) overviewDesc.textContent = product.description;
    var overviewList = document.querySelector("[data-tab-overview-features]");
    if (overviewList) {
      overviewList.innerHTML = product.features.map(function (f) {
        return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' + f + "</li>";
      }).join("");
    }
    var specTable = document.querySelector("[data-tab-specs]");
    if (specTable) {
      specTable.innerHTML = product.specifications.map(function (s) {
        return "<tr><th>" + s.label + "</th><td>" + s.value + "</td></tr>";
      }).join("");
    }
    var boxList = document.querySelector("[data-tab-box]");
    if (boxList) {
      boxList.innerHTML = product.boxContents.map(function (item, i) {
        return '<li><span class="count">' + (i + 1) + '.</span> ' + item + "</li>";
      }).join("");
    }
    var warrantyEl = document.querySelector("[data-tab-warranty]");
    if (warrantyEl) warrantyEl.textContent = product.warranty;

    var tabButtons = document.querySelectorAll(".tabs-nav button");
    var tabPanels = document.querySelectorAll(".tab-panel");
    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabButtons.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
        tabPanels.forEach(function (p) { p.classList.remove("is-active"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        document.getElementById(btn.getAttribute("aria-controls")).classList.add("is-active");
      });
    });
  }

  /* ------------------------------------------------------------------
     FAQ accordion — content must equal the FAQPage JSON-LD exactly
     ------------------------------------------------------------------ */
  function renderFAQ(product) {
    var wrap = document.querySelector("[data-pdp-faq]");
    if (!wrap) return;
    wrap.innerHTML = product.faqs.map(function (faq, i) {
      return (
        '<div class="accordion-item">' +
          '<button class="accordion-item__header" aria-expanded="false" id="faq-q-' + i + '" aria-controls="faq-a-' + i + '">' +
            "<span>" + faq.q + '</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg>' +
          "</button>" +
          '<div class="accordion-item__body" id="faq-a-' + i + '" role="region" aria-labelledby="faq-q-' + i + '">' +
            '<div class="accordion-item__body-inner">' + faq.a + "</div>" +
          "</div>" +
        "</div>"
      );
    }).join("");
  }

  /* ------------------------------------------------------------------
     Comparison strip vs. related products
     ------------------------------------------------------------------ */
  function renderCompareStrip(product) {
    var wrap = document.querySelector("[data-compare-strip]");
    if (!wrap) return;
    var related = data.getRelatedProducts(product, 2);
    var group = [product].concat(related);
    var rows = [
      { label: "Price", get: function (p) { return data.formatPrice(p.price); } },
      { label: "Rating", get: function (p) { return p.rating.toFixed(1) + " / 5"; } },
      { label: "Key Spec", get: function (p) { return p.specifications[0].value; } },
      { label: "Warranty", get: function (p) { return p.warranty.split(".")[0] + "."; } }
    ];
    var head = '<tr><th></th>' + group.map(function (p, i) {
      return "<th>" + (i === 0 ? '<span class="model-tag">This Product</span>' : '<span class="model-tag">Compare</span>') + '<a href="product.html?slug=' + p.slug + '" style="color:inherit;">' + p.name + "</a></th>";
    }).join("") + "</tr>";
    var body = rows.map(function (row) {
      return "<tr><th>" + row.label + "</th>" + group.map(function (p, i) {
        return '<td class="' + (i === 0 ? "is-highlight" : "") + '">' + row.get(p) + "</td>";
      }).join("") + "</tr>";
    }).join("");
    wrap.innerHTML = '<table class="compare-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
  }

  /* ------------------------------------------------------------------
     Related products + recently viewed strips
     ------------------------------------------------------------------ */
  function renderRelated(product, selector, heading, isRecent) {
    var wrap = document.querySelector(selector);
    if (!wrap) return;
    var grid = wrap.querySelector("[data-strip-grid]");
    var list;
    if (isRecent) {
      list = readRecentlyViewed().filter(function (id) { return id !== product.id; })
        .map(function (id) { return data.getProductById(id); }).filter(Boolean).slice(0, 4);
      if (!list.length) { wrap.style.display = "none"; return; }
      wrap.style.display = "";
    } else {
      list = data.getRelatedProducts(product, 4);
    }
    var titleEl = wrap.querySelector("[data-strip-title]");
    if (titleEl) titleEl.textContent = heading;
    grid.innerHTML = data.productCardsHTML(list);
  }

  function readRecentlyViewed() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch (e) { return []; }
  }
  function trackRecentlyViewed(product) {
    var list = readRecentlyViewed().filter(function (id) { return id !== product.id; });
    list.unshift(product.id);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  }

  /* ------------------------------------------------------------------
     JSON-LD: Product + Offer + AggregateRating + FAQPage + Breadcrumb
     ------------------------------------------------------------------ */
  function injectJSONLD(product) {
    var cat = data.getCategoryBySlug(product.category);

    var productLD = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: [absoluteUrl(product.image)],
      description: product.description,
      sku: product.sku,
      brand: { "@type": "Brand", name: product.brand },
      /* AggregateRating below is generated from this demo's own sample
         product data (rating/reviewCount fields in js/products.js).
         PRODUCTION NOTE: replace with real, wired-up customer review data
         before this goes live — never ship fabricated ratings. */
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: product.price,
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: absoluteUrl("product.html?slug=" + product.slug),
        itemCondition: "https://schema.org/NewCondition"
      }
    };

    var breadcrumbLD = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("index.html") },
        { "@type": "ListItem", position: 2, name: "Shop", item: absoluteUrl("shop.html") },
        { "@type": "ListItem", position: 3, name: cat ? cat.name : product.category, item: absoluteUrl("category.html?cat=" + product.category) },
        { "@type": "ListItem", position: 4, name: product.name, item: absoluteUrl("product.html?slug=" + product.slug) }
      ]
    };

    var faqLD = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: product.faqs.map(function (f) {
        return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } };
      })
    };

    appendJSONLD(productLD);
    appendJSONLD(breadcrumbLD);
    appendJSONLD(faqLD);
  }

  function appendJSONLD(obj) {
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(obj);
    document.head.appendChild(script);
  }

  document.addEventListener("DOMContentLoaded", initPDP);
})();
