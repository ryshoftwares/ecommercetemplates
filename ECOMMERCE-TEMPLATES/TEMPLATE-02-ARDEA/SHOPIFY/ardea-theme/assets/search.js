/* ==========================================================================
   ARDEA — assets/search.js
   Predictive search, ported from the demo's js/search.js but rebuilt on
   Shopify's native predictive search endpoint
   (/search/suggest.json?q=...&resources[type]=product) instead of the
   demo's client-side js/products.js array filter — every suggestion is a
   real, live product. Powers snippets/search-overlay.liquid (every page)
   and hands off full results to sections/main-search.liquid (real
   `search` object + {% paginate %}) via a normal GET to routes.search_url.
   ========================================================================== */

(function (global) {
  "use strict";

  var routes = (global.ArdeaSettings && global.ArdeaSettings.routes) || {};
  var PREDICTIVE_URL = routes.predictiveSearchUrl || "/search/suggest.json";
  var SEARCH_URL = routes.searchUrl || "/search";

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function suggestionCardHTML(product) {
    var priceHTML = product.price
      ? '<span class="price-current">' + product.price + "</span>" +
        (product.compare_at_price_max && product.compare_at_price_max !== product.price
          ? '<span class="price-compare">' + product.compare_at_price_max + "</span>"
          : "")
      : "";
    return (
      '<article class="product-card">' +
        '<div class="product-card__media">' +
          '<a href="' + product.url + '" class="product-card__link">' +
            (product.image
              ? '<img class="product-card__img product-card__img--primary" src="' + product.image + '" alt="' + escapeHTML(product.title) + '" width="600" height="750" loading="lazy">'
              : "") +
          "</a>" +
        "</div>" +
        '<div class="product-card__body">' +
          (product.vendor ? '<p class="product-card__category">' + escapeHTML(product.vendor) + "</p>" : "") +
          '<h3 class="product-card__name"><a href="' + product.url + '">' + escapeHTML(product.title) + "</a></h3>" +
          '<div class="product-card__price">' + priceHTML + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function fetchSuggestions(query) {
    var url = PREDICTIVE_URL + "?q=" + encodeURIComponent(query) + "&resources[type]=product&resources[limit]=4&resources[options][unavailable_products]=last";
    return fetch(url, { headers: { Accept: "application/json" } }).then(function (r) { return r.json(); });
  }

  /* ---------------------------------------------------------------------
     Overlay (snippets/search-overlay.liquid, present on every page)
     --------------------------------------------------------------------- */
  function initOverlay() {
    var overlay = document.querySelector("[data-search-overlay]");
    if (!overlay) return;
    var input = overlay.querySelector("[data-search-input]");
    var suggestBox = overlay.querySelector("[data-search-suggestions]");

    function open() {
      overlay.classList.add("is-open");
      document.body.classList.add("no-scroll");
      setTimeout(function () { input && input.focus(); }, 260);
    }
    function close() {
      overlay.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
    }

    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-search-open]")) { e.preventDefault(); open(); }
      if (e.target.closest("[data-search-close]")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
      if ((e.key === "/" || (e.ctrlKey && e.key.toLowerCase() === "k")) &&
          !overlay.classList.contains("is-open") &&
          document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        open();
      }
    });

    if (input && suggestBox) {
      var debounceTimer;
      input.addEventListener("input", function () {
        var q = input.value.trim();
        clearTimeout(debounceTimer);
        if (!q) { suggestBox.innerHTML = ""; return; }
        debounceTimer = setTimeout(function () {
          fetchSuggestions(q)
            .then(function (data) {
              var products = (data.resources && data.resources.results && data.resources.results.products) || [];
              if (products.length === 0) {
                suggestBox.innerHTML = '<p class="search-suggest-heading">No products match "' + escapeHTML(q) + '". Press Enter to see full results.</p>';
                return;
              }
              suggestBox.innerHTML =
                '<p class="search-suggest-heading">Suggested Products</p>' +
                '<div class="search-suggest-grid">' + products.map(suggestionCardHTML).join("") + "</div>";
              if (global.ArdeaWishlist) global.ArdeaWishlist.syncButtonsUI();
            })
            .catch(function () {});
        }, 200);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initOverlay);

  global.ArdeaSearch = { fetchSuggestions: fetchSuggestions, searchUrl: SEARCH_URL };
})(window);
