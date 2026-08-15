/* ==========================================================================
   VELORA (Shopify theme) — Predictive search
   Ported from the demo's js/search.js, rewired from the static client-side
   product dataset onto Shopify's native predictive search endpoint:
     GET /search/suggest.json?q=<term>&resources[type]=product&resources[limit]=5
   Powers the header search overlay (snippets/search-overlay.liquid); the
   full results page (sections/main-search.liquid) is server-rendered from
   the real `search` object and needs no JS to function.
   ========================================================================== */

(function (global) {
  "use strict";

  var DEBOUNCE_MS = 200;
  var predictiveUrl = (global.Velora && global.Velora.routes && global.Velora.routes.predictive_search_url) || "/search/suggest.json";

  function fmt(cents) {
    return (global.Velora && global.Velora.formatMoney) ? global.Velora.formatMoney(cents) : "₹" + Math.round(cents / 100);
  }

  function suggestionItemHTML(p) {
    return (
      '<a class="suggestion-item" href="' + p.url + '">' +
        '<img src="' + (p.image ? p.image.replace(/(\.[a-zA-Z0-9]+)(\?.*)?$/, "_104x$1$2") : "") + '" alt="' + p.title + '" width="52" height="64" loading="lazy">' +
        '<span><span class="s-name">' + p.title + "</span></span>" +
        '<span class="s-price">' + fmt(p.price) + "</span>" +
      "</a>"
    );
  }

  function initOverlay() {
    var overlay = document.querySelector("[data-search-overlay]");
    var openers = document.querySelectorAll("[data-search-open]");
    var closeBtn = document.querySelector("[data-search-close]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    if (!overlay) return;

    function open(e) {
      if (e) e.preventDefault();
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setTimeout(function () { if (input) input.focus(); }, 260);
    }
    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    openers.forEach(function (b) { b.addEventListener("click", open); });
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    var debounceTimer;
    if (input) {
      input.addEventListener("input", function () {
        var q = input.value;
        clearTimeout(debounceTimer);
        if (!results) return;
        if (!q.trim()) { results.innerHTML = ""; return; }
        debounceTimer = setTimeout(function () { fetchSuggestions(q, results); }, DEBOUNCE_MS);
      });
    }

    document.querySelectorAll("[data-popular-search]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.location.href = "/search?q=" + encodeURIComponent(btn.textContent.trim()) + "&type=product";
      });
    });

    global.Velora = global.Velora || {};
    global.Velora.searchOverlay = { open: open, close: close };
  }

  function fetchSuggestions(query, results) {
    var url = predictiveUrl + "?q=" + encodeURIComponent(query) + "&resources[type]=product&resources[limit]=5&resources[options][unavailable_products]=last";
    fetch(url, { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var products = (data.resources && data.resources.results && data.resources.results.products) || [];
        if (!products.length) {
          results.innerHTML = '<p class="search-empty-hint">No quick matches for "' + query.replace(/</g, "&lt;") + '". Press Enter to see full results.</p>';
          return;
        }
        results.innerHTML = products.map(suggestionItemHTML).join("");
      })
      .catch(function () {
        results.innerHTML = "";
      });
  }

  document.addEventListener("DOMContentLoaded", initOverlay);
})(window);
