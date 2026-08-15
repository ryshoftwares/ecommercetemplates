/* ==========================================================================
   MODIX — js/search.js
   Search overlay (live suggestions, all pages) + search.html results page.
   Matches against product name, category and description substrings.
   ========================================================================== */

(function () {
  "use strict";

  var data = window.MODIX.data;

  function matchProducts(query) {
    query = (query || "").trim().toLowerCase();
    if (!query) return [];
    var all = data.getAllProducts();
    return all.filter(function (p) {
      var haystack = (p.name + " " + p.category + " " + p.description + " " + p.sku).toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }

  function suggestionCardHTML(product) {
    return (
      '<a class="search-suggestion-card" href="product.html?slug=' + product.slug + '">' +
        '<div class="search-suggestion-card__media"><img src="' + product.image + '" alt="' + product.name + '" width="160" height="160" loading="lazy"></div>' +
        '<div class="search-suggestion-card__name">' + product.name + "</div>" +
        '<div class="search-suggestion-card__price">' + data.formatPrice(product.price) + "</div>" +
      "</a>"
    );
  }

  /* ------------------------------------------------------------------
     Overlay (present on every page via partial markup)
     ------------------------------------------------------------------ */
  function initOverlay() {
    var overlay = document.querySelector(".search-overlay");
    if (!overlay) return;
    var input = overlay.querySelector("[data-search-input]");
    var resultsWrap = overlay.querySelector("[data-search-suggestions]");
    var openBtns = document.querySelectorAll("[data-search-open]");
    var closeBtns = overlay.querySelectorAll("[data-search-close]");

    function open() {
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setTimeout(function () { input.focus(); }, 60);
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
      if (e.key === "/" && !overlay.classList.contains("is-open") && document.activeElement.tagName !== "INPUT") {
        e.preventDefault(); open();
      }
    });

    if (input) {
      input.addEventListener("input", function () {
        var matches = matchProducts(input.value).slice(0, 8);
        if (!input.value.trim()) {
          resultsWrap.innerHTML = defaultSuggestionsHTML();
          return;
        }
        resultsWrap.innerHTML = matches.length
          ? '<p class="search-suggestions__label">Products (' + matches.length + ")</p>" +
            '<div class="search-suggestions__grid">' + matches.slice(0, 4).map(suggestionCardHTML).join("") + "</div>"
          : '<p class="search-suggestions__label">No matches yet — press Enter to see full results</p>';
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
        }
      });
    }

    var form = overlay.querySelector("[data-search-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
      });
    }

    function defaultSuggestionsHTML() {
      var popular = data.getAllProducts().filter(function (p) { return p.badge === "Best Seller"; }).slice(0, 4);
      return (
        '<p class="search-suggestions__label">Popular Right Now</p>' +
        '<div class="search-suggestions__grid">' + popular.map(suggestionCardHTML).join("") + "</div>" +
        '<div class="search-quicklinks">' +
          data.getCategories().map(function (c) { return '<a href="category.html?cat=' + c.slug + '">' + c.name + "</a>"; }).join("") +
        "</div>"
      );
    }
    resultsWrap.innerHTML = defaultSuggestionsHTML();
  }

  /* ------------------------------------------------------------------
     search.html results page
     ------------------------------------------------------------------ */
  function initResultsPage() {
    var root = document.querySelector("[data-search-results-page]");
    if (!root) return;
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = root.querySelector("[data-search-page-input]");
    if (input) input.value = query;

    function render(q) {
      var results = matchProducts(q);
      var qLabel = q ? '"' + q + '"' : "all products";
      root.querySelectorAll("[data-search-query-label]").forEach(function (el) { el.textContent = qLabel; });
      root.querySelector("[data-search-result-count]").textContent = results.length;
      var grid = root.querySelector("[data-search-results-grid]");
      var emptyState = root.querySelector("[data-search-empty]");
      if (!results.length) {
        grid.style.display = "none";
        if (emptyState) emptyState.style.display = "";
      } else {
        grid.style.display = "";
        if (emptyState) emptyState.style.display = "none";
        grid.innerHTML = data.productCardsHTML(results);
      }
    }

    render(query);

    var form = root.querySelector("[data-search-page-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = input.value.trim();
        var url = new URL(window.location.href);
        url.searchParams.set("q", q);
        window.history.replaceState({}, "", url);
        render(q);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initOverlay();
    initResultsPage();
  });
})();
