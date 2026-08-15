/* ==========================================================================
   ARDEA (WordPress) — Theme Behaviour
   Ported from the demo's js/app.js + js/product.js + js/search.js
   interaction patterns, adapted to WordPress/WooCommerce-rendered markup
   and real AJAX endpoints (wishlist, quick view, quick add, search, cart
   fragments) instead of the demo's client-side products.js dataset.
   ========================================================================== */
(function (global) {
	"use strict";

	var settings = global.ArdeaSettings || {};
	var prefersReducedMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---------------------------------------------------------------------
	   Toasts — window.ArdeaToast.show(msg, type)
	--------------------------------------------------------------------- */
	var toastRegion;
	function ensureToastRegion() {
		if (toastRegion) return toastRegion;
		toastRegion = document.createElement("div");
		toastRegion.className = "toast-region";
		toastRegion.setAttribute("role", "status");
		toastRegion.setAttribute("aria-live", "polite");
		document.body.appendChild(toastRegion);
		return toastRegion;
	}
	var ICONS = {
		success: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 6"/></svg>',
		info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v5"/></svg>',
		error: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.01"/></svg>'
	};
	function showToast(message, type) {
		if (!message) return;
		type = type || "success";
		var region = ensureToastRegion();
		var el = document.createElement("div");
		el.className = "toast";
		el.innerHTML = (ICONS[type] || ICONS.success) + "<span>" + message + "</span>";
		region.appendChild(el);
		var timer = setTimeout(remove, 3200);
		function remove() {
			clearTimeout(timer);
			el.classList.add("is-leaving");
			setTimeout(function () { el.remove(); }, 200);
		}
	}
	global.ArdeaToast = { show: showToast };

	/* ---------------------------------------------------------------------
	   Scrim + generic panel open/close (mobile drawer, cart drawer, filters)
	--------------------------------------------------------------------- */
	var scrim;
	function ensureScrim() {
		if (scrim) return scrim;
		scrim = document.querySelector("[data-scrim]");
		if (!scrim) {
			scrim = document.createElement("div");
			scrim.className = "scrim";
			scrim.setAttribute("data-scrim", "");
			document.body.appendChild(scrim);
		}
		scrim.addEventListener("click", closeAllPanels);
		return scrim;
	}
	function openPanel(panel) {
		ensureScrim().classList.add("is-visible");
		panel.classList.add("is-open");
		document.body.classList.add("no-scroll");
	}
	function closePanel(panel) {
		panel.classList.remove("is-open");
		if (!document.querySelector(".mobile-drawer.is-open, .side-drawer.is-open, .filters.is-open")) {
			if (scrim) scrim.classList.remove("is-visible");
			document.body.classList.remove("no-scroll");
		}
	}
	function closeAllPanels() {
		document.querySelectorAll(".mobile-drawer.is-open, .side-drawer.is-open, .filters.is-open").forEach(function (p) {
			p.classList.remove("is-open");
		});
		if (scrim) scrim.classList.remove("is-visible");
		document.body.classList.remove("no-scroll");
	}
	function openCartDrawer() {
		var el = document.querySelector("[data-cart-drawer]");
		if (el) openPanel(el);
	}

	document.addEventListener("click", function (e) {
		if (e.target.closest("[data-cart-open]")) {
			e.preventDefault();
			openCartDrawer();
		}
		var closer = e.target.closest("[data-panel-close]");
		if (closer) {
			var panel = closer.closest(".mobile-drawer, .side-drawer, .filters");
			if (panel) closePanel(panel);
		}
		var mobileNavOpener = e.target.closest("[data-mobile-nav-open]");
		if (mobileNavOpener) {
			e.preventDefault();
			var drawer = document.querySelector("[data-mobile-drawer]");
			if (drawer) {
				openPanel(drawer);
				mobileNavOpener.setAttribute("aria-expanded", "true");
			}
		}
		var filterOpener = e.target.closest("[data-filter-drawer-open]");
		if (filterOpener) {
			e.preventDefault();
			var filters = document.querySelector(".filters");
			if (filters) openPanel(filters);
		}
	});

	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape") {
			closeAllPanels();
			var hamburger = document.querySelector("[data-mobile-nav-open]");
			if (hamburger) hamburger.setAttribute("aria-expanded", "false");
		}
	});

	/* ---------------------------------------------------------------------
	   Sticky header
	--------------------------------------------------------------------- */
	function initStickyHeader() {
		var header = document.querySelector(".site-header");
		if (!header) return;
		var lastState = false;
		function onScroll() {
			var stuck = global.scrollY > 8;
			if (stuck !== lastState) {
				header.classList.toggle("is-stuck", stuck);
				lastState = stuck;
			}
		}
		global.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
	}

	/* ---------------------------------------------------------------------
	   Announcement bar rotation
	--------------------------------------------------------------------- */
	function initAnnouncementRotation() {
		var msgs = document.querySelectorAll(".topbar__msg");
		if (msgs.length < 2 || prefersReducedMotion) return;
		var index = 0;
		setInterval(function () {
			msgs[index].classList.remove("is-active");
			index = (index + 1) % msgs.length;
			msgs[index].classList.add("is-active");
		}, 4200);
	}

	/* ---------------------------------------------------------------------
	   Mega menu (desktop hover + keyboard)
	--------------------------------------------------------------------- */
	function initMegaMenu() {
		document.querySelectorAll(".main-nav__item[data-has-mega]").forEach(function (item) {
			var closeTimer;
			function open() { clearTimeout(closeTimer); item.classList.add("is-open"); }
			function close() { closeTimer = setTimeout(function () { item.classList.remove("is-open"); }, 140); }
			item.addEventListener("mouseenter", open);
			item.addEventListener("mouseleave", close);
			item.addEventListener("focusin", open);
			item.addEventListener("focusout", function (e) {
				if (!item.contains(e.relatedTarget)) close();
			});
			var link = item.querySelector(".main-nav__link");
			if (link) {
				link.addEventListener("keydown", function (e) {
					if ((e.key === "Enter" || e.key === " ") && !item.classList.contains("is-open")) {
						e.preventDefault();
						open();
					}
				});
			}
		});
	}

	/* ---------------------------------------------------------------------
	   Mobile drawer nav accordion ("Shop" toggle/panel)
	--------------------------------------------------------------------- */
	function initMobileDrawerNav() {
		var drawer = document.querySelector("[data-mobile-drawer]");
		if (!drawer) return;
		drawer.querySelectorAll(".mobile-nav__toggle").forEach(function (toggle) {
			toggle.addEventListener("click", function () {
				var item = toggle.closest(".mobile-nav__item");
				var wasOpen = item.classList.contains("is-open");
				drawer.querySelectorAll(".mobile-nav__item.is-open").forEach(function (i) { i.classList.remove("is-open"); });
				if (!wasOpen) item.classList.add("is-open");
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Shop filters aside: collapsible groups + mobile close button
	--------------------------------------------------------------------- */
	function initFilterGroups() {
		document.querySelectorAll("[data-filter-group-toggle]").forEach(function (btn) {
			btn.addEventListener("click", function () {
				var group = btn.closest(".filter-group");
				if (group) group.classList.toggle("is-collapsed");
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Scroll reveal (IntersectionObserver)
	--------------------------------------------------------------------- */
	function initScrollReveal() {
		var targets = document.querySelectorAll("[data-reveal]");
		if (!targets.length) return;
		if (prefersReducedMotion || !("IntersectionObserver" in global)) {
			targets.forEach(function (t) { t.classList.add("is-revealed"); });
			return;
		}
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-revealed");
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
		targets.forEach(function (t) { observer.observe(t); });
	}

	/* ---------------------------------------------------------------------
	   Wishlist heart toggle — AJAX to ardea_wishlist_toggle
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
					action: "ardea_wishlist_toggle",
					nonce: settings.wishlistNonce,
					product_id: productId,
					action_type: "toggle"
				})
			})
				.then(function (r) { return r.json(); })
				.then(function (res) {
					btn.disabled = false;
					if (!res || !res.success) {
						showToast((settings.i18n && settings.i18n.error) || "Error", "error");
						return;
					}
					var active = res.data.active;
					document.querySelectorAll('[data-wishlist-toggle][data-id="' + productId + '"]').forEach(function (el) {
						el.classList.toggle("is-active", active);
						el.setAttribute("aria-pressed", active ? "true" : "false");
					});
					updateWishlistCountBadges(res.data.count);
					showToast(res.data.message, "success");
				})
				.catch(function () { btn.disabled = false; });
		});
	}

	/* ---------------------------------------------------------------------
	   Quick View modal — AJAX to ardea_quick_view
	--------------------------------------------------------------------- */
	function initQuickView() {
		var modal = document.querySelector("[data-quick-view-modal]");
		if (!modal) return;

		function openModal() {
			modal.classList.add("is-open");
			document.body.classList.add("no-scroll");
		}
		function closeModal() {
			modal.classList.remove("is-open");
			document.body.classList.remove("no-scroll");
		}

		document.addEventListener("click", function (e) {
			var trigger = e.target.closest("[data-quick-view]");
			if (trigger) {
				e.preventDefault();
				var productId = trigger.getAttribute("data-product-id");
				if (!productId || !settings.ajaxUrl) return;
				modal.innerHTML = '<div class="modal__panel"><div class="modal__body"><p class="text-muted">' + "…" + "</p></div></div>";
				openModal();
				fetch(settings.ajaxUrl, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						action: "ardea_quick_view",
						nonce: settings.quickViewNonce,
						product_id: productId
					})
				})
					.then(function (r) { return r.json(); })
					.then(function (res) {
						if (res && res.success) {
							modal.innerHTML = '<div class="modal__panel">' + res.data.html + "</div>";
						} else {
							modal.innerHTML = '<div class="modal__panel"><div class="modal__body"><p>' + ((settings.i18n && settings.i18n.error) || "Error") + "</p></div></div>";
						}
					});
			}
			if (e.target.closest("[data-quick-view-close]") || e.target === modal) {
				closeModal();
			}
		});
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
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
						showToast((settings.i18n && settings.i18n.error) || "Error", "error");
						return;
					}
					applyCartFragments(res.fragments);
					if (global.jQuery) {
						global.jQuery(document.body).trigger("added_to_cart", [res.fragments, res.cart_hash, global.jQuery(btn)]);
					}
					showToast((settings.i18n && settings.i18n.addedToCart) || "Added to your cart.", "success");
					openCartDrawer();
				})
				.catch(function () { btn.disabled = false; });
		});
	}

	/* ---------------------------------------------------------------------
	   FAQ accordion (single-open) on the PDP — custom feature, not native
	   WooCommerce. CSS drives the open/close animation via a fixed
	   max-height on .faq-item.is-open .faq-item__a.
	--------------------------------------------------------------------- */
	function initFaqAccordion() {
		document.querySelectorAll(".faq-accordion").forEach(function (wrap) {
			wrap.querySelectorAll("[data-faq-item]").forEach(function (item) {
				var btn = item.querySelector(".faq-item__q");
				if (!btn) return;
				btn.addEventListener("click", function () {
					var isOpen = item.classList.contains("is-open");
					wrap.querySelectorAll("[data-faq-item].is-open").forEach(function (other) {
						other.classList.remove("is-open");
						var q = other.querySelector(".faq-item__q");
						if (q) q.setAttribute("aria-expanded", "false");
					});
					if (!isOpen) {
						item.classList.add("is-open");
						btn.setAttribute("aria-expanded", "true");
					}
				});
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Quantity stepper — progressively wraps WooCommerce's native
	   input.qty in the demo's +/- button UI without touching WC's markup.
	--------------------------------------------------------------------- */
	function initQtySteppers() {
		document.querySelectorAll(".quantity").forEach(function (wrap) {
			if (wrap.classList.contains("qty-stepper") || wrap.dataset.ardeaEnhanced) return;
			var input = wrap.querySelector("input.qty");
			if (!input) return;
			wrap.dataset.ardeaEnhanced = "1";
			wrap.classList.add("qty-stepper");

			var minus = document.createElement("button");
			minus.type = "button";
			minus.setAttribute("aria-label", "Decrease quantity");
			minus.textContent = "−";
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
	   for the native dropdown. See ardea_variation_swatches() in
	   inc/woocommerce.php for the markup this pairs with.
	--------------------------------------------------------------------- */
	function initVariationSwatches() {
		document.addEventListener("click", function (e) {
			var swatch = e.target.closest(".swatch-list .swatch");
			if (!swatch) return;
			var list = swatch.closest(".swatch-list");
			var selectId = list ? list.getAttribute("data-swatch-for") : null;
			var select = selectId ? document.getElementById(selectId) : null;
			if (!select) return;
			select.value = swatch.getAttribute("data-swatch-value") || "";
			select.dispatchEvent(new Event("change", { bubbles: true }));
			list.querySelectorAll(".swatch").forEach(function (s) { s.setAttribute("aria-pressed", "false"); });
			swatch.setAttribute("aria-pressed", "true");
		});
	}

	/* ---------------------------------------------------------------------
	   Search overlay — quicklinks + live AJAX suggestions
	--------------------------------------------------------------------- */
	function initSearchOverlay() {
		var overlay = document.querySelector("[data-search-overlay]");
		var input = document.querySelector("[data-search-input]");
		var results = document.querySelector("[data-search-suggestions]");
		if (!overlay || !input) return;

		function openOverlay() {
			overlay.classList.add("is-open");
			document.body.classList.add("no-scroll");
			setTimeout(function () { input.focus(); }, 60);
		}
		function closeOverlay() {
			overlay.classList.remove("is-open");
			document.body.classList.remove("no-scroll");
		}
		document.addEventListener("click", function (e) {
			if (e.target.closest("[data-search-open]")) { e.preventDefault(); openOverlay(); }
			if (e.target.closest("[data-search-close]")) closeOverlay();
		});
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && overlay.classList.contains("is-open")) closeOverlay();
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
						action: "ardea_search_suggest",
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
						action: "ardea_newsletter_subscribe",
						nonce: settings.wishlistNonce,
						email: emailInput.value
					})
				})
					.then(function (r) { return r.json(); })
					.then(function (res) {
						form.reset();
						showToast(
							(res && res.data && res.data.message) || (settings.i18n && settings.i18n.subscribed) || "Thanks — you're on the list.",
							res && res.success ? "success" : "error"
						);
					});
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Promo countdown (decorative — counts down to a fixed number of days
	   from page load, matching the demo's homepage promo banner)
	--------------------------------------------------------------------- */
	function initPromoCountdown() {
		var el = document.querySelector("[data-promo-countdown]");
		if (!el) return;
		var target = new Date();
		target.setDate(target.getDate() + 5);
		target.setHours(23, 59, 59, 0);
		function render() {
			var diff = Math.max(0, target - new Date());
			var d = Math.floor(diff / 86400000);
			var h = Math.floor((diff % 86400000) / 3600000);
			var m = Math.floor((diff % 3600000) / 60000);
			el.innerHTML =
				"<div><strong>" + d + "</strong><span>Days</span></div>" +
				"<div><strong>" + h + "</strong><span>Hours</span></div>" +
				"<div><strong>" + m + "</strong><span>Mins</span></div>";
		}
		render();
		setInterval(render, 60000);
	}

	/* ---------------------------------------------------------------------
	   Init
	--------------------------------------------------------------------- */
	document.addEventListener("DOMContentLoaded", function () {
		initStickyHeader();
		initAnnouncementRotation();
		initMegaMenu();
		initMobileDrawerNav();
		initFilterGroups();
		initScrollReveal();
		initWishlistToggles();
		initQuickView();
		initQuickAdd();
		initFaqAccordion();
		initQtySteppers();
		initVariationSwatches();
		initSearchOverlay();
		initNewsletterForms();
		initPromoCountdown();

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
