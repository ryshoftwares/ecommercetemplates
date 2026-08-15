/* ==========================================================================
   VELORA — Wishlist, localStorage-backed
   Stores an array of product IDs. Renders heart toggles site-wide and the
   full wishlist.html page.
   ========================================================================== */

(function (global) {
  "use strict";

  var STORAGE_KEY = "velora_wishlist_v1";

  function read() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function write(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    updateBadges();
    syncToggles();
  }
  function has(id) { return read().indexOf(id) !== -1; }
  function toggle(id) {
    var ids = read();
    var idx = ids.indexOf(id);
    var added;
    if (idx === -1) { ids.push(id); added = true; }
    else { ids.splice(idx, 1); added = false; }
    write(ids);
    return added;
  }
  function remove(id) {
    write(read().filter(function (x) { return x !== id; }));
  }
  function count() { return read().length; }

  function updateBadges() {
    var n = count();
    document.querySelectorAll("[data-wishlist-count]").forEach(function (el) {
      el.textContent = n;
      el.style.display = n > 0 ? "flex" : "none";
    });
  }

  function syncToggles() {
    document.querySelectorAll("[data-wishlist-toggle]").forEach(function (btn) {
      var id = parseInt(btn.getAttribute("data-id"), 10);
      var active = has(id);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function bindToggles(root) {
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-wishlist-toggle]");
      if (!btn) return;
      e.preventDefault();
      var id = parseInt(btn.getAttribute("data-id"), 10);
      var added = toggle(id);
      if (global.VeloraToast) {
        global.VeloraToast.show(added ? "Added to wishlist" : "Removed from wishlist", "success");
      }
      if (document.querySelector("[data-wishlist-page]")) renderWishlistPage();
    });
  }

  function wishlistCardHTML(p) {
    var VP = global.VeloraProducts;
    return (
      '<article class="product-card" data-product-id="' + p.id + '">' +
        '<div class="product-media">' +
          '<a href="product.html?slug=' + p.slug + '" aria-label="View ' + p.name + '">' +
            '<img class="img-primary" src="' + p.image + '" alt="' + p.imageAlt + '" width="600" height="800" loading="lazy">' +
          "</a>" +
          '<button type="button" class="wishlist-toggle is-active" data-wishlist-toggle data-id="' + p.id + '" aria-label="Remove ' + p.name + ' from wishlist" aria-pressed="true">' +
            '<svg viewBox="0 0 24 24" stroke-width="1.6"><path d="M12 21s-7.5-4.6-10-9.2C0.3 8.3 2 4.5 5.7 4c2-.3 3.7.7 4.9 2.3C11.8 4.7 13.5 3.7 15.5 4c3.7.5 5.4 4.3 3.7 7.8C20 16.4 12 21 12 21z"/></svg>' +
          "</button>" +
        "</div>" +
        '<div class="product-info">' +
          '<div class="product-cat">' + p.category + "</div>" +
          '<h3 class="product-name"><a href="product.html?slug=' + p.slug + '">' + p.name + "</a></h3>" +
          '<div class="product-price">' + VP.formatPrice(p.price) + "</div>" +
          '<button type="button" class="btn btn-outline btn-sm btn-block" style="margin-top:12px" data-move-to-cart data-slug="' + p.slug + '">Move to Cart</button>' +
        "</div>" +
      "</article>"
    );
  }

  function renderWishlistPage() {
    var container = document.querySelector("[data-wishlist-grid]");
    var emptyEl = document.querySelector("[data-wishlist-empty]");
    var countEl = document.querySelector("[data-wishlist-page-count]");
    if (!container || !global.VeloraProducts) return;
    var ids = read();
    var products = global.VeloraProducts.all().filter(function (p) { return ids.indexOf(p.id) !== -1; });
    if (countEl) countEl.textContent = products.length;
    if (!products.length) {
      container.style.display = "none";
      if (emptyEl) emptyEl.style.display = "";
      return;
    }
    container.style.display = "";
    if (emptyEl) emptyEl.style.display = "none";
    container.innerHTML = products.map(wishlistCardHTML).join("");
  }

  function bindMoveToCart(root) {
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-move-to-cart]");
      if (!btn || !global.VeloraProducts || !global.VeloraCart) return;
      var p = global.VeloraProducts.getBySlug(btn.getAttribute("data-slug"));
      if (!p) return;
      global.VeloraCart.addItem({
        productId: p.id, slug: p.slug, name: p.name, image: p.image,
        price: p.price, color: p.colors[0], size: p.sizes[0], qty: 1
      });
      remove(p.id);
      renderWishlistPage();
      if (global.VeloraToast) global.VeloraToast.show(p.name + " moved to cart", "success");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateBadges();
    syncToggles();
    bindToggles(document.body);
    bindMoveToCart(document.body);
    renderWishlistPage();
  });

  global.VeloraWishlist = {
    has: has,
    toggle: toggle,
    remove: remove,
    count: count,
    getIds: read,
    renderPage: renderWishlistPage,
    sync: syncToggles
  };
})(window);
