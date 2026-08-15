/* ==========================================================================
   MODIX (WordPress) — Theme Behaviour
   Ported from the demo's js/app.js + js/product.js + js/search.js +
   js/wishlist.js interaction patterns, adapted to WordPress/WooCommerce-
   rendered markup and real AJAX endpoints (wishlist toggle, quick view,
   quick add, search suggestions, cart fragments, newsletter) instead of
   the demo's client-side products.js dataset.
   ========================================================================== */
(function (global) {
	"use strict";

	var settings = global.ModixSettings || {};
	var prefersReducedMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---------------------------------------------------------------------
	   Toasts — window.MODIX.toast({ type, title, message })
	--------------------------------------------------------------------- */
	function ensureToastContainer() {
		var el = document.querySelector(".toast-container");
		if (!el) {
			el = document.createElement("div");
			el.className = "toast-container";
			el.setAttribute("role", "status");
			el.setAttribute("aria-live", "polite");
			document.body.appendChild(el);
		}
		return el;
	}
	var ICONS = {
		success: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
		error: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
		info: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
	};
	function showToast(opts) {
		opts = opts || {};
		var type = opts.type || "info";
		var container = ensureToastContainer();
		var toast = document.createElement("div");
		toast.className = "toast toast--" + type;
		toast.innerHTML =
			(ICONS[type] || ICONS.info) +
			'<div><div class="toast__title">' + (opts.title || "Notice") + "</div>" +
			(opts.message ? '<div class="toast__msg">' + opts.message + "</div>" : "") + "</div>" +
			'<button class="toast__close" type="button" aria-label="Dismiss notification"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';
		container.appendChild(toast);
		requestAnimationFrame(function () { toast.classList.add("is-visible"); });

		var timer = setTimeout(dismiss, opts.duration || 3200);
		function dismiss() {
			clearTimeout(timer);
			toast.classList.remove("is-visible");
			setTimeout(function () { toast.remove(); }, 260);
		}
		toast.querySelector(".toast__close").addEventListener("click", dismiss);
	}
	global.MODIX = global.MODIX || {};
	global.MODIX.toast = showToast;

	/* ---------------------------------------------------------------------
	   Header: collapse-on-scroll
	--------------------------------------------------------------------- */
	function initHeaderCollapse() {
		var header = document.querySelector(".site-header");
		if (!header) return;
		var ticking = false;
		function update() {
			header.classList.toggle("is-scrolled", global.scrollY > 24);
			ticking = false;
		}
		global.addEventListener("scroll", function () {
			if (!ticking) { requestAnimationFrame(update); ticking = true; }
		}, { passive: true });
		update();
	}

	/* ---------------------------------------------------------------------
	   Mega-dropdown nav (desktop) — hover + keyboard accessible
	--------------------------------------------------------------------- */
	function initMegaNav() {
		var items = document.querySelectorAll(".nav-item.has-mega");
		items.forEach(function (item) {
			var link = item.querySelector(".nav-link");
			var panel = item.querySelector(".mega-panel");
			var closeTimer;
			function open() {
				clearTimeout(closeTimer);
				items.forEach(function (i) { if (i !== item) i.classList.remove("is-open"); });
				item.classList.add("is-open");
			}
			function scheduleClose() {
				clearTimeout(closeTimer);
				closeTimer = setTimeout(function () { item.classList.remove("is-open"); }, 160);
			}
			item.addEventListener("mouseenter", open);
			item.addEventListener("mouseleave", scheduleClose);
			if (link) {
				link.addEventListener("focus", open);
			}
			item.addEventListener("keydown", function (e) {
				if (e.key === "Escape") { item.classList.remove("is-open"); if (link) link.focus(); }
			});
		});
		document.addEventListener("click", function (e) {
			if (!e.target.closest(".nav-item.has-mega")) {
				items.forEach(function (i) { i.classList.remove("is-open"); });
			}
		});
	}

	/* ---------------------------------------------------------------------
	   Mobile drawer
	--------------------------------------------------------------------- */
	function initMobileDrawer() {
		var toggle = document.querySelector("[data-mobile-toggle]");
		var drawer = document.querySelector(".mobile-drawer");
		var scrim = document.querySelector("[data-drawer-scrim]");
		var closeBtn = document.querySelector("[data-mobile-drawer-close]");
		if (!toggle || !drawer) return;

		function open() {
			drawer.classList.add("is-open");
			if (scrim) scrim.classList.add("is-visible");
			document.body.style.overflow = "hidden";
			toggle.setAttribute("aria-expanded", "true");
		}
		function close() {
			drawer.classList.remove("is-open");
			if (scrim) scrim.classList.remove("is-visible");
			document.body.style.overflow = "";
			toggle.setAttribute("aria-expanded", "false");
		}
		toggle.addEventListener("click", function () {
			drawer.classList.contains("is-open") ? close() : open();
		});
		if (closeBtn) closeBtn.addEventListener("click", close);
		if (scrim) scrim.addEventListener("click", close);

		drawer.querySelectorAll("[data-submenu-toggle]").forEach(function (btn) {
			btn.addEventListener("click", function () {
				var sub = document.getElementById(btn.getAttribute("aria-controls"));
				if (!sub) return;
				var isOpen = sub.classList.toggle("is-open");
				btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Mobile filters drawer (shop/category archive)
	--------------------------------------------------------------------- */
	function initMobileFilters() {
		var toggle = document.querySelector("[data-mobile-filter-toggle]");
		var aside = document.querySelector(".filters-sidebar");
		var scrim = document.querySelector("[data-filters-scrim]");
		var closeBtn = document.querySelector("[data-filters-drawer-close]");
		if (!toggle || !aside) return;

		function open() {
			aside.classList.add("is-open");
			if (scrim) scrim.classList.add("is-visible");
			document.body.style.overflow = "hidden";
		}
		function close() {
			aside.classList.remove("is-open");
			if (scrim) scrim.classList.remove("is-visible");
			document.body.style.overflow = "";
		}
		toggle.addEventListener("click", open);
		if (closeBtn) closeBtn.addEventListener("click", close);
		if (scrim) scrim.addEventListener("click", close);
	}

	/* ---------------------------------------------------------------------
	   Collapsible filter groups (Category / Price / Color / Rating / …)
	--------------------------------------------------------------------- */
	function initFilterGroups() {
		document.querySelectorAll(".filter-group__title").forEach(function (title) {
			title.addEventListener("click", function () {
				var group = title.closest(".filter-group");
				if (group) group.classList.toggle("is-collapsed");
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Announcement bar rotation
	--------------------------------------------------------------------- */
	function initAnnouncementBar() {
		var items = document.querySelectorAll(".announcement-bar__item");
		if (items.length < 2 || prefersReducedMotion) return;
		var index = 0;
		setInterval(function () {
			items[index].classList.remove("is-active");
			index = (index + 1) % items.length;
			items[index].classList.add("is-active");
		}, 4200);
	}

	/* ---------------------------------------------------------------------
	   Scroll reveal via IntersectionObserver
	--------------------------------------------------------------------- */
	function initScrollReveal() {
		var targets = document.querySelectorAll("[data-reveal]");
		if (!targets.length) return;
		if (prefersReducedMotion || !("IntersectionObserver" in global)) {
			targets.forEach(function (t) { t.classList.add("is-visible"); });
			return;
		}
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
		targets.forEach(function (t) { observer.observe(t); });
	}

	/* ---------------------------------------------------------------------
	   Cart drawer + generic scrim open/close
	--------------------------------------------------------------------- */
	function closeAllDrawers() {
		document.querySelectorAll(".mobile-drawer.is-open, .cart-drawer.is-open, .filters-sidebar.is-open").forEach(function (p) {
			p.classList.remove("is-open");
		});
		document.querySelectorAll(".overlay-scrim.is-visible").forEach(function (s) { s.classList.remove("is-visible"); });
		document.body.style.overflow = "";
	}

	function initCartDrawer() {
		var drawer = document.querySelector(".cart-drawer");
		var scrim = document.querySelector("[data-cart-scrim]");
		var closeBtn = document.querySelector("[data-cart-close]");
		if (!drawer) return;

		function open() {
			drawer.classList.add("is-open");
			if (scrim) scrim.classList.add("is-visible");
			document.body.style.overflow = "hidden";
		}
		function close() {
			drawer.classList.remove("is-open");
			if (scrim) scrim.classList.remove("is-visible");
			document.body.style.overflow = "";
		}
		document.addEventListener("click", function (e) {
			if (e.target.closest("[data-cart-open]")) {
				e.preventDefault();
				open();
			}
		});
		if (closeBtn) closeBtn.addEventListener("click", close);
		if (scrim) scrim.addEventListener("click", close);
		global.MODIX.openCartDrawer = open;
	}

	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape") {
			closeAllDrawers();
			var modal = document.querySelector("[data-quick-view-modal].is-open");
			if (modal) modal.classList.remove("is-open");
			var overlay = document.querySelector(".search-overlay.is-open");
			if (overlay) overlay.classList.remove("is-open");
		}
	});

	/* ---------------------------------------------------------------------
	   Accordion (PDP FAQ)
	--------------------------------------------------------------------- */
	function initAccordions() {
		document.addEventListener("click", function (e) {
			var header = e.target.closest(".accordion-item__header");
			if (!header) return;
			var item = header.closest(".accordion-item");
			var body = item.querySelector(".accordion-item__body");
			var isOpen = item.classList.contains("is-open");
			var group = item.closest("[data-accordion-group]");
			if (group) {
				group.querySelectorAll(".accordion-item.is-open").forEach(function (other) {
					if (other !== item) {
						other.classList.remove("is-open");
						other.querySelector(".accordion-item__body").style.maxHeight = null;
						other.querySelector(".accordion-item__header").setAttribute("aria-expanded", "false");
					}
				});
			}
			if (isOpen) {
				item.classList.remove("is-open");
				body.style.maxHeight = null;
				header.setAttribute("aria-expanded", "false");
			} else {
				item.classList.add("is-open");
				body.style.maxHeight = body.scrollHeight + "px";
				header.setAttribute("aria-expanded", "true");
			}
		});
	}

	/* ---------------------------------------------------------------------
	   PDP tabs (Overview / Key Features / Specifications / What's in the
	   Box / Warranty / Shipping & Returns) — WooCommerce core already
	   ships this behaviour for ul.tabs/.woocommerce-Tabs-panel via
	   wc-single-product.js; this is a lightweight fallback in case that
	   script isn't enqueued (e.g. a caching/minifier edge case) so tabs
	   never look broken.
	--------------------------------------------------------------------- */
	function initProductTabs() {
		var nav = document.querySelector("ul.tabs, .tabs-nav");
		if (!nav) return;
		var tabLinks = nav.querySelectorAll("li > a, button");
		if (!tabLinks.length) return;
		var firstPanel = document.querySelector(".woocommerce-Tabs-panel, .tab-panel");
		if (firstPanel && firstPanel.classList.contains("is-active")) return; // wc-single-product.js already handled it
		tabLinks.forEach(function (link, index) {
			link.addEventListener("click", function (e) {
				var href = link.getAttribute("href");
				if (!href || href.charAt(0) !== "#") return;
				e.preventDefault();
				var panels = document.querySelectorAll(".woocommerce-Tabs-panel, .tab-panel");
				panels.forEach(function (p) { p.classList.remove("is-active"); });
				var target = document.querySelector(href);
				if (target) target.classList.add("is-active");
				nav.querySelectorAll("li, button").forEach(function (n) { n.classList.remove("active", "is-active"); });
				(link.closest("li") || link).classList.add("active", "is-active");
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Quantity stepper — progressively wraps WooCommerce's native
	   input.qty in the demo's +/- button UI without touching WC's markup.
	--------------------------------------------------------------------- */
	function initQtySteppers() {
		document.querySelectorAll(".quantity").forEach(function (wrap) {
			if (wrap.classList.contains("qty-stepper") || wrap.dataset.modixEnhanced) return;
			var input = wrap.querySelector("input.qty");
			if (!input) return;
			wrap.dataset.modixEnhanced = "1";
			wrap.classList.add("qty-stepper");

			var minus = document.createElement("button");
			minus.type = "button";
			minus.setAttribute("aria-label", "Decrease quantity");
			minus.textContent = "–";
			var plus = document.createElement("button");
			plus.type = "button";
			plus.setAttribute("aria-label", "Increase quantity");
			plus.textContent = "+";

			wrap.insertBefore(minus, input);
			wrap.appendChild(plus);

			function step(dir) {
				var min = parseFloat(input.min) || 1;
				var max = input.max ? parseFloat(input.max) : Infinity;
				var current = parseFloat(input.value) || min;
				var next = Math.min(max, Math.max(min, current + dir));
				input.value = next;
				input.dispatchEvent(new Event("change", { bubbles: true }));
			}
			minus.addEventListener("click", function () { step(-1); });
			plus.addEventListener("click", function () { step(1); });
		});
	}

	/* ---------------------------------------------------------------------
	   Variation "swatch" pills — forward clicks onto WooCommerce's native
	   (CSS-hidden) <select>, then fire a native change event so WC's own
	   variations.js recalculates price/availability exactly as it would
	   for the native dropdown. See modix_variation_swatches() in
	   inc/woocommerce.php for the markup this pairs with.
	--------------------------------------------------------------------- */
	function initVariationSwatches() {
		document.addEventListener("click", function (e) {
			var swatch = e.target.closest(".option-swatches .option-swatch, .option-pills .option-pill");
			if (!swatch || swatch.disabled) return;
			var list = swatch.closest(".option-swatches, .option-pills");
			var selectId = list ? list.getAttribute("data-swatch-for") : null;
			var select = selectId ? document.getElementById(selectId) : null;
			if (!select) return;
			select.value = swatch.getAttribute("data-swatch-value") || "";
			select.dispatchEvent(new Event("change", { bubbles: true }));
			list.querySelectorAll(".option-swatch, .option-pill").forEach(function (s) {
				s.classList.remove("is-active");
				s.setAttribute("aria-pressed", "false");
			});
			swatch.classList.add("is-active");
			swatch.setAttribute("aria-pressed", "true");
		});
	}

	/* ---------------------------------------------------------------------
	   Wishlist heart toggle — AJAX to modix_wishlist_toggle
	--------------------------------------------------------------------- */
	function updateWishlistCountBadges(count) {
		document.querySelectorAll("[data-wishlist-count]").forEach(function (el) {
			el.textContent = count;
			el.style.display = count > 0 ? "" : "none";
		});
		document.querySelectorAll("[data-wishlist-page-count]").forEach(function (el) {
			el.textContent = count;
		});
	}
	function initWishlistToggles() {
		document.addEventListener("click", function (e) {
			var btn = e.target.closest("[data-wishlist-toggle]");
			if (!btn) return;
			e.preventDefault();
			var productId = btn.getAttribute("data-id");
			if (!productId || !settings.ajaxUrl) return;
			btn.disabled = true;
			fetch(settings.ajaxUrl, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					action: "modix_wishlist_toggle",
					nonce: settings.wishlistNonce,
					product_id: productId,
					action_type: "toggle"
				})
			})
				.then(function (r) { return r.json(); })
				.then(function (res) {
					btn.disabled = false;
					if (!res || !res.success) {
						showToast({ type: "error", title: (settings.i18n && settings.i18n.error) || "Error" });
						return;
					}
					var active = res.data.active;
					document.querySelectorAll('[data-wishlist-toggle][data-id="' + productId + '"]').forEach(function (el) {
						el.classList.toggle("is-active", active);
						el.setAttribute("aria-pressed", active ? "true" : "false");
					});
					updateWishlistCountBadges(res.data.count);
					showToast({
						type: active ? "success" : "info",
						title: active ? "Added to wishlist" : "Removed from wishlist",
						message: res.data.message
					});
					if (document.querySelector("[data-wishlist-page]")) {
						global.location.reload();
					}
				})
				.catch(function () { btn.disabled = false; });
		});
	}

	/* ---------------------------------------------------------------------
	   Quick View modal — AJAX to modix_quick_view
	--------------------------------------------------------------------- */
	function initQuickView() {
		var modal = document.querySelector("[data-quick-view-modal]");
		if (!modal) return;
		var body = modal.querySelector("[data-quick-view-body]");

		function openModal() {
			modal.classList.add("is-open");
			document.body.style.overflow = "hidden";
		}
		function closeModal() {
			modal.classList.remove("is-open");
			document.body.style.overflow = "";
		}

		document.addEventListener("click", function (e) {
			var trigger = e.target.closest("[data-quick-view]");
			if (trigger) {
				e.preventDefault();
				var productId = trigger.getAttribute("data-product-id");
				if (!productId || !settings.ajaxUrl || !body) return;
				body.innerHTML = '<p class="form-hint">…</p>';
				openModal();
				fetch(settings.ajaxUrl, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						action: "modix_quick_view",
						nonce: settings.quickViewNonce,
						product_id: productId
					})
				})
					.then(function (r) { return r.json(); })
					.then(function (res) {
						if (res && res.success) {
							body.innerHTML = res.data.html;
						} else {
							body.innerHTML = '<p>' + ((settings.i18n && settings.i18n.error) || "Error") + "</p>";
						}
					});
			}
			if (e.target.closest("[data-quick-view-close]") || e.target === modal) {
				closeModal();
			}
		});
	}

	/* ---------------------------------------------------------------------
	   Quick Add — real WooCommerce AJAX add-to-cart (?wc-ajax=add_to_cart),
	   applying returned cart fragments exactly like WooCommerce's own
	   wc-add-to-cart.js so the header count / cart drawer stay in sync.
	--------------------------------------------------------------------- */
	function wcAjaxUrl(endpoint) {
		if (settings.wcAjaxUrl) return settings.wcAjaxUrl.replace("%%endpoint%%", endpoint);
		return "/?wc-ajax=" + endpoint;
	}
	function applyCartFragments(fragments) {
		if (!fragments) return;
		Object.keys(fragments).forEach(function (selector) {
			document.querySelectorAll(selector).forEach(function (el) {
				el.outerHTML = fragments[selector];
			});
		});
	}
	function initQuickAdd() {
		document.addEventListener("click", function (e) {
			var btn = e.target.closest("[data-quick-add]");
			if (!btn) return;
			e.preventDefault();
			btn.disabled = true;
			var body = new URLSearchParams({
				product_id: btn.getAttribute("data-product_id"),
				quantity: btn.getAttribute("data-quantity") || "1"
			});
			fetch(wcAjaxUrl("add_to_cart"), {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: body,
				credentials: "same-origin"
			})
				.then(function (r) { return r.json(); })
				.then(function (res) {
					btn.disabled = false;
					if (!res || res.error) {
						showToast({ type: "error", title: (settings.i18n && settings.i18n.error) || "Error" });
						return;
					}
					applyCartFragments(res.fragments);
					if (global.jQuery) {
						global.jQuery(document.body).trigger("added_to_cart", [res.fragments, res.cart_hash, global.jQuery(btn)]);
					}
					showToast({ type: "success", title: "Added to cart", message: (settings.i18n && settings.i18n.addedToCart) || "" });
					if (global.MODIX.openCartDrawer) global.MODIX.openCartDrawer();
				})
				.catch(function () { btn.disabled = false; });
		});
	}

	/* ---------------------------------------------------------------------
	   Search overlay — quicklinks + live AJAX suggestions
	--------------------------------------------------------------------- */
	function initSearchOverlay() {
		var overlay = document.querySelector(".search-overlay");
		var input = document.querySelector("[data-search-input]");
		var results = document.querySelector("[data-search-suggestions]");
		if (!overlay || !input) return;

		function openOverlay() {
			overlay.classList.add("is-open");
			document.body.style.overflow = "hidden";
			setTimeout(function () { input.focus(); }, 60);
		}
		function closeOverlay() {
			overlay.classList.remove("is-open");
			document.body.style.overflow = "";
		}
		document.addEventListener("click", function (e) {
			if (e.target.closest("[data-search-open]")) { e.preventDefault(); openOverlay(); }
			if (e.target.closest("[data-search-close]")) closeOverlay();
		});

		var timer = null;
		input.addEventListener("input", function () {
			clearTimeout(timer);
			var term = input.value.trim();
			if (!results) return;
			if (term.length < 2) {
				results.innerHTML = "";
				return;
			}
			timer = setTimeout(function () {
				if (!settings.ajaxUrl) return;
				fetch(settings.ajaxUrl, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						action: "modix_search_suggest",
						nonce: settings.quickViewNonce,
						term: term
					})
				})
					.then(function (r) { return r.json(); })
					.then(function (res) {
						if (res && res.success) results.innerHTML = res.data.html;
					});
			}, 260);
		});
	}

	/* ---------------------------------------------------------------------
	   Newsletter forms (header/footer/homepage) — AJAX subscribe
	--------------------------------------------------------------------- */
	function initNewsletterForms() {
		document.querySelectorAll("[data-newsletter-form]").forEach(function (form) {
			form.addEventListener("submit", function (e) {
				e.preventDefault();
				var emailInput = form.querySelector('input[type="email"]');
				if (!emailInput || !settings.ajaxUrl) return;
				fetch(settings.ajaxUrl, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						action: "modix_newsletter_subscribe",
						nonce: settings.wishlistNonce,
						email: emailInput.value
					})
				})
					.then(function (r) { return r.json(); })
					.then(function (res) {
						form.reset();
						showToast({
							type: res && res.success ? "success" : "error",
							title: res && res.success ? "You're subscribed" : "Something went wrong",
							message: (res && res.data && res.data.message) || (settings.i18n && settings.i18n.subscribed) || ""
						});
					});
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Account icon — WooCommerce My Account link is a real page/endpoint,
	   so no client-side handling is needed beyond the anchor already in
	   header.php; kept here only as a placeholder init for parity with
	   the demo's structure.
	--------------------------------------------------------------------- */

	/* ---------------------------------------------------------------------
	   Init
	--------------------------------------------------------------------- */
	document.addEventListener("DOMContentLoaded", function () {
		initHeaderCollapse();
		initMegaNav();
		initMobileDrawer();
		initMobileFilters();
		initFilterGroups();
		initAnnouncementBar();
		initScrollReveal();
		initCartDrawer();
		initAccordions();
		initProductTabs();
		initQtySteppers();
		initVariationSwatches();
		initWishlistToggles();
		initQuickView();
		initQuickAdd();
		initSearchOverlay();
		initNewsletterForms();

		if (global.jQuery) {
			global.jQuery(document.body).on("woocommerce_variation_has_changed found_variation reset_data", function () {
				setTimeout(initQtySteppers, 50);
			});
			global.jQuery(document.body).on("wc_fragments_refreshed wc_fragments_loaded", function () {
				document.querySelectorAll("[data-cart-count]").forEach(function (el) {
					el.style.display = parseInt(el.textContent, 10) > 0 ? "" : "none";
				});
			});
		}
	});
})(window);
