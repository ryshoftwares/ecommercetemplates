<?php
/**
 * Styles, scripts, fonts.
 *
 * @package Velora
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function velora_enqueue_assets() {
	// Google Fonts — same pairing as the demo: Playfair Display (display) + Jost (body).
	// Preconnect hints are printed separately in velora_resource_hints() below.
	wp_enqueue_style(
		'velora-fonts',
		'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Jost:wght@400;500;600&display=swap',
		array(),
		null
	);

	// Core stylesheet (theme header + ported design tokens/components).
	wp_enqueue_style( 'velora-style', get_stylesheet_uri(), array( 'velora-fonts' ), VELORA_VERSION );

	// Responsive breakpoints, loaded after the base stylesheet so overrides win.
	wp_enqueue_style( 'velora-responsive', VELORA_URI . '/assets/css/responsive.css', array( 'velora-style' ), VELORA_VERSION );

	// Theme interactions: mobile drawer, search overlay, cart drawer, tabs,
	// FAQ accordion, PDP zoom, quick view/quick add, wishlist toggles, toasts.
	wp_enqueue_script( 'velora-theme', VELORA_URI . '/assets/js/theme.js', array( 'jquery' ), VELORA_VERSION, true );

	$localized = array(
		'ajaxUrl'        => admin_url( 'admin-ajax.php' ),
		// WooCommerce's own endpoint builder (handles plain vs. pretty
		// permalinks correctly) — used by theme.js for the Quick Add
		// button's add_to_cart call instead of guessing a wp-admin path,
		// which could otherwise clash with admin auth for guests.
		'wcAjaxUrl'      => class_exists( 'WC_AJAX' ) ? WC_AJAX::get_endpoint( '%%endpoint%%' ) : '',
		'wishlistNonce'  => wp_create_nonce( 'velora_wishlist' ),
		'quickViewNonce' => wp_create_nonce( 'velora_quick_view' ),
		'isWooCommerce'  => class_exists( 'WooCommerce' ),
		'shopUrl'        => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ),
		'cartUrl'        => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' ),
		'checkoutUrl'    => function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : home_url( '/checkout/' ),
		'wishlistUrl'    => velora_get_wishlist_page_url(),
		'i18n'           => array(
			'addedToWishlist'   => __( 'Added to your wishlist.', 'velora' ),
			'removedFromWishlist' => __( 'Removed from your wishlist.', 'velora' ),
			'addedToCart'       => __( 'Added to your cart.', 'velora' ),
			'error'             => __( 'Something went wrong. Please try again.', 'velora' ),
			'subscribed'        => __( 'Thanks for subscribing to Velora.', 'velora' ),
		),
	);
	wp_localize_script( 'velora-theme', 'VeloraSettings', $localized );

	// WooCommerce: keep header cart count (and mini-cart drawer contents) live via AJAX
	// without a full page reload — required by the brief, and it's what wc-cart-fragments
	// is built for, so we lean on WooCommerce core instead of re-implementing it.
	if ( class_exists( 'WooCommerce' ) ) {
		wp_enqueue_script( 'wc-cart-fragments' );
	}
}
add_action( 'wp_enqueue_scripts', 'velora_enqueue_assets' );

/**
 * Fallback used by inc/enqueue.php before inc/wishlist.php has necessarily
 * loaded its own definition (WooCommerce-only feature) — avoids a fatal on
 * sites that have the theme active without WooCommerce installed yet.
 */
if ( ! function_exists( 'velora_get_wishlist_page_url' ) ) {
	function velora_get_wishlist_page_url() {
		return home_url( '/' );
	}
}

/**
 * Preconnect hints for Google Fonts, matching the demo's <head>.
 */
function velora_resource_hints( $urls, $relation_type ) {
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
add_filter( 'wp_resource_hints', 'velora_resource_hints', 10, 2 );

/**
 * Editor style so the block editor preview roughly matches the front end.
 */
function velora_editor_styles() {
	add_editor_style( array( 'style.css', 'assets/css/responsive.css' ) );
}
add_action( 'after_setup_theme', 'velora_editor_styles' );
