/* ==========================================================================
   VELORA — Cart (drawer + cart.html), localStorage-backed
   Cart item shape: { productId, slug, name, image, price, color, size, qty }
   Coupon: "VELORA10" = 10% off subtotal. Free shipping threshold: ₹4000.
   ========================================================================== */

(function (global) {
  "use strict";

  var STORAGE_KEY = "velora_cart_v1";
  var COUPON_KEY = "velora_coupon_v1";
  var FREE_SHIP_THRESHOLD = 4000;
  var SHIPPING_FLAT = 250;
  var VALID_COUPON = "VELORA10";
  var COUPON_RATE = 0.10;

  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadges();
  }
  function readCoupon() {
    try { return localStorage.getItem(COUPON_KEY) || null; } catch (e) { return null; }
  }
  function writeCoupon(code) {
    if (code) localStorage.setItem(COUPON_KEY, code);
    else localStorage.removeItem(COUPON_KEY);
  }

  function lineKey(item) { return [item.productId, item.color, item.size].join("::"); }

  function addItem(item) {
    var cart = readCart();
    var existing = cart.find(function (l) { return lineKey(l) === lineKey(item); });
    if (existing) existing.qty += item.qty;
    else cart.push(item);
    writeCart(cart);
    return cart;
  }

  function removeLine(key) {
    var cart = readCart().filter(function (l) { return lineKey(l) !== key; });
    writeCart(cart);
    return cart;
  }

  function setQty(key, qty) {
    var cart = readCart();
    var line = cart.find(function (l) { return lineKey(l) === key; });
    if (line) {
      line.qty = Math.max(1, qty);
      writeCart(cart);
    }
    return cart;
  }

  function clearCart() { writeCart([]); }

  function getSubtotal() {
    return readCart().reduce(function (sum, l) { return sum + l.price * l.qty; }, 0);
  }
  function getItemCount() {
    return readCart().reduce(function (sum, l) { return sum + l.qty; }, 0);
  }
  function getDiscount(subtotal) {
    var code = readCoupon();
    if (code === VALID_COUPON) return Math.round(subtotal * COUPON_RATE);
    return 0;
  }
  function getShipping(subtotal, discount) {
    var payable = subtotal - discount;
    if (payable <= 0) return 0;
    return payable >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FLAT;
  }
  function getTotal() {
    var subtotal = getSubtotal();
    var discount = getDiscount(subtotal);
    var shipping = getShipping(subtotal, discount);
    return Math.max(0, subtotal - discount) + shipping;
  }

  function applyCoupon(code) {
    code = (code || "").trim().toUpperCase();
    if (code === VALID_COUPON) {
      writeCoupon(code);
      return { ok: true, message: "Coupon applied — 10% off your order." };
    }
    return { ok: false, message: "That coupon code isn't valid. Try VELORA10." };
  }
  function removeCoupon() { writeCoupon(null); }

  var fmt = function (n) { return (global.VeloraProducts ? global.VeloraProducts.formatPrice(n) : "₹" + Math.round(n)); };

  function qtyStepperHTML(key, qty) {
    return (
      '<div class="qty-stepper" data-qty-stepper data-key="' + key + '">' +
        '<button type="button" data-qty-dec aria-label="Decrease quantity">-</button>' +
        '<input type="text" inputmode="numeric" value="' + qty + '" aria-label="Quantity" readonly>' +
        '<button type="button" data-qty-inc aria-label="Increase quantity">+</button>' +
      "</div>"
    );
  }

  function cartLineHTML(item) {
    var key = lineKey(item);
    return (
      '<div class="cart-line" data-line="' + key + '">' +
        '<img src="' + item.image + '" alt="' + item.name + ' in ' + item.color + '" width="84" height="100">' +
        '<div>' +
          '<div class="cart-line-name">' + item.name + "</div>" +
          '<div class="cart-line-variant">' + item.color + " / " + item.size + "</div>" +
          qtyStepperHTML(key, item.qty) +
          '<div><button type="button" class="cart-line-remove" data-remove-line data-key="' + key + '">Remove</button></div>' +
        "</div>" +
        '<div class="cart-line-price">' + fmt(item.price * item.qty) + "</div>" +
      "</div>"
    );
  }

  function cartRowHTML(item) {
    var key = lineKey(item);
    return (
      '<div class="cart-row" data-line="' + key + '">' +
        '<div class="cart-row-product">' +
          '<img src="' + item.image + '" alt="' + item.name + ' in ' + item.color + '" width="96" height="120">' +
          '<div>' +
            '<div class="cart-line-name">' + item.name + "</div>" +
            '<div class="cart-line-variant">' + item.color + " / " + item.size + "</div>" +
            '<button type="button" class="cart-line-remove" data-remove-line data-key="' + key + '">Remove</button>' +
          "</div>" +
        "</div>" +
        '<div>' + fmt(item.price) + "</div>" +
        '<div>' + qtyStepperHTML(key, item.qty) + "</div>" +
        '<div class="cart-line-price">' + fmt(item.price * item.qty) + "</div>" +
      "</div>"
    );
  }

  function emptyCartHTML(context) {
    return (
      '<div class="cart-empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6"/></svg>' +
        "<h3>Your cart is empty</h3>" +
        '<p class="text-muted">Looks like you haven\'t added anything yet.</p>' +
        '<a href="shop.html" class="btn btn-primary">Continue Shopping</a>' +
      "</div>"
    );
  }

  function renderFreeShipBar(container, subtotal, discount) {
    if (!container) return;
    var payable = Math.max(0, subtotal - discount);
    var remaining = FREE_SHIP_THRESHOLD - payable;
    var pct = Math.min(100, Math.round((payable / FREE_SHIP_THRESHOLD) * 100));
    if (remaining <= 0) {
      container.innerHTML = '<strong>You\'ve unlocked FREE SHIPPING</strong><div class="freeship-track"><div class="freeship-fill" style="width:100%"></div></div>';
    } else {
      container.innerHTML = "Add " + fmt(remaining) + ' more to unlock <strong>FREE SHIPPING</strong><div class="freeship-track"><div class="freeship-fill" style="width:' + pct + '%"></div></div>';
    }
  }

  function renderSummary(root, prefix) {
    var subtotal = getSubtotal();
    var discount = getDiscount(subtotal);
    var shipping = getShipping(subtotal, discount);
    var total = subtotal - discount + shipping;
    var set = function (sel, val) { var el = root.querySelector(sel); if (el) el.textContent = val; };
    set("[data-subtotal]", fmt(subtotal));
    set("[data-discount]", discount ? "-" + fmt(discount) : fmt(0));
    set("[data-shipping]", shipping === 0 ? "FREE" : fmt(shipping));
    set("[data-total]", fmt(total));
    var discountRow = root.querySelector("[data-discount-row]");
    if (discountRow) discountRow.style.display = discount ? "flex" : "none";
  }

  function renderDrawer() {
    var itemsEl = document.querySelector("[data-cart-drawer-items]");
    var footEl = document.querySelector("[data-cart-drawer-foot]");
    var freeship = document.querySelector("[data-freeship-bar]");
    if (!itemsEl) return;
    var cart = readCart();
    var subtotal = getSubtotal();
    var discount = getDiscount(subtotal);
    renderFreeShipBar(freeship, subtotal, discount);
    if (!cart.length) {
      itemsEl.innerHTML = emptyCartHTML("drawer");
      if (footEl) footEl.style.display = "none";
      return;
    }
    if (footEl) footEl.style.display = "";
    itemsEl.innerHTML = cart.map(cartLineHTML).join("");
    if (footEl) renderSummary(footEl, "drawer");
  }

  function renderCartPage() {
    var wrap = document.querySelector("[data-cart-page]");
    if (!wrap) return;
    var cart = readCart();
    var itemsEl = wrap.querySelector("[data-cart-rows]");
    var emptyEl = wrap.querySelector("[data-cart-empty]");
    var layoutEl = wrap.querySelector("[data-cart-layout]");
    var freeship = wrap.querySelector("[data-freeship-bar]");
    var subtotal = getSubtotal();
    var discount = getDiscount(subtotal);

    if (!cart.length) {
      if (layoutEl) layoutEl.style.display = "none";
      if (emptyEl) { emptyEl.style.display = ""; emptyEl.innerHTML = emptyCartHTML("page"); }
      return;
    }
    if (layoutEl) layoutEl.style.display = "";
    if (emptyEl) emptyEl.style.display = "none";
    if (itemsEl) itemsEl.innerHTML = cart.map(cartRowHTML).join("");
    renderFreeShipBar(freeship, subtotal, discount);
    var summaryEl = wrap.querySelector("[data-cart-summary]");
    if (summaryEl) renderSummary(summaryEl, "page");

    var couponMsg = wrap.querySelector("[data-coupon-msg]");
    var code = readCoupon();
    if (couponMsg && code === VALID_COUPON) {
      couponMsg.textContent = "Coupon VELORA10 applied — 10% off.";
      couponMsg.className = "coupon-msg is-success";
    }
  }

  function updateCartBadges() {
    var count = getItemCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });
  }

  function bindQtyAndRemove(root) {
    root.addEventListener("click", function (e) {
      var stepper = e.target.closest("[data-qty-stepper]");
      var removeBtn = e.target.closest("[data-remove-line]");
      if (stepper) {
        var key = stepper.getAttribute("data-key");
        var cart = readCart();
        var line = cart.find(function (l) { return lineKey(l) === key; });
        if (!line) return;
        if (e.target.closest("[data-qty-inc]")) setQty(key, line.qty + 1);
        if (e.target.closest("[data-qty-dec]")) setQty(key, line.qty - 1);
        refreshAll();
      }
      if (removeBtn) {
        removeLine(removeBtn.getAttribute("data-key"));
        refreshAll();
        if (global.VeloraToast) global.VeloraToast.show("Item removed from cart", "info");
      }
    });
  }

  function refreshAll() {
    renderDrawer();
    renderCartPage();
    updateCartBadges();
  }

  function initCartDrawerToggle() {
    var openers = document.querySelectorAll("[data-cart-open]");
    var drawer = document.querySelector(".cart-drawer");
    var backdrop = document.querySelector(".cart-drawer-backdrop");
    var closeBtn = document.querySelector("[data-cart-close]");
    if (!drawer || !backdrop) return;
    function open(e) {
      if (e) e.preventDefault();
      renderDrawer();
      drawer.classList.add("is-open");
      backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      drawer.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    openers.forEach(function (btn) { btn.addEventListener("click", open); });
    if (closeBtn) closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    global.VeloraCartDrawer = { open: open, close: close };
  }

  function initCouponForms() {
    document.querySelectorAll("[data-coupon-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input");
        var msg = form.parentElement.querySelector("[data-coupon-msg]") || form.querySelector("[data-coupon-msg]");
        var result = applyCoupon(input.value);
        if (msg) {
          msg.textContent = result.message;
          msg.className = "coupon-msg " + (result.ok ? "is-success" : "is-error");
        }
        if (result.ok) refreshAll();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateCartBadges();
    renderDrawer();
    renderCartPage();
    initCartDrawerToggle();
    initCouponForms();
    bindQtyAndRemove(document.body);
  });

  global.VeloraCart = {
    getCart: readCart,
    addItem: addItem,
    removeLine: removeLine,
    setQty: setQty,
    clearCart: clearCart,
    getSubtotal: getSubtotal,
    getDiscount: getDiscount,
    getShipping: getShipping,
    getTotal: getTotal,
    getItemCount: getItemCount,
    applyCoupon: applyCoupon,
    removeCoupon: removeCoupon,
    readCoupon: readCoupon,
    refresh: refreshAll,
    FREE_SHIP_THRESHOLD: FREE_SHIP_THRESHOLD,
    lineKey: lineKey
  };
})(window);
