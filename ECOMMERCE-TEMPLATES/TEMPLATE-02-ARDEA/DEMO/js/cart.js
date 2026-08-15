/* ==========================================================================
   ARDEA — js/cart.js
   Cart drawer + cart.html logic. Persists to localStorage. Vanilla JS.
   ========================================================================== */

(function (global) {
  "use strict";

  var STORAGE_KEY = "ardea_cart";
  var COUPON_CODE = "ARDEA10";
  var COUPON_RATE = 0.10;
  var FREE_SHIP_THRESHOLD = 6000;
  var FLAT_SHIPPING = 499;

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) { return []; }
  }

  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
    document.dispatchEvent(new CustomEvent("ardea:cart-updated", { detail: { cart: cart } }));
  }

  function addToCart(productId, qty, variant) {
    qty = qty || 1;
    var cart = readCart();
    var existing = cart.find(function (l) { return l.productId === productId && l.variant === (variant || null); });
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productId: productId, qty: qty, variant: variant || null });
    }
    writeCart(cart);
    renderDrawer();
    return cart;
  }

  function removeFromCart(productId, variant) {
    var cart = readCart().filter(function (l) {
      return !(l.productId === productId && l.variant === (variant || null));
    });
    writeCart(cart);
    renderDrawer();
    renderCartPage();
  }

  function updateQty(productId, variant, qty) {
    var cart = readCart();
    var line = cart.find(function (l) { return l.productId === productId && l.variant === (variant || null); });
    if (line) {
      line.qty = Math.max(1, qty);
      writeCart(cart);
    }
    renderDrawer();
    renderCartPage();
  }

  function clearCart() {
    writeCart([]);
    renderDrawer();
    renderCartPage();
  }

  function getCartCount() {
    return readCart().reduce(function (sum, l) { return sum + l.qty; }, 0);
  }

  function getCartLinesWithProducts() {
    var data = global.ArdeaData;
    if (!data) return [];
    return readCart().map(function (l) {
      var product = data.getProductBySlug ? data.getAllProducts().find(function (p) { return p.id === l.productId; }) : null;
      return { line: l, product: product };
    }).filter(function (x) { return x.product; });
  }

  function getAppliedCoupon() {
    try { return sessionStorage.getItem("ardea_coupon") || ""; } catch (e) { return ""; }
  }
  function setAppliedCoupon(code) {
    try { sessionStorage.setItem("ardea_coupon", code); } catch (e) {}
  }

  function computeTotals() {
    var lines = getCartLinesWithProducts();
    var subtotal = lines.reduce(function (sum, x) { return sum + x.product.price * x.line.qty; }, 0);
    var coupon = getAppliedCoupon();
    var discount = coupon === COUPON_CODE ? Math.round(subtotal * COUPON_RATE) : 0;
    var afterDiscount = subtotal - discount;
    var shipping = subtotal === 0 ? 0 : (afterDiscount >= FREE_SHIP_THRESHOLD ? 0 : FLAT_SHIPPING);
    var total = afterDiscount + shipping;
    var remaining = Math.max(0, FREE_SHIP_THRESHOLD - afterDiscount);
    return { subtotal: subtotal, discount: discount, shipping: shipping, total: total, remaining: remaining, lines: lines };
  }

  function updateCartCount() {
    var count = getCartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });
  }

  function progressBarHTML(totals) {
    var data = global.ArdeaData;
    var fmt = data ? data.formatINR : function (n) { return "₹" + n; };
    var pct = Math.min(100, Math.round(((FREE_SHIP_THRESHOLD - totals.remaining) / FREE_SHIP_THRESHOLD) * 100));
    var label = totals.remaining > 0
      ? 'Add <strong>' + fmt(totals.remaining) + '</strong> more to unlock <strong>FREE DELIVERY</strong>'
      : "You've unlocked <strong>FREE DELIVERY</strong>";
    return (
      '<div class="cart-progress">' +
        '<p class="cart-progress__label' + (totals.remaining > 0 ? "" : " is-met") + '">' + label + "</p>" +
        '<div class="cart-progress__track"><div class="cart-progress__bar" style="width:' + pct + '%"></div></div>' +
      "</div>"
    );
  }

  function lineHTML(entry, context) {
    var data = global.ArdeaData;
    var p = entry.product, l = entry.line;
    var lineTotal = data.formatINR(p.price * l.qty);
    return (
      '<div class="cart-line" data-line data-product-id="' + p.id + '" data-variant="' + (l.variant || "") + '">' +
        '<img class="cart-line__img" src="' + p.image + '" alt="' + p.name + '" width="84" height="100">' +
        '<div class="cart-line__body">' +
          '<h4 class="cart-line__name"><a href="product.html?slug=' + p.slug + '">' + p.name + "</a></h4>" +
          '<p class="cart-line__meta">' + (l.variant ? l.variant + " · " : "") + p.category.replace("-", " ") + "</p>" +
          '<div class="cart-line__price">' + lineTotal + "</div>" +
          (context === "page" ?
            '<div class="qty-stepper" data-qty-stepper>' +
              '<button type="button" data-qty-dec aria-label="Decrease quantity">−</button>' +
              '<input type="number" min="1" value="' + l.qty + '" aria-label="Quantity for ' + p.name + '">' +
              '<button type="button" data-qty-inc aria-label="Increase quantity">+</button>' +
            "</div>" :
            '<p class="cart-line__meta">Qty: ' + l.qty + "</p>"
          ) +
          '<button type="button" class="cart-line__remove" data-remove-line>Remove</button>' +
        "</div>" +
      "</div>"
    );
  }

  function renderDrawer() {
    var container = document.querySelector("[data-cart-drawer-items]");
    if (!container) return;
    var totals = computeTotals();
    var progressEl = document.querySelector("[data-cart-drawer-progress]");
    if (progressEl) progressEl.innerHTML = progressBarHTML(totals);

    if (totals.lines.length === 0) {
      container.innerHTML =
        '<div class="cart-empty">' +
          '<svg viewBox="0 0 24 24"><path d="M4 4h2l1.6 10.6a2 2 0 002 1.4h7.6a2 2 0 002-1.7L20 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>' +
          "<h3>Your cart is empty</h3>" +
          '<p class="lead" style="margin-top:0.5rem;">Browse our collections to find your next piece.</p>' +
          '<a href="shop.html" class="btn btn--dark" style="margin-top:1.5rem;">Continue Shopping</a>' +
        "</div>";
    } else {
      container.innerHTML = totals.lines.map(function (e) { return lineHTML(e, "drawer"); }).join("");
    }

    var footer = document.querySelector("[data-cart-drawer-footer]");
    if (footer) {
      var data = global.ArdeaData;
      footer.innerHTML =
        '<div class="summary-row"><span>Subtotal</span><span>' + data.formatINR(totals.subtotal) + "</span></div>" +
        (totals.discount > 0 ? '<div class="summary-row"><span>Discount (ARDEA10)</span><span class="value--accent">-' + data.formatINR(totals.discount) + "</span></div>" : "") +
        '<div class="summary-row"><span>Shipping</span><span>' + (totals.shipping === 0 ? "Free" : data.formatINR(totals.shipping)) + "</span></div>" +
        '<div class="summary-row summary-row--total"><span>Total</span><span>' + data.formatINR(totals.total) + "</span></div>" +
        '<a href="cart.html" class="btn btn--outline btn--full" style="margin-top:1rem;">View Cart</a>' +
        '<a href="checkout.html" class="btn btn--primary btn--full" style="margin-top:0.75rem;">Checkout</a>';
    }
    bindLineEvents(container);
  }

  function renderCartPage() {
    var container = document.querySelector("[data-cart-page-items]");
    if (!container) return;
    var totals = computeTotals();
    var progressEl = document.querySelector("[data-cart-page-progress]");
    if (progressEl) progressEl.innerHTML = progressBarHTML(totals);

    var emptyState = document.querySelector("[data-cart-page-empty]");
    var layout = document.querySelector("[data-cart-page-layout]");

    if (totals.lines.length === 0) {
      if (layout) layout.style.display = "none";
      if (emptyState) emptyState.style.display = "block";
      return;
    }
    if (layout) layout.style.display = "";
    if (emptyState) emptyState.style.display = "none";

    container.innerHTML = totals.lines.map(function (e) { return lineHTML(e, "page"); }).join("");

    var data = global.ArdeaData;
    var summary = document.querySelector("[data-cart-page-summary]");
    if (summary) {
      summary.innerHTML =
        '<div class="summary-row"><span>Subtotal</span><span>' + data.formatINR(totals.subtotal) + "</span></div>" +
        (totals.discount > 0 ? '<div class="summary-row"><span>Discount (ARDEA10)</span><span class="value--accent">-' + data.formatINR(totals.discount) + "</span></div>" : "") +
        '<div class="summary-row"><span>Shipping</span><span>' + (totals.shipping === 0 ? "Free" : data.formatINR(totals.shipping)) + "</span></div>" +
        '<div class="summary-row summary-row--total"><span>Estimated Total</span><span>' + data.formatINR(totals.total) + "</span></div>";
    }
    var couponNote = document.querySelector("[data-coupon-note]");
    if (couponNote) {
      var code = getAppliedCoupon();
      if (code === COUPON_CODE) {
        couponNote.textContent = "Coupon ARDEA10 applied — 10% off your order.";
        couponNote.className = "coupon-note is-success";
      } else if (code) {
        couponNote.textContent = "That coupon code isn't valid. Try ARDEA10.";
        couponNote.className = "coupon-note is-error";
      } else {
        couponNote.textContent = "";
        couponNote.className = "coupon-note";
      }
    }
    bindLineEvents(container);
  }

  function bindLineEvents(container) {
    container.querySelectorAll("[data-remove-line]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var line = btn.closest("[data-line]");
        var id = Number(line.getAttribute("data-product-id"));
        var variant = line.getAttribute("data-variant") || null;
        removeFromCart(id, variant);
        if (global.ArdeaToast) global.ArdeaToast.show("Removed from cart", "info");
      });
    });
    container.querySelectorAll("[data-qty-inc]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var line = btn.closest("[data-line]");
        var id = Number(line.getAttribute("data-product-id"));
        var variant = line.getAttribute("data-variant") || null;
        var input = line.querySelector("input");
        updateQty(id, variant, Number(input.value) + 1);
      });
    });
    container.querySelectorAll("[data-qty-dec]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var line = btn.closest("[data-line]");
        var id = Number(line.getAttribute("data-product-id"));
        var variant = line.getAttribute("data-variant") || null;
        var input = line.querySelector("input");
        updateQty(id, variant, Math.max(1, Number(input.value) - 1));
      });
    });
    container.querySelectorAll('.qty-stepper input').forEach(function (input) {
      input.addEventListener("change", function () {
        var line = input.closest("[data-line]");
        var id = Number(line.getAttribute("data-product-id"));
        var variant = line.getAttribute("data-variant") || null;
        updateQty(id, variant, Math.max(1, Number(input.value) || 1));
      });
    });
  }

  function initCouponForm() {
    var form = document.querySelector("[data-coupon-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input");
      var code = (input.value || "").trim().toUpperCase();
      setAppliedCoupon(code);
      renderCartPage();
      renderDrawer();
    });
  }

  function initQuickAddButtons() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-quick-add]");
      if (!btn) return;
      var id = Number(btn.getAttribute("data-product-id"));
      var product = global.ArdeaData.getAllProducts().find(function (p) { return p.id === id; });
      addToCart(id, 1, product && product.colors ? product.colors[0] : null);
      if (global.ArdeaToast) global.ArdeaToast.show((product ? product.name : "Item") + " added to cart", "success");
      if (global.ArdeaApp && global.ArdeaApp.openCartDrawer) global.ArdeaApp.openCartDrawer();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    renderDrawer();
    renderCartPage();
    initCouponForm();
    initQuickAddButtons();
  });

  global.ArdeaCart = {
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQty: updateQty,
    clearCart: clearCart,
    readCart: readCart,
    getCartCount: getCartCount,
    computeTotals: computeTotals,
    renderDrawer: renderDrawer,
    renderCartPage: renderCartPage,
    FREE_SHIP_THRESHOLD: FREE_SHIP_THRESHOLD,
    COUPON_CODE: COUPON_CODE
  };
})(window);
