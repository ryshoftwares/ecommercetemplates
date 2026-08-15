/* ==========================================================================
   VELORA (Shopify theme) — Cart (AJAX Cart API)
   Ported from the demo's js/cart.js, rewired from localStorage onto
   Shopify's real Cart API: /cart/add.js, /cart/change.js, /cart/update.js,
   /cart.js. Drives both the slide-in cart drawer (snippets/cart-drawer.liquid)
   and the cart page (sections/main-cart.liquid) from the same live cart
   object, so the two are always in sync.

   FREE SHIPPING BAR: uses window.Velora.cartFreeShippingThreshold (from
   settings.cart_free_shipping_threshold, config/settings_schema.json). This
   value is in the shop's currency subunit as configured by the merchant —
   Shopify's own Settings > General currency governs what actually gets
   charged at checkout; this bar is a presentational nudge only.

   DISCOUNT CODE LIMITATION (see sections/main-cart.liquid comment): Shopify
   does not expose discount-code validation to theme JavaScript. Submitting
   the coupon form here stores the code as a cart note attribute via
   /cart/update.js (purely informational, visible to the merchant on the
   order) and shows the shopper a message that codes are applied at
   checkout. No discount amount is invented or displayed.
   ========================================================================== */

(function (global) {
  "use strict";

  var routes = (global.Velora && global.Velora.routes) || {
    cart_add_url: "/cart/add.js",
    cart_change_url: "/cart/change.js",
    cart_update_url: "/cart/update.js"
  };
  var FREE_SHIP_THRESHOLD = (global.Velora && global.Velora.cartFreeShippingThreshold) || 4000;

  function fmt(cents) {
    return (global.Velora && global.Velora.formatMoney) ? global.Velora.formatMoney(cents) : "₹" + Math.round(cents / 100);
  }

  function getCart() {
    return fetch("/cart.js", { headers: { Accept: "application/json" } }).then(function (r) { return r.json(); });
  }

  function addItem(variantId, quantity, properties) {
    var body = { id: variantId, quantity: quantity || 1 };
    if (properties) body.properties = properties;
    return fetch((routes.cart_add_url || "/cart/add.js"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (err) { throw err; });
      return r.json();
    }).then(function (item) {
      return refreshAll().then(function () { return item; });
    });
  }

  function changeLine(key, quantity) {
    return fetch((routes.cart_change_url || "/cart/change.js"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: key, quantity: quantity })
    }).then(function (r) { return r.json(); }).then(function (cart) {
      renderFromCart(cart);
      return cart;
    });
  }

  function removeLine(key) { return changeLine(key, 0); }

  function updateNote(attributes) {
    return fetch((routes.cart_update_url || "/cart/update.js"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ attributes: attributes })
    }).then(function (r) { return r.json(); });
  }

  function refreshAll() {
    return getCart().then(function (cart) {
      renderFromCart(cart);
      return cart;
    });
  }

  /* ---------------------------------------------------------------------
     Rendering — shared markup builders for drawer + page line items
  --------------------------------------------------------------------- */
  function qtyStepperHTML(key, qty) {
    return (
      '<div class="qty-stepper" data-qty-stepper data-key="' + key + '">' +
        '<button type="button" data-qty-dec aria-label="Decrease quantity">-</button>' +
        '<input type="number" min="1" value="' + qty + '" aria-label="Quantity" data-qty-input>' +
        '<button type="button" data-qty-inc aria-label="Increase quantity">+</button>' +
      "</div>"
    );
  }

  function cartLineHTML(item) {
    return (
      '<div class="cart-line" data-line-key="' + item.key + '">' +
        '<img src="' + (item.image || "") + '" alt="' + item.product_title + '" width="84" height="100">' +
        "<div>" +
          '<div class="cart-line-name">' + item.product_title + "</div>" +
          (item.variant_title ? '<div class="cart-line-variant">' + item.variant_title + "</div>" : "") +
          qtyStepperHTML(item.key, item.quantity) +
          '<div><button type="button" class="cart-line-remove" data-remove-line data-key="' + item.key + '">Remove</button></div>' +
        "</div>" +
        '<div class="cart-line-price">' + fmt(item.final_line_price) + "</div>" +
      "</div>"
    );
  }

  function cartRowHTML(item) {
    return (
      '<div class="cart-row" data-line-key="' + item.key + '">' +
        '<div class="cart-row-product">' +
          '<img src="' + (item.image || "") + '" alt="' + item.product_title + '" width="96" height="120">' +
          "<div>" +
            '<div class="cart-line-name"><a href="' + item.url + '">' + item.product_title + "</a></div>" +
            (item.variant_title ? '<div class="cart-line-variant">' + item.variant_title + "</div>" : "") +
            '<button type="button" class="cart-line-remove" data-remove-line data-key="' + item.key + '">Remove</button>' +
          "</div>" +
        "</div>" +
        "<div>" + fmt(item.price) + "</div>" +
        "<div>" + qtyStepperHTML(item.key, item.quantity) + "</div>" +
        '<div class="cart-line-price">' + fmt(item.final_line_price) + "</div>" +
      "</div>"
    );
  }

  function emptyCartHTML() {
    return (
      '<div class="cart-empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6"/></svg>' +
        "<h3>Your cart is empty</h3>" +
        '<p class="text-muted">Looks like you haven\'t added anything yet.</p>' +
        '<a href="' + ((global.Velora && global.Velora.routes.all_products_collection_url) || "/collections/all") + '" class="btn btn-primary">Continue Shopping</a>' +
      "</div>"
    );
  }

  function renderFreeShipBar(container, cart) {
    if (!container) return;
    var payable = cart.total_price;
    var remaining = FREE_SHIP_THRESHOLD * 100 - payable; /* threshold setting is in major currency units */
    var pct = Math.min(100, Math.round((payable / (FREE_SHIP_THRESHOLD * 100)) * 100));
    if (remaining <= 0) {
      container.innerHTML = '<strong>You\'ve unlocked FREE SHIPPING</strong><div class="freeship-track"><div class="freeship-fill" style="width:100%"></div></div>';
    } else {
      container.innerHTML = "Add " + fmt(remaining) + ' more to unlock <strong>FREE SHIPPING</strong><div class="freeship-track"><div class="freeship-fill" style="width:' + pct + '%"></div></div>';
    }
  }

  function renderSummary(root, cart) {
    var set = function (sel, val) { var el = root.querySelector(sel); if (el) el.textContent = val; };
    set("[data-subtotal]", fmt(cart.original_total_price != null ? cart.original_total_price : cart.total_price));
    set("[data-discount]", cart.total_discount ? "-" + fmt(cart.total_discount) : fmt(0));
    var discountRow = root.querySelector("[data-discount-row]");
    if (discountRow) discountRow.style.display = cart.total_discount ? "flex" : "none";
    var shippingEl = root.querySelector("[data-shipping]");
    if (shippingEl) {
      shippingEl.textContent = cart.total_price >= FREE_SHIP_THRESHOLD * 100 ? "FREE" : "Calculated at checkout";
    }
    set("[data-total]", fmt(cart.total_price));
  }

  function bindQtyAndRemove(root) {
    if (root.__veloraCartBound) return;
    root.__veloraCartBound = true;
    root.addEventListener("click", function (e) {
      var stepper = e.target.closest("[data-qty-stepper]");
      var removeBtn = e.target.closest("[data-remove-line]");
      if (stepper) {
        var key = stepper.getAttribute("data-key");
        var input = stepper.querySelector("[data-qty-input]");
        if (e.target.closest("[data-qty-inc]")) { input.value = parseInt(input.value, 10) + 1; changeLine(key, parseInt(input.value, 10)); }
        if (e.target.closest("[data-qty-dec]")) { input.value = Math.max(1, parseInt(input.value, 10) - 1); changeLine(key, parseInt(input.value, 10)); }
      }
      if (removeBtn) {
        removeLine(removeBtn.getAttribute("data-key")).then(function () {
          if (global.Velora.toast) global.Velora.toast.show("Item removed from cart", "info");
        });
      }
    });
    root.addEventListener("change", function (e) {
      var input = e.target.closest("[data-qty-input]");
      if (!input) return;
      var stepper = input.closest("[data-qty-stepper]");
      var key = stepper.getAttribute("data-key");
      var qty = Math.max(1, parseInt(input.value, 10) || 1);
      changeLine(key, qty);
    });
  }

  function renderDrawer(cart) {
    var itemsEl = document.querySelector("[data-cart-drawer-items]");
    var footEl = document.querySelector("[data-cart-drawer-foot]");
    var freeship = document.querySelector(".cart-drawer [data-freeship-bar]");
    var badge = document.querySelectorAll("[data-cart-count]");
    badge.forEach(function (el) { el.textContent = cart.item_count; el.style.display = cart.item_count > 0 ? "flex" : "none"; });
    if (!itemsEl) return;
    renderFreeShipBar(freeship, cart);
    if (!cart.item_count) {
      itemsEl.innerHTML = emptyCartHTML();
      if (footEl) footEl.style.display = "none";
      return;
    }
    if (footEl) footEl.style.display = "";
    itemsEl.innerHTML = cart.items.map(cartLineHTML).join("");
    if (footEl) renderSummary(footEl, cart);
    bindQtyAndRemove(document.querySelector(".cart-drawer"));
  }

  function renderCartPage(cart) {
    var wrap = document.querySelector("[data-cart-page]");
    if (!wrap) return;
    /* Full re-render of the page section on quantity/remove changes so it
       always matches the server-rendered structure exactly. */
    var rowsEl = wrap.querySelector("[data-cart-rows]");
    var layoutEl = wrap.querySelector("[data-cart-layout]");
    var emptyEl = wrap.querySelector("[data-cart-empty]");
    var freeship = wrap.querySelector("[data-freeship-bar]");
    if (!cart.item_count) {
      if (layoutEl) layoutEl.style.display = "none";
      if (!emptyEl) {
        emptyEl = document.createElement("div");
        emptyEl.setAttribute("data-cart-empty", "");
        wrap.appendChild(emptyEl);
      }
      emptyEl.style.display = "";
      emptyEl.innerHTML = emptyCartHTML();
      return;
    }
    if (emptyEl) emptyEl.style.display = "none";
    if (layoutEl) layoutEl.style.display = "";
    if (rowsEl) rowsEl.innerHTML = cart.items.map(cartRowHTML).join("");
    renderFreeShipBar(freeship, cart);
    var summaryEl = wrap.querySelector("[data-cart-summary]");
    if (summaryEl) renderSummary(summaryEl, cart);
    bindQtyAndRemove(wrap);
  }

  function renderFromCart(cart) {
    renderDrawer(cart);
    renderCartPage(cart);
  }

  /* ---------------------------------------------------------------------
     Cart drawer open/close
  --------------------------------------------------------------------- */
  function initCartDrawerToggle() {
    var openers = document.querySelectorAll("[data-cart-open]");
    var drawer = document.querySelector("[data-cart-drawer]");
    var backdrop = document.querySelector("[data-cart-drawer-backdrop]");
    var closeBtn = document.querySelector("[data-cart-close]");
    if (!drawer || !backdrop) return;
    function open(e) {
      if (e) e.preventDefault();
      refreshAll();
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    openers.forEach(function (btn) { btn.addEventListener("click", open); });
    if (closeBtn) closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    global.Velora = global.Velora || {};
    global.Velora.cartDrawer = { open: open, close: close };
  }

  /* ---------------------------------------------------------------------
     Discount code note (documented limitation — see file header)
  --------------------------------------------------------------------- */
  function initCouponForms() {
    document.querySelectorAll("[data-coupon-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("[data-coupon-input]");
        var msg = form.querySelector("[data-coupon-msg]") || form.parentElement.querySelector("[data-coupon-msg]");
        var code = (input.value || "").trim();
        if (!code) return;
        updateNote({ discount_code_requested: code }).then(function () {
          if (msg) {
            msg.textContent = "Saved. Enter \"" + code + "\" again at checkout — Shopify validates and applies discount codes only at checkout, not in the cart.";
            msg.className = "coupon-msg is-success";
          }
        }).catch(function () {
          if (msg) { msg.textContent = "Couldn't save that code right now — you can still enter it at checkout."; msg.className = "coupon-msg is-error"; }
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Product form submit (PDP add-to-cart) -> AJAX instead of full postback,
     unless JS fails to load (progressive enhancement — the form still works
     as a normal POST to /cart/add without JS).
  --------------------------------------------------------------------- */
  function initProductForms() {
    document.querySelectorAll("[data-product-form-el]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var submitBtn = form.querySelector("[data-pdp-add]");
        var variantInput = form.querySelector('[name="id"]');
        var qtyInput = form.querySelector('[name="quantity"]');
        var variantId = variantInput ? variantInput.value : null;
        var qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
        if (!variantId) return;
        if (submitBtn) submitBtn.setAttribute("disabled", "disabled");
        addItem(variantId, qty).then(function () {
          if (global.Velora.toast) global.Velora.toast.show("Added to cart", "success");
          if (global.Velora.cartDrawer && global.Velora.cartTypeDrawer) global.Velora.cartDrawer.open();
        }).catch(function () {
          if (global.Velora.toast) global.Velora.toast.show("Couldn't add that item — it may be sold out.", "error");
        }).finally(function () {
          if (submitBtn) submitBtn.removeAttribute("disabled");
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCartDrawerToggle();
    initCouponForms();
    initProductForms();
    refreshAll();
  });

  global.Velora = global.Velora || {};
  global.Velora.cart = {
    getCart: getCart,
    addItem: addItem,
    changeLine: changeLine,
    removeLine: removeLine,
    updateNote: updateNote,
    refresh: refreshAll
  };
})(window);
