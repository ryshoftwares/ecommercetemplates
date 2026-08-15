<?php
/**
 * Styles, scripts, fonts.
 *
 * @package Modix
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function modix_enqueue_assets() {
	// Google Fonts — same pairing as the demo: Space Grotesk (headings),
	// Inter (body) and JetBrains Mono (spec/price/mono accents).
	// Preconnect hints are printed separately in modix_resource_hints() below.
	wp_enqueue_style(
		'modix-fonts',
		'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
		array(),
		null
	);

	// Core stylesheet (theme header + ported design tokens/components).
	wp_enqueue_style( 'modix-style', get_stylesheet_uri(), array( 'modix-fonts' ), MODIX_VERSION );

	// Responsive breakpoints (1440/1280/1024/768/480/390/375), loaded after
	// the base stylesheet so overrides win.
	wp_enqueue_style( 'modix-responsive', MODIX_URI . '/assets/css/responsive.css', array( 'modix-style' ), MODIX_VERSION );

	// Theme interactions: header collapse-on-scroll, mega-dropdown nav,
	// mobile drawer, announcement bar rotation, search overlay, cart
	// drawer, tabs, FAQ accordion, PDP gallery/option swatches, quick
	// view/quick add, wishlist toggles, toasts, scroll-reveal.
	wp_enqueue_script( 'modix-theme', MODIX_URI . '/assets/js/theme.js', array( 'jquery' ), MODIX_VERSION, true );

	$localized = array(
		'ajaxUrl'        => admin_url( 'admin-ajax.php' ),
		// WooCommerce's own endpoint builder (handles plain vs. pretty
		// permalinks correctly) — used by theme.js for the Quick Add
		// button's add_to_cart call instead of guessing a wp-admin path,
		// which could otherwise clash with admin auth for guests.
		'wcAjaxUrl'      => class_exists( 'WC_AJAX' ) ? WC_AJAX::get_endpoint( '%%endpoint%%' ) : '',
		'wishlistNonce'  => wp_create_nonce( 'modix_wishlist' ),
		'quickViewNonce' => wp_create_nonce( 'modix_quick_view' ),
		'isWooCommerce'  => class_exists( 'WooCommerce' ),
		'shopUrl'        => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ),
		'cartUrl'        => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' ),
		'checkoutUrl'    => function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : home_url( '/checkout/' ),
		'wishlistUrl'    => function_exists( 'modix_get_wishlist_page_url' ) ? modix_get_wishlist_page_url() : home_url( '/' ),
		'i18n'           => array(
			'addedToWishlist'     => __( 'Added to your wishlist.', 'modix' ),
			'removedFromWishlist' => __( 'Removed from your wishlist.', 'modix' ),
			'addedToCart'         => __( 'Added to your cart.', 'modix' ),
			'error'               => __( 'Something went wrong. Please try again.', 'modix' ),
			'subscribed'          => __( "You're subscribed — thanks for joining the Modix insider list.", 'modix' ),
		),
	);
	wp_localize_script( 'modix-theme', 'ModixSettings', $localized );

	// WooCommerce: keep header cart count (and cart drawer contents) live
	// via AJAX without a full page reload — required by the brief, and
	// it's what wc-cart-fragments is built for, so we lean on WooCommerce
	// core instead of re-implementing it.
	if ( class_exists( 'WooCommerce' ) ) {
		wp_enqueue_script( 'wc-cart-fragments' );
	}
}
add_action( 'wp_enqueue_scripts', 'modix_enqueue_assets' );

/**
 * Fallback used by inc/enqueue.php before inc/wishlist.php has necessarily
 * loaded its own definition (WooCommerce-only feature) — avoids a fatal on
 * sites that have the theme active without WooCommerce installed yet.
 */
if ( ! function_exists( 'modix_get_wishlist_page_url' ) ) {
	function modix_get_wishlist_page_url() {
		return home_url( '/' );
	}
}

/**
 * Preconnect hints for Google Fonts, matching the demo's <head>.
 */
function modix_resource_hints( $urls, $relation_type ) {
	if ( 'preconnect' === $relation_type ) {
		$urls[] = array(
			'href' => 'https://fonts.googleapis.com',
		);
		$urls[] = array(
			'href'        => 'https://fonts.gstatic.com',
			'crossorigin' => 'anonymous',
		);
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'modix_resource_hints', 10, 2 );

/**
 * Editor style so the block editor preview roughly matches the front end.
 */
function modix_editor_styles() {
	add_editor_style( array( 'style.css', 'assets/css/responsive.css' ) );
}
add_action( 'after_setup_theme', 'modix_editor_styles' );
