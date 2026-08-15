/* ==========================================================================
   ARDEA — js/wishlist.js
   Wishlist toggle (product cards, PDP) + wishlist.html rendering.
   ========================================================================== */

(function (global) {
  "use strict";

  var STORAGE_KEY = "ardea_wishlist";

  function readWishlist() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (e) { return []; }
  }
  function writeWishlist(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    updateWishlistCount();
    document.dispatchEvent(new CustomEvent("ardea:wishlist-updated", { detail: { list: list } }));
  }
  function isInWishlist(id) { return readWishlist().indexOf(id) !== -1; }

  function toggle(id) {
    var list = readWishlist();
    var idx = list.indexOf(id);
    var added;
    if (idx === -1) { list.push(id); added = true; }
    else { list.splice(idx, 1); added = false; }
    writeWishlist(list);
    return added;
  }

  function remove(id) {
    var list = readWishlist().filter(function (x) { return x !== id; });
    writeWishlist(list);
  }

  function updateWishlistCount() {
    var count = readWishlist().length;
    document.querySelectorAll("[data-wishlist-count]").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });
  }

  function syncButtonsUI() {
    var list = readWishlist();
    document.querySelectorAll("[data-wishlist-toggle]").forEach(function (btn) {
      var id = Number(btn.getAttribute("data-product-id"));
      var active = list.indexOf(id) !== -1;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function renderWishlistPage() {
    var grid = document.querySelector("[data-wishlist-grid]");
    if (!grid) return;
    var data = global.ArdeaData;
    var list = readWishlist();
    var emptyState = document.querySelector("[data-wishlist-empty]");
    var countLabel = document.querySelector("[data-wishlist-page-count]");

    if (countLabel) countLabel.textContent = list.length + (list.length === 1 ? " item" : " items");

    if (list.length === 0) {
      grid.style.display = "none";
      if (emptyState) emptyState.style.display = "block";
      return;
    }
    grid.style.display = "";
    if (emptyState) emptyState.style.display = "none";

    var products = data.getAllProducts().filter(function (p) { return list.indexOf(p.id) !== -1; });
    grid.innerHTML = products.map(function (p) { return data.productCardHTML(p); }).join("");
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-wishlist-toggle]");
    if (!btn) return;
    var id = Number(btn.getAttribute("data-product-id"));
    var added = toggle(id);
    syncButtonsUI();
    renderWishlistPage();
    if (global.ArdeaToast) {
      global.ArdeaToast.show(added ? "Added to wishlist" : "Removed from wishlist", "success");
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    updateWishlistCount();
    syncButtonsUI();
    renderWishlistPage();
  });

  global.ArdeaWishlist = {
    toggle: toggle,
    remove: remove,
    readWishlist: readWishlist,
    isInWishlist: isInWishlist,
    renderWishlistPage: renderWishlistPage,
    syncButtonsUI: syncButtonsUI
  };
})(window);
