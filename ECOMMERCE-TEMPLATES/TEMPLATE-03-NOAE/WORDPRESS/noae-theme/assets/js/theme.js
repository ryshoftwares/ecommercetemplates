/* ==========================================================================
   NOAÉ (WordPress) — Theme Behaviour
   Ported from the demo's js/app.js + js/product.js + js/search.js
   interaction patterns, adapted to WordPress/WooCommerce-rendered markup
   and real AJAX endpoints (wishlist, quick view, quick add, search, cart
   fragments) instead of the demo's client-side products.js dataset.
   ========================================================================== */
(function (global) {
	"use strict";

	var settings = global.NoaeSettings || {};
	var prefersReducedMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---------------------------------------------------------------------
	   Toasts — window.NoaeToast.show(msg, type)
	--------------------------------------------------------------------- */
	var toastRegion;
	function ensureToastRegion() {
		if (toastRegion) return toastRegion;
		toastRegion = document.getElementById("toastRegion");
		if (!toastRegion) {
			toastRegion = document.createElement("div");
			toastRegion.id = "toastRegion";
			toastRegion.className = "noae-toast-region";
			toastRegion.setAttribute("role", "status");
			toastRegion.setAttribute("aria-live", "polite");
			document.body.appendChild(toastRegion);
		}
		return toastRegion;
	}
	function showToast(message, type) {
		if (!message) return;
		var region = ensureToastRegion();
		var el = document.createElement("div");
		el.className = "noae-toast" + (type === "success" ? " noae-toast--success" : type === "error" ? " noae-toast--error" : "");
		el.textContent = message;
		region.appendChild(el);
		setTimeout(function () {
			el.style.transition = "opacity 220ms ease";
			el.style.opacity = "0";
			setTimeout(function () { el.remove(); }, 240);
		}, 2600);
	}
	global.NoaeToast = { show: showToast };

	/* ---------------------------------------------------------------------
	   Shared scrim + generic panel open/close (mobile drawer, cart drawer,
	   shop filters aside)
	--------------------------------------------------------------------- */
	var scrim;
	function ensureScrim() {
		if (scrim) return scrim;
		scrim = document.createElement("div");
		scrim.className = "noae-drawer-overlay";
		scrim.setAttribute("data-scrim", "");
		document.body.appendChild(scrim);
		scrim.addEventListener("click", closeAllPanels);
		return scrim;
	}
	function openPanel(panel) {
		ensureScrim().classList.add("is-open");
		panel.classList.add("is-open");
		document.body.style.overflow = "hidden";
	}
	function closePanel(panel) {
		panel.classList.remove("is-open");
		if (!document.querySelector(".noae-drawer.is-open, .noae-filters.is-open")) {
			if (scrim) scrim.classList.remove("is-open");
			document.body.style.overflow = "";
		}
	}
	function closeAllPanels() {
		document.querySelectorAll(".noae-drawer.is-open, .noae-filters.is-open").forEach(function (p) {
			p.classList.remove("is-open");
		});
		if (scrim) scrim.classList.remove("is-open");
		document.body.style.overflow = "";
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
			var panel = closer.closest(".noae-drawer, .noae-filters");
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
			var filters = document.querySelector(".noae-filters");
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
		var header = document.querySelector(".noae-header");
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
		var items = document.querySelectorAll(".noae-announcement__item");
		if (items.length < 2 || prefersReducedMotion) return;
		var index = 0;
		setInterval(function () {
			items[index].classList.remove("is-active");
			index = (index + 1) % items.length;
			items[index].classList.add("is-active");
		}, 4200);
	}

	/* ---------------------------------------------------------------------
	   Scroll reveal (IntersectionObserver)
	--------------------------------------------------------------------- */
	function initScrollReveal() {
		var targets = document.querySelectorAll(".noae-reveal");
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
		}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
		targets.forEach(function (t) { observer.observe(t); });
	}

	/* ---------------------------------------------------------------------
	   Wishlist heart toggle — AJAX to noae_wishlist_toggle
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
					action: "noae_wishlist_toggle",
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
	   Quick View modal — AJAX to noae_quick_view
	--------------------------------------------------------------------- */
	function initQuickView() {
		var overlay = document.querySelector("[data-quick-view-modal-overlay]");
		var modal = document.querySelector("[data-quick-view-modal]");
		if (!overlay || !modal) return;

		function openModal() {
			overlay.classList.add("is-open");
			document.body.style.overflow = "hidden";
		}
		function closeModal() {
			overlay.classList.remove("is-open");
			document.body.style.overflow = "";
		}

		document.addEventListener("click", function (e) {
			var trigger = e.target.closest("[data-quick-view]");
			if (trigger) {
				e.preventDefault();
				var productId = trigger.getAttribute("data-product-id");
				if (!productId || !settings.ajaxUrl) return;
				modal.innerHTML = "";
				openModal();
				fetch(settings.ajaxUrl, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						action: "noae_quick_view",
						nonce: settings.quickViewNonce,
						product_id: productId
					})
				})
					.then(function (r) { return r.json(); })
					.then(function (res) {
						if (res && res.success) {
							modal.innerHTML = res.data.html;
						} else {
							modal.innerHTML = '<div style="padding:2rem;"><p>' + ((settings.i18n && settings.i18n.error) || "Error") + "</p></div>";
						}
					});
			}
			if (e.target.closest("[data-quick-view-close]") || e.target === overlay) {
				closeModal();
			}
		});
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
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
					showToast((settings.i18n && settings.i18n.addedToCart) || "Added to your bag.", "success");
					openCartDrawer();
				})
				.catch(function () { btn.disabled = false; });
		});
	}

	/* ---------------------------------------------------------------------
	   Cart drawer: "Remove" link — enhances the .noae-cart-item__remove
	   button (rendered by noae_render_cart_drawer_items()) with an AJAX
	   remove-from-cart call so items disappear without a page reload.
	--------------------------------------------------------------------- */
	function initCartRemove() {
		document.addEventListener("click", function (e) {
			var btn = e.target.closest(".remove_from_cart_button[data-remove-url]");
			if (!btn || !btn.closest(".noae-cart-drawer")) return;
			e.preventDefault();
			fetch(btn.getAttribute("data-remove-url"), { credentials: "same-origin" })
				.then(function () {
					// WooCommerce's remove-cart-item endpoint triggers wc_fragments
					// refresh on the storefront JS; without that script enqueued we
					// just refresh fragments manually via a no-op add_to_cart ping.
					global.location.reload();
				});
		});
	}

	/* ---------------------------------------------------------------------
	   FAQ accordion (single-open) on the PDP — custom feature, not native
	   WooCommerce. CSS drives the open/close animation via a fixed
	   max-height on .noae-faq__item.is-open .noae-faq__answer.
	--------------------------------------------------------------------- */
	function initFaqAccordion() {
		document.querySelectorAll(".noae-faq").forEach(function (wrap) {
			wrap.querySelectorAll("[data-faq-item]").forEach(function (item) {
				var btn = item.querySelector(".noae-faq__question");
				if (!btn) return;
				btn.addEventListener("click", function () {
					var isOpen = item.classList.contains("is-open");
					wrap.querySelectorAll("[data-faq-item].is-open").forEach(function (other) {
						other.classList.remove("is-open");
						var q = other.querySelector(".noae-faq__question");
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
	   Product tabs — WooCommerce's own ul.tabs/.panel markup, restyled to
	   the demo's .noae-tabs__list/.noae-tabs__panel look via a lightweight
	   click handler mirroring the demo's js/product.js renderTabs().
	--------------------------------------------------------------------- */
	function initProductTabs() {
		var wrap = document.querySelector(".woocommerce-tabs");
		if (!wrap) return;
		var tabs = wrap.querySelectorAll("ul.tabs > li");
		var panels = wrap.querySelectorAll(".panel");
		if (!tabs.length) return;

		function activate(index) {
			tabs.forEach(function (li, i) { li.classList.toggle("active", i === index); });
			panels.forEach(function (panel, i) { panel.classList.toggle("is-active", i === index); });
		}
		tabs.forEach(function (li, i) {
			var link = li.querySelector("a");
			if (!link) return;
			link.addEventListener("click", function (e) {
				e.preventDefault();
				activate(i);
			});
		});
		activate(0);
	}

	/* ---------------------------------------------------------------------
	   Quantity stepper — progressively wraps WooCommerce's native
	   input.qty in the demo's +/- button UI without touching WC's markup.
	--------------------------------------------------------------------- */
	function initQtySteppers() {
		document.querySelectorAll(".quantity").forEach(function (wrap) {
			if (wrap.classList.contains("noae-qty-selector") || wrap.dataset.noaeEnhanced) return;
			var input = wrap.querySelector("input.qty");
			if (!input) return;
			wrap.dataset.noaeEnhanced = "1";
			wrap.classList.add("noae-qty-selector");

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
	   Variant "chip" pills — forward clicks onto WooCommerce's native
	   (CSS-hidden) <select>, then fire a native change event so WC's own
	   variations.js recalculates price/availability exactly as it would
	   for the native dropdown. See noae_variation_swatches() in
	   inc/woocommerce.php for the markup this pairs with.
	--------------------------------------------------------------------- */
	function initVariantChips() {
		document.addEventListener("click", function (e) {
			var chip = e.target.closest(".noae-variant-options .noae-variant-chip");
			if (!chip) return;
			var list = chip.closest(".noae-variant-options");
			var selectId = list ? list.getAttribute("data-swatch-for") : null;
			var select = selectId ? document.getElementById(selectId) : null;
			if (!select) return;
			select.value = chip.getAttribute("data-swatch-value") || "";
			select.dispatchEvent(new Event("change", { bubbles: true }));
			list.querySelectorAll(".noae-variant-chip").forEach(function (c) { c.classList.remove("is-selected"); });
			chip.classList.add("is-selected");
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
			if (e.target === overlay) closeOverlay();
		});
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && overlay.classList.contains("is-open")) closeOverlay();
		});

		var timer = null;
		var placeholderHtml = results ? results.innerHTML : "";
		input.addEventListener("input", function () {
			clearTimeout(timer);
			var term = input.value.trim();
			if (!results) return;
			if (term.length < 2) {
				results.innerHTML = placeholderHtml;
				return;
			}
			timer = setTimeout(function () {
				if (!settings.ajaxUrl) return;
				fetch(settings.ajaxUrl, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						action: "noae_search_suggest",
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
	   Newsletter / skin-quiz forms (header/footer/homepage) — AJAX subscribe
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
						action: "noae_newsletter_subscribe",
						nonce: settings.wishlistNonce,
						email: emailInput.value
					})
				})
					.then(function (r) { return r.json(); })
					.then(function (res) {
						form.reset();
						showToast(
							(res && res.data && res.data.message) || (settings.i18n && settings.i18n.subscribed) || "Welcome to the ritual — check your inbox for 10% off.",
							res && res.success ? "success" : "error"
						);
					});
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Filter group collapse (shop filters aside) + current-year footer text
	--------------------------------------------------------------------- */
	function initFilterGroups() {
		document.querySelectorAll(".noae-filters__group-title").forEach(function (title) {
			title.addEventListener("click", function () {
				var group = title.closest(".noae-filters__group");
				if (group) group.classList.toggle("is-collapsed");
			});
		});
	}
	function initMisc() {
		document.querySelectorAll(".js-current-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });
	}

	/* ---------------------------------------------------------------------
	   Init
	--------------------------------------------------------------------- */
	document.addEventListener("DOMContentLoaded", function () {
		initStickyHeader();
		initAnnouncementRotation();
		initScrollReveal();
		initWishlistToggles();
		initQuickView();
		initQuickAdd();
		initCartRemove();
		initFaqAccordion();
		initProductTabs();
		initQtySteppers();
		initVariantChips();
		initSearchOverlay();
		initNewsletterForms();
		initFilterGroups();
		initMisc();

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
