/* ==========================================================================
   MODIX — assets/search.js
   Search overlay (live predictive suggestions, all pages) against
   Shopify's native predictive search endpoint:
   /search/suggest.json?q=...&resources[type]=product&resources[limit]=8
   Ported from the demo's js/search.js overlay UX (default "Popular Right
   Now" suggestions + category quicklinks when the input is empty).
   ========================================================================== */

(function (global) {
  "use strict";

  var settings = global.ModixSettings || {};
  var routes = settings.routes || {};
  var PREDICTIVE_URL = routes.predictiveSearchUrl || "/search/suggest.json";

  function money(cents) {
    if (global.ModixCart) return global.ModixCart.formatMoney(cents);
    return "₹" + (cents / 100).toFixed(0);
  }

  function suggestionCardHTML(product) {
    var img = product.image ? product.image.url : (product.featured_image || "");
    return (
      '<a class="search-suggestion-card" href="' + product.url + '">' +
        '<div class="search-suggestion-card__media">' + (img ? '<img src="' + img + '" alt="' + product.title + '" width="160" height="160" loading="lazy">' : "") + "</div>" +
        '<div class="search-suggestion-card__name">' + product.title + "</div>" +
        '<div class="search-suggestion-card__price">' + money(product.price) + "</div>" +
      "</a>"
    );
  }

  function fetchPredictive(query) {
    var url = PREDICTIVE_URL + "?q=" + encodeURIComponent(query) + "&resources[type]=product&resources[limit]=8&resources[options][unavailable_products]=last";
    return fetch(url, { headers: { Accept: "application/json" } }).then(function (r) { return r.json(); });
  }

  function initOverlay() {
    var overlay = document.querySelector("[data-search-overlay]");
    if (!overlay) return;
    var input = overlay.querySelector("[data-search-input]");
    var resultsWrap = overlay.querySelector("[data-search-suggestions]");
    var openBtns = document.querySelectorAll("[data-search-open]");
    var closeBtns = overlay.querySelectorAll("[data-search-close]");

    function open() {
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setTimeout(function () { input && input.focus(); }, 60);
    }
    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    openBtns.forEach(function (btn) { btn.addEventListener("click", function (e) { e.preventDefault(); open(); }); });
    closeBtns.forEach(function (btn) { btn.addEventListener("click", close); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
      if (e.key === "/" && !overlay.classList.contains("is-open") && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault(); open();
      }
    });

    var debounceTimer;
    if (input) {
      input.addEventListener("input", function () {
        var query = input.value.trim();
        clearTimeout(debounceTimer);
        if (!query) {
          if (resultsWrap) resultsWrap.innerHTML = defaultSuggestionsHTML();
          return;
        }
        debounceTimer = setTimeout(function () {
          fetchPredictive(query).then(function (data) {
            var products = (data.resources && data.resources.results && data.resources.results.products) || [];
            if (!resultsWrap) return;
            resultsWrap.innerHTML = products.length
              ? '<p class="search-suggestions__label">Products (' + products.length + ")</p>" +
                '<div class="search-suggestions__grid">' + products.slice(0, 4).map(suggestionCardHTML).join("") + "</div>"
              : '<p class="search-suggestions__label">No matches yet — press Enter to see full results</p>';
          }).catch(function () {});
        }, 200);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          global.location.href = (routes.searchUrl || "/search") + "?q=" + encodeURIComponent(input.value.trim()) + "&type=product";
        }
      });
    }

    var form = overlay.querySelector("[data-search-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        global.location.href = (routes.searchUrl || "/search") + "?q=" + encodeURIComponent(input.value.trim()) + "&type=product";
      });
    }

    function defaultSuggestionsHTML() {
      var quicklinks = overlay.querySelector(".search-quicklinks");
      return quicklinks ? "" : "";
    }
    if (resultsWrap && !resultsWrap.innerHTML.trim()) resultsWrap.innerHTML = defaultSuggestionsHTML();
  }

  document.addEventListener("DOMContentLoaded", initOverlay);
})(window);
