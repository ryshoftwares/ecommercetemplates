/* ==========================================================================
   MODIX — js/wishlist.js
   Wishlist toggle (product cards, PDP) + wishlist.html page.
   Persists product ids to localStorage.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "modix_wishlist";
  var data = window.MODIX.data;

  function readWishlist() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function writeWishlist(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    updateWishlistBadges();
  }

  function isWishlisted(id) { return readWishlist().indexOf(Number(id)) !== -1; }

  function toggleWishlist(id) {
    id = Number(id);
    var list = readWishlist();
    var idx = list.indexOf(id);
    var added;
    if (idx === -1) { list.push(id); added = true; }
    else { list.splice(idx, 1); added = false; }
    writeWishlist(list);
    return added;
  }

  function updateWishlistBadges() {
    var count = readWishlist().length;
    document.querySelectorAll("[data-wishlist-count]").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "" : "none";
    });
    document.querySelectorAll("[data-wishlist-toggle]").forEach(function (btn) {
      var active = isWishlisted(btn.dataset.id);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function initToggleButtons() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-wishlist-toggle]");
      if (!btn) return;
      e.preventDefault();
      var added = toggleWishlist(btn.dataset.id);
      var product = data.getProductById(btn.dataset.id);
      btn.classList.toggle("is-active", added);
      btn.setAttribute("aria-pressed", added ? "true" : "false");
      window.MODIX.toast({
        type: added ? "success" : "info",
        title: added ? "Added to wishlist" : "Removed from wishlist",
        message: product ? product.name : ""
      });
      renderWishlistPage();
    });
  }

  /* wishlist.html renders its own card markup (rather than the generic
     data.productCardHTML) so it can surface explicit "Move to Cart" and
     "Remove" actions instead of the shop grid's hover quick-add. */
  function wishlistCardHTML(product) {
    var discount = data.discountPercent(product);
    return (
      '<article class="product-card wishlist-card" data-product-id="' + product.id + '">' +
        '<div class="product-card__media">' +
          (discount > 0 ? '<span class="badge badge--sale">-' + discount + '%</span>' : "") +
          '<a href="product.html?slug=' + product.slug + '" aria-label="View ' + product.name + '">' +
            '<img src="' + product.image + '" alt="' + product.name + '" width="400" height="400" loading="lazy">' +
          "</a>" +
        "</div>" +
        '<div class="product-card__body">' +
          '<span class="product-card__category">' + ((data.getCategoryBySlug(product.category) || {}).name || "") + "</span>" +
          '<h3 class="product-card__name"><a href="product.html?slug=' + product.slug + '">' + product.name + "</a></h3>" +
          data.ratingHTML(product) +
          '<div class="price-row"><span class="price">' + data.formatPrice(product.price) + "</span>" +
          (discount > 0 ? ' <span class="price--compare">' + data.formatPrice(product.comparePrice) + "</span>" : "") + "</div>" +
          '<div class="wishlist-card__actions">' +
            '<button class="btn btn-primary btn-sm btn-block" type="button" data-move-to-cart data-id="' + product.id + '">Move to Cart</button>' +
            '<button class="btn btn-ghost btn-sm btn-block" type="button" data-wishlist-remove data-id="' + product.id + '">Remove</button>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderWishlistPage() {
    var root = document.querySelector("[data-wishlist-page]");
    if (!root) return;
    var ids = readWishlist();
    var products = ids.map(function (id) { return data.getProductById(id); }).filter(Boolean);
    var grid = root.querySelector("[data-wishlist-grid]");
    var emptyState = root.querySelector("[data-wishlist-empty]");
    var countEl = root.querySelector("[data-wishlist-page-count]");

    if (countEl) countEl.textContent = products.length;

    if (!products.length) {
      grid.style.display = "none";
      if (emptyState) emptyState.style.display = "";
      return;
    }
    grid.style.display = "";
    if (emptyState) emptyState.style.display = "none";
    grid.innerHTML = products.map(wishlistCardHTML).join("");
  }

  /* "Move to Cart" adds the item to the cart via window.MODIX.cart (no
     cart logic duplicated here) then removes it from the wishlist. */
  function initWishlistPageActions() {
    document.addEventListener("click", function (e) {
      var moveBtn = e.target.closest("[data-move-to-cart]");
      if (moveBtn) {
        var product = data.getProductById(moveBtn.dataset.id);
        if (product && window.MODIX.cart) {
          var color = product.colors && product.colors[0] ? product.colors[0].name : "";
          var variant = product.variants && product.variants[0] ? product.variants[0] : "";
          window.MODIX.cart.addToCart(product.id, 1, color, variant);
          toggleWishlist(product.id);
          window.MODIX.toast({ type: "success", title: "Moved to cart", message: product.name });
          renderWishlistPage();
        }
        return;
      }
      var removeBtn = e.target.closest("[data-wishlist-remove]");
      if (removeBtn) {
        var product2 = data.getProductById(removeBtn.dataset.id);
        toggleWishlist(removeBtn.dataset.id);
        window.MODIX.toast({ type: "info", title: "Removed from wishlist", message: product2 ? product2.name : "" });
        renderWishlistPage();
      }
    });
  }

  window.MODIX.wishlist = {
    readWishlist: readWishlist,
    toggleWishlist: toggleWishlist,
    isWishlisted: isWishlisted,
    renderWishlistPage: renderWishlistPage
  };

  document.addEventListener("DOMContentLoaded", function () {
    updateWishlistBadges();
    initToggleButtons();
    initWishlistPageActions();
    renderWishlistPage();
  });
})();
