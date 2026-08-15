/* ==========================================================================
   NOAÉ (Shopify theme) — Search overlay (live predictive suggestions)
   Ported from the demo's js/search.js. Uses Shopify's native Predictive
   Search API (routes.predictive_search_url) instead of a static in-memory
   product list, so suggestions always reflect real, in-stock catalog data.
   The full results page (sections/main-search.liquid) uses the native
   `search` object server-side and needs no client-side fetch.
   ========================================================================== */

(function (global) {
  "use strict";

  var debounceTimer = null;

  function fmt(cents) {
    return (global.Noae && global.Noae.formatMoney) ? global.Noae.formatMoney(cents) : "₹" + Math.round(cents / 100);
  }

  function suggestionMarkup(product) {
    var price = product.variants && product.variants[0] ? product.variants[0].price : product.price;
    return (
      '<a class="noae-search-suggestion" href="' + product.url + '">' +
        '<img src="' + (product.featured_image ? product.featured_image.url : product.image || "") + '" alt="' + product.title + '" width="52" height="52" loading="lazy">' +
        "<div><strong>" + product.title + "</strong><br><span style=\"font-size:0.8rem;color:var(--color-plum-soft)\">" + (product.type || product.product_type || "") + " · " + fmt(price) + "</span></div>" +
      "</a>"
    );
  }

  function runPredictiveSearch(query, callback) {
    var url = (global.Noae && global.Noae.routes.predictive_search_url) || "/search/suggest";
    var params = new URLSearchParams({
      q: query,
      "resources[type]": "product",
      "resources[limit]": 6,
      "resources[options][unavailable_products]": "last"
    });
    fetch(url + ".json?" + params.toString(), { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var products = (data.resources && data.resources.results && data.resources.results.products) || [];
        callback(products);
      })
      .catch(function () { callback([]); });
  }

  function openOverlay() {
    var overlay = document.getElementById("searchOverlay");
    if (!overlay) return;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var input = document.getElementById("searchInput");
    if (input) setTimeout(function () { input.focus(); }, 60);
  }

  function closeOverlay() {
    var overlay = document.getElementById("searchOverlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function wireOverlay() {
    var overlay = document.getElementById("searchOverlay");
    var input = document.getElementById("searchInput");
    var suggestionsBox = document.getElementById("searchSuggestions");
    var closeBtn = document.getElementById("searchClose");
    var triggers = document.querySelectorAll("[data-search-open]");
    var form = document.getElementById("searchForm");

    triggers.forEach(function (t) { t.addEventListener("click", function (e) { e.preventDefault(); openOverlay(); }); });
    if (closeBtn) closeBtn.addEventListener("click", closeOverlay);
    if (overlay) {
      overlay.addEventListener("click", function (e) { if (e.target === overlay) closeOverlay(); });
    }
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeOverlay(); });

    if (input && suggestionsBox) {
      input.addEventListener("input", function () {
        var query = input.value.trim();
        clearTimeout(debounceTimer);
        if (!query) {
          suggestionsBox.innerHTML = '<p style="color:var(--color-plum-soft);font-size:0.9rem;">Start typing to discover serums, cleansers, and rituals.</p>';
          return;
        }
        debounceTimer = setTimeout(function () {
          runPredictiveSearch(query, function (products) {
            if (!products.length) {
              suggestionsBox.innerHTML = '<p style="color:var(--color-plum-soft);font-size:0.9rem;">No products found for "' + query + '". Try "serum", "hair oil", or "sleep".</p>';
              return;
            }
            suggestionsBox.innerHTML = products.map(suggestionMarkup).join("");
          });
        }, 220);
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        if (!input || !input.value.trim()) e.preventDefault();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", wireOverlay);

  global.Noae = global.Noae || {};
  global.Noae.search = { open: openOverlay, close: closeOverlay, run: runPredictiveSearch };
})(window);
