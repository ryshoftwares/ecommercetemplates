<?php
/**
 * Theme setup: add_theme_support, image sizes, nav menus, widget areas,
 * and the mega-dropdown nav Walker classes.
 *
 * @package Modix
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function modix_setup() {
	// Internationalisation.
	load_theme_textdomain( 'modix', MODIX_DIR . '/languages' );

	// Core support.
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'customize-selective-refresh-widgets' );

	// Custom logo — rendered in header.php next to the MODIX wordmark fallback.
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 40,
			'width'       => 160,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	// WooCommerce core support + gallery features used on the single product template.
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

	// Image sizes matching the demo's square product renders and the
	// editorial/hero crops used on front-page.php and single.php.
	add_image_size( 'modix-product-card', 600, 600, true );
	add_image_size( 'modix-product-large', 1000, 1000, true );
	add_image_size( 'modix-mega-product', 200, 200, true );
	add_image_size( 'modix-editorial', 1200, 960, true );

	register_nav_menus(
		array(
			'primary' => __( 'Primary Menu', 'modix' ),
			'footer'  => __( 'Footer Menu', 'modix' ),
			'utility' => __( 'Utility Strip Menu', 'modix' ),
		)
	);
}
add_action( 'after_setup_theme', 'modix_setup' );

/**
 * Widget areas for the footer's link columns (Shop / Company / Support),
 * kept optional — footer.php falls back to the demo's real link copy when a
 * sidebar has no widgets so the footer never renders empty on first install.
 */
function modix_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Footer — Shop Column', 'modix' ),
			'id'            => 'footer-shop',
			'description'   => __( 'Optional. Overrides the default Shop links column in the footer.', 'modix' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Footer — Company Column', 'modix' ),
			'id'            => 'footer-company',
			'description'   => __( 'Optional. Overrides the default Company links column in the footer.', 'modix' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Footer — Support Column', 'modix' ),
			'id'            => 'footer-support',
			'description'   => __( 'Optional. Overrides the default Support links column in the footer.', 'modix' ),
			'before_widget' => '<div class="footer-col %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
	register_sidebar(
		array(
			'name'          => __( 'Blog Sidebar', 'modix' ),
			'id'            => 'blog-sidebar',
			'description'   => __( 'Displayed on blog single/archive templates if populated.', 'modix' ),
			'before_widget' => '<div class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
		)
	);
}
add_action( 'widgets_init', 'modix_widgets_init' );

/* =============================================================
 * Primary nav walkers — header.php uses these with wp_nav_menu() so a
 * merchant's real "Primary Menu" (Appearance → Menus) drives the link
 * labels/order/targets, while EVERY top-level item that resolves to a real
 * product_cat term archive (Audio, Smartphones, Laptops, Smart Home,
 * Wearables in the demo — but always live store taxonomy, never hardcoded)
 * gets its own mega-dropdown panel with mini spec-chip product highlights,
 * matching the MODIX demo's header exactly (unlike a single "Shop" mega —
 * MODIX's demo opens a mega panel from each category nav item). Detection
 * of "which items are categories" is done by URL match against real
 * product_cat term links, so it keeps working however the merchant orders
 * or labels their menu.
 * ============================================================= */
function modix_menu_item_category( $item ) {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return false;
	}
	static $terms = null;
	if ( null === $terms ) {
		$terms = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
				'parent'     => 0,
			)
		);
		if ( is_wp_error( $terms ) ) {
			$terms = array();
		}
	}
	foreach ( $terms as $term ) {
		if ( untrailingslashit( $item->url ) === untrailingslashit( get_term_link( $term ) ) ) {
			return $term;
		}
	}
	return false;
}

if ( ! class_exists( 'Modix_Walker_Primary_Nav' ) ) {
	/**
	 * Desktop primary nav. Renders every top-level item as the demo's
	 * `.nav-item > a.nav-link`; when the item resolves to a real product
	 * category, adds `.has-mega` and injects that category's mega panel
	 * (mini spec-chip product highlights) right after the link — matching
	 * the MODIX demo's header exactly. Deeper (manually nested) menu items
	 * are intentionally not rendered here (the mega panel replaces them).
	 */
	class Modix_Walker_Primary_Nav extends Walker_Nav_Menu {
		public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
			if ( 0 !== $depth ) {
				return;
			}
			$term    = modix_menu_item_category( $item );
			$title   = apply_filters( 'the_title', $item->title, $item->ID );

			$output .= '<li class="nav-item' . ( $term ? ' has-mega' : '' ) . '">';
			$output .= '<a class="nav-link" href="' . esc_url( $item->url ) . '"' . ( $term ? ' aria-haspopup="true"' : '' ) . '>' . esc_html( $title );
			if ( $term ) {
				$output .= ' <svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
			}
			$output .= '</a>';

			if ( $term && function_exists( 'modix_render_mega_menu' ) ) {
				ob_start();
				modix_render_mega_menu( $term );
				$output .= ob_get_clean();
			}
		}

		public function end_el( &$output, $item, $depth = 0, $args = null ) {
			if ( 0 !== $depth ) {
				return;
			}
			$output .= "</li>\n";
		}

		// The mega panel above is rendered independently from live product
		// data, not from nested WP menu items, so suppress default sub-menu
		// rendering to avoid a second, unstyled dropdown if a merchant
		// accidentally nests items under a category.
		public function start_lvl( &$output, $depth = 0, $args = null ) {}
		public function end_lvl( &$output, $depth = 0, $args = null ) {}
	}
}

if ( ! class_exists( 'Modix_Walker_Mobile_Nav' ) ) {
	/**
	 * Mobile drawer nav. Flat `.mobile-drawer__link`s for ordinary items;
	 * a category item becomes the demo's expandable
	 * `<button data-submenu-toggle>` + `.mobile-drawer__submenu` panel
	 * listing "Shop All {Category}" followed by that category's real
	 * products, matching the mobile-drawer markup in the MODIX demo.
	 */
	class Modix_Walker_Mobile_Nav extends Walker_Nav_Menu {
		public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
			if ( 0 !== $depth ) {
				return;
			}
			$title = apply_filters( 'the_title', $item->title, $item->ID );
			$term  = modix_menu_item_category( $item );

			if ( $term ) {
				$panel_id = 'submenu-' . sanitize_html_class( $term->slug );
				$output  .= '<li>';
				$output  .= '<button class="mobile-drawer__link" type="button" data-submenu-toggle aria-expanded="false" aria-controls="' . esc_attr( $panel_id ) . '">' . esc_html( $title ) . ' <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>';
				$output  .= '<div class="mobile-drawer__submenu" id="' . esc_attr( $panel_id ) . '">';
				$output  .= '<a href="' . esc_url( get_term_link( $term ) ) . '">' . esc_html( sprintf( __( 'Shop All %s', 'modix' ), $term->name ) ) . '</a>';
				if ( function_exists( 'modix_mega_menu_products' ) ) {
					foreach ( modix_mega_menu_products( $term, 3 ) as $mobile_product ) {
						$output .= '<a href="' . esc_url( get_permalink( $mobile_product->get_id() ) ) . '">' . esc_html( $mobile_product->get_name() ) . '</a>';
					}
				}
				$output .= '</div>';
				$output .= '</li>';
			} else {
				$output .= '<li><a class="mobile-drawer__link" href="' . esc_url( $item->url ) . '">' . esc_html( $title ) . '</a></li>';
			}
		}

		public function end_el( &$output, $item, $depth = 0, $args = null ) {}
		public function start_lvl( &$output, $depth = 0, $args = null ) {}
		public function end_lvl( &$output, $depth = 0, $args = null ) {}
	}
}
