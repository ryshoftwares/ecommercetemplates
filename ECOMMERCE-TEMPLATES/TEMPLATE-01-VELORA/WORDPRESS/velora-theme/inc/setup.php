<?php
/**
 * Theme setup: add_theme_support, image sizes, nav menus, widget areas.
 *
 * @package Velora
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function velora_setup() {
	// Internationalisation.
	load_theme_textdomain( 'velora', VELORA_DIR . '/languages' );

	// Core support.
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'customize-selective-refresh-widgets' );

	// Custom logo — rendered in header.php next to the VELORA wordmark fallback.
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 64,
			'width'       => 220,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	// WooCommerce core support + gallery features used on the single product template.
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

	// Image sizes matching the demo's editorial crops.
	// Product cards use a 3:4 portrait crop (600x800 in the static demo).
	add_image_size( 'velora-product-card', 600, 800, true );
	add_image_size( 'velora-product-large', 1200, 1600, true );
	// Category / editorial tiles (900x700 landscape in the demo cat-grid).
	add_image_size( 'velora-category-tile', 900, 700, true );
	// Hero + campaign banner crops.
	add_image_size( 'velora-hero', 1200, 1500, true );
	add_image_size( 'velora-banner-wide', 1600, 900, true );

	register_nav_menus(
		array(
			'primary' => __( 'Primary Menu', 'velora' ),
			'footer'  => __( 'Footer Menu', 'velora' ),
		)
	);
}
add_action( 'after_setup_theme', 'velora_setup' );

/**
 * Widget areas for the footer's four link columns (Shop / Help / Company),
 * kept optional — footer.php falls back to the demo's real link copy when a
 * sidebar has no widgets so the footer never renders empty on first install.
 */
function velora_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Footer — Shop Column', 'velora' ),
			'id'            => 'footer-shop',
			'description'   => __( 'Optional. Overrides the default Shop links column in the footer.', 'velora' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Footer — Help Column', 'velora' ),
			'id'            => 'footer-help',
			'description'   => __( 'Optional. Overrides the default Help links column in the footer.', 'velora' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Footer — Company Column', 'velora' ),
			'id'            => 'footer-company',
			'description'   => __( 'Optional. Overrides the default Company links column in the footer.', 'velora' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Blog Sidebar', 'velora' ),
			'id'            => 'blog-sidebar',
			'description'   => __( 'Displayed on blog single/archive templates if populated.', 'velora' ),
			'before_widget' => '<div class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
}
add_action( 'widgets_init', 'velora_widgets_init' );
