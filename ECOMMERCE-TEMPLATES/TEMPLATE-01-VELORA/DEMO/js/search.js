/* ==========================================================================
   VELORA — Search overlay (header) + search.html results page
   URL convention: search.html?q=<query>
   ========================================================================== */

(function (global) {
  "use strict";

  var POPULAR = ["Dresses", "Wool Coat", "Cashmere", "Accessories", "Sale"];

  function matches(product, query) {
    var q = query.trim().toLowerCase();
    if (!q) return false;
    return (
      product.name.toLowerCase().indexOf(q) !== -1 ||
      product.category.toLowerCase().indexOf(q) !== -1 ||
      product.description.toLowerCase().indexOf(q) !== -1
    );
  }

  function suggestionItemHTML(p) {
    var VP = global.VeloraProducts;
    return (
      '<a class="suggestion-item" href="product.html?slug=' + p.slug + '">' +
        '<img src="' + p.image + '" alt="' + p.imageAlt + '" width="52" height="64" loading="lazy">' +
        '<span><span class="s-name">' + p.name + '</span><span class="s-cat"> · ' + p.category + "</span></span>" +
        '<span class="s-price">' + VP.formatPrice(p.price) + "</span>" +
      "</a>"
    );
  }

  function initOverlay() {
    var overlay = document.querySelector(".search-overlay");
    var openers = document.querySelectorAll("[data-search-open]");
    var closeBtn = document.querySelector("[data-search-close]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-form]");
    if (!overlay || !global.VeloraProducts) return;

    function open(e) {
      if (e) e.preventDefault();
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setTimeout(function () { input.focus(); }, 260);
    }
    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    openers.forEach(function (b) { b.addEventListener("click", open); });
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    if (input) {
      input.addEventListener("input", function () {
        var q = input.value;
        if (!results) return;
        if (!q.trim()) { results.innerHTML = ""; return; }
        var matched = global.VeloraProducts.all().filter(function (p) { return matches(p, q); }).slice(0, 5);
        if (!matched.length) {
          results.innerHTML = '<p class="search-empty-hint">No quick matches for "' + q + '". Press Enter to see full results.</p>';
          return;
        }
        results.innerHTML = matched.map(suggestionItemHTML).join("");
      });
    }
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = input.value.trim();
        window.location.href = "search.html?q=" + encodeURIComponent(q);
      });
    }
    document.querySelectorAll("[data-popular-search]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.location.href = "search.html?q=" + encodeURIComponent(btn.textContent.trim());
      });
    });
  }

  function initResultsPage() {
    var wrap = document.querySelector("[data-search-page]");
    if (!wrap || !global.VeloraProducts) return;
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    var queryLabel = wrap.querySelector("[data-search-query]");
    var input = wrap.querySelector("[data-search-page-input]");
    var grid = wrap.querySelector("[data-search-grid]");
    var emptyEl = wrap.querySelector("[data-search-empty]");
    var countEl = wrap.querySelector("[data-search-count]");

    if (queryLabel) queryLabel.textContent = q ? '"' + q + '"' : "";
    if (input) input.value = q;

    var results = q ? global.VeloraProducts.all().filter(function (p) { return matches(p, q); }) : [];
    if (countEl) countEl.textContent = results.length;

    if (!q || !results.length) {
      if (grid) grid.style.display = "none";
      if (emptyEl) {
        emptyEl.style.display = "";
        var msgEl = emptyEl.querySelector("[data-empty-message]");
        if (msgEl) {
          msgEl.textContent = q ? 'No results for "' + q + '". Try a different search term or browse categories below.' : "Enter a search term above to find products.";
        }
      }
    } else {
      if (grid) { grid.style.display = ""; global.VeloraProducts.renderGrid(grid, results); }
      if (emptyEl) emptyEl.style.display = "none";
    }

    var pageForm = wrap.querySelector("[data-search-page-form]");
    if (pageForm) {
      pageForm.addEventListener("submit", function (e) {
        e.preventDefault();
        window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initOverlay();
    initResultsPage();
  });
})(window);
