/* ==========================================================================
   ARDEA — js/filters.js
   shop.html filtering, sorting and pagination.
   URL convention: shop.html?category=<room-slug>&sort=<key>&page=<n>
   ========================================================================== */

(function (global) {
  "use strict";

  var PAGE_SIZE = 8;

  function init() {
    var grid = document.querySelector("[data-shop-grid]");
    if (!grid) return;
    var data = global.ArdeaData;
    var params = new URLSearchParams(window.location.search);

    var state = {
      rooms: params.get("category") ? [params.get("category")] : [],
      colors: [],
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
      minRating: 0,
      sort: params.get("sort") || "featured",
      page: Number(params.get("page")) || 1
    };

    var roomInputs = document.querySelectorAll("[data-filter-room]");
    var colorInputs = document.querySelectorAll("[data-filter-color]");
    var minPriceInput = document.querySelector("[data-filter-price-min]");
    var maxPriceInput = document.querySelector("[data-filter-price-max]");
    var inStockInput = document.querySelector("[data-filter-instock]");
    var ratingInputs = document.querySelectorAll("[data-filter-rating]");
    var sortSelect = document.querySelector("[data-sort-select]");
    var countLabel = document.querySelector("[data-shop-count]");
    var activeFiltersEl = document.querySelector("[data-active-filters]");
    var paginationEl = document.querySelector("[data-shop-pagination]");
    var clearAllBtn = document.querySelector("[data-filter-clear-all]");
    var emptyState = document.querySelector("[data-shop-empty]");

    roomInputs.forEach(function (input) {
      if (state.rooms.indexOf(input.value) !== -1) input.checked = true;
    });
    if (sortSelect) sortSelect.value = state.sort;

    function getFiltered() {
      var products = data.getAllProducts();
      if (state.rooms.length) {
        products = products.filter(function (p) { return state.rooms.indexOf(p.category) !== -1; });
      }
      if (state.colors.length) {
        products = products.filter(function (p) {
          return (p.colors || []).some(function (c) {
            return state.colors.some(function (sel) { return c.toLowerCase().indexOf(sel.toLowerCase()) !== -1; });
          });
        });
      }
      if (state.minPrice !== null) products = products.filter(function (p) { return p.price >= state.minPrice; });
      if (state.maxPrice !== null) products = products.filter(function (p) { return p.price <= state.maxPrice; });
      if (state.inStockOnly) products = products.filter(function (p) { return p.stock > 0; });
      if (state.minRating > 0) products = products.filter(function (p) { return p.rating >= state.minRating; });
      return products;
    }

    function getSorted(products) {
      var arr = products.slice();
      switch (state.sort) {
        case "price-asc": arr.sort(function (a, b) { return a.price - b.price; }); break;
        case "price-desc": arr.sort(function (a, b) { return b.price - a.price; }); break;
        case "rating": arr.sort(function (a, b) { return b.rating - a.rating; }); break;
        case "newest": arr.sort(function (a, b) { return (b.badge === "New") - (a.badge === "New") || b.id - a.id; }); break;
        default: /* featured: bestsellers first, then id order */
          arr.sort(function (a, b) { return (b.badge === "Bestseller") - (a.badge === "Bestseller"); });
      }
      return arr;
    }

    function syncURL() {
      var p = new URLSearchParams();
      if (state.rooms.length === 1) p.set("category", state.rooms[0]);
      if (state.sort !== "featured") p.set("sort", state.sort);
      if (state.page > 1) p.set("page", String(state.page));
      var qs = p.toString();
      var url = window.location.pathname + (qs ? "?" + qs : "");
      history.replaceState(null, "", url);
    }

    function renderActiveChips() {
      if (!activeFiltersEl) return;
      var chips = [];
      state.rooms.forEach(function (r) {
        var room = data.getRoomBySlug(r);
        chips.push({ label: room ? room.label : r, clear: function () { state.rooms = state.rooms.filter(function (x) { return x !== r; }); } });
      });
      state.colors.forEach(function (c) {
        chips.push({ label: c, clear: function () { state.colors = state.colors.filter(function (x) { return x !== c; }); } });
      });
      if (state.minRating > 0) {
        chips.push({ label: state.minRating + "★ & up", clear: function () { state.minRating = 0; } });
      }
      if (state.inStockOnly) {
        chips.push({ label: "In stock", clear: function () { state.inStockOnly = false; } });
      }
      if (state.minPrice !== null || state.maxPrice !== null) {
        chips.push({
          label: (state.minPrice !== null ? data.formatINR(state.minPrice) : "₹0") + " – " + (state.maxPrice !== null ? data.formatINR(state.maxPrice) : "Any"),
          clear: function () { state.minPrice = null; state.maxPrice = null; if (minPriceInput) minPriceInput.value = ""; if (maxPriceInput) maxPriceInput.value = ""; }
        });
      }
      activeFiltersEl.innerHTML = chips.map(function (chip, i) {
        return '<span class="active-filter-chip" data-chip-index="' + i + '">' + chip.label + '<button type="button" aria-label="Remove filter">×</button></span>';
      }).join("");
      activeFiltersEl.querySelectorAll(".active-filter-chip").forEach(function (el, i) {
        el.querySelector("button").addEventListener("click", function () {
          chips[i].clear();
          syncInputsFromState();
          state.page = 1;
          render();
        });
      });
    }

    function syncInputsFromState() {
      roomInputs.forEach(function (input) { input.checked = state.rooms.indexOf(input.value) !== -1; });
      colorInputs.forEach(function (input) { input.setAttribute("aria-pressed", state.colors.indexOf(input.value) !== -1 ? "true" : "false"); });
      if (inStockInput) inStockInput.checked = state.inStockOnly;
      ratingInputs.forEach(function (input) { input.checked = Number(input.value) === state.minRating; });
    }

    function renderPagination(total) {
      if (!paginationEl) return;
      var pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (state.page > pageCount) state.page = pageCount;
      if (pageCount <= 1) { paginationEl.innerHTML = ""; return; }
      var html = '<button type="button" data-page-prev aria-label="Previous page"' + (state.page === 1 ? " disabled" : "") + ">‹</button>";
      for (var i = 1; i <= pageCount; i++) {
        html += '<button type="button" class="page-num' + (i === state.page ? " is-active" : "") + '" data-page="' + i + '" aria-current="' + (i === state.page ? "true" : "false") + '">' + i + "</button>";
      }
      html += '<button type="button" data-page-next aria-label="Next page"' + (state.page === pageCount ? " disabled" : "") + ">›</button>";
      paginationEl.innerHTML = html;

      paginationEl.querySelectorAll("[data-page]").forEach(function (btn) {
        btn.addEventListener("click", function () { state.page = Number(btn.getAttribute("data-page")); render(true); });
      });
      var prev = paginationEl.querySelector("[data-page-prev]");
      var next = paginationEl.querySelector("[data-page-next]");
      if (prev) prev.addEventListener("click", function () { if (state.page > 1) { state.page--; render(true); } });
      if (next) next.addEventListener("click", function () { if (state.page < pageCount) { state.page++; render(true); } });
    }

    function render(scroll) {
      var filtered = getFiltered();
      var sorted = getSorted(filtered);
      var total = sorted.length;
      var start = (state.page - 1) * PAGE_SIZE;
      var pageItems = sorted.slice(start, start + PAGE_SIZE);

      if (countLabel) countLabel.textContent = total + (total === 1 ? " piece" : " pieces");

      if (total === 0) {
        grid.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
      } else {
        grid.style.display = "";
        if (emptyState) emptyState.style.display = "none";
        grid.innerHTML = pageItems.map(function (p) { return data.productCardHTML(p); }).join("");
      }
      renderPagination(total);
      renderActiveChips();
      syncURL();
      if (scroll) grid.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
    }

    function prefersReduced() {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    roomInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        state.rooms = Array.prototype.filter.call(roomInputs, function (i) { return i.checked; }).map(function (i) { return i.value; });
        state.page = 1;
        render();
      });
    });
    colorInputs.forEach(function (input) {
      input.addEventListener("click", function () {
        var val = input.value;
        var pressed = input.getAttribute("aria-pressed") === "true";
        if (pressed) { state.colors = state.colors.filter(function (c) { return c !== val; }); }
        else { state.colors.push(val); }
        input.setAttribute("aria-pressed", String(!pressed));
        state.page = 1;
        render();
      });
    });
    if (minPriceInput) minPriceInput.addEventListener("change", function () {
      state.minPrice = minPriceInput.value ? Number(minPriceInput.value) : null;
      state.page = 1; render();
    });
    if (maxPriceInput) maxPriceInput.addEventListener("change", function () {
      state.maxPrice = maxPriceInput.value ? Number(maxPriceInput.value) : null;
      state.page = 1; render();
    });
    if (inStockInput) inStockInput.addEventListener("change", function () {
      state.inStockOnly = inStockInput.checked; state.page = 1; render();
    });
    ratingInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        state.minRating = input.checked ? Number(input.value) : 0;
        state.page = 1; render();
      });
    });
    if (sortSelect) sortSelect.addEventListener("change", function () {
      state.sort = sortSelect.value; state.page = 1; render();
    });
    if (clearAllBtn) clearAllBtn.addEventListener("click", function () {
      state = { rooms: [], colors: [], minPrice: null, maxPrice: null, inStockOnly: false, minRating: 0, sort: "featured", page: 1 };
      if (minPriceInput) minPriceInput.value = "";
      if (maxPriceInput) maxPriceInput.value = "";
      if (sortSelect) sortSelect.value = "featured";
      syncInputsFromState();
      render();
    });

    document.querySelectorAll("[data-filter-group-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.closest(".filter-group").classList.toggle("is-collapsed");
      });
    });

    syncInputsFromState();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})(window);
