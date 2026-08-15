/* =========================================================================
   NOAÉ — Search overlay (live suggestions) + search.html results
   ========================================================================= */
(function () {
  "use strict";

  function matches(product, query) {
    var q = query.toLowerCase();
    return (
      product.name.toLowerCase().indexOf(q) !== -1 ||
      product.category.toLowerCase().indexOf(q) !== -1 ||
      product.description.toLowerCase().indexOf(q) !== -1 ||
      product.keyIngredients.join(" ").toLowerCase().indexOf(q) !== -1
    );
  }

  function runSearch(query) {
    if (!window.NoaeProducts || !query) return [];
    return window.NoaeProducts.all.filter(function (p) { return matches(p, query); });
  }

  function suggestionMarkup(product) {
    return (
      '<a class="noae-search-suggestion" href="product.html?slug=' + product.slug + '">' +
        '<img src="' + product.image + '" alt="' + product.name + '" width="52" height="52" loading="lazy">' +
        '<div><strong>' + product.name + '</strong><br><span style="font-size:0.8rem;color:var(--color-plum-soft)">' + product.category + ' · ' + window.NoaeProducts.formatPrice(product.price) + '</span></div>' +
      '</a>'
    );
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
    var triggers = document.querySelectorAll(".js-search-open");
    var form = document.getElementById("searchForm");

    triggers.forEach(function (t) { t.addEventListener("click", openOverlay); });
    if (closeBtn) closeBtn.addEventListener("click", closeOverlay);
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeOverlay();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeOverlay();
    });

    if (input && suggestionsBox) {
      input.addEventListener("input", function () {
        var query = input.value.trim();
        if (!query) { suggestionsBox.innerHTML = '<p style="color:var(--color-plum-soft);font-size:0.9rem;">Start typing to discover serums, cleansers, and rituals.</p>'; return; }
        var results = runSearch(query).slice(0, 6);
        if (!results.length) {
          suggestionsBox.innerHTML = '<p style="color:var(--color-plum-soft);font-size:0.9rem;">No products found for "' + query + '". Try "serum", "hair oil", or "sleep".</p>';
          return;
        }
        suggestionsBox.innerHTML = results.map(suggestionMarkup).join("");
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var query = input ? input.value.trim() : "";
        window.location.href = "search.html?q=" + encodeURIComponent(query);
      });
    }
  }

  function renderResultsPage() {
    var grid = document.getElementById("searchResultsGrid");
    if (!grid) return;
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var heading = document.getElementById("searchQueryHeading");
    var input = document.getElementById("searchPageInput");
    if (input) input.value = query;

    var results = query ? runSearch(query) : [];
    if (heading) {
      heading.textContent = query ? 'Search results for "' + query + '"' : "Search NOAÉ";
    }

    var emptyState = document.getElementById("searchEmptyState");
    var countEl = document.getElementById("searchResultCount");

    if (!query) {
      grid.innerHTML = "";
      if (emptyState) emptyState.classList.add("noae-hide");
      if (countEl) countEl.textContent = "";
      return;
    }

    if (!results.length) {
      grid.innerHTML = "";
      if (emptyState) emptyState.classList.remove("noae-hide");
      if (countEl) countEl.textContent = "0 results";
      return;
    }

    if (emptyState) emptyState.classList.add("noae-hide");
    if (countEl) countEl.textContent = results.length + (results.length === 1 ? " result" : " results");
    grid.innerHTML = results.map(function (p) { return window.NoaeProducts.renderProductCard(p); }).join("");
  }

  function wireResultsForm() {
    var form = document.getElementById("searchPageForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("searchPageInput");
      window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireOverlay();
    renderResultsPage();
    wireResultsForm();
  });

  window.NoaeSearch = { open: openOverlay, close: closeOverlay, run: runSearch };
})();
