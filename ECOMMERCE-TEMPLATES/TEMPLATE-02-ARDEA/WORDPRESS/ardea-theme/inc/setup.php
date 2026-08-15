<?php
/**
 * Theme setup: add_theme_support, image sizes, nav menus, widget areas.
 *
 * @package Ardea
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function ardea_setup() {
	// Internationalisation.
	load_theme_textdomain( 'ardea', ARDEA_DIR . '/languages' );

	// Core support.
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'customize-selective-refresh-widgets' );

	// Custom logo — rendered in header.php next to the ARDEA wordmark fallback.
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

	// Image sizes matching the demo's editorial crops.
	// Product cards use a 4:5 portrait crop (600x750 in the static demo).
	add_image_size( 'ardea-product-card', 600, 750, true );
	add_image_size( 'ardea-product-large', 1000, 1250, true );
	// Shop-by-room tiles (800x600 landscape source, cropped by CSS to fill
	// the asymmetric bento grid regardless of tile shape).
	add_image_size( 'ardea-category-tile', 800, 600, true );
	// Hero + editorial spotlight + wide promo banner crops.
	add_image_size( 'ardea-hero', 900, 1125, true );
	add_image_size( 'ardea-editorial', 1200, 1400, true );
	add_image_size( 'ardea-banner-wide', 1600, 560, true );

	register_nav_menus(
		array(
			'primary' => __( 'Primary Menu', 'ardea' ),
			'footer'  => __( 'Footer Menu', 'ardea' ),
		)
	);
}
add_action( 'after_setup_theme', 'ardea_setup' );

/**
 * Widget areas for the footer's link columns (Shop / Help / Company),
 * kept optional — footer.php falls back to the demo's real link copy when a
 * sidebar has no widgets so the footer never renders empty on first install.
 */
function ardea_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Footer — Shop Column', 'ardea' ),
			'id'            => 'footer-shop',
			'description'   => __( 'Optional. Overrides the default Shop links column in the footer.', 'ardea' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Footer — Help Column', 'ardea' ),
			'id'            => 'footer-help',
			'description'   => __( 'Optional. Overrides the default Help links column in the footer.', 'ardea' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Footer — Company Column', 'ardea' ),
			'id'            => 'footer-company',
			'description'   => __( 'Optional. Overrides the default Company links column in the footer.', 'ardea' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Blog Sidebar', 'ardea' ),
			'id'            => 'blog-sidebar',
			'description'   => __( 'Displayed on blog single/archive templates if populated.', 'ardea' ),
			'before_widget' => '<div class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
}
add_action( 'widgets_init', 'ardea_widgets_init' );

/* =============================================================
 * Primary nav walkers — header.php uses these with wp_nav_menu() so a
 * merchant's real "Primary Menu" (Appearance → Menus) drives the link
 * labels/order/targets, while the "Shop" item's mega menu content is
 * ALWAYS the real, live product_cat tree (ardea_render_mega_menu(), see
 * inc/woocommerce.php) — never something a merchant has to hand-build as
 * nested menu items. Detection of "which item is Shop" is done by URL
 * match against the real Shop page, falling back to a title match, so it
 * keeps working however the merchant labels/orders their menu.
 * ============================================================= */
function ardea_menu_item_is_shop( $item ) {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return false;
	}
	$shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : '';
	if ( $shop_url && untrailingslashit( $item->url ) === untrailingslashit( $shop_url ) ) {
		return true;
	}
	return false !== stripos( $item->title, 'shop' );
}

if ( ! class_exists( 'Ardea_Walker_Primary_Nav' ) ) {
	/**
	 * Desktop primary nav. Renders every top-level item as the demo's
	 * `.main-nav__item > a.main-nav__link`; when the item is the Shop
	 * link, adds `data-has-mega` and injects the real mega menu markup
	 * right after the link, matching the ARDEA demo's header exactly.
	 * Deeper (manually nested) menu items are intentionally not rendered
	 * here — see the class docblock above.
	 */
	class Ardea_Walker_Primary_Nav extends Walker_Nav_Menu {
		public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
			if ( 0 !== $depth ) {
				return;
			}
			$is_mega = ardea_menu_item_is_shop( $item );
			$title   = apply_filters( 'the_title', $item->title, $item->ID );

			$output .= '<li class="main-nav__item"' . ( $is_mega ? ' data-has-mega' : '' ) . '>';
			$output .= '<a class="main-nav__link" href="' . esc_url( $item->url ) . '"' . ( $is_mega ? ' aria-haspopup="true"' : '' ) . '>' . esc_html( $title );
			if ( $is_mega ) {
				$output .= ' <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg>';
			}
			$output .= '</a>';

			if ( $is_mega && function_exists( 'ardea_render_mega_menu' ) ) {
				ob_start();
				ardea_render_mega_menu();
				$output .= ob_get_clean();
			}
		}

		public function end_el( &$output, $item, $depth = 0, $args = null ) {
			if ( 0 !== $depth ) {
				return;
			}
			$output .= "</li>\n";
		}

		// The mega menu above is rendered independently from live taxonomy
		// data, not from nested WP menu items, so suppress default
		// sub-menu rendering to avoid a second, unstyled dropdown if a
		// merchant accidentally nests items under Shop.
		public function start_lvl( &$output, $depth = 0, $args = null ) {}
		public function end_lvl( &$output, $depth = 0, $args = null ) {}
	}
}

if ( ! class_exists( 'Ardea_Walker_Mobile_Nav' ) ) {
	/**
	 * Mobile drawer nav. Flat `.mobile-nav__link`s for ordinary items; the
	 * Shop item becomes the demo's expandable `.mobile-nav__item` toggle
	 * whose panel lists the real top-level product categories (plus a
	 * "Shop All" link), matching mobile-drawer markup in the ARDEA demo.
	 */
	class Ardea_Walker_Mobile_Nav extends Walker_Nav_Menu {
		public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
			if ( 0 !== $depth ) {
				return;
			}
			$title = apply_filters( 'the_title', $item->title, $item->ID );

			if ( ardea_menu_item_is_shop( $item ) ) {
				$output .= '<div class="mobile-nav__item">';
				$output .= '<button type="button" class="mobile-nav__toggle">' . esc_html( $title ) . ' <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg></button>';
				$output .= '<div class="mobile-nav__panel"><div class="mobile-nav__panel-inner">';
				if ( function_exists( 'ardea_mega_menu_columns' ) ) {
					foreach ( ardea_mega_menu_columns( 5 ) as $room ) {
						$output .= '<a href="' . esc_url( get_term_link( $room ) ) . '">' . esc_html( $room->name ) . '</a>';
					}
				}
				$output .= '<a href="' . esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ) . '">' . esc_html__( 'Shop All', 'ardea' ) . '</a>';
				$output .= '</div></div></div>';
			} else {
				$output .= '<a class="mobile-nav__link" href="' . esc_url( $item->url ) . '">' . esc_html( $title ) . '</a>';
			}
		}

		public function end_el( &$output, $item, $depth = 0, $args = null ) {}
		public function start_lvl( &$output, $depth = 0, $args = null ) {}
		public function end_lvl( &$output, $depth = 0, $args = null ) {}
	}
}
