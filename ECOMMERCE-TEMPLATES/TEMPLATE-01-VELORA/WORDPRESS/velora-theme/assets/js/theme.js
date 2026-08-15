/* ==========================================================================
   VELORA (WordPress) — Theme Behaviour
   Ported from the demo's js/app.js + js/product.js + js/search.js
   interaction patterns, adapted to WP/WooCommerce-rendered markup and
   real AJAX endpoints (wishlist, quick view, quick add, search, cart
   fragments) instead of the demo's client-side product.js dataset.
   ========================================================================== */
(function ($) {
	"use strict";

	var settings = window.VeloraSettings || {};
	var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---------------------------------------------------------------------
	   Announcement bar rotation
	--------------------------------------------------------------------- */
	function initAnnouncementBar() {
		var items = document.querySelectorAll(".announce-item");
		if (!items.length) return;
		var i = 0;
		items[0].classList.add("is-active");
		if (items.length < 2 || prefersReducedMotion) return;
		setInterval(function () {
			items[i].classList.remove("is-active");
			i = (i + 1) % items.length;
			items[i].classList.add("is-active");
		}, 4200);
	}

	/* ---------------------------------------------------------------------
	   Header shrink-on-scroll
	--------------------------------------------------------------------- */
	function initHeaderShrink() {
		var header = document.querySelector(".site-header");
		if (!header) return;
		var ticking = false;
		function update() {
			header.classList.toggle("is-shrunk", window.scrollY > 40);
			ticking = false;
		}
		window.addEventListener("scroll", function () {
			if (!ticking) {
				requestAnimationFrame(update);
				ticking = true;
			}
		});
		update();
	}

	/* ---------------------------------------------------------------------
	   Generic slide-in drawer helper (mobile nav, search, cart, filters)
	--------------------------------------------------------------------- */
	function bindDrawer(openSelector, panelSelector, backdropSelector, closeSelector, openClass) {
		var openers = document.querySelectorAll(openSelector);
		var panel = document.querySelector(panelSelector);
		var backdrop = document.querySelector(backdropSelector);
		if (!panel) return { open: function () {}, close: function () {} };
		openClass = openClass || "is-open";

		function open() {
			panel.classList.add(openClass);
			if (backdrop) backdrop.classList.add("is-open");
			document.body.style.overflow = "hidden";
		}
		function close() {
			panel.classList.remove(openClass);
			if (backdrop) backdrop.classList.remove("is-open");
			document.body.style.overflow = "";
		}
		openers.forEach(function (el) {
			el.addEventListener("click", function (e) {
				e.preventDefault();
				open();
			});
		});
		document.querySelectorAll(closeSelector).forEach(function (el) {
			el.addEventListener("click", close);
		});
		if (backdrop) backdrop.addEventListener("click", close);
		return { open: open, close: close };
	}

	/* ---------------------------------------------------------------------
	   Scroll-reveal entrance animations
	--------------------------------------------------------------------- */
	function initScrollReveal() {
		var targets = document.querySelectorAll(".reveal");
		if (!targets.length) return;
		if (prefersReducedMotion || !("IntersectionObserver" in window)) {
			targets.forEach(function (t) { t.classList.add("is-visible"); });
			return;
		}
		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
		);
		targets.forEach(function (t) { observer.observe(t); });
	}

	/* ---------------------------------------------------------------------
	   Toast notifications — window.VeloraToast.show(msg, type)
	--------------------------------------------------------------------- */
	function initToasts() {
		var stack = document.querySelector(".toast-stack");
		if (!stack) {
			stack = document.createElement("div");
			stack.className = "toast-stack";
			stack.setAttribute("role", "status");
			stack.setAttribute("aria-live", "polite");
			document.body.appendChild(stack);
		}
		var icons = {
			success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>',
			error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12" y2="16.01"/></svg>',
			info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="7" x2="12" y2="7.01"/></svg>'
		};
		function show(message, type) {
			type = type || "info";
			var toast = document.createElement("div");
			toast.className = "toast toast-" + type;
			toast.innerHTML = (icons[type] || icons.info) + "<span>" + message + "</span>";
			stack.appendChild(toast);
			requestAnimationFrame(function () { toast.classList.add("is-visible"); });
			setTimeout(function () {
				toast.classList.remove("is-visible");
				setTimeout(function () { toast.remove(); }, 320);
			}, 3200);
		}
		window.VeloraToast = { show: show };
	}

	/* ---------------------------------------------------------------------
	   Wishlist heart toggle — AJAX to velora_wishlist_toggle
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
					action: "velora_wishlist_toggle",
					nonce: settings.wishlistNonce,
					product_id: productId,
					action_type: "toggle"
				})
			})
				.then(function (r) { return r.json(); })
				.then(function (res) {
					btn.disabled = false;
					if (!res || !res.success) {
						if (window.VeloraToast) window.VeloraToast.show((settings.i18n && settings.i18n.error) || "Error", "error");
						return;
					}
					var active = res.data.active;
					document.querySelectorAll('[data-wishlist-toggle][data-id="' + productId + '"]').forEach(function (el) {
						el.classList.toggle("is-active", active);
						el.setAttribute("aria-pressed", active ? "true" : "false");
					});
					updateWishlistCountBadges(res.data.count);
					if (window.VeloraToast) window.VeloraToast.show(res.data.message, "success");
				})
				.catch(function () {
					btn.disabled = false;
				});
		});
	}

	/* ---------------------------------------------------------------------
	   Quick View modal — AJAX to velora_quick_view
	--------------------------------------------------------------------- */
	function initQuickView() {
		var modal = document.querySelector("[data-quickview-modal]");
		var body = document.querySelector("[data-qv-body]");
		if (!modal || !body) return;

		function openModal() {
			modal.classList.add("is-open");
			document.body.style.overflow = "hidden";
		}
		function closeModal() {
			modal.classList.remove("is-open");
			document.body.style.overflow = "";
		}
		modal.addEventListener("click", function (e) {
			if (e.target === modal) closeModal();
		});
		document.querySelectorAll("[data-qv-close]").forEach(function (el) {
			el.addEventListener("click", closeModal);
		});
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape") closeModal();
		});

		document.addEventListener("click", function (e) {
			var trigger = e.target.closest("[data-quickview]");
			if (!trigger) return;
			e.preventDefault();
			var productId = trigger.getAttribute("data-id");
			if (!productId || !settings.ajaxUrl) return;
			body.innerHTML = '<div class="qv-media"></div><div class="qv-body"><p class="text-muted">Loading…</p></div>';
			openModal();
			fetch(settings.ajaxUrl, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					action: "velora_quick_view",
					nonce: settings.quickViewNonce,
					product_id: productId
				})
			})
				.then(function (r) { return r.json(); })
				.then(function (res) {
					if (res && res.success) {
						body.innerHTML = res.data.html;
					} else {
						body.innerHTML = '<div class="qv-body"><p>' + ((settings.i18n && settings.i18n.error) || "Error") + "</p></div>";
					}
				});
		});
	}

	/* ---------------------------------------------------------------------
	   Quick Add — real WooCommerce AJAX add-to-cart (?wc-ajax=add_to_cart),
	   then apply the returned cart fragments exactly like WooCommerce's own
	   wc-add-to-cart.js does, so the header count / cart drawer stay in sync.
	--------------------------------------------------------------------- */
	function wcAjaxUrl(endpoint) {
		if (settings.wcAjaxUrl) {
			return settings.wcAjaxUrl.replace("%%endpoint%%", endpoint);
		}
		// Fallback matching WooCommerce's own default endpoint shape.
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
			var btn = e.target.closest(".velora-quick-add[data-quickadd]");
			if (!btn) return;
			e.preventDefault();
			btn.classList.add("loading");
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
					btn.classList.remove("loading");
					if (!res || res.error) {
						if (window.VeloraToast) window.VeloraToast.show((settings.i18n && settings.i18n.error) || "Error", "error");
						return;
					}
					applyCartFragments(res.fragments);
					if (window.jQuery) {
						jQuery(document.body).trigger("added_to_cart", [res.fragments, res.cart_hash, jQuery(btn)]);
					}
					if (window.VeloraToast) window.VeloraToast.show((settings.i18n && settings.i18n.addedToCart) || "Added to cart", "success");
					var cartDrawer = document.querySelector(".cart-drawer");
					if (cartDrawer) {
						cartDrawer.classList.add("is-open");
						var backdrop = document.querySelector(".cart-drawer-backdrop");
						if (backdrop) backdrop.classList.add("is-open");
					}
				})
				.catch(function () {
					btn.classList.remove("loading");
				});
		});
	}

	/* ---------------------------------------------------------------------
	   FAQ accordion (single-open) — custom feature, not native WooCommerce.
	--------------------------------------------------------------------- */
	function initFaqAccordion() {
		var wrap = document.querySelector("[data-pdp-faqs]");
		if (!wrap) return;
		wrap.querySelectorAll("[data-faq-item]").forEach(function (item) {
			var btn = item.querySelector(".faq-question");
			var answer = item.querySelector(".faq-answer");
			if (!btn || !answer) return;
			btn.addEventListener("click", function () {
				var isOpen = item.classList.contains("is-open");
				wrap.querySelectorAll("[data-faq-item]").forEach(function (other) {
					other.classList.remove("is-open");
					var q = other.querySelector(".faq-question");
					var a = other.querySelector(".faq-answer");
					if (q) q.setAttribute("aria-expanded", "false");
					if (a) a.style.maxHeight = null;
				});
				if (!isOpen) {
					item.classList.add("is-open");
					btn.setAttribute("aria-expanded", "true");
					answer.style.maxHeight = answer.scrollHeight + "px";
				}
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Quantity stepper — progressively wraps WooCommerce's native
	   input.qty in the demo's +/- button UI without touching WC's markup.
	--------------------------------------------------------------------- */
	function initQtySteppers() {
		document.querySelectorAll(".quantity").forEach(function (wrap) {
			if (wrap.classList.contains("qty-stepper") || wrap.dataset.veloraEnhanced) return;
			var input = wrap.querySelector("input.qty");
			if (!input) return;
			wrap.dataset.veloraEnhanced = "1";
			wrap.classList.add("qty-stepper");

			var minus = document.createElement("button");
			minus.type = "button";
			minus.setAttribute("aria-label", "Decrease quantity");
			minus.textContent = "-";
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
	   Search overlay — popular search shortcuts + live AJAX suggestions
	--------------------------------------------------------------------- */
	function initSearchOverlay() {
		var input = document.querySelector("[data-search-input]");
		var results = document.querySelector("[data-search-results]");
		if (input) {
			document.querySelectorAll("[data-popular-search]").forEach(function (btn) {
				btn.addEventListener("click", function () {
					input.value = btn.textContent.trim();
					input.dispatchEvent(new Event("input", { bubbles: true }));
					input.focus();
				});
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
							action: "velora_search_suggest",
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
	}

	/* ---------------------------------------------------------------------
	   Newsletter forms (header/footer/homepage) — AJAX subscribe
	--------------------------------------------------------------------- */
	function initNewsletterForms() {
		document.querySelectorAll(".newsletter-form, [data-newsletter-form]").forEach(function (form) {
			form.addEventListener("submit", function (e) {
				e.preventDefault();
				var emailInput = form.querySelector('input[type="email"]');
				if (!emailInput || !settings.ajaxUrl) return;
				fetch(settings.ajaxUrl, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						action: "velora_newsletter_subscribe",
						nonce: settings.wishlistNonce,
						email: emailInput.value
					})
				})
					.then(function (r) { return r.json(); })
					.then(function (res) {
						form.reset();
						if (window.VeloraToast) {
							window.VeloraToast.show(
								(res && res.data && res.data.message) || (settings.i18n && settings.i18n.subscribed) || "Thanks for subscribing.",
								res && res.success ? "success" : "error"
							);
						}
					});
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Filter group collapse (shop sidebar <h4> click) + mobile drawer
	--------------------------------------------------------------------- */
	function initFilterGroups() {
		document.querySelectorAll(".filter-group > h4").forEach(function (h4) {
			h4.addEventListener("click", function () {
				h4.closest(".filter-group").classList.toggle("is-collapsed");
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Init
	--------------------------------------------------------------------- */
	document.addEventListener("DOMContentLoaded", function () {
		initToasts();
		initAnnouncementBar();
		initHeaderShrink();
		initScrollReveal();
		initWishlistToggles();
		initQuickView();
		initQuickAdd();
		initFaqAccordion();
		initQtySteppers();
		initSearchOverlay();
		initNewsletterForms();
		initFilterGroups();

		bindDrawer("[data-drawer-open]", ".mobile-drawer", ".mobile-drawer-backdrop", "[data-drawer-close]");
		bindDrawer("[data-search-open]", ".search-overlay", null, "[data-search-close]", "is-open");
		bindDrawer("[data-cart-open]", ".cart-drawer", ".cart-drawer-backdrop", "[data-cart-close]");
		bindDrawer("[data-filter-drawer-open]", ".filters-aside", "[data-filter-drawer-backdrop]", "[data-filter-drawer-close]", "is-drawer-open");

		var applyBtn = document.querySelector("[data-filter-drawer-apply]");
		if (applyBtn) {
			applyBtn.addEventListener("click", function () {
				document.querySelector(".filters-aside").classList.remove("is-drawer-open");
				var bd = document.querySelector("[data-filter-drawer-backdrop]");
				if (bd) bd.classList.remove("is-open");
			});
		}

		// Re-run quantity stepper enhancement after WooCommerce swaps in a
		// new variation form (variable products replace the qty markup).
		if (window.jQuery) {
			jQuery(document.body).on("woocommerce_variation_has_changed found_variation reset_data", function () {
				setTimeout(initQtySteppers, 50);
			});
			jQuery(document.body).on("wc_fragments_refreshed wc_fragments_loaded", function () {
				var count = document.querySelectorAll("[data-cart-count]")[0];
				if (count) count.style.display = parseInt(count.textContent, 10) > 0 ? "" : "none";
			});
		}
	});
})(window.jQuery || function () {});
