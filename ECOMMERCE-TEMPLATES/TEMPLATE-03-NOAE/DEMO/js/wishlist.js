/* =========================================================================
   NOAÉ — Wishlist, localStorage-backed
   ========================================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "noae_wishlist";

  function readList() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch (e) { return []; }
  }
  function writeList(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    document.dispatchEvent(new CustomEvent("noae:wishlist-updated"));
  }

  function has(id) { return readList().indexOf(String(id)) !== -1; }

  function add(id) {
    var list = readList();
    if (list.indexOf(String(id)) === -1) list.push(String(id));
    writeList(list);
  }

  function remove(id) {
    var list = readList().filter(function (i) { return i !== String(id); });
    writeList(list);
  }

  function toggle(id) {
    var wasActive = has(id);
    if (wasActive) remove(id); else add(id);
    return !wasActive;
  }

  function getCount() { return readList().length; }

  function getProducts() {
    if (!window.NoaeProducts) return [];
    return readList().map(function (id) { return window.NoaeProducts.getProductById(id); }).filter(Boolean);
  }

  function updateBadge() {
    var count = getCount();
    document.querySelectorAll(".js-wishlist-count").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "inline-flex" : "none";
    });
  }

  function syncToggleButtons() {
    document.querySelectorAll(".noae-wishlist-toggle").forEach(function (btn) {
      var id = btn.dataset.productId;
      var active = has(id);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function renderWishlistPage() {
    var grid = document.getElementById("wishlistGrid");
    if (!grid) return;
    var empty = document.getElementById("wishlistEmptyState");
    var products = getProducts();
    if (!products.length) {
      grid.innerHTML = "";
      if (empty) empty.classList.remove("noae-hide");
      return;
    }
    if (empty) empty.classList.add("noae-hide");
    grid.innerHTML = products.map(function (p) { return window.NoaeProducts.renderProductCard(p); }).join("");
  }

  function init() {
    updateBadge();
    syncToggleButtons();
    renderWishlistPage();
    document.addEventListener("noae:wishlist-updated", function () {
      updateBadge();
      syncToggleButtons();
      renderWishlistPage();
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  window.NoaeWishlist = {
    has: has,
    add: add,
    remove: remove,
    toggle: toggle,
    getCount: getCount,
    getProducts: getProducts,
    updateBadge: updateBadge,
    syncToggleButtons: syncToggleButtons,
    renderWishlistPage: renderWishlistPage
  };
})();
