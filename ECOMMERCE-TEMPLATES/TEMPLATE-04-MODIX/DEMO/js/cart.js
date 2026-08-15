/* ==========================================================================
   MODIX — js/cart.js
   Cart drawer (all pages) + cart.html page. Persists to localStorage.
   Coupon "MODIX10" = 10% off subtotal (demo only).
   Free shipping unlocks at subtotal >= FREE_SHIPPING_THRESHOLD.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "modix_cart";
  var COUPON_KEY = "modix_cart_coupon";
  var FREE_SHIPPING_THRESHOLD = 2999;
  var SHIPPING_FLAT_FEE = 199;
  var VALID_COUPON = "MODIX10";
  var COUPON_DISCOUNT_RATE = 0.10;

  var data = window.MODIX.data;

  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCountBadges();
  }
  function readCoupon() {
    return localStorage.getItem(COUPON_KEY) || "";
  }
  function writeCoupon(code) {
    if (code) localStorage.setItem(COUPON_KEY, code);
    else localStorage.removeItem(COUPON_KEY);
  }

  function lineKey(id, color, variant) { return id + "::" + (color || "") + "::" + (variant || ""); }

  function addToCart(id, qty, color, variant) {
    qty = qty || 1;
    var cart = readCart();
    var key = lineKey(id, color, variant);
    var existing = cart.filter(function (l) { return lineKey(l.id, l.color, l.variant) === key; })[0];
    if (existing) { existing.qty += qty; }
    else { cart.push({ id: id, qty: qty, color: color || "", variant: variant || "" }); }
    writeCart(cart);
    renderCartDrawer();
    return cart;
  }

  function removeLine(id, color, variant) {
    var cart = readCart().filter(function (l) { return lineKey(l.id, l.color, l.variant) !== lineKey(id, color, variant); });
    writeCart(cart);
    renderCartDrawer();
    renderCartPage();
  }

  function setQty(id, color, variant, qty) {
    var cart = readCart();
    var key = lineKey(id, color, variant);
    cart.forEach(function (l) { if (lineKey(l.id, l.color, l.variant) === key) l.qty = Math.max(1, qty); });
    writeCart(cart);
    renderCartDrawer();
    renderCartPage();
  }

  function cartCount() {
    return readCart().reduce(function (sum, l) { return sum + l.qty; }, 0);
  }

  function cartLinesWithProducts() {
    return readCart().map(function (l) {
      var product = data.getProductById(l.id);
      return product ? { line: l, product: product } : null;
    }).filter(Boolean);
  }

  function subtotal() {
    return cartLinesWithProducts().reduce(function (sum, item) { return sum + item.product.price * item.line.qty; }, 0);
  }

  function couponDiscount(sub) {
    return readCoupon() === VALID_COUPON ? Math.round(sub * COUPON_DISCOUNT_RATE) : 0;
  }

  function shippingFee(sub) {
    if (sub === 0) return 0;
    return sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_FEE;
  }

  function totals() {
    var sub = subtotal();
    var discount = couponDiscount(sub);
    var shipping = shippingFee(sub - discount);
    var total = sub - discount + shipping;
    return { subtotal: sub, discount: discount, shipping: shipping, total: total };
  }

  function updateCartCountBadges() {
    var count = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "" : "none";
    });
  }

  /* ------------------------------------------------------------------
     Cart drawer rendering (present on every page)
     ------------------------------------------------------------------ */
  function cartDrawerItemHTML(item) {
    var product = item.product, line = item.line;
    var variantLabel = [line.color, line.variant].filter(Boolean).join(" / ");
    return (
      '<div class="cart-item" data-line-key="' + lineKey(line.id, line.color, line.variant) + '">' +
        '<div class="cart-item__media"><img src="' + product.image + '" alt="' + product.name + '" width="76" height="76" loading="lazy"></div>' +
        '<div>' +
          '<div class="cart-item__name">' + product.name + "</div>" +
          (variantLabel ? '<div class="cart-item__variant">' + variantLabel + "</div>" : "") +
          '<div class="cart-item__row">' +
            '<div class="qty-stepper qty-stepper--sm" data-qty-stepper data-id="' + line.id + '" data-color="' + line.color + '" data-variant="' + line.variant + '">' +
              '<button type="button" data-step="-1" aria-label="Decrease quantity">–</button>' +
              '<input type="text" inputmode="numeric" value="' + line.qty + '" aria-label="Quantity" readonly>' +
              '<button type="button" data-step="1" aria-label="Increase quantity">+</button>' +
            "</div>" +
            '<span class="cart-item__price">' + data.formatPrice(product.price * line.qty) + "</span>" +
          "</div>" +
          '<button class="cart-item__remove" type="button" data-remove-line data-id="' + line.id + '" data-color="' + line.color + '" data-variant="' + line.variant + '">Remove</button>' +
        "</div>" +
      "</div>"
    );
  }

  function progressBarHTML(sub) {
    var remaining = FREE_SHIPPING_THRESHOLD - sub;
    var pct = Math.min(100, Math.round((sub / FREE_SHIPPING_THRESHOLD) * 100));
    if (remaining <= 0) {
      return '<p><strong>You\'ve unlocked FREE SHIPPING</strong></p><div class="progress-bar"><div class="progress-bar__fill" style="width:100%"></div></div>';
    }
    return (
      '<p>Add <strong>' + data.formatPrice(remaining) + '</strong> more to unlock FREE SHIPPING</p>' +
      '<div class="progress-bar"><div class="progress-bar__fill" style="width:' + pct + '%"></div></div>'
    );
  }

  function renderCartDrawer() {
    var drawer = document.querySelector(".cart-drawer");
    if (!drawer) return;
    var items = cartLinesWithProducts();
    var t = totals();
    var itemsWrap = drawer.querySelector(".cart-drawer__items");
    var progressWrap = drawer.querySelector(".cart-drawer__progress");
    var footer = drawer.querySelector(".cart-drawer__footer");

    if (progressWrap) progressWrap.innerHTML = progressBarHTML(t.subtotal);

    if (!items.length) {
      itemsWrap.innerHTML =
        '<div class="empty-state">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h2l2.6 12.6a2 2 0 002 1.4h8.8a2 2 0 002-1.6L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="17" cy="21" r="1"/></svg>' +
          "<h3>Your cart is empty</h3><p>Add a product to get started.</p>" +
          '<a href="shop.html" class="btn btn-primary">Shop All Products</a>' +
        "</div>";
      if (footer) footer.style.display = "none";
    } else {
      itemsWrap.innerHTML = items.map(cartDrawerItemHTML).join("");
      if (footer) {
        footer.style.display = "";
        footer.querySelector("[data-cart-subtotal]").textContent = data.formatPrice(t.subtotal);
      }
    }
    bindDrawerEvents(drawer);
  }

  function bindDrawerEvents(scope) {
    scope.querySelectorAll("[data-qty-stepper]").forEach(function (stepper) {
      stepper.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var input = stepper.querySelector("input");
          var delta = Number(btn.getAttribute("data-step"));
          var next = Math.max(1, Number(input.value) + delta);
          setQty(Number(stepper.dataset.id), stepper.dataset.color, stepper.dataset.variant, next);
        });
      });
    });
    scope.querySelectorAll("[data-remove-line]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        removeLine(Number(btn.dataset.id), btn.dataset.color, btn.dataset.variant);
        window.MODIX.toast({ type: "info", title: "Removed from cart" });
      });
    });
  }

  /* ------------------------------------------------------------------
     Drawer open/close + global "add to cart" trigger binding
     ------------------------------------------------------------------ */
  function initCartDrawerToggle() {
    var drawer = document.querySelector(".cart-drawer");
    var scrim = document.querySelector("[data-cart-scrim]");
    if (!drawer) return;

    function open() { drawer.classList.add("is-open"); if (scrim) scrim.classList.add("is-visible"); document.body.style.overflow = "hidden"; }
    function close() { drawer.classList.remove("is-open"); if (scrim) scrim.classList.remove("is-visible"); document.body.style.overflow = ""; }

    document.querySelectorAll("[data-cart-open]").forEach(function (btn) { btn.addEventListener("click", function (e) { e.preventDefault(); renderCartDrawer(); open(); }); });
    document.querySelectorAll("[data-cart-close]").forEach(function (btn) { btn.addEventListener("click", close); });
    if (scrim) scrim.addEventListener("click", close);

    window.MODIX.openCartDrawer = function () { renderCartDrawer(); open(); };
    window.MODIX.closeCartDrawer = close;
  }

  function initQuickAddButtons() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-quick-add]");
      if (!btn) return;
      var product = data.getProductById(btn.dataset.id);
      if (!product) return;
      var color = product.colors && product.colors[0] ? product.colors[0].name : "";
      var variant = product.variants && product.variants[0] ? product.variants[0] : "";
      addToCart(product.id, 1, color, variant);
      window.MODIX.toast({ type: "success", title: "Added to cart", message: product.name });
      if (window.MODIX.openCartDrawer) window.MODIX.openCartDrawer();
    });
  }

  /* ------------------------------------------------------------------
     Cart page (cart.html)
     ------------------------------------------------------------------ */
  function renderCartPage() {
    var root = document.querySelector("[data-cart-page]");
    if (!root) return;
    var items = cartLinesWithProducts();
    var t = totals();
    var body = root.querySelector("[data-cart-table-body]");
    var emptyState = root.querySelector("[data-cart-empty]");
    var tableWrap = root.querySelector("[data-cart-table-wrap]");
    var summary = root.querySelector("[data-cart-summary]");

    if (!items.length) {
      if (tableWrap) tableWrap.style.display = "none";
      if (summary) summary.style.display = "none";
      if (emptyState) emptyState.style.display = "";
      return;
    }
    if (tableWrap) tableWrap.style.display = "";
    if (summary) summary.style.display = "";
    if (emptyState) emptyState.style.display = "none";

    body.innerHTML = items.map(function (item) {
      var product = item.product, line = item.line;
      var variantLabel = [line.color, line.variant].filter(Boolean).join(" / ");
      return (
        "<tr>" +
          "<td>" +
            '<div class="cart-table-product">' +
              '<div class="cart-item__media"><img src="' + product.image + '" alt="' + product.name + '" width="84" height="84" loading="lazy"></div>' +
              "<div>" +
                '<div class="cart-item__name">' + product.name + "</div>" +
                (variantLabel ? '<div class="cart-item__variant">' + variantLabel + "</div>" : "") +
                '<button class="cart-item__remove" type="button" data-remove-line data-id="' + line.id + '" data-color="' + line.color + '" data-variant="' + line.variant + '">Remove</button>' +
              "</div>" +
            "</div>" +
          "</td>" +
          '<td class="mono">' + data.formatPrice(product.price) + "</td>" +
          "<td>" +
            '<div class="qty-stepper" data-qty-stepper data-id="' + line.id + '" data-color="' + line.color + '" data-variant="' + line.variant + '">' +
              '<button type="button" data-step="-1" aria-label="Decrease quantity">–</button>' +
              '<input type="text" inputmode="numeric" value="' + line.qty + '" aria-label="Quantity" readonly>' +
              '<button type="button" data-step="1" aria-label="Increase quantity">+</button>' +
            "</div>" +
          "</td>" +
          '<td class="mono"><strong>' + data.formatPrice(product.price * line.qty) + "</strong></td>" +
        "</tr>"
      );
    }).join("");

    bindDrawerEvents(root);

    root.querySelector("[data-summary-subtotal]").textContent = data.formatPrice(t.subtotal);
    root.querySelector("[data-summary-discount]").textContent = t.discount ? "−" + data.formatPrice(t.discount) : data.formatPrice(0);
    root.querySelector("[data-summary-shipping]").textContent = t.shipping ? data.formatPrice(t.shipping) : "FREE";
    root.querySelector("[data-summary-total]").textContent = data.formatPrice(t.total);

    var progress = root.querySelector("[data-cart-progress]");
    if (progress) progress.innerHTML = progressBarHTML(t.subtotal);

    var couponMsg = root.querySelector("[data-coupon-message]");
    if (couponMsg) {
      if (readCoupon() === VALID_COUPON) {
        couponMsg.className = "coupon-success";
        couponMsg.textContent = "MODIX10 applied — 10% off your subtotal.";
      } else {
        couponMsg.textContent = "";
      }
    }
  }

  function initCouponForms() {
    document.querySelectorAll("[data-coupon-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input");
        var code = (input.value || "").trim().toUpperCase();
        var msg = form.parentElement.querySelector("[data-coupon-message]") || document.querySelector("[data-coupon-message]");
        if (code === VALID_COUPON) {
          writeCoupon(code);
          if (msg) { msg.className = "coupon-success"; msg.textContent = "MODIX10 applied — 10% off your subtotal."; }
          window.MODIX.toast({ type: "success", title: "Coupon applied", message: "10% discount added to your order." });
        } else {
          writeCoupon("");
          if (msg) { msg.className = "coupon-error"; msg.textContent = "That code isn't valid. Try MODIX10."; }
          window.MODIX.toast({ type: "error", title: "Invalid coupon" });
        }
        renderCartPage();
        renderCartDrawer();
      });
    });
  }

  function clearCart() {
    writeCart([]);
    writeCoupon("");
    renderCartDrawer();
    renderCartPage();
  }

  window.MODIX.cart = {
    addToCart: addToCart,
    removeLine: removeLine,
    setQty: setQty,
    cartCount: cartCount,
    subtotal: subtotal,
    totals: totals,
    readCart: readCart,
    readCoupon: readCoupon,
    cartLinesWithProducts: cartLinesWithProducts,
    clearCart: clearCart,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    validCoupon: VALID_COUPON,
    progressBarHTML: progressBarHTML,
    renderCartDrawer: renderCartDrawer,
    renderCartPage: renderCartPage
  };

  document.addEventListener("DOMContentLoaded", function () {
    updateCartCountBadges();
    initCartDrawerToggle();
    initQuickAddButtons();
    initCouponForms();
    renderCartDrawer();
    renderCartPage();
  });
})();
