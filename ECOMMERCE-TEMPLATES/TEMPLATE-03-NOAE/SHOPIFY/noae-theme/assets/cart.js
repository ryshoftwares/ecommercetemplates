/* ==========================================================================
   NOAÉ (Shopify theme) — Bag (AJAX Cart API)
   Ported from the demo's js/cart.js, rewired from localStorage onto
   Shopify's real Cart API: /cart/add.js, /cart/change.js, /cart/update.js,
   /cart.js. Drives both the slide-in bag drawer (snippets/cart-drawer.liquid)
   and the bag page (sections/main-cart.liquid) from the same live cart
   object, so the two are always in sync.

   FREE SHIPPING BAR: uses window.Noae.cartFreeShippingThreshold (from
   settings.cart_free_shipping_threshold, config/settings_schema.json — the
   NOAÉ demo default is ₹1,999). Copy mirrors the demo exactly: "Add ₹450
   more to unlock FREE SHIPPING" / "You've unlocked FREE SHIPPING".

   DISCOUNT CODE LIMITATION (see sections/main-cart.liquid comment): Shopify
   does not expose discount-code validation to theme JavaScript. Submitting
   the coupon form here stores the code as a cart note attribute via
   /cart/update.js (purely informational, visible to the merchant on the
   order) and shows the shopper a message that codes are applied at
   checkout. No discount amount is invented or displayed — cart.total_discount
   (real Shopify automatic/script discounts only) is the only discount ever
   rendered.
   ========================================================================== */

