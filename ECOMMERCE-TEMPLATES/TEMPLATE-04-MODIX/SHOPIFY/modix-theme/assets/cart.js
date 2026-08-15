/* ==========================================================================
   MODIX — assets/cart.js
   AJAX Cart API (/cart/add.js, /cart/change.js, /cart/update.js, /cart.js)
   driving snippets/cart-drawer.liquid + sections/main-cart.liquid, the
   free-shipping progress bar ("Add ₹999 more to unlock FREE SHIPPING",
   threshold from settings.cart_free_shipping_threshold via
   window.ModixSettings, see layout/theme.liquid), and the cart-note /
   attribute based "coupon" field — no fake client-side discount math (see
   the comment at the top of sections/main-cart.liquid for why: Shopify only
   validates and applies discount codes at checkout).
   ========================================================================== */

(function (global) {
  "use strict";

  var settings = global.ModixSettings || {};
  var routes = settings.routes || {};
  var CART_URL = routes.cartUrl || "/cart";
  var ADD_URL = routes.cartAddUrl || "/cart/add.js";
  var CHANGE_URL = routes.cartChangeUrl || "/cart/change.js";
  var UPDATE_URL = routes.cartUpdateUrl || "/cart/update.js";
  var FREE_SHIP_THRESHOLD_CENTS = (settings.cartFreeShippingThreshold || 2999) * 100;
  var MONEY_FORMAT = settings.moneyFormat || "₹{{amount}}";

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
    var whole = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + thousands);
    var cents = parts[1] ? decimal + parts[1] : "";
    return whole + cents;
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
          if (global.Modix && global.Modix.toast) global.Modix.toast({ type: "error", title: "Couldn't add that item to your cart.", message: item.description });
          throw new Error(item.description || "Add to cart failed");
        }
        if (global.Modix && global.Modix.toast) global.Modix.toast({ type: "success", title: "Added to cart", message: item.product_title || "Item" });
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
     class names (.cart-item, .progress-bar, .summary-row, etc.) so one
     render pass can update both containers wherever they exist on the page.
     --------------------------------------------------------------------- */
  function progressBarHTML(cart) {
    if (FREE_SHIP_THRESHOLD_CENTS <= 0) return "";
    var remaining = Math.max(0, FREE_SHIP_THRESHOLD_CENTS - cart.total_price);
    var pct = Math.min(100, Math.round(((FREE_SHIP_THRESHOLD_CENTS - remaining) / FREE_SHIP_THRESHOLD_CENTS) * 100));
    var label = remaining > 0
      ? "Add <strong>" + formatMoney(remaining) + "</strong> more to unlock FREE SHIPPING"
      : "<strong>You've unlocked FREE SHIPPING</strong>";
    return (
      "<p>" + label + "</p>" +
      '<div class="progress-bar"><div class="progress-bar__fill" style="width:' + pct + '%"></div></div>'
    );
  }

  function drawerLineHTML(item) {
    var variantLabel = item.variant_title && item.variant_title !== "Default Title" ? item.variant_title : "";
    return (
      '<div class="cart-item" data-cart-key="' + item.key + '">' +
        '<a href="' + item.url + '" class="cart-item__media">' + (item.image ? '<img src="' + item.image + '" alt="' + (item.product_title || "") + '" width="76" height="76" loading="lazy">' : "") + "</a>" +
        "<div>" +
          '<div class="cart-item__name"><a href="' + item.url + '">' + item.product_title + "</a></div>" +
          (variantLabel ? '<div class="cart-item__variant">' + variantLabel + "</div>" : "") +
          '<div class="cart-item__row">' +
            '<div class="qty-stepper qty-stepper--sm" data-qty-stepper data-cart-key="' + item.key + '">' +
              '<button type="button" data-qty-dec aria-label="Decrease quantity">–</button>' +
              '<input type="number" min="0" value="' + item.quantity + '" aria-label="Quantity" data-qty-input>' +
              '<button type="button" data-qty-inc aria-label="Increase quantity">+</button>' +
            "</div>" +
            '<span class="cart-item__price">' + formatMoney(item.final_line_price) + "</span>" +
          "</div>" +
          '<button type="button" class="cart-item__remove" data-remove-line data-cart-key="' + item.key + '">Remove</button>' +
        "</div>" +
      "</div>"
    );
  }

  function pageRowHTML(item) {
    var variantLabel = item.variant_title && item.variant_title !== "Default Title" ? item.variant_title : "";
    return (
      '<tr data-cart-key="' + item.key + '">' +
        "<td>" +
          '<div class="cart-table-product">' +
            '<a href="' + item.url + '" class="cart-item__media">' + (item.image ? '<img src="' + item.image + '" alt="' + (item.product_title || "") + '" width="84" height="84" loading="lazy">' : "") + "</a>" +
            "<div>" +
              '<div class="cart-item__name"><a href="' + item.url + '">' + item.product_title + "</a></div>" +
              (variantLabel ? '<div class="cart-item__variant">' + variantLabel + "</div>" : "") +
              '<button type="button" class="cart-item__remove" data-remove-line data-cart-key="' + item.key + '">Remove</button>' +
            "</div>" +
          "</div>" +
        "</td>" +
        '<td class="mono">' + formatMoney(item.final_price) + "</td>" +
        "<td>" +
          '<div class="qty-stepper" data-qty-stepper data-cart-key="' + item.key + '">' +
            '<button type="button" data-qty-dec aria-label="Decrease quantity">–</button>' +
            '<input type="number" min="0" value="' + item.quantity + '" aria-label="Quantity" data-qty-input>' +
            '<button type="button" data-qty-inc aria-label="Increase quantity">+</button>' +
          "</div>" +
        "</td>" +
        '<td class="mono"><strong>' + formatMoney(item.final_line_price) + "</strong></td>" +
      "</tr>"
    );
  }

  function summaryRowsHTML(cart) {
    var discount = cart.total_discount || 0;
    return (
      '<div class="summary-row"><span>Subtotal</span><span data-summary-subtotal class="mono">' + formatMoney(cart.original_total_price != null ? cart.original_total_price : cart.total_price) + "</span></div>" +
      (discount > 0 ? '<div class="summary-row"><span>Coupon Discount</span><span class="mono" style="color:var(--color-success);">−' + formatMoney(discount) + "</span></div>" : "") +
      '<div class="summary-row"><span>Shipping</span><span data-summary-shipping class="mono">Calculated at checkout</span></div>' +
      '<div class="summary-row is-total"><span>Total</span><span data-summary-total class="mono">' + formatMoney(cart.total_price) + "</span></div>"
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
        '<div class="empty-state">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h2l2.6 12.6a2 2 0 002 1.4h8.8a2 2 0 002-1.6L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="17" cy="21" r="1"/></svg>' +
          "<h3>Your cart is empty</h3><p>Add a product to get started.</p>" +
          '<a href="' + (routes.allProductsCollectionUrl || "/collections/all") + '" class="btn btn-primary">Shop All Products</a>' +
        "</div>";
      if (footerEl) footerEl.style.display = "none";
      return;
    }
    itemsEl.innerHTML = cart.items.map(drawerLineHTML).join("");
    if (footerEl) {
      footerEl.style.display = "";
      var subtotalEl = footerEl.querySelector("[data-cart-drawer-subtotal]");
      if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
    }
  }

  function renderCartPage(cart) {
    var root = document.querySelector("[data-cart-page]");
    if (!root) return;
    var tableBody = root.querySelector("[data-cart-table-body]");
    var emptyState = root.querySelector("[data-cart-empty]");
    var layoutEl = root.querySelector("[data-cart-page-layout]");
    var progressEl = root.querySelector("[data-cart-progress]");

    if (progressEl) progressEl.innerHTML = cart.item_count > 0 ? progressBarHTML(cart) : "";

    if (cart.item_count === 0) {
      if (layoutEl) layoutEl.style.display = "none";
      if (emptyState) emptyState.style.display = "";
      return;
    }
    if (layoutEl) layoutEl.style.display = "";
    if (emptyState) emptyState.style.display = "none";
    if (tableBody) tableBody.innerHTML = cart.items.map(pageRowHTML).join("");

    var subtotalEl = root.querySelector("[data-summary-subtotal]");
    var totalEl = root.querySelector("[data-summary-total]");
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.original_total_price != null ? cart.original_total_price : cart.total_price);
    if (totalEl) totalEl.textContent = formatMoney(cart.total_price);
  }

  function updateCartCount(cart) {
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = cart.item_count;
      el.style.display = cart.item_count > 0 ? "" : "none";
    });
  }

  function render(cart) {
    updateCartCount(cart);
    renderDrawer(cart);
    renderCartPage(cart);
  }

  /* ---------------------------------------------------------------------
     Drawer open/close
     --------------------------------------------------------------------- */
  function initCartDrawerToggle() {
    var drawer = document.querySelector("[data-cart-drawer]");
    var scrim = document.querySelector("[data-cart-scrim]");
    if (!drawer) return;

    function open() { drawer.classList.add("is-open"); if (scrim) scrim.classList.add("is-visible"); document.body.style.overflow = "hidden"; }
    function close() { drawer.classList.remove("is-open"); if (scrim) scrim.classList.remove("is-visible"); document.body.style.overflow = ""; }

    document.querySelectorAll("[data-cart-open]").forEach(function (btn) { btn.addEventListener("click", function (e) { e.preventDefault(); refresh(); open(); }); });
    document.querySelectorAll("[data-cart-close]").forEach(function (btn) { btn.addEventListener("click", close); });
    if (scrim) scrim.addEventListener("click", close);

    global.Modix = global.Modix || {};
    global.Modix.openCartDrawer = function () { refresh(); open(); };
    global.Modix.closeCartDrawer = close;
    if (global.Modix.app) global.Modix.app.openCartDrawer = global.Modix.openCartDrawer;
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
          if (global.Modix && global.Modix.toast) global.Modix.toast({ type: "info", title: "Removed from cart" });
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
      if (quickAdd && !quickAdd.disabled) {
        e.preventDefault();
        addToCart(quickAdd.getAttribute("data-variant-id"), 1).then(function () {
          if (global.Modix && global.Modix.openCartDrawer) global.Modix.openCartDrawer();
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
        var input = couponForm.querySelector("input[name='attributes[requested_discount_code]']");
        var code = (input.value || "").trim();
        updateAttributes({ requested_discount_code: code }).then(function () {
          var msg = document.querySelector("[data-coupon-message]");
          if (msg && code) {
            msg.className = "coupon-success";
            msg.textContent = 'Saved "' + code + '" to your order note — Shopify validates and applies discount codes at checkout, so enter it again there.';
          }
        });
      });
    }
  }

  /* ---------------------------------------------------------------------
     Init
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initCartDrawerToggle();
    bindEvents();
    refresh();
  });

  global.ModixCart = {
    addToCart: addToCart,
    changeItem: changeItem,
    updateAttributes: updateAttributes,
    refresh: refresh,
    formatMoney: formatMoney
  };
})(window);
