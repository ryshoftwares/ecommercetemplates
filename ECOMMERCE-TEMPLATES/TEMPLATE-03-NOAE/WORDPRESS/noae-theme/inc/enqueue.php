<?php
/**
 * Styles, scripts, fonts.
 *
 * @package Noae
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function noae_enqueue_assets() {
	// Google Fonts — same pairing as the demo: Cormorant Garamond (italic
	// display serif) + Nunito Sans (body). Preconnect hints are printed
	// separately in noae_resource_hints() below.
	wp_enqueue_style(
		'noae-fonts',
		'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600;1,700&family=Nunito+Sans:wght@400;600;700;800&display=swap',
		array(),
		null
	);

	// Core stylesheet (theme header + ported design tokens/components).
	wp_enqueue_style( 'noae-style', get_stylesheet_uri(), array( 'noae-fonts' ), NOAE_VERSION );

	// Responsive breakpoints, loaded after the base stylesheet so overrides win.
	wp_enqueue_style( 'noae-responsive', NOAE_URI . '/assets/css/responsive.css', array( 'noae-style' ), NOAE_VERSION );

	// Theme interactions: mobile drawer, announcement rotation, search
	// overlay, cart drawer, tabs, FAQ accordion, PDP gallery/variant
	// swatches, quick view/quick add, wishlist toggles, toasts, scroll reveal.
	wp_enqueue_script( 'noae-theme', NOAE_URI . '/assets/js/theme.js', array( 'jquery' ), NOAE_VERSION, true );

	$localized = array(
		'ajaxUrl'        => admin_url( 'admin-ajax.php' ),
		// WooCommerce's own endpoint builder (handles plain vs. pretty
		// permalinks correctly) — used by theme.js for the Quick Add
		// button's add_to_cart call instead of guessing a wp-admin path,
		// which could otherwise clash with admin auth for guests.
		'wcAjaxUrl'      => class_exists( 'WC_AJAX' ) ? WC_AJAX::get_endpoint( '%%endpoint%%' ) : '',
		'wishlistNonce'  => wp_create_nonce( 'noae_wishlist' ),
		'quickViewNonce' => wp_create_nonce( 'noae_quick_view' ),
		'isWooCommerce'  => class_exists( 'WooCommerce' ),
		'shopUrl'        => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ),
		'cartUrl'        => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' ),
		'checkoutUrl'    => function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : home_url( '/checkout/' ),
		'wishlistUrl'    => noae_get_wishlist_page_url(),
		'i18n'           => array(
			'addedToWishlist'     => __( 'Added to your wishlist.', 'noae' ),
			'removedFromWishlist' => __( 'Removed from your wishlist.', 'noae' ),
			'addedToCart'         => __( 'Added to your bag.', 'noae' ),
			'error'               => __( 'Something went wrong. Please try again.', 'noae' ),
			'subscribed'          => __( 'Welcome to the ritual — check your inbox for 10% off.', 'noae' ),
		),
	);
	wp_localize_script( 'noae-theme', 'NoaeSettings', $localized );

	// WooCommerce: keep header cart count (and mini-cart/drawer contents)
	// live via AJAX without a full page reload — this is exactly what
	// wc-cart-fragments is built for, so we lean on WooCommerce core
	// instead of re-implementing it.
	if ( class_exists( 'WooCommerce' ) ) {
		wp_enqueue_script( 'wc-cart-fragments' );
	}
}
add_action( 'wp_enqueue_scripts', 'noae_enqueue_assets' );

/**
 * Fallback used by inc/enqueue.php before inc/wishlist.php has necessarily
 * loaded its own definition (WooCommerce-only feature) — avoids a fatal on
 * sites that have the theme active without WooCommerce installed yet.
 */
if ( ! function_exists( 'noae_get_wishlist_page_url' ) ) {
	function noae_get_wishlist_page_url() {
		return home_url( '/' );
	}
}

/**
 * Preconnect hints for Google Fonts, matching the demo's <head>.
 */
function noae_resource_hints( $urls, $relation_type ) {
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
add_filter( 'wp_resource_hints', 'noae_resource_hints', 10, 2 );

/**
 * Editor style so the block editor preview roughly matches the front end.
 */
function noae_editor_styles() {
	add_editor_style( array( 'style.css', 'assets/css/responsive.css' ) );
}
add_action( 'after_setup_theme', 'noae_editor_styles' );