(function (global) {
  "use strict";

  var routes = (global.Noae && global.Noae.routes) || {
    cart_add_url: "/cart/add.js",
    cart_change_url: "/cart/change.js",
    cart_update_url: "/cart/update.js"
  };
  var FREE_SHIP_THRESHOLD = (global.Noae && global.Noae.cartFreeShippingThreshold) || 1999;

  function fmt(cents) {
    return (global.Noae && global.Noae.formatMoney) ? global.Noae.formatMoney(cents) : "₹" + Math.round(cents / 100);
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
      '<div class="noae-qty-selector" data-qty-stepper data-key="' + key + '">' +
        '<button type="button" data-qty-dec aria-label="Decrease quantity">−</button>' +
        '<input type="text" readonly value="' + qty + '" aria-label="Quantity" data-qty-input>' +
        '<button type="button" data-qty-inc aria-label="Increase quantity">+</button>' +
      "</div>"
    );
  }

  function cartLineHTML(item) {
    return (
      '<div class="noae-cart-item" data-line-key="' + item.key + '">' +
        '<img class="noae-cart-item__img" src="' + (item.image || "") + '" alt="' + item.product_title + '" width="76" height="76">' +
        "<div>" +
          '<p class="noae-cart-item__name">' + item.product_title + "</p>" +
          (item.variant_title && item.variant_title !== "Default Title" ? '<p class="noae-cart-item__variant">Size: ' + item.variant_title + "</p>" : "") +
          qtyStepperHTML(item.key, item.quantity) +
          '<button type="button" class="noae-cart-item__remove" data-remove-line data-key="' + item.key + '">Remove</button>' +
        "</div>" +
        '<p class="noae-cart-item__price">' + fmt(item.final_line_price) + "</p>" +
      "</div>"
    );
  }

  function cartRowHTML(item) {
    return (
      '<tr data-line-key="' + item.key + '">' +
        '<td><div class="noae-cart-table__product">' +
          '<img src="' + (item.image || "") + '" alt="' + item.product_title + '" width="90" height="90">' +
          "<div>" +
            '<p class="noae-cart-item__name"><a href="' + item.url + '">' + item.product_title + "</a></p>" +
            (item.variant_title && item.variant_title !== "Default Title" ? '<p class="noae-cart-item__variant">Size: ' + item.variant_title + "</p>" : "") +
            '<button type="button" class="noae-cart-item__remove" data-remove-line data-key="' + item.key + '">Remove</button>' +
          "</div>" +
        "</div></td>" +
        "<td>" + fmt(item.price) + "</td>" +
        "<td>" + qtyStepperHTML(item.key, item.quantity) + "</td>" +
        "<td><strong>" + fmt(item.final_line_price) + "</strong></td>" +
      "</tr>"
    );
  }

  function emptyCartHTML() {
    return (
      '<div class="noae-cart-drawer__empty">' +
        "<h3>Your bag is empty</h3>" +
        '<p>Discover your next daily ritual.</p>' +
        '<a href="' + ((global.Noae && global.Noae.routes.all_products_collection_url) || "/collections/all") + '" class="noae-btn noae-btn--dark noae-mt-6">Shop Bestsellers</a>' +
      "</div>"
    );
  }

  function renderFreeShipBar(container, cart) {
    if (!container) return;
    var payable = cart.total_price;
    var thresholdCents = FREE_SHIP_THRESHOLD * 100;
    var remaining = thresholdCents - payable;
    var pct = Math.min(100, Math.round((payable / thresholdCents) * 100));
    var html = '<div class="noae-cart-progress">';
    if (remaining <= 0) {
      html += '<p class="noae-cart-progress__text">You\'ve unlocked <strong>FREE SHIPPING</strong> 🎉</p>';
    } else {
      html += '<p class="noae-cart-progress__text">Add ' + fmt(remaining) + ' more to unlock <strong>FREE SHIPPING</strong></p>';
    }
    html += '<div class="noae-cart-progress__bar"><div class="noae-cart-progress__fill" style="width:' + pct + '%"></div></div></div>';
    container.innerHTML = html;
  }

  function renderSummary(root, cart) {
    var set = function (sel, val) { var el = root.querySelector(sel); if (el) el.textContent = val; };
    set("[data-subtotal]", fmt(cart.original_total_price != null ? cart.original_total_price : cart.total_price));
    set("[data-discount]", cart.total_discount ? "−" + fmt(cart.total_discount) : fmt(0));
    var discountRow = root.querySelector("[data-discount-row]");
    if (discountRow) discountRow.style.display = cart.total_discount ? "flex" : "none";
    var shippingEl = root.querySelector("[data-shipping]");
    if (shippingEl) {
      shippingEl.textContent = cart.total_price >= FREE_SHIP_THRESHOLD * 100 ? "FREE" : "Calculated at checkout";
    }
    set("[data-total]", fmt(cart.total_price));
  }

  function bindQtyAndRemove(root) {
    if (!root || root.__noaeCartBound) return;
    root.__noaeCartBound = true;
    root.addEventListener("click", function (e) {
      var stepper = e.target.closest("[data-qty-stepper]");
      var removeBtn = e.target.closest("[data-remove-line]");
      if (stepper) {
        var key = stepper.getAttribute("data-key");
        var input = stepper.querySelector("[data-qty-input]");
        if (e.target.closest("[data-qty-inc]")) { input.value = parseInt(input.value, 10) + 1; changeLine(key, parseInt(input.value, 10)); }
        if (e.target.closest("[data-qty-dec]")) {
          var newQty = parseInt(input.value, 10) - 1;
          if (newQty < 1) return;
          input.value = newQty;
          changeLine(key, newQty);
        }
      }
      if (removeBtn) {
        removeLine(removeBtn.getAttribute("data-key")).then(function () {
          if (global.NoaeToast) global.NoaeToast.show("Item removed from bag", "default");
        });
      }
    });
  }

  function renderDrawer(cart) {
    var itemsEl = document.getElementById("cartDrawerItems");
    var footEl = document.getElementById("cartDrawerFooter");
    var freeship = document.querySelector(".noae-cart-drawer [data-freeship-bar]");
    var badge = document.querySelectorAll("[data-cart-count]");
    badge.forEach(function (el) { el.textContent = cart.item_count; el.style.display = cart.item_count > 0 ? "inline-flex" : "none"; });
    if (!itemsEl) return;
    renderFreeShipBar(freeship, cart);
    if (!cart.item_count) {
      itemsEl.innerHTML = emptyCartHTML();
      if (footEl) footEl.style.display = "none";
      return;
    }
    if (footEl) footEl.style.display = "";
    itemsEl.innerHTML = '<div class="noae-cart-items">' + cart.items.map(cartLineHTML).join("") + "</div>";
    if (footEl) {
      footEl.innerHTML =
        '<div class="noae-cart-subtotal-row"><span>Subtotal</span><span data-subtotal>' + fmt(cart.total_price) + "</span></div>" +
        '<a href="' + ((global.Noae && global.Noae.routes.cart_url) || "/cart") + '" class="noae-btn noae-btn--outline noae-btn--full noae-mt-6">View Bag</a>' +
        '<a href="' + ((global.Noae && global.Noae.routes.cart_url) || "/cart") + '/checkout" class="noae-btn noae-btn--dark noae-btn--full noae-mt-6">Checkout</a>';
    }
    bindQtyAndRemove(document.getElementById("cartDrawer"));
  }

  function renderCartPage(cart) {
    var wrap = document.querySelector("[data-cart-page]");
    if (!wrap) return;
    var emptyEl = document.getElementById("cartEmptyState");
    var filledEl = document.getElementById("cartFilledState");
    var rowsEl = document.getElementById("cartTableBody");
    var freeship = document.getElementById("cartPageProgress");
    if (!cart.item_count) {
      if (filledEl) filledEl.classList.add("noae-hide");
      if (emptyEl) emptyEl.classList.remove("noae-hide");
      return;
    }
    if (emptyEl) emptyEl.classList.add("noae-hide");
    if (filledEl) filledEl.classList.remove("noae-hide");
    if (rowsEl) rowsEl.innerHTML = cart.items.map(cartRowHTML).join("");
    renderFreeShipBar(freeship, cart);
    var summaryEl = document.querySelector("[data-cart-summary]");
    if (summaryEl) renderSummary(summaryEl, cart);
    bindQtyAndRemove(wrap);
  }

  function renderFromCart(cart) {
    renderDrawer(cart);
    renderCartPage(cart);
  }

  /* ---------------------------------------------------------------------
     Bag drawer open/close
  --------------------------------------------------------------------- */
  function initCartDrawerToggle() {
    var openers = document.querySelectorAll("[data-cart-open]");
    var drawer = document.getElementById("cartDrawer");
    var backdrop = document.getElementById("cartOverlay");
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
    global.Noae = global.Noae || {};
    global.Noae.cartDrawer = { open: open, close: close };
  }

  /* ---------------------------------------------------------------------
     Discount code note (documented limitation — see file header)
  --------------------------------------------------------------------- */
  function initCouponForms() {
    document.querySelectorAll("[data-coupon-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("[data-coupon-input]");
        var msg = document.getElementById("couponFeedback") || form.querySelector("[data-coupon-msg]");
        var code = (input.value || "").trim();
        if (!code) return;
        updateNote({ discount_code_requested: code }).then(function () {
          if (msg) {
            msg.textContent = "Saved. Enter \"" + code + "\" again at checkout — Shopify validates and applies discount codes only at checkout, not in the bag.";
            msg.className = "noae-coupon-feedback is-success";
          }
          if (global.NoaeToast) global.NoaeToast.show("Code saved — apply it again at checkout", "success");
        }).catch(function () {
          if (msg) { msg.textContent = "Couldn't save that code right now — you can still enter it at checkout."; msg.className = "noae-coupon-feedback is-error"; }
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
        addItem(variantId, qty).then(function (product) {
          if (global.NoaeToast) global.NoaeToast.show((product.title || "Item") + " added to your bag", "success");
          if (global.Noae.cartDrawer && global.Noae.cartTypeDrawer) global.Noae.cartDrawer.open();
        }).catch(function () {
          if (global.NoaeToast) global.NoaeToast.show("Couldn't add that item — it may be sold out.", "error");
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

  global.Noae = global.Noae || {};
  global.Noae.cart = {
    getCart: getCart,
    addItem: addItem,
    changeLine: changeLine,
    removeLine: removeLine,
    updateNote: updateNote,
    refresh: refreshAll
  };
})(window);
