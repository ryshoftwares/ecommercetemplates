/* ==========================================================================
   VELORA — Shop Page Filtering, Sorting & Pagination
   URL convention: shop.html?cat=<category-slug> pre-selects a category filter.
   ========================================================================== */

(function (global) {
  "use strict";

  var PAGE_SIZE = 8;

  function initShopPage() {
    var root = document.querySelector("[data-shop-page]");
    if (!root || !global.VeloraProducts) return;

    var VP = global.VeloraProducts;
    var all = VP.all();
    var maxPrice = Math.max.apply(null, all.map(function (p) { return p.comparePrice || p.price; }));

    var state = {
      categories: [],
      sizes: [],
      colors: [],
      minRating: 0,
      inStockOnly: false,
      maxPriceVal: maxPrice,
      sort: "featured",
      page: 1
    };

    var params = new URLSearchParams(window.location.search);
    var presetCat = params.get("cat");
    if (presetCat) state.categories = [presetCat];

    var grid = root.querySelector("[data-product-grid]");
    var resultCount = root.querySelector("[data-result-count]");
    var chipsWrap = root.querySelector("[data-active-chips]");
    var pagination = root.querySelector("[data-pagination]");
    var sortSelect = root.querySelector("[data-sort-select]");
    var priceRange = root.querySelector("[data-price-range]");
    var priceOutput = root.querySelector("[data-price-output]");

    // Populate price range control bounds
    if (priceRange) {
      priceRange.max = maxPrice;
      priceRange.value = maxPrice;
      if (priceOutput) priceOutput.textContent = VP.formatPrice(maxPrice);
    }

    function applyFilters() {
      var list = all.filter(function (p) {
        if (state.categories.length && state.categories.indexOf(p.categorySlug) === -1) return false;
        if (state.sizes.length && !p.sizes.some(function (s) { return state.sizes.indexOf(s) !== -1; })) return false;
        if (state.colors.length && !p.colors.some(function (c) { return state.colors.indexOf(c) !== -1; })) return false;
        if (state.minRating && p.rating < state.minRating) return false;
        if (state.inStockOnly && p.stock <= 0) return false;
        if (p.price > state.maxPriceVal) return false;
        return true;
      });

      switch (state.sort) {
        case "price-asc": list.sort(function (a, b) { return a.price - b.price; }); break;
        case "price-desc": list.sort(function (a, b) { return b.price - a.price; }); break;
        case "rating": list.sort(function (a, b) { return b.rating - a.rating; }); break;
        case "newest": list.sort(function (a, b) { return b.id - a.id; }); break;
        default: break; // featured = data order
      }
      return list;
    }

    function renderChips() {
      if (!chipsWrap) return;
      var chips = [];
      state.categories.forEach(function (c) {
        chips.push({ label: c.charAt(0).toUpperCase() + c.slice(1), type: "cat", value: c });
      });
      state.colors.forEach(function (c) { chips.push({ label: c, type: "color", value: c }); });
      state.sizes.forEach(function (s) { chips.push({ label: "Size " + s, type: "size", value: s }); });
      if (state.minRating) chips.push({ label: state.minRating + "★ & up", type: "rating", value: state.minRating });
      if (state.inStockOnly) chips.push({ label: "In stock", type: "stock", value: true });

      chipsWrap.innerHTML = chips.map(function (c) {
        return '<span class="chip" data-chip-type="' + c.type + '" data-chip-value="' + c.value + '">' + c.label + ' <button type="button" aria-label="Remove filter">&times;</button></span>';
      }).join("");
    }

    function render() {
      var filtered = applyFilters();
      var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      if (state.page > totalPages) state.page = totalPages;
      var start = (state.page - 1) * PAGE_SIZE;
      var pageItems = filtered.slice(start, start + PAGE_SIZE);

      VP.renderGrid(grid, pageItems);
      if (resultCount) resultCount.textContent = filtered.length + (filtered.length === 1 ? " result" : " results");
      renderChips();
      renderPagination(totalPages);

      // re-run reveal + wishlist sync for freshly injected cards
      if (global.VeloraWishlist) global.VeloraWishlist.sync();
      grid.querySelectorAll(".product-card").forEach(function (c) { c.classList.add("is-visible"); });
    }

    function renderPagination(totalPages) {
      if (!pagination) return;
      if (totalPages <= 1) { pagination.innerHTML = ""; return; }
      var html = "";
      html += '<button type="button" data-page="' + Math.max(1, state.page - 1) + '" aria-label="Previous page">&laquo;</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button type="button" data-page="' + i + '" class="' + (i === state.page ? "is-active" : "") + '">' + i + "</button>";
      }
      html += '<button type="button" data-page="' + Math.min(totalPages, state.page + 1) + '" aria-label="Next page">&raquo;</button>';
      pagination.innerHTML = html;
    }

    // --- Bind filter controls ---
    root.querySelectorAll("[data-filter-category]").forEach(function (cb) {
      if (state.categories.indexOf(cb.value) !== -1) cb.checked = true;
      cb.addEventListener("change", function () {
        state.categories = Array.from(root.querySelectorAll("[data-filter-category]:checked")).map(function (c) { return c.value; });
        state.page = 1; render();
      });
    });
    root.querySelectorAll("[data-filter-size]").forEach(function (el) {
      el.addEventListener("click", function () {
        el.classList.toggle("is-selected");
        state.sizes = Array.from(root.querySelectorAll("[data-filter-size].is-selected")).map(function (c) { return c.getAttribute("data-value"); });
        state.page = 1; render();
      });
    });
    root.querySelectorAll("[data-filter-color]").forEach(function (el) {
      el.addEventListener("click", function () {
        el.classList.toggle("is-selected");
        state.colors = Array.from(root.querySelectorAll("[data-filter-color].is-selected")).map(function (c) { return c.getAttribute("data-value"); });
        state.page = 1; render();
      });
    });
    root.querySelectorAll("[data-filter-rating]").forEach(function (radio) {
      radio.addEventListener("change", function () {
        state.minRating = parseFloat(radio.value);
        state.page = 1; render();
      });
    });
    var stockCb = root.querySelector("[data-filter-stock]");
    if (stockCb) stockCb.addEventListener("change", function () { state.inStockOnly = stockCb.checked; state.page = 1; render(); });

    if (priceRange) {
      priceRange.addEventListener("input", function () {
        state.maxPriceVal = parseInt(priceRange.value, 10);
        if (priceOutput) priceOutput.textContent = VP.formatPrice(state.maxPriceVal);
        state.page = 1; render();
      });
    }
    if (sortSelect) sortSelect.addEventListener("change", function () { state.sort = sortSelect.value; render(); });

    if (pagination) {
      pagination.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        state.page = parseInt(btn.getAttribute("data-page"), 10);
        render();
        var top = root.querySelector("[data-scroll-top]");
        if (top) top.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    if (chipsWrap) {
      chipsWrap.addEventListener("click", function (e) {
        var chip = e.target.closest(".chip");
        if (!chip || !e.target.closest("button")) return;
        var type = chip.getAttribute("data-chip-type");
        var value = chip.getAttribute("data-chip-value");
        if (type === "cat") {
          state.categories = state.categories.filter(function (c) { return c !== value; });
          var cb = root.querySelector('[data-filter-category][value="' + value + '"]');
          if (cb) cb.checked = false;
        } else if (type === "color") {
          state.colors = state.colors.filter(function (c) { return c !== value; });
          var sw = root.querySelector('[data-filter-color][data-value="' + value + '"]');
          if (sw) sw.classList.remove("is-selected");
        } else if (type === "size") {
          state.sizes = state.sizes.filter(function (s) { return s !== value; });
          var szEl = root.querySelectorAll('[data-filter-size]');
          szEl.forEach(function (el) { if (el.getAttribute("data-value") === value) el.classList.remove("is-selected"); });
        } else if (type === "rating") {
          state.minRating = 0;
          root.querySelectorAll("[data-filter-rating]").forEach(function (r) { r.checked = false; });
        } else if (type === "stock") {
          state.inStockOnly = false;
          if (stockCb) stockCb.checked = false;
        }
        state.page = 1; render();
      });
    }

    var clearBtn = root.querySelector("[data-clear-filters]");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        state = { categories: [], sizes: [], colors: [], minRating: 0, inStockOnly: false, maxPriceVal: maxPrice, sort: "featured", page: 1 };
        root.querySelectorAll("[data-filter-category]").forEach(function (c) { c.checked = false; });
        root.querySelectorAll("[data-filter-size], [data-filter-color]").forEach(function (c) { c.classList.remove("is-selected"); });
        root.querySelectorAll("[data-filter-rating]").forEach(function (r) { r.checked = false; });
        if (stockCb) stockCb.checked = false;
        if (priceRange) { priceRange.value = maxPrice; if (priceOutput) priceOutput.textContent = VP.formatPrice(maxPrice); }
        if (sortSelect) sortSelect.value = "featured";
        render();
      });
    }

    // Mobile filter drawer — reuses the single .filters-aside node (see style.css)
    var drawer = root.querySelector(".filters-aside");
    var drawerBackdrop = document.querySelector("[data-filter-drawer-backdrop]");
    var drawerTrigger = root.querySelector("[data-filter-drawer-open]");
    var drawerClose = root.querySelector("[data-filter-drawer-close]");
    if (drawer && drawerTrigger) {
      drawerTrigger.addEventListener("click", function () {
        drawer.classList.add("is-drawer-open");
        if (drawerBackdrop) drawerBackdrop.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
      var closeDrawer = function () {
        drawer.classList.remove("is-drawer-open");
        if (drawerBackdrop) drawerBackdrop.classList.remove("is-open");
        document.body.style.overflow = "";
      };
      if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
      if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);
      var applyBtn = root.querySelector("[data-filter-drawer-apply]");
      if (applyBtn) applyBtn.addEventListener("click", closeDrawer);
    }

    // Collapsible filter groups
    root.querySelectorAll(".filter-group h4").forEach(function (h) {
      h.addEventListener("click", function () { h.parentElement.classList.toggle("is-collapsed"); });
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", initShopPage);
})(window);
