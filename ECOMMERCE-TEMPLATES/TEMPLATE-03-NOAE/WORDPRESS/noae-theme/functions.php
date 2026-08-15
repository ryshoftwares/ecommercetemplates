<?php
/**
 * Noaé theme bootstrap.
 *
 * This file only wires up constants and requires the pieces that live in
 * inc/. Each inc/ file is single-purpose so the theme stays easy to audit:
 *
 *   inc/setup.php       theme_support, image sizes, nav menus, sidebars
 *   inc/enqueue.php      styles/scripts, Google Fonts, cart fragments
 *   inc/customizer.php   WP Customizer sections/settings (copy-only, no color pickers)
 *   inc/woocommerce.php  WooCommerce hooks, shop/PDP layout, SEO-plugin-aware JSON-LD
 *   inc/wishlist.php     custom wishlist feature (usermeta + cookie fallback, AJAX, shortcodes)
 *
 * @package Noae
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Disallow direct access.
}

/** Theme version + constants. */
define( 'NOAE_VERSION', '1.0.0' );
define( 'NOAE_DIR', get_template_directory() );
define( 'NOAE_URI', get_template_directory_uri() );

/** Content width used by core/media/oEmbed for responsive sizing. */
if ( ! isset( $content_width ) ) {
	$content_width = 1320; // matches --container-max in style.css
}

/**
 * Load theme pieces. WooCommerce/wishlist load BEFORE enqueue.php on
 * purpose: inc/enqueue.php calls noae_get_wishlist_page_url() (defined in
 * inc/wishlist.php) while building the localized script data, and only
 * defines a same-named fallback stub if that function doesn't exist yet —
 * so the real implementation must win the race when WooCommerce is active.
 */
require NOAE_DIR . '/inc/setup.php';

if ( class_exists( 'WooCommerce' ) ) {
	require NOAE_DIR . '/inc/woocommerce.php';
	require NOAE_DIR . '/inc/wishlist.php';
}

require NOAE_DIR . '/inc/enqueue.php';
require NOAE_DIR . '/inc/customizer.php';

/**
 * SEO-plugin detection — used by header.php (robots/OG/Twitter tags) and,
 * when WooCommerce is active, by inc/woocommerce.php (Product JSON-LD).
 *
 * Rank Math and Yoast both already output Product/Organization/WebSite
 * JSON-LD and Open Graph/Twitter tags once their WooCommerce integration
 * is active. If we printed our own on top, search engines would see
 * duplicate/conflicting structured data and duplicate meta tags on the
 * same page. So: when either plugin is detected we skip our own Product
 * schema and Open Graph/Twitter tags entirely and defer to the plugin. We
 * still print BreadcrumbList and FAQPage JSON-LD ourselves in that case
 * (see inc/woocommerce.php), because neither plugin reliably emits
 * BreadcrumbList/FAQ for a vanilla WooCommerce product out of the box.
 */
function noae_seo_plugin_active() {
	return (
		defined( 'WPSEO_VERSION' ) || class_exists( 'WPSEO_Options' ) // Yoast SEO.
		|| defined( 'RANK_MATH_VERSION' ) // Rank Math.
	);
}

/**
 * Small shared helpers used across templates.
 */

/**
 * Format a number as INR-style currency the way the demo does (₹ + grouped
 * digits), falling back to WooCommerce's own formatter when WooCommerce is
 * active so real store currency settings are always respected.
 */
function noae_format_price( $amount ) {
	if ( function_exists( 'wc_price' ) ) {
		return wc_price( $amount );
	}
	return '₹' . number_format( (float) $amount );
}

/**
 * Excerpt helper capped to a word count, used on blog archive cards.
 */
function noae_excerpt( $limit = 28 ) {
	$text  = get_the_excerpt();
	$words = explode( ' ', wp_strip_all_tags( $text ) );
	if ( count( $words ) > $limit ) {
		$words = array_slice( $words, 0, $limit );
		return implode( ' ', $words ) . '…';
	}
	return implode( ' ', $words );
}
