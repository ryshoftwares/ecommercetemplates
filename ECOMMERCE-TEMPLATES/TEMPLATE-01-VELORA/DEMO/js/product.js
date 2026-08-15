/* ==========================================================================
   VELORA — Product Detail Page + Quick View + Quick Add
   URL convention: product.html?slug=<slug>
   Also injects Product / Offer / FAQPage / BreadcrumbList JSON-LD dynamically
   to match the on-page content exactly, since this is a single templated file.
   ========================================================================== */

(function (global) {
  "use strict";

  var RECENT_KEY = "velora_recent_v1";
  var TAB_KEYS = ["overview", "features", "materials", "size-guide", "shipping", "returns", "care"];

  function getSlug() {
    return new URLSearchParams(window.location.search).get("slug");
  }

  function readRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (e) { return []; }
  }
  function pushRecent(slug) {
    var list = readRecent().filter(function (s) { return s !== slug; });
    list.unshift(slug);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  }

  /* ---------------------------------------------------------------------
     Quick View + Quick Add — global, works on every page with product cards
  --------------------------------------------------------------------- */
  function initQuickView() {
    var backdrop = document.querySelector("[data-quickview-modal]");
    if (!backdrop || !global.VeloraProducts) return;
    var body = backdrop.querySelector("[data-qv-body]");

    function close() {
      backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
    var closeBtn = backdrop.querySelector("[data-qv-close]");
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    function open(slug) {
      var p = global.VeloraProducts.getBySlug(slug);
      if (!p || !body) return;
      var VP = global.VeloraProducts;
      var discount = VP.discountPercent(p.price, p.comparePrice);
      body.innerHTML =
        '<div class="qv-media"><img src="' + p.image + '" alt="' + p.imageAlt + '" width="600" height="800"></div>' +
        '<div class="qv-body">' +
          '<div class="product-cat">' + p.category + "</div>" +
          "<h2>" + p.name + "</h2>" +
          '<div class="product-rating"><span class="stars">' + VP.renderStars(p.rating) + "</span><span>" + p.rating.toFixed(1) + " (" + p.reviewCount + " reviews)</span></div>" +
          '<div class="product-price"><span>' + VP.formatPrice(p.price) + "</span>" +
            (p.comparePrice ? '<span class="price-compare">' + VP.formatPrice(p.comparePrice) + '</span><span class="price-discount">-' + discount + '%</span>' : "") +
          "</div>" +
          '<p class="desc">' + p.description + "</p>" +
          '<div class="variant-group"><div class="variant-label">Color <span class="selected-value" data-qv-color-label>' + p.colors[0] + '</span></div>' +
            '<div class="swatch-row" data-qv-colors>' + p.colors.map(function (c, i) {
              return '<button type="button" class="swatch-color ' + (i === 0 ? "is-selected" : "") + '" style="background:' + VP.colorToHex(c) + '" data-color="' + c + '" aria-label="' + c + '"></button>';
            }).join("") + "</div></div>" +
          '<div class="variant-group"><div class="variant-label">Size <span class="selected-value" data-qv-size-label>' + p.sizes[0] + '</span></div>' +
            '<div class="swatch-row" data-qv-sizes>' + p.sizes.map(function (s, i) {
              return '<button type="button" class="swatch-size ' + (i === 0 ? "is-selected" : "") + '" data-size="' + s + '">' + s + "</button>";
            }).join("") + "</div></div>" +
          '<div class="pdp-actions">' +
            '<div class="qty-stepper" data-qv-qty><button type="button" data-qty-dec>-</button><input type="text" value="1" readonly><button type="button" data-qty-inc>+</button></div>' +
            '<button type="button" class="btn btn-primary" data-qv-add data-slug="' + p.slug + '">Add to Cart</button>' +
          "</div>" +
          '<a href="product.html?slug=' + p.slug + '" class="btn-text">View full product &rarr;</a>' +
        "</div>";

      body.querySelectorAll("[data-qv-colors] button").forEach(function (b) {
        b.addEventListener("click", function () {
          body.querySelectorAll("[data-qv-colors] button").forEach(function (x) { x.classList.remove("is-selected"); });
          b.classList.add("is-selected");
          body.querySelector("[data-qv-color-label]").textContent = b.getAttribute("data-color");
        });
      });
      body.querySelectorAll("[data-qv-sizes] button").forEach(function (b) {
        b.addEventListener("click", function () {
          body.querySelectorAll("[data-qv-sizes] button").forEach(function (x) { x.classList.remove("is-selected"); });
          b.classList.add("is-selected");
          body.querySelector("[data-qv-size-label]").textContent = b.getAttribute("data-size");
        });
      });
      var qtyInput = body.querySelector("[data-qv-qty] input");
      body.querySelector("[data-qv-qty] [data-qty-inc]").addEventListener("click", function () { qtyInput.value = parseInt(qtyInput.value, 10) + 1; });
      body.querySelector("[data-qv-qty] [data-qty-dec]").addEventListener("click", function () { qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1); });

      body.querySelector("[data-qv-add]").addEventListener("click", function () {
        var color = body.querySelector("[data-qv-colors] .is-selected").getAttribute("data-color");
        var size = body.querySelector("[data-qv-sizes] .is-selected").getAttribute("data-size");
        var qty = parseInt(qtyInput.value, 10);
        global.VeloraCart.addItem({ productId: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, color: color, size: size, qty: qty });
        if (global.VeloraToast) global.VeloraToast.show(p.name + " added to cart", "success");
        close();
      });

      backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    document.body.addEventListener("click", function (e) {
      var qvBtn = e.target.closest("[data-quickview]");
      if (qvBtn) { e.preventDefault(); open(qvBtn.getAttribute("data-slug")); }
    });
  }

  function initQuickAdd() {
    document.body.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-quickadd]");
      if (!btn || !global.VeloraProducts || !global.VeloraCart) return;
      e.preventDefault();
      var p = global.VeloraProducts.getBySlug(btn.getAttribute("data-slug"));
      if (!p) return;
      global.VeloraCart.addItem({ productId: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, color: p.colors[0], size: p.sizes[0], qty: 1 });
      if (global.VeloraToast) global.VeloraToast.show(p.name + " added to cart", "success");
    });
  }

  /* ---------------------------------------------------------------------
     Product Detail Page
  --------------------------------------------------------------------- */
  function renderPDP() {
    var root = document.querySelector("[data-pdp]");
    if (!root || !global.VeloraProducts) return;
    var VP = global.VeloraProducts;
    var slug = getSlug();
    var p = VP.getBySlug(slug);

    if (!p) {
      root.innerHTML = '<div class="empty-state"><h2>Product not found</h2><p class="text-muted">This item may have sold out or moved. Browse the full collection instead.</p><a href="shop.html" class="btn btn-primary">Back to Shop</a></div>';
      document.title = "Product Not Found | Velora";
      return;
    }

    pushRecent(p.slug);
    var discount = VP.discountPercent(p.price, p.comparePrice);

    // Title / meta
    document.title = p.name + " | Velora";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", p.description);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", canonical.href.split("?")[0] + "?slug=" + p.slug);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", p.name + " | Velora");
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", p.description);
    var ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", location.origin + location.pathname.replace(/product\.html.*/, "") + p.image);

    // Breadcrumb
    var crumb = root.querySelector("[data-breadcrumb]");
    if (crumb) {
      crumb.innerHTML =
        '<li><a href="index.html">Home</a></li>' +
        '<li><a href="shop.html">Shop</a></li>' +
        '<li><a href="category.html?cat=' + p.categorySlug + '">' + p.category + "</a></li>" +
        '<li aria-current="page">' + p.name + "</li>";
    }

    // Gallery
    var mainMedia = root.querySelector("[data-pdp-main-media]");
    var thumbsWrap = root.querySelector("[data-pdp-thumbs]");
    var mainImg = document.createElement("img");
    mainImg.src = p.gallery[0].src; mainImg.alt = p.gallery[0].alt; mainImg.width = 700; mainImg.height = 933;
    mainMedia.innerHTML = ""; mainMedia.appendChild(mainImg);
    thumbsWrap.innerHTML = p.gallery.map(function (g, i) {
      return '<img src="' + g.src + '" alt="' + g.alt + '" width="120" height="160" class="' + (i === 0 ? "is-active" : "") + '" data-idx="' + i + '" loading="lazy">';
    }).join("");
    thumbsWrap.querySelectorAll("img").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        thumbsWrap.querySelectorAll("img").forEach(function (t) { t.classList.remove("is-active"); });
        thumb.classList.add("is-active");
        var g = p.gallery[parseInt(thumb.getAttribute("data-idx"), 10)];
        mainImg.src = g.src; mainImg.alt = g.alt;
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

    // Info block
    root.querySelector("[data-pdp-category]").textContent = p.category;
    root.querySelector("[data-pdp-name]").textContent = p.name;
    root.querySelector("[data-pdp-stars]").textContent = VP.renderStars(p.rating);
    root.querySelector("[data-pdp-rating-text]").textContent = p.rating.toFixed(1) + " (" + p.reviewCount + " reviews)";
    root.querySelector("[data-pdp-price]").innerHTML =
      '<span class="price-current">' + VP.formatPrice(p.price) + "</span>" +
      (p.comparePrice ? '<span class="price-compare">' + VP.formatPrice(p.comparePrice) + '</span><span class="price-discount">-' + discount + "% OFF</span>" : "");
    root.querySelector("[data-pdp-desc]").textContent = p.description;
    var stockEl = root.querySelector("[data-pdp-stock]");
    if (p.stock > 10) { stockEl.textContent = "In stock — ready to ship"; stockEl.className = "stock-msg in-stock"; }
    else if (p.stock > 0) { stockEl.textContent = "Only " + p.stock + " left in stock"; stockEl.className = "stock-msg low-stock"; }
    else { stockEl.textContent = "Currently out of stock"; stockEl.className = "stock-msg"; }
    root.querySelector("[data-pdp-sku]").textContent = p.sku;

    // Variants
    var colorWrap = root.querySelector("[data-pdp-colors]");
    var colorLabel = root.querySelector("[data-pdp-color-label]");
    colorWrap.innerHTML = p.colors.map(function (c, i) {
      return '<button type="button" class="swatch-color ' + (i === 0 ? "is-selected" : "") + '" style="background:' + VP.colorToHex(c) + '" data-color="' + c + '" aria-label="' + c + '"></button>';
    }).join("");
    colorLabel.textContent = p.colors[0];
    colorWrap.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        colorWrap.querySelectorAll("button").forEach(function (x) { x.classList.remove("is-selected"); });
        b.classList.add("is-selected");
        colorLabel.textContent = b.getAttribute("data-color");
      });
    });

    var sizeWrap = root.querySelector("[data-pdp-sizes]");
    var sizeLabel = root.querySelector("[data-pdp-size-label]");
    sizeWrap.innerHTML = p.sizes.map(function (s, i) {
      return '<button type="button" class="swatch-size ' + (i === 0 ? "is-selected" : "") + '" data-size="' + s + '">' + s + "</button>";
    }).join("");
    sizeLabel.textContent = p.sizes[0];
    sizeWrap.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        sizeWrap.querySelectorAll("button").forEach(function (x) { x.classList.remove("is-selected"); });
        b.classList.add("is-selected");
        sizeLabel.textContent = b.getAttribute("data-size");
      });
    });

    // Qty + actions
    var qtyInput = root.querySelector("[data-pdp-qty] input");
    root.querySelector("[data-pdp-qty] [data-qty-inc]").addEventListener("click", function () { qtyInput.value = parseInt(qtyInput.value, 10) + 1; });
    root.querySelector("[data-pdp-qty] [data-qty-dec]").addEventListener("click", function () { qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1); });

    function currentSelection() {
      return {
        color: colorWrap.querySelector(".is-selected").getAttribute("data-color"),
        size: sizeWrap.querySelector(".is-selected").getAttribute("data-size"),
        qty: parseInt(qtyInput.value, 10)
      };
    }

    root.querySelector("[data-pdp-add]").addEventListener("click", function () {
      var sel = currentSelection();
      global.VeloraCart.addItem({ productId: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, color: sel.color, size: sel.size, qty: sel.qty });
      if (global.VeloraToast) global.VeloraToast.show(p.name + " added to cart", "success");
    });
    root.querySelector("[data-pdp-buy-now]").addEventListener("click", function () {
      var sel = currentSelection();
      global.VeloraCart.addItem({ productId: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, color: sel.color, size: sel.size, qty: sel.qty });
      window.location.href = "checkout.html";
    });
    var wishBtn = root.querySelector("[data-pdp-wishlist]");
    wishBtn.setAttribute("data-id", p.id);
    wishBtn.setAttribute("data-wishlist-toggle", "");
    if (global.VeloraWishlist && global.VeloraWishlist.has(p.id)) wishBtn.classList.add("is-active");

    // Tabs
    var tabOverview = root.querySelector("[data-tab-overview]");
    if (tabOverview) tabOverview.textContent = p.description + " Designed by VELORA's in-house atelier, this piece is part of the New Season collection and is produced in limited quantities.";
    var tabFeatures = root.querySelector("[data-tab-features]");
    if (tabFeatures) tabFeatures.innerHTML = p.features.map(function (f) { return "<li>" + f + "</li>"; }).join("");
    var tabMaterials = root.querySelector("[data-tab-materials]");
    if (tabMaterials) tabMaterials.textContent = p.materials;
    var tabCare = root.querySelector("[data-tab-care]");
    if (tabCare) tabCare.textContent = p.careInstructions;
    var tabSizeGuide = root.querySelector("[data-tab-size-guide]");
    if (tabSizeGuide) {
      tabSizeGuide.innerHTML =
        "<p>VELORA sizing follows standard UK sizing. If you are between sizes, we recommend sizing up for a relaxed fit or sizing down for a fitted silhouette.</p>" +
        '<table class="spec-table"><tr><th>XS</th><td>UK 6 · Bust 80cm · Waist 61cm</td></tr><tr><th>S</th><td>UK 8 · Bust 84cm · Waist 65cm</td></tr><tr><th>M</th><td>UK 10 · Bust 88cm · Waist 69cm</td></tr><tr><th>L</th><td>UK 12 · Bust 94cm · Waist 75cm</td></tr><tr><th>XL</th><td>UK 14 · Bust 100cm · Waist 81cm</td></tr></table>';
    }
    var tabShipping = root.querySelector("[data-tab-shipping]");
    if (tabShipping) tabShipping.innerHTML = "<p>Orders are processed within 1-2 business days. Standard delivery across India takes 3-5 business days and is free on orders over ₹4,000. Express delivery (1-2 business days) is available at checkout for a flat fee.</p>";
    var tabReturns = root.querySelector("[data-tab-returns]");
    if (tabReturns) tabReturns.innerHTML = "<p>We accept returns and exchanges within 30 days of delivery on unworn items with original tags attached. Refunds are issued to the original payment method within 5-7 business days of us receiving the return.</p>";

    // FAQ accordion — must match FAQPage JSON-LD exactly
    var faqWrap = root.querySelector("[data-pdp-faqs]");
    faqWrap.innerHTML = p.faqs.map(function (f, i) {
      return (
        '<div class="faq-item" data-faq-item>' +
          '<button type="button" class="faq-question" aria-expanded="false">' + f.q + '<span class="plus">+</span></button>' +
          '<div class="faq-answer"><p>' + f.a + "</p></div>" +
        "</div>"
      );
    }).join("");
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

    // Related products
    var relatedGrid = root.querySelector("[data-related-grid]");
    if (relatedGrid) VP.renderGrid(relatedGrid, VP.getRelated(p, 4));

    // Recently viewed (excludes current)
    var recentGrid = root.querySelector("[data-recent-grid]");
    var recentSection = root.querySelector("[data-recent-section]");
    var recentSlugs = readRecent().filter(function (s) { return s !== p.slug; }).slice(0, 4);
    var recentProducts = recentSlugs.map(function (s) { return VP.getBySlug(s); }).filter(Boolean);
    if (recentGrid) {
      if (recentProducts.length) { VP.renderGrid(recentGrid, recentProducts); if (recentSection) recentSection.style.display = ""; }
      else if (recentSection) recentSection.style.display = "none";
    }

    injectStructuredData(p, VP);
    if (global.VeloraWishlist) global.VeloraWishlist.sync();
  }

  function injectStructuredData(p, VP) {
    var discount = VP.discountPercent(p.price, p.comparePrice);
    var breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "index.html" },
        { "@type": "ListItem", "position": 2, "name": "Shop", "item": "shop.html" },
        { "@type": "ListItem", "position": 3, "name": p.category, "item": "category.html?cat=" + p.categorySlug },
        { "@type": "ListItem", "position": 4, "name": p.name, "item": "product.html?slug=" + p.slug }
      ]
    };
    var productLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "image": p.image,
      "description": p.description,
      "sku": p.sku,
      "brand": { "@type": "Brand", "name": p.brand },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": p.price,
        "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": "product.html?slug=" + p.slug
      },
      /* Demo-only: aggregateRating below uses this template's own sample rating/review
         data. In production this must be wired to a real review data source. */
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": p.rating,
        "reviewCount": p.reviewCount
      }
    };
    var faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": p.faqs.map(function (f) {
        return { "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } };
      })
    };
    [["ld-breadcrumb", breadcrumbLd], ["ld-product", productLd], ["ld-faq", faqLd]].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (el) el.textContent = JSON.stringify(pair[1], null, 2);
    });
  }

  function initTabs() {
    var nav = document.querySelector(".tab-nav");
    if (!nav) return;
    var buttons = nav.querySelectorAll("button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        document.querySelectorAll(".tab-panel").forEach(function (panel) { panel.classList.remove("is-active"); });
        var target = document.querySelector("[data-tab-panel='" + btn.getAttribute("data-tab") + "']");
        if (target) target.classList.add("is-active");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initQuickView();
    initQuickAdd();
    renderPDP();
    initTabs();
  });
})(window);
