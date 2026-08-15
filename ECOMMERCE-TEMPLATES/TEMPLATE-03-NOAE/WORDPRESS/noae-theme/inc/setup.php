<?php
/**
 * Theme setup: add_theme_support, image sizes, nav menus, widget areas.
 *
 * @package Noae
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function noae_setup() {
	// Internationalisation.
	load_theme_textdomain( 'noae', NOAE_DIR . '/languages' );

	// Core support.
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'customize-selective-refresh-widgets' );

	// Custom logo — the italic serif "NOAÉ" wordmark is the style.css
	// fallback in header.php/footer.php when no custom logo is set.
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 56,
			'width'       => 200,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	// WooCommerce core support + gallery features used on the single product template.
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

	// Image sizes matching the demo's crops.
	// Product cards use a 4:5 portrait crop (400x480 in the static demo).
	add_image_size( 'noae-product-card', 600, 750, true );
	add_image_size( 'noae-product-large', 1000, 1250, true );
	// Shop-by-concern category tiles (square crop).
	add_image_size( 'noae-category-tile', 600, 600, true );
	// Hero + editorial + ethos/ingredient spotlight crops.
	add_image_size( 'noae-hero', 800, 550, true );
	add_image_size( 'noae-editorial', 800, 450, true );
	add_image_size( 'noae-ethos', 700, 700, true );

	register_nav_menus(
		array(
			'primary' => __( 'Primary Menu', 'noae' ),
			'footer'  => __( 'Footer Menu', 'noae' ),
		)
	);
}
add_action( 'after_setup_theme', 'noae_setup' );

/**
 * Widget areas for the footer's link columns (Shop / Company / Help),
 * kept optional — footer.php falls back to the demo's real link copy when a
 * sidebar has no widgets so the footer never renders empty on first install.
 */
function noae_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Footer — Shop Column', 'noae' ),
			'id'            => 'footer-shop',
			'description'   => __( 'Optional. Overrides the default Shop links column in the footer.', 'noae' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<p class="noae-footer__heading">',
			'after_title'   => '</p>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Footer — Company Column', 'noae' ),
			'id'            => 'footer-company',
			'description'   => __( 'Optional. Overrides the default Company links column in the footer.', 'noae' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<p class="noae-footer__heading">',
			'after_title'   => '</p>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Footer — Help Column', 'noae' ),
			'id'            => 'footer-help',
			'description'   => __( 'Optional. Overrides the default Help links column in the footer.', 'noae' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<p class="noae-footer__heading">',
			'after_title'   => '</p>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Blog Sidebar', 'noae' ),
			'id'            => 'blog-sidebar',
			'description'   => __( 'Displayed on blog single/archive templates if populated.', 'noae' ),
			'before_widget' => '<div class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
}
add_action( 'widgets_init', 'noae_widgets_init' );

/* =============================================================
 * Primary nav walker — the NOAÉ demo header has NO dropdowns (Shop /
 * Skincare / Haircare / Wellness / Our Story / Contact are all flat
 * links), so unlike a mega-menu theme this walker only needs to add the
 * demo's exact `.noae-nav__link` class (plus `is-active` on the current
 * item) to each top-level item — depth beyond 0 is intentionally not
 * rendered, matching the flat nav in the demo's header.php markup.
 * ============================================================= */
if ( ! class_exists( 'Noae_Walker_Primary_Nav' ) ) {
	class Noae_Walker_Primary_Nav extends Walker_Nav_Menu {
		public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
			if ( 0 !== $depth ) {
				return;
			}
			$classes = array( 'noae-nav__link' );
			if ( in_array( 'current-menu-item', $item->classes, true ) || in_array( 'current-menu-parent', $item->classes, true ) ) {
				$classes[] = 'is-active';
			}
			$title = apply_filters( 'the_title', $item->title, $item->ID );
			$output .= '<li><a class="' . esc_attr( implode( ' ', $classes ) ) . '" href="' . esc_url( $item->url ) . '">' . esc_html( $title ) . '</a></li>';
		}

		public function end_el( &$output, $item, $depth = 0, $args = null ) {}
		public function start_lvl( &$output, $depth = 0, $args = null ) {}
		public function end_lvl( &$output, $depth = 0, $args = null ) {}
	}
}

/**
 * Mobile drawer nav walker — same flat link set, styled with the demo's
 * `.noae-mobile-nav__link` italic-serif treatment.
 */
if ( ! class_exists( 'Noae_Walker_Mobile_Nav' ) ) {
	class Noae_Walker_Mobile_Nav extends Walker_Nav_Menu {
		public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
			if ( 0 !== $depth ) {
				return;
			}
			$title = apply_filters( 'the_title', $item->title, $item->ID );
			$output .= '<li><a class="noae-mobile-nav__link" href="' . esc_url( $item->url ) . '">' . esc_html( $title ) . '</a></li>';
		}

		public function end_el( &$output, $item, $depth = 0, $args = null ) {}
		public function start_lvl( &$output, $depth = 0, $args = null ) {}
		public function end_lvl( &$output, $depth = 0, $args = null ) {}
	}
}

/**
 * Resolve a real WooCommerce product category archive by slug, falling
 * back to the shop page so nav links are never dead on a fresh install
 * before a merchant has created matching categories.
 */
function noae_category_url( $slug ) {
	$term = get_term_by( 'slug', $slug, 'product_cat' );
	if ( $term && ! is_wp_error( $term ) ) {
		return get_term_link( $term );
	}
	return function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
}
