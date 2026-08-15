/* ==========================================================================
   MODIX — js/filters.js
   shop.html filtering, sorting and pagination.
   URL convention: shop.html?category=audio&category=laptops&color=Charcoal
                   &price=under-5000&rating=4&compat=android&stock=in
                   &sort=price-asc&page=2
   Every filter/sort/page change updates the URL via history.replaceState so
   results are shareable and back/forward-navigable.
   ========================================================================== */

(function () {
  "use strict";

  var data = window.MODIX.data;
  var PAGE_SIZE = 8;

  var PRICE_BANDS = {
    "under-5000": function (p) { return p.price < 5000; },
    "5000-20000": function (p) { return p.price >= 5000 && p.price < 20000; },
    "20000-75000": function (p) { return p.price >= 20000 && p.price < 75000; },
    "over-75000": function (p) { return p.price >= 75000; }
  };

  function initShopPage() {
    var root = document.querySelector("[data-shop-page]");
    if (!root) return;

    var allProducts = data.getAllProducts();
    var allColors = uniqueColors(allProducts);

    var els = {
      grid: root.querySelector("[data-shop-grid]"),
      count: root.querySelector("[data-shop-count]"),
      sort: root.querySelector("[data-shop-sort]"),
      pagination: root.querySelector("[data-shop-pagination]"),
      tags: root.querySelector("[data-shop-filter-tags]"),
      emptyState: root.querySelector("[data-shop-empty]"),
      categoryGroup: root.querySelector("[data-filter-category]"),
      colorGroup: root.querySelector("[data-filter-color]"),
      ratingGroup: root.querySelector("[data-filter-rating]"),
      priceGroup: root.querySelector("[data-filter-price]"),
      compatGroup: root.querySelector("[data-filter-compat]"),
      stockGroup: root.querySelector("[data-filter-stock]"),
      clearBtn: root.querySelector("[data-filters-clear]"),
      sidebar: root.querySelector(".filters-sidebar"),
      mobileToggle: root.querySelector("[data-mobile-filter-toggle]"),
      drawerClose: root.querySelector("[data-filters-drawer-close]"),
      drawerScrim: root.querySelector("[data-filters-scrim]")
    };

    buildCategoryOptions(els.categoryGroup, allProducts);
    buildColorOptions(els.colorGroup, allColors);

    function buildCategoryOptions(container, products) {
      if (!container) return;
      var counts = {};
      products.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
      container.innerHTML = data.getCategories().map(function (c) {
        return (
          '<label class="checkbox-row"><input type="checkbox" name="category" value="' + c.slug + '"> ' +
          c.name + ' <span class="mono" style="margin-left:auto;color:var(--text-muted);font-size:12px;">' + (counts[c.slug] || 0) + "</span></label>"
        );
      }).join("");
    }

    function buildColorOptions(container, colors) {
      if (!container) return;
      container.innerHTML = '<div class="filter-swatches">' + colors.map(function (c) {
        return '<button type="button" class="filter-swatch" data-color="' + c.name + '" style="background:' + c.hex + '" title="' + c.name + '" aria-label="Filter by ' + c.name + '"></button>';
      }).join("") + "</div>";
    }

    function uniqueColors(products) {
      var seen = {}, out = [];
      products.forEach(function (p) {
        (p.colors || []).forEach(function (c) {
          if (!seen[c.name]) { seen[c.name] = true; out.push(c); }
        });
      });
      return out;
    }

    function getState() {
      var params = new URLSearchParams(window.location.search);
      return {
        category: params.getAll("category"),
        color: params.getAll("color"),
        price: params.getAll("price"),
        rating: params.get("rating") || "",
        compat: params.get("compat") || "",
        stock: params.get("stock") || "",
        sort: params.get("sort") || "featured",
        page: Number(params.get("page") || 1)
      };
    }

    function setState(state, pushPage) {
      var params = new URLSearchParams();
      state.category.forEach(function (v) { params.append("category", v); });
      state.color.forEach(function (v) { params.append("color", v); });
      state.price.forEach(function (v) { params.append("price", v); });
      if (state.rating) params.set("rating", state.rating);
      if (state.compat) params.set("compat", state.compat);
      if (state.stock) params.set("stock", state.stock);
      if (state.sort && state.sort !== "featured") params.set("sort", state.sort);
      if (state.page && state.page > 1) params.set("page", state.page);
      var url = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
      window.history.replaceState({}, "", url);
    }

    function applyStateToControls(state) {
      root.querySelectorAll('[data-filter-category] input[type=checkbox]').forEach(function (cb) {
        cb.checked = state.category.indexOf(cb.value) !== -1;
      });
      root.querySelectorAll('[data-filter-price] input[type=checkbox]').forEach(function (cb) {
        cb.checked = state.price.indexOf(cb.value) !== -1;
      });
      root.querySelectorAll('[data-filter-color] .filter-swatch').forEach(function (sw) {
        sw.classList.toggle("is-active", state.color.indexOf(sw.dataset.color) !== -1);
      });
      root.querySelectorAll('[data-filter-rating] input[type=radio]').forEach(function (r) {
        r.checked = r.value === state.rating;
      });
      root.querySelectorAll('[data-filter-compat] input[type=checkbox]').forEach(function (cb) {
        cb.checked = cb.value === state.compat;
      });
      root.querySelectorAll('[data-filter-stock] input[type=checkbox]').forEach(function (cb) {
        cb.checked = state.stock === "in";
      });
      if (els.sort) els.sort.value = state.sort;
    }

    function filterProducts(state) {
      var list = allProducts.slice();
      if (state.category.length) list = list.filter(function (p) { return state.category.indexOf(p.category) !== -1; });
      if (state.color.length) list = list.filter(function (p) { return (p.colors || []).some(function (c) { return state.color.indexOf(c.name) !== -1; }); });
      if (state.price.length) {
        list = list.filter(function (p) { return state.price.some(function (band) { return PRICE_BANDS[band] && PRICE_BANDS[band](p); }); });
      }
      if (state.rating) {
        var min = Number(state.rating);
        list = list.filter(function (p) { return p.rating >= min; });
      }
      if (state.compat) {
        list = list.filter(function (p) {
          var specs = p.specifications || [];
          return specs.some(function (s) { return /compat/i.test(s.label) && s.value.toLowerCase().indexOf(state.compat) !== -1; });
        });
      }
      if (state.stock === "in") list = list.filter(function (p) { return p.stock > 0; });
      return list;
    }

    function sortProducts(list, sort) {
      var out = list.slice();
      switch (sort) {
        case "price-asc": out.sort(function (a, b) { return a.price - b.price; }); break;
        case "price-desc": out.sort(function (a, b) { return b.price - a.price; }); break;
        case "rating-desc": out.sort(function (a, b) { return b.rating - a.rating; }); break;
        case "newest": out.sort(function (a, b) { return b.id - a.id; }); break;
        default: break; /* featured: dataset order */
      }
      return out;
    }

    function renderTags(state) {
      if (!els.tags) return;
      var tags = [];
      state.category.forEach(function (v) { var c = data.getCategoryBySlug(v); tags.push({ type: "category", value: v, label: c ? c.name : v }); });
      state.color.forEach(function (v) { tags.push({ type: "color", value: v, label: v }); });
      state.price.forEach(function (v) { tags.push({ type: "price", value: v, label: priceLabel(v) }); });
      if (state.rating) tags.push({ type: "rating", value: state.rating, label: state.rating + "★ & up" });
      if (state.compat) tags.push({ type: "compat", value: state.compat, label: state.compat });
      if (state.stock === "in") tags.push({ type: "stock", value: "in", label: "In Stock" });

      els.tags.innerHTML = tags.map(function (t) {
        return (
          '<span class="filter-tag" data-tag-type="' + t.type + '" data-tag-value="' + t.value + '">' + t.label +
          '<button type="button" aria-label="Remove filter ' + t.label + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg></button></span>'
        );
      }).join("");
    }

    function priceLabel(band) {
      return { "under-5000": "Under ₹5,000", "5000-20000": "₹5,000–₹20,000", "20000-75000": "₹20,000–₹75,000", "over-75000": "Over ₹75,000" }[band] || band;
    }

    function renderPagination(totalItems, page) {
      if (!els.pagination) return;
      var pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
      if (pageCount <= 1) { els.pagination.innerHTML = ""; return; }
      var html = "";
      for (var i = 1; i <= pageCount; i++) {
        html += '<button type="button" data-page="' + i + '" class="' + (i === page ? "is-active" : "") + '" aria-current="' + (i === page ? "true" : "false") + '">' + i + "</button>";
      }
      els.pagination.innerHTML = html;
    }

    function render() {
      var state = getState();
      applyStateToControls(state);
      var filtered = filterProducts(state);
      var sorted = sortProducts(filtered, state.sort);
      var pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
      var page = Math.min(Math.max(1, state.page), pageCount);
      var pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

      if (els.count) els.count.textContent = sorted.length + (sorted.length === 1 ? " product" : " products");
      renderTags(state);

      if (!pageItems.length) {
        els.grid.style.display = "none";
        if (els.emptyState) els.emptyState.style.display = "";
        if (els.pagination) els.pagination.innerHTML = "";
      } else {
        els.grid.style.display = "";
        if (els.emptyState) els.emptyState.style.display = "none";
        els.grid.innerHTML = data.productCardsHTML(pageItems);
        renderPagination(sorted.length, page);
      }
      window.MODIX.wishlist && window.MODIX.wishlist.renderWishlistPage && updateWishlistIcons();
    }

    function updateWishlistIcons() {
      var wl = window.MODIX.wishlist.readWishlist();
      root.querySelectorAll("[data-wishlist-toggle]").forEach(function (btn) {
        var active = wl.indexOf(Number(btn.dataset.id)) !== -1;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function updateFromControls(pageReset) {
      var state = getState();
      state.category = Array.from(root.querySelectorAll('[data-filter-category] input:checked')).map(function (i) { return i.value; });
      state.price = Array.from(root.querySelectorAll('[data-filter-price] input:checked')).map(function (i) { return i.value; });
      var ratingChecked = root.querySelector('[data-filter-rating] input:checked');
      state.rating = ratingChecked ? ratingChecked.value : "";
      var compatChecked = root.querySelector('[data-filter-compat] input:checked');
      state.compat = compatChecked ? compatChecked.value : "";
      var stockChecked = root.querySelector('[data-filter-stock] input:checked');
      state.stock = stockChecked ? "in" : "";
      if (els.sort) state.sort = els.sort.value;
      if (pageReset) state.page = 1;
      setState(state);
      render();
    }

    root.addEventListener("change", function (e) {
      if (e.target.closest("[data-filter-category], [data-filter-price], [data-filter-rating], [data-filter-compat], [data-filter-stock]")) {
        updateFromControls(true);
      }
      if (e.target === els.sort) updateFromControls(true);
    });

    if (els.colorGroup) {
      els.colorGroup.addEventListener("click", function (e) {
        var sw = e.target.closest(".filter-swatch");
        if (!sw) return;
        var state = getState();
        var color = sw.dataset.color;
        var idx = state.color.indexOf(color);
        if (idx === -1) state.color.push(color); else state.color.splice(idx, 1);
        state.page = 1;
        setState(state);
        render();
      });
    }

    if (els.tags) {
      els.tags.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        var tag = btn.closest(".filter-tag");
        var state = getState();
        var type = tag.dataset.tagType, value = tag.dataset.tagValue;
        if (type === "category") state.category = state.category.filter(function (v) { return v !== value; });
        if (type === "color") state.color = state.color.filter(function (v) { return v !== value; });
        if (type === "price") state.price = state.price.filter(function (v) { return v !== value; });
        if (type === "rating") state.rating = "";
        if (type === "compat") state.compat = "";
        if (type === "stock") state.stock = "";
        state.page = 1;
        setState(state);
        render();
      });
    }

    if (els.clearBtn) {
      els.clearBtn.addEventListener("click", function () {
        window.history.replaceState({}, "", window.location.pathname);
        render();
      });
    }

    if (els.pagination) {
      els.pagination.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-page]");
        if (!btn) return;
        var state = getState();
        state.page = Number(btn.dataset.page);
        setState(state);
        render();
        root.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      });
    }

    /* Mobile filter drawer */
    if (els.mobileToggle && els.sidebar) {
      els.mobileToggle.addEventListener("click", function () {
        els.sidebar.classList.add("is-open");
        if (els.drawerScrim) els.drawerScrim.classList.add("is-visible");
        document.body.style.overflow = "hidden";
      });
      function closeDrawer() {
        els.sidebar.classList.remove("is-open");
        if (els.drawerScrim) els.drawerScrim.classList.remove("is-visible");
        document.body.style.overflow = "";
      }
      if (els.drawerClose) els.drawerClose.addEventListener("click", closeDrawer);
      if (els.drawerScrim) els.drawerScrim.addEventListener("click", closeDrawer);
    }

    /* Filter group collapse (accordion-style within sidebar) */
    root.querySelectorAll(".filter-group__title").forEach(function (title) {
      title.addEventListener("click", function () {
        title.closest(".filter-group").classList.toggle("is-collapsed");
      });
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", initShopPage);
})();
