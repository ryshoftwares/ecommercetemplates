/* =========================================================================
   NOAÉ — Product Detail Page: gallery/zoom, variants, tabs, FAQ,
   related + recently viewed, and dynamic SEO tag injection.
   (product.html is a single template driven by ?slug=)
   ========================================================================= */
(function () {
  "use strict";

  var RECENT_KEY = "noae_recently_viewed";
  var currentVariant = null;
  var currentQty = 1;

  function getRecentlyViewed() {
    try {
      var raw = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch (e) { return []; }
  }
  function pushRecentlyViewed(id) {
    var list = getRecentlyViewed().filter(function (i) { return i !== String(id); });
    list.unshift(String(id));
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
  }

  function setMeta(name, content, attr) {
    attr = attr || "name";
    var el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (el) el.setAttribute("content", content);
  }

  function setSeo(product) {
    var products = window.NoaeProducts;
    var title = product.name + " | NOAÉ";
    document.title = title;
    setMeta("description", product.description);
    setMeta("og:title", title, "property");
    setMeta("og:description", product.description, "property");
    setMeta("og:image", window.location.origin + "/" + product.image, "property");
    setMeta("twitter:title", title);
    setMeta("twitter:description", product.description);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://www.noae-demo.com/product.html?slug=" + product.slug);

    // Breadcrumb JSON-LD
    var breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.noae-demo.com/index.html" },
        { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://www.noae-demo.com/shop.html" },
        { "@type": "ListItem", "position": 3, "name": product.category, "item": "https://www.noae-demo.com/category.html?cat=" + product.category.toLowerCase() },
        { "@type": "ListItem", "position": 4, "name": product.name, "item": "https://www.noae-demo.com/product.html?slug=" + product.slug }
      ]
    };
    injectLd("ld-breadcrumb", breadcrumbLd);

    // Product + Offer + AggregateRating JSON-LD
    // NOTE (demo-only): aggregateRating below is derived from this static demo's own
    // sample product.rating / product.reviewCount fields. In production this MUST be
    // wired to a real, live review data source — never hardcode ratings in markup.
    var productLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": window.location.origin + "/" + product.image,
      "description": product.description,
      "sku": product.sku,
      "brand": { "@type": "Brand", "name": product.brand },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": product.price,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": "https://www.noae-demo.com/product.html?slug=" + product.slug
      }
    };
    injectLd("ld-product", productLd);

    // FAQPage JSON-LD — must exactly match the visible FAQ accordion
    var faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": product.faqs.map(function (f) {
        return { "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } };
      })
    };
    injectLd("ld-faq", faqLd);
  }

  function injectLd(id, data) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function renderBreadcrumb(product) {
    var el = document.getElementById("pdpBreadcrumb");
    if (!el) return;
    el.innerHTML =
      '<ol><li><a href="index.html">Home</a></li>' +
      '<li><a href="shop.html">Shop</a></li>' +
      '<li><a href="category.html?cat=' + product.category.toLowerCase() + '">' + product.category + '</a></li>' +
      '<li aria-current="page">' + product.name + '</li></ol>';
  }

  function renderGallery(product) {
    var main = document.getElementById("pdpMainImage");
    var thumbs = document.getElementById("pdpThumbs");
    if (!main) return;
    main.innerHTML = '<img id="pdpMainImg" src="' + product.gallery[0] + '" alt="' + product.name + ' — main product view" width="600" height="750">';
    if (thumbs) {
      thumbs.innerHTML = product.gallery.map(function (src, i) {
        return '<button type="button" class="noae-pdp__thumb' + (i === 0 ? " is-active" : "") + '" data-src="' + src + '" aria-label="View image ' + (i + 1) + '"><img src="' + src + '" alt="' + product.name + ' view ' + (i + 1) + '" width="76" height="76" loading="lazy"></button>';
      }).join("");
      thumbs.querySelectorAll(".noae-pdp__thumb").forEach(function (btn) {
        btn.addEventListener("click", function () {
          document.getElementById("pdpMainImg").src = btn.dataset.src;
          thumbs.querySelectorAll(".noae-pdp__thumb").forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
        });
      });
    }
    wireZoom(main);
  }

  function wireZoom(main) {
    var img = main.querySelector("img");
    if (!img || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    main.addEventListener("mousemove", function (e) {
      var rect = main.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = x + "% " + y + "%";
      img.style.transform = "scale(1.5)";
    });
    main.addEventListener("mouseleave", function () {
      img.style.transform = "scale(1)";
    });
  }

  function renderVariants(product) {
    var group = document.getElementById("pdpVariants");
    if (!group) return;
    currentVariant = product.variants[0];
    group.innerHTML =
      '<span class="noae-variant-label">Size</span>' +
      '<div class="noae-variant-options">' +
      product.variants.map(function (v, i) {
        return '<button type="button" class="noae-variant-chip' + (i === 0 ? " is-selected" : "") + '" data-size="' + v.size + '">' + v.size + '</button>';
      }).join("") + '</div>';
    group.querySelectorAll(".noae-variant-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        group.querySelectorAll(".noae-variant-chip").forEach(function (c) { c.classList.remove("is-selected"); });
        chip.classList.add("is-selected");
        currentVariant = product.variants.filter(function (v) { return v.size === chip.dataset.size; })[0];
        updatePriceRow(product);
      });
    });
  }

  function updatePriceRow(product) {
    var priceEl = document.getElementById("pdpPrice");
    if (priceEl) priceEl.textContent = window.NoaeProducts.formatPrice(currentVariant.price);
  }

  function renderQty() {
    var wrap = document.getElementById("pdpQty");
    if (!wrap) return;
    var input = wrap.querySelector("input");
    wrap.querySelector(".js-qty-inc").addEventListener("click", function () {
      currentQty += 1;
      input.value = currentQty;
    });
    wrap.querySelector(".js-qty-dec").addEventListener("click", function () {
      currentQty = Math.max(1, currentQty - 1);
      input.value = currentQty;
    });
  }

  function renderTabs(product) {
    var tabList = document.getElementById("pdpTabList");
    var panelWrap = document.getElementById("pdpTabPanels");
    if (!tabList || !panelWrap) return;
    var sections = [
      { id: "overview", label: "Overview", html: "<p>" + product.description + "</p><h4>Highlights</h4><ul>" + product.features.map(function (f) { return "<li>" + f + "</li>"; }).join("") + "</ul>" },
      { id: "ingredients", label: "Key Ingredients", html: "<ul>" + product.keyIngredients.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>" },
      { id: "how-to-use", label: "How to Use", html: "<p>" + product.howToUse + "</p>" },
      { id: "skin-type", label: "Skin Type", html: "<p>Formulated for: <strong>" + product.skinType.join(", ") + "</strong> skin types.</p>" },
      { id: "shipping", label: "Shipping", html: "<p>Free shipping on orders over ₹1,999. Orders below this threshold ship for a flat ₹99. Most orders dispatch within 1-2 business days and arrive within 3-6 business days depending on location.</p>" },
      { id: "returns", label: "Returns", html: "<p>Unopened products may be returned within 14 days of delivery for a full refund. Opened products can be exchanged if they arrived damaged or defective. Contact our care team to start a return.</p>" },
      { id: "storage", label: "Storage", html: "<p>" + product.storage + "</p>" }
    ];
    tabList.innerHTML = sections.map(function (s, i) {
      return '<button type="button" class="noae-tabs__btn' + (i === 0 ? " is-active" : "") + '" data-tab="' + s.id + '" role="tab" aria-selected="' + (i === 0) + '">' + s.label + '</button>';
    }).join("");
    panelWrap.innerHTML = sections.map(function (s, i) {
      return '<div class="noae-tabs__panel' + (i === 0 ? " is-active" : "") + '" id="tab-' + s.id + '" role="tabpanel">' + s.html + '</div>';
    }).join("");
    tabList.querySelectorAll(".noae-tabs__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabList.querySelectorAll(".noae-tabs__btn").forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
        panelWrap.querySelectorAll(".noae-tabs__panel").forEach(function (p) { p.classList.remove("is-active"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        document.getElementById("tab-" + btn.dataset.tab).classList.add("is-active");
      });
    });
  }

  function renderFaq(product) {
    var el = document.getElementById("pdpFaq");
    if (!el) return;
    el.innerHTML = product.faqs.map(function (f, i) {
      return (
        '<div class="noae-faq__item" data-index="' + i + '">' +
          '<button type="button" class="noae-faq__question" aria-expanded="false"><span>' + f.q + '</span><span class="noae-faq__icon">+</span></button>' +
          '<div class="noae-faq__answer"><p class="noae-faq__answer-inner">' + f.a + '</p></div>' +
        '</div>'
      );
    }).join("");
    el.querySelectorAll(".noae-faq__question").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".noae-faq__item");
        var isOpen = item.classList.contains("is-open");
        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }

  function renderRelated(product) {
    var el = document.getElementById("pdpRelated");
    if (!el) return;
    var related = window.NoaeProducts.getRelatedProducts(product, 4);
    el.innerHTML = related.map(function (p) { return window.NoaeProducts.renderProductCard(p); }).join("");
  }

  function renderRecentlyViewed(product) {
    var section = document.getElementById("pdpRecentlyViewedSection");
    var el = document.getElementById("pdpRecentlyViewed");
    if (!el || !section) return;
    var ids = getRecentlyViewed().filter(function (i) { return i !== String(product.id); });
    var products = ids.map(function (id) { return window.NoaeProducts.getProductById(id); }).filter(Boolean).slice(0, 4);
    if (!products.length) { section.classList.add("noae-hide"); return; }
    section.classList.remove("noae-hide");
    el.innerHTML = products.map(function (p) { return window.NoaeProducts.renderProductCard(p); }).join("");
  }

  function wireActions(product) {
    var addBtn = document.getElementById("pdpAddToCart");
    var buyBtn = document.getElementById("pdpBuyNow");
    var wishBtn = document.getElementById("pdpWishlist");
    if (addBtn) addBtn.addEventListener("click", function () {
      window.NoaeCart.addItem(product.id, currentVariant.size, currentQty);
      window.NoaeToast.show(product.name + " added to your bag", "success");
    });
    if (buyBtn) buyBtn.addEventListener("click", function () {
      window.NoaeCart.addItem(product.id, currentVariant.size, currentQty);
      window.location.href = "checkout.html";
    });
    if (wishBtn) {
      wishBtn.dataset.productId = product.id;
      var active = window.NoaeWishlist.has(product.id);
      wishBtn.classList.toggle("is-active", active);
      wishBtn.addEventListener("click", function () {
        var now = window.NoaeWishlist.toggle(product.id);
        wishBtn.classList.toggle("is-active", now);
        window.NoaeToast.show(now ? "Added to wishlist" : "Removed from wishlist", now ? "success" : "default");
      });
    }
  }

  function renderNotFound() {
    var main = document.getElementById("pdpMain");
    if (main) main.innerHTML = '<div class="noae-404"><p class="noae-404__code">404</p><h1>Product not found</h1><p>This ritual step may have moved. Explore our full collection instead.</p><a href="shop.html" class="noae-btn noae-btn--dark noae-mt-6">Back to Shop</a></div>';
  }

  function init() {
    var products = window.NoaeProducts;
    if (!products) return;
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("slug");
    var product = slug ? products.getProductBySlug(slug) : null;

    if (!product) { renderNotFound(); return; }

    setSeo(product);
    renderBreadcrumb(product);
    document.querySelectorAll(".js-pdp-category").forEach(function (el) { el.textContent = product.category; });
    document.querySelectorAll(".js-pdp-name").forEach(function (el) { el.textContent = product.name; });
    var ratingEl = document.getElementById("pdpRating");
    if (ratingEl) ratingEl.innerHTML = products.renderStars(product.rating) + '<span>(' + product.reviewCount + ' reviews)</span>';
    var priceEl = document.getElementById("pdpPrice");
    if (priceEl) priceEl.textContent = products.formatPrice(product.price);
    var comparePriceEl = document.getElementById("pdpComparePrice");
    if (comparePriceEl) {
      if (product.comparePrice) { comparePriceEl.textContent = products.formatPrice(product.comparePrice); comparePriceEl.classList.remove("noae-hide"); }
      else comparePriceEl.classList.add("noae-hide");
    }
    var descEl = document.getElementById("pdpDescription");
    if (descEl) descEl.textContent = product.description;
    var stockEl = document.getElementById("pdpStock");
    if (stockEl) stockEl.textContent = product.stock > 0 ? "In Stock — ships in 1-2 business days" : "Currently Out of Stock";
    var metaEl = document.getElementById("pdpMetaList");
    if (metaEl) metaEl.innerHTML =
      "<li><span>SKU</span><span>" + product.sku + "</span></li>" +
      "<li><span>Brand</span><span>" + product.brand + "</span></li>" +
      "<li><span>Category</span><span>" + product.category + "</span></li>" +
      "<li><span>Skin Type</span><span>" + product.skinType.join(", ") + "</span></li>";

    renderGallery(product);
    renderVariants(product);
    renderQty();
    renderTabs(product);
    renderFaq(product);
    renderRelated(product);
    renderRecentlyViewed(product);
    wireActions(product);
    pushRecentlyViewed(product.id);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
