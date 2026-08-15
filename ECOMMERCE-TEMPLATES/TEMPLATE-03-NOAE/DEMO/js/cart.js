/* =========================================================================
   NOAÉ — Cart (drawer + cart.html), localStorage-backed
   ========================================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "noae_cart";
  var COUPON_KEY = "noae_coupon";
  var FREE_SHIP_THRESHOLD = 1999;
  var FLAT_SHIPPING = 99;
  var VALID_COUPON = "NOAE10";
  var COUPON_RATE = 0.10;

  function readCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }
  function writeCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("noae:cart-updated"));
  }
  function getCoupon() {
    return localStorage.getItem(COUPON_KEY) || "";
  }
  function setCoupon(code) {
    if (code) localStorage.setItem(COUPON_KEY, code);
    else localStorage.removeItem(COUPON_KEY);
    document.dispatchEvent(new CustomEvent("noae:cart-updated"));
  }

  function addItem(id, variantSize, qty) {
    qty = qty || 1;
    var items = readCart();
    var existing = items.filter(function (i) { return i.id === String(id) && i.variant === variantSize; })[0];
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id: String(id), variant: variantSize, qty: qty });
    }
    writeCart(items);
  }

  function removeItem(id, variantSize) {
    var items = readCart().filter(function (i) { return !(i.id === String(id) && i.variant === variantSize); });
    writeCart(items);
  }

  function updateQty(id, variantSize, qty) {
    var items = readCart();
    items.forEach(function (i) {
      if (i.id === String(id) && i.variant === variantSize) i.qty = Math.max(1, qty);
    });
    writeCart(items);
  }

  function getEnrichedItems() {
    var products = window.NoaeProducts;
    if (!products) return [];
    return readCart().map(function (i) {
      var product = products.getProductById(i.id);
      if (!product) return null;
      var variant = product.variants.filter(function (v) { return v.size === i.variant; })[0] || product.variants[0];
      return {
        id: i.id,
        variant: variant.size,
        qty: i.qty,
        product: product,
        unitPrice: variant.price,
        lineTotal: variant.price * i.qty
      };
    }).filter(Boolean);
  }

  function getSubtotal() {
    return getEnrichedItems().reduce(function (sum, i) { return sum + i.lineTotal; }, 0);
  }

  function getCount() {
    return readCart().reduce(function (sum, i) { return sum + i.qty; }, 0);
  }

  function getDiscount() {
    var subtotal = getSubtotal();
    if (getCoupon() === VALID_COUPON) return Math.round(subtotal * COUPON_RATE);
    return 0;
  }

  function getShipping() {
    var subtotal = getSubtotal() - getDiscount();
    if (subtotal <= 0) return 0;
    return subtotal >= FREE_SHIP_THRESHOLD ? 0 : FLAT_SHIPPING;
  }

  function getTotal() {
    return Math.max(0, getSubtotal() - getDiscount()) + getShipping();
  }

  function applyCoupon(code) {
    code = (code || "").trim().toUpperCase();
    if (code === VALID_COUPON) {
      setCoupon(code);
      return { ok: true, message: "Coupon applied — 10% off your order." };
    }
    setCoupon("");
    return { ok: false, message: "That code isn't valid. Try NOAE10 for 10% off." };
  }

  function fmt(n) {
    return window.NoaeProducts ? window.NoaeProducts.formatPrice(n) : "₹" + n;
  }

  function updateBadge() {
    var count = getCount();
    document.querySelectorAll(".js-cart-count").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "inline-flex" : "none";
    });
  }

  function cartItemMarkup(item) {
    return (
      '<div class="noae-cart-item" data-id="' + item.id + '" data-variant="' + item.variant + '">' +
        '<img class="noae-cart-item__img" src="' + item.product.image + '" alt="' + item.product.name + ' — ' + item.variant + '" width="76" height="76" loading="lazy">' +
        '<div>' +
          '<p class="noae-cart-item__name">' + item.product.name + '</p>' +
          '<p class="noae-cart-item__variant">Size: ' + item.variant + '</p>' +
          '<div class="noae-qty-selector noae-mt-6">' +
            '<button type="button" class="js-qty-dec" aria-label="Decrease quantity">−</button>' +
            '<input type="text" readonly value="' + item.qty + '" aria-label="Quantity for ' + item.product.name + '">' +
            '<button type="button" class="js-qty-inc" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<button type="button" class="noae-cart-item__remove js-cart-remove">Remove</button>' +
        '</div>' +
        '<p class="noae-cart-item__price">' + fmt(item.lineTotal) + '</p>' +
      '</div>'
    );
  }

  function progressMarkup() {
    var subtotal = getSubtotal();
    var remaining = FREE_SHIP_THRESHOLD - subtotal;
    var pct = Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100));
    var text = remaining > 0
      ? "Add " + fmt(remaining) + " more to unlock <strong>FREE SHIPPING</strong>"
      : "You've unlocked <strong>FREE SHIPPING</strong> 🎉";
    return (
      '<div class="noae-cart-progress">' +
        '<p class="noae-cart-progress__text">' + text + '</p>' +
        '<div class="noae-cart-progress__bar"><div class="noae-cart-progress__fill" style="width:' + pct + '%"></div></div>' +
      '</div>'
    );
  }

  function renderDrawer() {
    var body = document.getElementById("cartDrawerItems");
    var footer = document.getElementById("cartDrawerFooter");
    var progress = document.getElementById("cartDrawerProgress");
    if (!body) return;
    var items = getEnrichedItems();
    if (progress) progress.innerHTML = progressMarkup();
    if (!items.length) {
      body.innerHTML = '<div class="noae-cart-drawer__empty"><h3>Your bag is empty</h3><p>Discover your next daily ritual.</p><a href="shop.html" class="noae-btn noae-btn--dark noae-mt-6">Shop Bestsellers</a></div>';
      if (footer) footer.innerHTML = "";
      return;
    }
    body.innerHTML = '<div class="noae-cart-items">' + items.map(cartItemMarkup).join("") + '</div>';
    if (footer) {
      footer.innerHTML =
        '<div class="noae-cart-subtotal-row"><span>Subtotal</span><span>' + fmt(getSubtotal()) + '</span></div>' +
        '<a href="cart.html" class="noae-btn noae-btn--outline noae-btn--full noae-mt-6">View Bag</a>' +
        '<a href="checkout.html" class="noae-btn noae-btn--dark noae-btn--full noae-mt-6">Checkout</a>';
    }
    wireQtyControls(body);
  }

  function renderCartPage() {
    var wrap = document.getElementById("cartPageContent");
    if (!wrap) return;
    var items = getEnrichedItems();
    var empty = document.getElementById("cartEmptyState");
    var filled = document.getElementById("cartFilledState");
    if (!items.length) {
      if (empty) empty.classList.remove("noae-hide");
      if (filled) filled.classList.add("noae-hide");
      return;
    }
    if (empty) empty.classList.add("noae-hide");
    if (filled) filled.classList.remove("noae-hide");

    var tbody = document.getElementById("cartTableBody");
    if (tbody) {
      tbody.innerHTML = items.map(function (item) {
        return (
          '<tr data-id="' + item.id + '" data-variant="' + item.variant + '">' +
            '<td><div class="noae-cart-table__product">' +
              '<img src="' + item.product.image + '" alt="' + item.product.name + ' — ' + item.variant + '" width="90" height="90" loading="lazy">' +
              '<div><p class="noae-cart-item__name">' + item.product.name + '</p><p class="noae-cart-item__variant">Size: ' + item.variant + '</p>' +
              '<button type="button" class="noae-cart-item__remove js-cart-remove">Remove</button></div>' +
            '</div></td>' +
            '<td>' + fmt(item.unitPrice) + '</td>' +
            '<td><div class="noae-qty-selector"><button type="button" class="js-qty-dec" aria-label="Decrease quantity">−</button><input type="text" readonly value="' + item.qty + '"><button type="button" class="js-qty-inc" aria-label="Increase quantity">+</button></div></td>' +
            '<td><strong>' + fmt(item.lineTotal) + '</strong></td>' +
          '</tr>'
        );
      }).join("");
      wireQtyControls(tbody);
    }

    var progressEl = document.getElementById("cartPageProgress");
    if (progressEl) progressEl.innerHTML = progressMarkup();

    renderSummary();
  }

  function renderSummary() {
    var subtotalEl = document.getElementById("summarySubtotal");
    var discountRow = document.getElementById("summaryDiscountRow");
    var discountEl = document.getElementById("summaryDiscount");
    var shippingEl = document.getElementById("summaryShipping");
    var totalEl = document.getElementById("summaryTotal");
    if (!subtotalEl) return;
    var subtotal = getSubtotal();
    var discount = getDiscount();
    var shipping = getShipping();
    subtotalEl.textContent = fmt(subtotal);
    if (discount > 0) {
      discountRow.classList.remove("noae-hide");
      discountEl.textContent = "−" + fmt(discount);
    } else if (discountRow) {
      discountRow.classList.add("noae-hide");
    }
    shippingEl.textContent = shipping === 0 ? "FREE" : fmt(shipping);
    totalEl.textContent = fmt(getTotal());

    var couponInput = document.getElementById("couponInput");
    if (couponInput && getCoupon()) couponInput.value = getCoupon();
  }

  function wireQtyControls(scope) {
    scope.querySelectorAll(".js-qty-inc").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest("[data-id]");
        var input = row.querySelector("input");
        var newQty = parseInt(input.value, 10) + 1;
        updateQty(row.dataset.id, row.dataset.variant, newQty);
      });
    });
    scope.querySelectorAll(".js-qty-dec").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest("[data-id]");
        var input = row.querySelector("input");
        var newQty = parseInt(input.value, 10) - 1;
        if (newQty < 1) return;
        updateQty(row.dataset.id, row.dataset.variant, newQty);
      });
    });
    scope.querySelectorAll(".js-cart-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest("[data-id]");
        removeItem(row.dataset.id, row.dataset.variant);
        if (window.NoaeToast) window.NoaeToast.show("Item removed from bag", "default");
      });
    });
  }

  function wireCouponForm() {
    var form = document.getElementById("couponForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("couponInput");
      var feedback = document.getElementById("couponFeedback");
      var result = applyCoupon(input.value);
      if (feedback) {
        feedback.textContent = result.message;
        feedback.className = "noae-coupon-feedback " + (result.ok ? "is-success" : "is-error");
      }
      if (window.NoaeToast) window.NoaeToast.show(result.message, result.ok ? "success" : "error");
    });
  }

  function init() {
    updateBadge();
    renderDrawer();
    renderCartPage();
    wireCouponForm();
    document.addEventListener("noae:cart-updated", function () {
      updateBadge();
      renderDrawer();
      renderCartPage();
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  window.NoaeCart = {
    addItem: addItem,
    removeItem: removeItem,
    updateQty: updateQty,
    getEnrichedItems: getEnrichedItems,
    getSubtotal: getSubtotal,
    getDiscount: getDiscount,
    getShipping: getShipping,
    getTotal: getTotal,
    getCount: getCount,
    applyCoupon: applyCoupon,
    getCoupon: getCoupon,
    FREE_SHIP_THRESHOLD: FREE_SHIP_THRESHOLD,
    VALID_COUPON: VALID_COUPON,
    updateBadge: updateBadge,
    renderDrawer: renderDrawer,
    renderCartPage: renderCartPage
  };
})();
