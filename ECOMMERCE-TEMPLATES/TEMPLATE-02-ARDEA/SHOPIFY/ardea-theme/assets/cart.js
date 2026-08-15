/* ==========================================================================
   ARDEA — assets/cart.js
   AJAX Cart API (/cart/add.js, /cart/change.js, /cart/update.js, /cart.js)
   driving snippets/cart-drawer.liquid + sections/main-cart.liquid, the
   free-shipping progress bar (settings.cart_free_shipping_threshold via
   window.ArdeaSettings, see layout/theme.liquid), and the cart-note /
   attribute based "coupon" field (no fake client-side discount math — see
   the comment at the top of sections/main-cart.liquid for why).
   ========================================================================== */

(function (global) {
  "use strict";

  var routes = (global.ArdeaSettings && global.ArdeaSettings.routes) || {};
  var CART_URL = routes.cartUrl || "/cart";
  var ADD_URL = routes.cartAddUrl || "/cart/add.js";
  var CHANGE_URL = routes.cartChangeUrl || "/cart/change.js";
  var UPDATE_URL = routes.cartUpdateUrl || "/cart/update.js";
  var FREE_SHIP_THRESHOLD_CENTS = ((global.ArdeaSettings && global.ArdeaSettings.cartFreeShippingThreshold) || 0) * 100;
  var MONEY_FORMAT = (global.ArdeaSettings && global.ArdeaSettings.moneyFormat) || "₹{{amount}}";

  /* ---------------------------------------------------------------------
     Money formatting (Shopify's standard money_format token replacement)
     --------------------------------------------------------------------- */
  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = precision >= 0 ? precision : 2;
    thousands = thousands === undefined ? "," : thousands;
    decimal = decimal === undefined ? "." : decimal;
    if (isNaN(number) || number == null) return "0";
    number = (number / 100.0).toFixed(precision);
    var parts = number.split(".");
    var dollars = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + thousands);
    var cents = parts[1] ? decimal + parts[1] : "";
    return dollars + cents;
  }
  function formatMoney(cents) {
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var match = MONEY_FORMAT.match(placeholderRegex);
    var token = match ? match[1] : "amount";
    var value;
    switch (token) {
      case "amount_no_decimals": value = formatWithDelimiters(cents, 0); break;
      case "amount_with_comma_separator": value = formatWithDelimiters(cents, 2, ".", ","); break;
      case "amount_no_decimals_with_comma_separator": value = formatWithDelimiters(cents, 0, ".", ","); break;
      default: value = formatWithDelimiters(cents, 2);
    }
    return MONEY_FORMAT.replace(placeholderRegex, value);
  }

  /* ---------------------------------------------------------------------
     AJAX Cart API
     --------------------------------------------------------------------- */
  function fetchCart() {
    return fetch(CART_URL + ".js", { headers: { Accept: "application/json" } }).then(function (r) { return r.json(); });
  }
  function addToCart(variantId, qty) {
    return fetch(ADD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: variantId, quantity: qty || 1 })
    })
      .then(function (r) { return r.json(); })
      .then(function (item) {
        if (item.status) {
          if (global.ArdeaToast) global.ArdeaToast.show(item.description || "Couldn't add that item to your cart.", "error");
          throw new Error(item.description || "Add to cart failed");
        }
        if (global.ArdeaToast) global.ArdeaToast.show((item.product_title || "Item") + " added to cart", "success");
        return refresh().then(function () { return item; });
      });
  }
  function changeItem(key, qty) {
    return fetch(CHANGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: key, quantity: qty })
    })
      .then(function (r) { return r.json(); })
      .then(function (cart) { render(cart); return cart; });
  }
  function updateAttributes(attributes) {
    return fetch(UPDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ attributes: attributes })
    })
      .then(function (r) { return r.json(); })
      .then(function (cart) { render(cart); return cart; });
  }
  function refresh() {
    return fetchCart().then(function (cart) { render(cart); return cart; });
  }

  /* ---------------------------------------------------------------------
     Rendering — shared between the drawer (snippets/cart-drawer.liquid)
     and the cart page (sections/main-cart.liquid); both use identical
     class names (.cart-line, .cart-progress, .summary-row, etc.) so one
     render pass can update both containers wherever they exist on the page.
     --------------------------------------------------------------------- */
  function progressBarHTML(cart) {
    if (FREE_SHIP_THRESHOLD_CENTS <= 0) return "";
    var remaining = Math.max(0, FREE_SHIP_THRESHOLD_CENTS - cart.total_price);
    var pct = Math.min(100, Math.round(((FREE_SHIP_THRESHOLD_CENTS - remaining) / FREE_SHIP_THRESHOLD_CENTS) * 100));
    var label = remaining > 0
      ? "Add <strong>" + formatMoney(remaining) + "</strong> more to unlock <strong>FREE DELIVERY</strong>"
      : "You've unlocked <strong>FREE DELIVERY</strong>";
    return (
      '<div class="cart-progress">' +
        '<p class="cart-progress__label' + (remaining > 0 ? "" : " is-met") + '">' + label + "</p>" +
        '<div class="cart-progress__track"><div class="cart-progress__bar" style="width:' + pct + '%"></div></div>' +
      "</div>"
    );
  }

  function lineHTML(item, context) {
    var meta = [];
    if (item.variant_title && item.variant_title !== "Default Title") meta.push(item.variant_title);
    if (item.product_type) meta.push(item.product_type);
    return (
      '<div class="cart-line" data-line data-cart-key="' + item.key + '">' +
        '<a href="' + item.url + '">' +
          (item.image ? '<img class="cart-line__img" src="' + item.image + '" alt="' + (item.product_title || "") + '" width="84" height="100">' : "") +
        "</a>" +
        '<div class="cart-line__body">' +
          '<h4 class="cart-line__name"><a href="' + item.url + '">' + item.product_title + "</a></h4>" +
          (meta.length ? '<p class="cart-line__meta">' + meta.join(" · ") + "</p>" : "") +
          '<div class="cart-line__price">' + formatMoney(item.final_line_price) + "</div>" +
          (context === "page"
            ? '<div class="qty-stepper" data-qty-stepper data-cart-key="' + item.key + '">' +
                '<button type="button" data-qty-dec aria-label="Decrease quantity">−</button>' +
                '<input type="number" min="0" value="' + item.quantity + '" aria-label="Quantity" data-qty-input>' +
                '<button type="button" data-qty-inc aria-label="Increase quantity">+</button>' +
              "</div>"
            : '<p class="cart-line__meta">Qty: ' + item.quantity + "</p>"
          ) +
          '<button type="button" class="cart-line__remove" data-remove-line data-cart-key="' + item.key + '">Remove</button>' +
        "</div>" +
      "</div>"
    );
  }

  function summaryHTML(cart) {
    var discount = cart.total_discount || cart.cart_level_discount_applications && cart.cart_level_discount_applications.reduce(function (s, d) { return s + (d.total_allocated_amount || 0); }, 0) || 0;
    return (
      '<div class="summary-row"><span>Subtotal</span><span>' + formatMoney(cart.items_subtotal_price != null ? cart.items_subtotal_price : cart.original_total_price) + "</span></div>" +
      (discount > 0 ? '<div class="summary-row"><span>Discount</span><span class="value--accent">-' + formatMoney(discount) + "</span></div>" : "") +
      '<div class="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>' +
      '<div class="summary-row summary-row--total"><span>Total</span><span>' + formatMoney(cart.total_price) + "</span></div>"
    );
  }

  function renderDrawer(cart) {
    var itemsEl = document.querySelector("[data-cart-drawer-items]");
    var progressEl = document.querySelector("[data-cart-drawer-progress]");
    var footerEl = document.querySelector("[data-cart-drawer-footer]");
    if (!itemsEl) return;

    if (progressEl) progressEl.innerHTML = cart.item_count > 0 ? progressBarHTML(cart) : "";

    if (cart.item_count === 0) {
      itemsEl.innerHTML =
        '<div class="cart-empty">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 4h2l1.6 10.6a2 2 0 002 1.4h7.6a2 2 0 002-1.7L20 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>' +
          "<h3>Your cart is empty</h3>" +
          '<p class="lead" style="margin-top:0.5rem;">Browse our collections to find your next piece.</p>' +
          '<a href="/collections/all" class="btn btn--dark" style="margin-top:1.5rem;">Continue Shopping</a>' +
        "</div>";
      if (footerEl) { footerEl.innerHTML = ""; footerEl.style.display = "none"; }
      return;
    }

    itemsEl.innerHTML = cart.items.map(function (item) { return lineHTML(item, "drawer"); }).join("");
    if (footerEl) {
      footerEl.style.display = "";
      footerEl.innerHTML =
        summaryHTML(cart) +
        '<a href="' + CART_URL + '" class="btn btn--outline btn--full" style="margin-top:1rem;">View Cart</a>' +
        '<a href="' + CART_URL + '/checkout" class="btn btn--primary btn--full" style="margin-top:0.75rem;">Checkout</a>';
    }
  }

  function renderCartPage(cart) {
    var itemsEl = document.querySelector("[data-cart-page-items]");
    if (!itemsEl) return;
    var progressEl = document.querySelector("[data-cart-page-progress]");
    var emptyEl = document.querySelector("[data-cart-page-empty]");
    var layoutEl = document.querySelector("[data-cart-page-layout]");
    var summaryEl = document.querySelector("[data-cart-page-summary]");

    if (progressEl) progressEl.innerHTML = cart.item_count > 0 ? progressBarHTML(cart) : "";

    if (cart.item_count === 0) {
      if (layoutEl) layoutEl.style.display = "none";
      if (emptyEl) emptyEl.style.display = "";
      return;
    }
    if (layoutEl) layoutEl.style.display = "";
    if (emptyEl) emptyEl.style.display = "none";

    itemsEl.innerHTML = cart.items.map(function (item) { return lineHTML(item, "page"); }).join("");
    if (summaryEl) summaryEl.innerHTML = summaryHTML(cart);
  }

  function updateCartCount(cart) {
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = cart.item_count;
      el.style.display = cart.item_count > 0 ? "flex" : "none";
    });
  }

  function render(cart) {
    updateCartCount(cart);
    renderDrawer(cart);
    renderCartPage(cart);
  }

  /* ---------------------------------------------------------------------
     Event bindings (delegated — works for both drawer and page markup)
     --------------------------------------------------------------------- */
  function bindEvents() {
    document.addEventListener("click", function (e) {
      var removeBtn = e.target.closest("[data-remove-line]");
      if (removeBtn) {
        e.preventDefault();
        changeItem(removeBtn.getAttribute("data-cart-key"), 0).then(function () {
          if (global.ArdeaToast) global.ArdeaToast.show("Removed from cart", "info");
        });
        return;
      }
      var incBtn = e.target.closest("[data-qty-inc]");
      var decBtn = e.target.closest("[data-qty-dec]");
      if (incBtn || decBtn) {
        e.preventDefault();
        var stepper = (incBtn || decBtn).closest("[data-cart-key]");
        var key = stepper.getAttribute("data-cart-key");
        var input = stepper.querySelector("input");
        var qty = Math.max(0, (Number(input.value) || 1) + (incBtn ? 1 : -1));
        input.value = qty;
        changeItem(key, qty);
        return;
      }
      var quickAdd = e.target.closest("[data-quickadd]");
      if (quickAdd) {
        e.preventDefault();
        addToCart(quickAdd.getAttribute("data-variant-id"), 1).then(function () {
          if (global.ArdeaApp) global.ArdeaApp.openCartDrawer();
        }).catch(function () {});
      }
    });

    document.addEventListener("change", function (e) {
      var input = e.target.closest("[data-qty-input]");
      if (input) {
        var stepper = input.closest("[data-cart-key]");
        var key = stepper.getAttribute("data-cart-key");
        changeItem(key, Math.max(0, Number(input.value) || 0));
      }
    });

    var couponForm = document.querySelector("[data-coupon-form]");
    if (couponForm) {
      couponForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = couponForm.querySelector("[data-coupon-input]");
        var code = (input.value || "").trim();
        updateAttributes({ requested_discount_code: code }).then(function () {
          var note = document.querySelector("[data-coupon-note]");
          if (note && code) {
            note.textContent = "Saved \"" + code + "\" to your order note — Shopify validates and applies discount codes at checkout, so enter it again there.";
            note.className = "coupon-note is-success";
          }
        });
      });
    }
  }

  /* ---------------------------------------------------------------------
     Init
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    bindEvents();
    refresh();
  });

  global.ArdeaCart = {
    addToCart: addToCart,
    changeItem: changeItem,
    updateAttributes: updateAttributes,
    refresh: refresh,
    formatMoney: formatMoney
  };
})(window);
