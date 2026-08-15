/* =========================================================================
   NOAÉ — Shop / Category filtering, sorting, pagination
   Shareable state via URL params: ?cat=&sort=&page=
   ========================================================================= */
(function () {
  "use strict";

  var PAGE_SIZE = 8;

  function init() {
    var grid = document.getElementById("productGrid");
    if (!grid || !window.NoaeProducts) return;

    var lockedCategory = grid.dataset.lockedCategory || null;
    var params = new URLSearchParams(window.location.search);

    var state = {
      categories: new Set(lockedCategory ? [lockedCategory] : (params.get("cat") ? [params.get("cat")] : [])),
      priceMin: null,
      priceMax: null,
      skinTypes: new Set(),
      sizes: new Set(),
      inStockOnly: false,
      minRating: 0,
      sort: params.get("sort") || "featured",
      page: parseInt(params.get("page"), 10) || 1
    };

    var sortSelect = document.getElementById("shopSortSelect");
    if (sortSelect) sortSelect.value = state.sort;

    function getAllProducts() {
      return window.NoaeProducts.all;
    }

    function matchesState(p) {
      if (state.categories.size && !state.categories.has(p.category)) return false;
      if (state.priceMin != null && p.price < state.priceMin) return false;
      if (state.priceMax != null && p.price > state.priceMax) return false;
      if (state.skinTypes.size) {
        var hit = p.skinType.some(function (s) { return state.skinTypes.has(s); });
        if (!hit) return false;
      }
      if (state.sizes.size) {
        var sizeHit = p.variants.some(function (v) { return state.sizes.has(v.size); });
        if (!sizeHit) return false;
      }
      if (state.inStockOnly && p.stock <= 0) return false;
      if (state.minRating && p.rating < state.minRating) return false;
      return true;
    }

    function sortProducts(list) {
      var arr = list.slice();
      switch (state.sort) {
        case "price-asc": arr.sort(function (a, b) { return a.price - b.price; }); break;
        case "price-desc": arr.sort(function (a, b) { return b.price - a.price; }); break;
        case "rating": arr.sort(function (a, b) { return b.rating - a.rating; }); break;
        case "newest": arr.sort(function (a, b) { return (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0) || (parseInt(b.id) - parseInt(a.id)); }); break;
        default: arr.sort(function (a, b) { return (b.badge === "Bestseller" ? 1 : 0) - (a.badge === "Bestseller" ? 1 : 0); });
      }
      return arr;
    }

    function syncUrl() {
      var p = new URLSearchParams(window.location.search);
      if (!lockedCategory) {
        var cats = Array.from(state.categories);
        if (cats.length === 1) p.set("cat", cats[0]); else p.delete("cat");
      }
      if (state.sort && state.sort !== "featured") p.set("sort", state.sort); else p.delete("sort");
      if (state.page > 1) p.set("page", state.page); else p.delete("page");
      var newUrl = window.location.pathname + (p.toString() ? "?" + p.toString() : "");
      history.replaceState(null, "", newUrl);
    }

    function render() {
      var filtered = sortProducts(getAllProducts().filter(matchesState));
      var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      if (state.page > totalPages) state.page = totalPages;
      var start = (state.page - 1) * PAGE_SIZE;
      var pageItems = filtered.slice(start, start + PAGE_SIZE);

      var countEl = document.getElementById("shopResultCount");
      if (countEl) countEl.textContent = filtered.length + (filtered.length === 1 ? " product" : " products");

      var emptyState = document.getElementById("shopEmptyState");
      if (!filtered.length) {
        grid.innerHTML = "";
        if (emptyState) emptyState.classList.remove("noae-hide");
      } else {
        if (emptyState) emptyState.classList.add("noae-hide");
        grid.innerHTML = pageItems.map(function (p) { return window.NoaeProducts.renderProductCard(p); }).join("");
      }

      renderPagination(totalPages);
      syncUrl();
    }

    function renderPagination(totalPages) {
      var el = document.getElementById("shopPagination");
      if (!el) return;
      if (totalPages <= 1) { el.innerHTML = ""; return; }
      var html = "";
      for (var i = 1; i <= totalPages; i++) {
        html += '<button type="button" class="noae-pagination__btn' + (i === state.page ? " is-active" : "") + '" data-page="' + i + '" aria-label="Page ' + i + '"' + (i === state.page ? ' aria-current="page"' : '') + '>' + i + '</button>';
      }
      el.innerHTML = html;
      el.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.page = parseInt(btn.dataset.page, 10);
          render();
          grid.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
        });
      });
    }

    function prefersReducedMotion() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function wireCategoryCheckboxes() {
      if (lockedCategory) return;
      document.querySelectorAll('input[name="category"]').forEach(function (cb) {
        cb.checked = state.categories.has(cb.value);
        cb.addEventListener("change", function () {
          if (cb.checked) state.categories.add(cb.value); else state.categories.delete(cb.value);
          state.page = 1;
          render();
        });
      });
    }

    function wireSkinTypeCheckboxes() {
      document.querySelectorAll('input[name="skinType"]').forEach(function (cb) {
        cb.addEventListener("change", function () {
          if (cb.checked) state.skinTypes.add(cb.value); else state.skinTypes.delete(cb.value);
          state.page = 1;
          render();
        });
      });
    }

    function wireSizeCheckboxes() {
      document.querySelectorAll('input[name="size"]').forEach(function (cb) {
        cb.addEventListener("change", function () {
          if (cb.checked) state.sizes.add(cb.value); else state.sizes.delete(cb.value);
          state.page = 1;
          render();
        });
      });
    }

    function wireAvailability() {
      var cb = document.getElementById("filterInStock");
      if (!cb) return;
      cb.addEventListener("change", function () {
        state.inStockOnly = cb.checked;
        state.page = 1;
        render();
      });
    }

    function wireRating() {
      document.querySelectorAll('input[name="rating"]').forEach(function (radio) {
        radio.addEventListener("change", function () {
          state.minRating = parseFloat(radio.value);
          state.page = 1;
          render();
        });
      });
    }

    function wirePriceRange() {
      var min = document.getElementById("priceMin");
      var max = document.getElementById("priceMax");
      var apply = function () {
        state.priceMin = min && min.value ? parseFloat(min.value) : null;
        state.priceMax = max && max.value ? parseFloat(max.value) : null;
        state.page = 1;
        render();
      };
      if (min) min.addEventListener("change", apply);
      if (max) max.addEventListener("change", apply);
    }

    function wireSort() {
      if (!sortSelect) return;
      sortSelect.addEventListener("change", function () {
        state.sort = sortSelect.value;
        state.page = 1;
        render();
      });
    }

    function wireClear() {
      var clearBtn = document.getElementById("filtersClear");
      if (!clearBtn) return;
      clearBtn.addEventListener("click", function () {
        if (!lockedCategory) state.categories.clear();
        state.priceMin = null; state.priceMax = null;
        state.skinTypes.clear(); state.sizes.clear();
        state.inStockOnly = false; state.minRating = 0;
        document.querySelectorAll('#productFilters input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
        document.querySelectorAll('#productFilters input[type="radio"]').forEach(function (r) { r.checked = false; });
        var minInput = document.getElementById("priceMin"); if (minInput) minInput.value = "";
        var maxInput = document.getElementById("priceMax"); if (maxInput) maxInput.value = "";
        wireCategoryCheckboxes();
        render();
      });
    }

    function wireMobileFilterDrawer() {
      var filtersPanel = document.getElementById("productFilters");
      var openBtn = document.getElementById("filtersOpenMobile");
      var closeBtn = document.getElementById("filtersCloseMobile");
      var overlay = document.getElementById("filtersOverlay");
      if (openBtn && filtersPanel) openBtn.addEventListener("click", function () {
        filtersPanel.classList.add("is-open");
        if (overlay) overlay.classList.add("is-open");
      });
      if (closeBtn && filtersPanel) closeBtn.addEventListener("click", function () {
        filtersPanel.classList.remove("is-open");
        if (overlay) overlay.classList.remove("is-open");
      });
      if (overlay && filtersPanel) overlay.addEventListener("click", function () {
        filtersPanel.classList.remove("is-open");
        overlay.classList.remove("is-open");
      });
    }

    wireCategoryCheckboxes();
    wireSkinTypeCheckboxes();
    wireSizeCheckboxes();
    wireAvailability();
    wireRating();
    wirePriceRange();
    wireSort();
    wireClear();
    wireMobileFilterDrawer();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
