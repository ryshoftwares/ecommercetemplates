/* ==========================================================================
   ARDEA — js/search.js
   Search overlay with live suggestions (all pages) + search.html results.
   URL convention: search.html?q=<query>
   ========================================================================== */

(function (global) {
  "use strict";

  function matchProduct(product, query) {
    var q = query.trim().toLowerCase();
    if (!q) return false;
    var haystack = [
      product.name, product.category, product.description,
      (product.colors || []).join(" "), product.sku
    ].join(" ").toLowerCase();
    return haystack.indexOf(q) !== -1;
  }

  function searchProducts(query) {
    var data = global.ArdeaData;
    if (!data || !query) return [];
    return data.getAllProducts().filter(function (p) { return matchProduct(p, query); });
  }

  /* ---------------------------------------------------------------------
     Overlay (available on every page)
     --------------------------------------------------------------------- */
  function initOverlay() {
    var overlay = document.querySelector("[data-search-overlay]");
    if (!overlay) return;
    var input = overlay.querySelector("[data-search-input]");
    var suggestBox = overlay.querySelector("[data-search-suggestions]");
    var data = global.ArdeaData;

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
      if (e.target.closest("[data-search-close]")) { close(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
      if ((e.key === "/" || (e.ctrlKey && e.key.toLowerCase() === "k")) && !overlay.classList.contains("is-open") && document.activeElement.tagName !== "INPUT") {
        e.preventDefault(); open();
      }
    });

    if (input && suggestBox) {
      input.addEventListener("input", function () {
        var q = input.value.trim();
        if (!q) { suggestBox.innerHTML = ""; return; }
        var results = searchProducts(q).slice(0, 4);
        if (results.length === 0) {
          suggestBox.innerHTML = '<p class="search-suggest-heading">No products match "' + escapeHTML(q) + '". Try “sofa”, “lamp” or “oak”.</p>';
          return;
        }
        suggestBox.innerHTML =
          '<p class="search-suggest-heading">Suggested Products</p>' +
          '<div class="search-suggest-grid">' + results.map(function (p) { return data.productCardHTML(p, { lazy: false }); }).join("") + "</div>";
      });
      var form = overlay.querySelector("[data-search-form]");
      if (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var q = input.value.trim();
          if (q) window.location.href = "search.html?q=" + encodeURIComponent(q);
        });
      }
    }
  }

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------------------
     search.html results page
     --------------------------------------------------------------------- */
  function initResultsPage() {
    var resultsGrid = document.querySelector("[data-search-results]");
    if (!resultsGrid) return;
    var data = global.ArdeaData;
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    var queryLabel = document.querySelector("[data-search-query-label]");
    var countLabel = document.querySelector("[data-search-count-label]");
    var emptyState = document.querySelector("[data-search-empty]");
    var formInput = document.querySelector("[data-search-page-input]");
    if (formInput) {
      formInput.value = q;
      var pageForm = formInput.closest("form");
      if (pageForm) {
        pageForm.addEventListener("submit", function (e) {
          e.preventDefault();
          var newQ = formInput.value.trim();
          window.location.href = "search.html" + (newQ ? "?q=" + encodeURIComponent(newQ) : "");
        });
      }
    }

    if (!q) {
      resultsGrid.style.display = "none";
      if (emptyState) {
        emptyState.style.display = "block";
        emptyState.querySelector("h2").textContent = "Search Ardea";
        emptyState.querySelector("p").textContent = "Try searching for a room, material or product — “oak”, “lighting”, “sofa”.";
      }
      if (queryLabel) queryLabel.textContent = "";
      return;
    }
    if (queryLabel) queryLabel.textContent = '“' + q + '”';

    var results = searchProducts(q);
    if (countLabel) countLabel.textContent = results.length + (results.length === 1 ? " result" : " results");

    if (results.length === 0) {
      resultsGrid.style.display = "none";
      if (emptyState) {
        emptyState.style.display = "block";
        emptyState.querySelector("h2").textContent = "No results for “" + q + "”";
        emptyState.querySelector("p").textContent = "Check your spelling, or browse by room instead.";
      }
      return;
    }
    resultsGrid.style.display = "";
    if (emptyState) emptyState.style.display = "none";
    resultsGrid.innerHTML = results.map(function (p) { return data.productCardHTML(p); }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initOverlay();
    initResultsPage();
  });

  global.ArdeaSearch = { searchProducts: searchProducts };
})(window);
