<?php
/**
 * Styles, scripts, fonts.
 *
 * @package Ardea
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function ardea_enqueue_assets() {
	// Google Fonts — same pairing as the demo: Fraunces (display) + Manrope (body).
	// Preconnect hints are printed separately in ardea_resource_hints() below.
	wp_enqueue_style(
		'ardea-fonts',
		'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=Manrope:wght@400;500;600;700;800&display=swap',
		array(),
		null
	);

	// Core stylesheet (theme header + ported design tokens/components).
	wp_enqueue_style( 'ardea-style', get_stylesheet_uri(), array( 'ardea-fonts' ), ARDEA_VERSION );

	// Responsive breakpoints, loaded after the base stylesheet so overrides win.
	wp_enqueue_style( 'ardea-responsive', ARDEA_URI . '/assets/css/responsive.css', array( 'ardea-style' ), ARDEA_VERSION );

	// Theme interactions: mobile drawer, mega menu, search overlay, cart
	// drawer, tabs, FAQ accordion, PDP gallery/finish swatches, quick
	// view/quick add, wishlist toggles, toasts, promo countdown.
	wp_enqueue_script( 'ardea-theme', ARDEA_URI . '/assets/js/theme.js', array( 'jquery' ), ARDEA_VERSION, true );

	$localized = array(
		'ajaxUrl'        => admin_url( 'admin-ajax.php' ),
		// WooCommerce's own endpoint builder (handles plain vs. pretty
		// permalinks correctly) — used by theme.js for the Quick Add
		// button's add_to_cart call instead of guessing a wp-admin path,
		// which could otherwise clash with admin auth for guests.
		'wcAjaxUrl'      => class_exists( 'WC_AJAX' ) ? WC_AJAX::get_endpoint( '%%endpoint%%' ) : '',
		'wishlistNonce'  => wp_create_nonce( 'ardea_wishlist' ),
		'quickViewNonce' => wp_create_nonce( 'ardea_quick_view' ),
		'isWooCommerce'  => class_exists( 'WooCommerce' ),
		'shopUrl'        => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ),
		'cartUrl'        => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' ),
		'checkoutUrl'    => function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : home_url( '/checkout/' ),
		'wishlistUrl'    => ardea_get_wishlist_page_url(),
		'i18n'           => array(
			'addedToWishlist'     => __( 'Added to your wishlist.', 'ardea' ),
			'removedFromWishlist' => __( 'Removed from your wishlist.', 'ardea' ),
			'addedToCart'         => __( 'Added to your cart.', 'ardea' ),
			'error'               => __( 'Something went wrong. Please try again.', 'ardea' ),
			'subscribed'          => __( "Thanks — you're on the list.", 'ardea' ),
		),
	);
	wp_localize_script( 'ardea-theme', 'ArdeaSettings', $localized );

	// WooCommerce: keep header cart count (and mini-cart drawer contents) live via AJAX
	// without a full page reload — required by the brief, and it's what wc-cart-fragments
	// is built for, so we lean on WooCommerce core instead of re-implementing it.
	if ( class_exists( 'WooCommerce' ) ) {
		wp_enqueue_script( 'wc-cart-fragments' );
	}
}
add_action( 'wp_enqueue_scripts', 'ardea_enqueue_assets' );

/**
 * Fallback used by inc/enqueue.php before inc/wishlist.php has necessarily
 * loaded its own definition (WooCommerce-only feature) — avoids a fatal on
 * sites that have the theme active without WooCommerce installed yet.
 */
if ( ! function_exists( 'ardea_get_wishlist_page_url' ) ) {
	function ardea_get_wishlist_page_url() {
		return home_url( '/' );
	}
}

/**
 * Preconnect hints for Google Fonts, matching the demo's <head>.
 */
function ardea_resource_hints( $urls, $relation_type ) {
	if ( 'preconnect' === $relation_type ) {
		$urls[] = array(
			'href' => 'https://fonts.googleapis.com',
		);
		$urls[] = array(
			'href' => 'https://fonts.gstatic.com',
			'crossorigin',
		);
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'ardea_resource_hints', 10, 2 );

/**
 * Editor style so the block editor preview roughly matches the front end.
 */
function ardea_editor_styles() {
	add_editor_style( array( 'style.css', 'assets/css/responsive.css' ) );
}
add_action( 'after_setup_theme', 'ardea_editor_styles' );
