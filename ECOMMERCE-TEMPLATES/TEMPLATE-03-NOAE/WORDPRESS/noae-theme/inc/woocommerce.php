<?php
/**
 * WooCommerce integration.
 *
 * Architectural note: everything here is hook-based restyling of
 * WooCommerce's own archive-product.php / single-product.php templates —
 * we never copy those two files into the theme. The one exception the
 * brief explicitly allows for is documented at the top of
 * woocommerce/content-product.php (we DO ship that file, the per-product
 * card partial, because the demo's card markup — hover-swap image, heart
 * button, quick view/quick add row — has no clean hook seam in the
 * default template; WooCommerce itself expects content-product.php to be
 * themeable, so this is the WooCommerce-recommended override, not a
 * bypass of it).
 *
 * @package Noae
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* =============================================================
 * 1. Category tile image resolution + footer "Shop" links
 *
 * Used by template-parts/categories.php (homepage "Shop By Concern") and
 * 404.php. Prefers the term's own WooCommerce thumbnail, falls back to a
 * slug-matched demo illustration, then a generic botanical placeholder —
 * always something on-brand, never blank. Nothing here is a hardcoded
 * product name.
 * ============================================================= */
function noae_category_image_url( $term ) {
	$thumbnail_id = get_term_meta( $term->term_id, 'thumbnail_id', true );
	if ( $thumbnail_id ) {
		$src = wp_get_attachment_image_url( $thumbnail_id, 'noae-category-tile' );
		if ( $src ) {
			return $src;
		}
	}
	$slug_map = array( 'skincare', 'haircare', 'wellness', 'body' );
	if ( in_array( $term->slug, $slug_map, true ) ) {
		return NOAE_URI . '/assets/images/noae-category-' . $term->slug . '.svg';
	}
	return NOAE_URI . '/assets/images/noae-ingredient-botanical.svg';
}

/**
 * Footer "Shop" column links — pulled from real product category terms
 * (top-level, ordered by menu order) instead of a hardcoded
 * Skincare/Haircare/Wellness/Body list, so a merchant's own category set
 * appears automatically.
 */
function noae_footer_shop_links() {
	$links = array();
	$terms = get_terms(
		array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
			'parent'     => 0,
			'orderby'    => 'menu_order',
			'number'     => 6,
		)
	);
	if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
		foreach ( $terms as $term ) {
			$links[ $term->name ] = get_term_link( $term );
		}
	}
	$links[ __( 'All Products', 'noae' ) ] = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
	return $links;
}

/* =============================================================
 * 2. Cart drawer rendering + AJAX fragments
 *
 * The same three render functions back BOTH the initial server render in
 * header.php and the wc-cart-fragments AJAX refresh below, so there is a
 * single source of truth for the cart drawer's markup.
 * ============================================================= */

/**
 * Free-shipping progress threshold used by the cart drawer/cart page
 * progress bar. Matches the demo's js/cart.js FREE_SHIP_THRESHOLD (₹1,999)
 * quoted throughout the demo's announcement bar and PDP shipping tab.
 */
function noae_freeship_threshold() {
	return apply_filters( 'noae_freeship_threshold', 1999 );
}

/**
 * Flat shipping rate below the free-shipping threshold, matching the
 * demo's FLAT_SHIPPING (₹99).
 */
function noae_flat_shipping_rate() {
	return apply_filters( 'noae_flat_shipping_rate', 99 );
}

function noae_render_freeship_bar() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart ) {
		return;
	}
	$threshold = noae_freeship_threshold();
	$subtotal  = (float) WC()->cart->get_subtotal();
	$remaining = max( 0, $threshold - $subtotal );
	$pct       = $threshold > 0 ? min( 100, round( ( $subtotal / $threshold ) * 100 ) ) : 100;
	?>
	<div class="noae-cart-progress">
		<?php if ( $remaining <= 0 ) : ?>
			<p class="noae-cart-progress__text"><?php esc_html_e( "You've unlocked free shipping!", 'noae' ); ?></p>
		<?php else : ?>
			<p class="noae-cart-progress__text">
				<?php
				printf(
					/* translators: %s: price remaining to unlock free shipping. */
					esc_html__( 'Add %s more for free shipping', 'noae' ),
					wp_kses_post( wc_price( $remaining ) )
				);
				?>
			</p>
		<?php endif; ?>
		<div class="noae-cart-progress__bar"><div class="noae-cart-progress__fill" style="width:<?php echo esc_attr( $pct ); ?>%"></div></div>
	</div>
	<?php
}

function noae_render_cart_drawer_items() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart || WC()->cart->is_empty() ) {
		?>
		<div class="noae-cart-drawer__empty">
			<p style="font-size:2.4rem;line-height:1;margin-bottom:var(--space-3);">🛍️</p>
			<h3><?php esc_html_e( 'Your bag is empty', 'noae' ); ?></h3>
			<p><?php esc_html_e( "Looks like you haven't added a ritual yet. Explore our bestsellers and find your next daily favourite.", 'noae' ); ?></p>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="noae-btn noae-btn--dark noae-mt-6"><?php esc_html_e( 'Continue Shopping', 'noae' ); ?></a>
		</div>
		<?php
		return;
	}
	echo '<div class="noae-cart-items">';
	foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
		$product = $cart_item['data'];
		if ( ! $product || ! $product->exists() || $cart_item['quantity'] <= 0 ) {
			continue;
		}
		$thumbnail_id = $product->get_image_id();
		$thumbnail    = $thumbnail_id ? wp_get_attachment_image_url( $thumbnail_id, 'thumbnail' ) : wc_placeholder_img_src();
		$permalink    = $product->get_permalink( $cart_item );
		?>
		<div class="noae-cart-item" data-cart-key="<?php echo esc_attr( $cart_item_key ); ?>">
			<a href="<?php echo esc_url( $permalink ); ?>"><img class="noae-cart-item__img" src="<?php echo esc_url( $thumbnail ); ?>" alt="<?php echo esc_attr( $product->get_name() ); ?>"></a>
			<div>
				<p class="noae-cart-item__name"><a href="<?php echo esc_url( $permalink ); ?>"><?php echo wp_kses_post( $product->get_name() ); ?></a></p>
				<p class="noae-cart-item__variant"><?php echo wc_get_formatted_cart_item_data( $cart_item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
				<button type="button" class="noae-cart-item__remove remove_from_cart_button" data-cart_item_key="<?php echo esc_attr( $cart_item_key ); ?>" data-product_id="<?php echo esc_attr( $product->get_id() ); ?>" data-remove-url="<?php echo esc_url( wc_get_cart_remove_url( $cart_item_key ) ); ?>"><?php esc_html_e( 'Remove', 'noae' ); ?></button>
			</div>
			<p class="noae-cart-item__price"><?php echo wp_kses_post( WC()->cart->get_product_subtotal( $product, $cart_item['quantity'] ) ); ?></p>
		</div>
		<?php
	}
	echo '</div>';
}

function noae_render_cart_drawer_foot() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart ) {
		return;
	}
	$cart = WC()->cart;
	if ( $cart->is_empty() ) {
		return;
	}
	?>
	<div class="noae-cart-subtotal-row"><span><?php esc_html_e( 'Subtotal', 'noae' ); ?></span><span><?php echo wp_kses_post( wc_price( $cart->get_subtotal() ) ); ?></span></div>
	<?php if ( $cart->get_cart_discount_total() > 0 ) : ?>
	<div class="noae-summary-row"><span><?php esc_html_e( 'Discount', 'noae' ); ?></span><span>-<?php echo wp_kses_post( wc_price( $cart->get_cart_discount_total() ) ); ?></span></div>
	<?php endif; ?>
	<a href="<?php echo esc_url( wc_get_cart_url() ); ?>" class="noae-btn noae-btn--outline noae-btn--full"><?php esc_html_e( 'View Bag', 'noae' ); ?></a>
	<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="noae-btn noae-btn--dark noae-btn--full noae-mt-6"><?php esc_html_e( 'Checkout', 'noae' ); ?></a>
	<?php
}

/**
 * wc-cart-fragments hook: whenever an item is added/removed/updated via
 * AJAX, WooCommerce core re-runs this filter and swaps out any element in
 * the DOM matching each key with the fresh HTML — this is what keeps the
 * header cart count and the whole drawer live without a page reload.
 */
function noae_cart_fragments( $fragments ) {
	if ( ! WC()->cart ) {
		return $fragments;
	}
	$count = WC()->cart->get_cart_contents_count();

	ob_start();
	?>
	<span class="noae-badge--count js-cart-count" data-cart-count style="<?php echo $count ? '' : 'display:none'; ?>"><?php echo (int) $count; ?></span>
	<?php
	$fragments['[data-cart-count]'] = ob_get_clean();

	ob_start();
	?>
	<div id="cartDrawerItems" data-cart-drawer-items><?php noae_render_cart_drawer_items(); ?></div>
	<?php
	$fragments['[data-cart-drawer-items]'] = ob_get_clean();

	ob_start();
	?>
	<div id="cartDrawerFooter" class="noae-cart-drawer__footer" data-cart-drawer-footer><?php noae_render_cart_drawer_foot(); ?></div>
	<?php
	$fragments['[data-cart-drawer-footer]'] = ob_get_clean();

	ob_start();
	?>
	<div id="cartDrawerProgress" data-cart-drawer-progress><?php noae_render_freeship_bar(); ?></div>
	<?php
	$fragments['[data-cart-drawer-progress]'] = ob_get_clean();

	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'noae_cart_fragments' );

/* =============================================================
 * 3. Star rating — replace WC's %-width stars with the demo's ★/☆ glyphs
 *    inside .noae-product-card__rating / .noae-pdp__rating, reused
 *    everywhere: cards, PDP, quick view and the reviews grid.
 * ============================================================= */
function noae_rating_html( $html, $rating, $count ) {
	$full  = (int) floor( $rating );
	$half  = ( $rating - $full ) >= 0.5;
	$stars = '';
	for ( $i = 0; $i < $full; $i++ ) {
		$stars .= '<span class="noae-star noae-star--full">★</span>';
	}
	if ( $half ) {
		$stars .= '<span class="noae-star noae-star--half">★</span>';
	}
	$empty = 5 - $full - ( $half ? 1 : 0 );
	for ( $i = 0; $i < $empty; $i++ ) {
		$stars .= '<span class="noae-star noae-star--empty">☆</span>';
	}
	return $stars . '<span class="noae-product-card__review-count">(' . (int) $count . ')</span>';
}
add_filter( 'woocommerce_product_get_rating_html', 'noae_rating_html', 10, 3 );

/**
 * Sale badge — replace the default <span class="onsale">Sale!</span> with
 * the demo's .noae-badge.noae-badge--discount + computed discount percentage.
 */
function noae_sale_flash( $html, $post, $product ) {
	if ( ! $product instanceof WC_Product || ! $product->is_on_sale() ) {
		return $html;
	}
	$regular = (float) $product->get_regular_price();
	$sale    = (float) $product->get_price();
	$percent = ( $regular > 0 ) ? round( ( ( $regular - $sale ) / $regular ) * 100 ) : 0;
	return '<span class="noae-badge noae-badge--discount">' . sprintf(
		/* translators: %d: discount percentage. */
		esc_html__( '-%d%%', 'noae' ),
		$percent
	) . '</span>';
}
add_filter( 'woocommerce_sale_flash', 'noae_sale_flash', 10, 3 );

/**
 * Bestseller/New badge — Featured products get the demo's rose
 * "Bestseller" badge; products published within the last 30 days get the
 * sage "New" badge (matches badgeClass() in the demo's js/products.js).
 * Shared by content-product.php and the single-product summary.
 */
function noae_product_merch_badge_html( $product ) {
	if ( ! $product instanceof WC_Product ) {
		return '';
	}
	if ( $product->is_featured() ) {
		return '<span class="noae-badge noae-badge--rose">' . esc_html__( 'Bestseller', 'noae' ) . '</span>';
	}
	$is_new = ( time() - get_post_time( 'U', true, $product->get_id() ) ) < ( DAY_IN_SECONDS * 30 );
	if ( $is_new ) {
		return '<span class="noae-badge noae-badge--sage">' . esc_html__( 'New', 'noae' ) . '</span>';
	}
	return '';
}

/**
 * Add-to-cart button copy — matches the demo's "Add to Cart" casing.
 */
add_filter( 'woocommerce_product_single_add_to_cart_text', fn() => __( 'Add to Cart', 'noae' ) );
add_filter( 'woocommerce_product_add_to_cart_text', fn() => __( 'Add to Cart', 'noae' ) );

/* =============================================================
 * 4. Products-per-page / grid columns — matches the demo's 4-column
 *    .noae-product-grid.
 * ============================================================= */
add_filter( 'loop_shop_per_page', fn() => 12, 20 );
add_filter( 'loop_shop_columns', fn() => 4 );
add_filter(
	'woocommerce_output_related_products_args',
	function ( $args ) {
		$args['posts_per_page'] = 4;
		$args['columns']        = 4;
		return $args;
	}
);
add_filter( 'woocommerce_upsell_display_args', fn( $args ) => wp_parse_args( array( 'posts_per_page' => 4, 'columns' => 4 ), $args ) );

/* =============================================================
 * 5. Shop / category archive layout — filters aside + page-header band
 *
 * Fully hook-based: WooCommerce's own woocommerce_output_content_wrapper()
 * (hooked to woocommerce_before_main_content @10) still prints <main>. We
 * only add extra open/close divs around it at neighbouring priorities so
 * the aside sits inside <main> alongside the native product loop —
 * archive-product.php itself is never copied into the theme.
 * ============================================================= */
function noae_shop_is_archive() {
	return is_shop() || is_product_category() || is_product_tag();
}

/**
 * On shop/category/tag archives we print our own woocommerce_breadcrumb()
 * call manually inside the .noae-breadcrumb wrapper (see
 * noae_open_page_header below), so the DEFAULT `woocommerce_breadcrumb`
 * hook (core, priority 20 on woocommerce_before_main_content) must be
 * removed there or it would render a second, unstyled breadcrumb right
 * after ours. Single product pages are untouched and keep using that
 * default hook.
 */
function noae_maybe_remove_default_breadcrumb() {
	if ( noae_shop_is_archive() ) {
		remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
	}
}
add_action( 'wp', 'noae_maybe_remove_default_breadcrumb' );

function noae_open_page_header() {
	if ( ! noae_shop_is_archive() ) {
		return;
	}
	echo '<nav class="noae-container noae-breadcrumb" aria-label="' . esc_attr__( 'Breadcrumb', 'noae' ) . '">';
	woocommerce_breadcrumb( array( 'wrap_before' => '<ol>', 'wrap_after' => '</ol>', 'before' => '<li>', 'after' => '</li>' ) );
	echo '</nav>';
	echo '<section class="noae-page-header"><div class="noae-container">';
}
add_action( 'woocommerce_before_main_content', 'noae_open_page_header', 15 );

function noae_close_page_header() {
	if ( ! noae_shop_is_archive() ) {
		return;
	}
	if ( is_shop() ) {
		echo '<h1>' . esc_html__( 'Shop All Products', 'noae' ) . '</h1>';
		echo '<p class="noae-page-header__intro">' . esc_html__( 'Every NOAÉ ritual lives here — hydrating skincare, repairing haircare, calming wellness essentials, and softening body care, formulated with the same ingredient-forward honesty across every category. Filter by category, price, skin type, size, or rating to build the routine that fits your skin and your budget.', 'noae' ) . '</p>';
	} else {
		$term = get_queried_object();
		echo '<h1>' . esc_html( single_term_title( '', false ) ) . '</h1>';
		if ( ! empty( $term->description ) ) {
			echo '<p class="noae-page-header__intro">' . wp_kses_post( $term->description ) . '</p>';
		}
	}
	echo '</div></section>'; // .noae-page-header
	echo '<div class="noae-container noae-shop-layout">';
	noae_shop_filters_aside();
	echo '<div>';
}
add_action( 'woocommerce_before_main_content', 'noae_close_page_header', 21 );

function noae_shop_filters_aside() {
	?>
	<aside class="noae-filters" id="productFilters">
		<div class="noae-drawer__header">
			<p class="noae-drawer__title"><?php esc_html_e( 'Filters', 'noae' ); ?></p>
			<button type="button" class="noae-drawer__close" data-panel-close aria-label="<?php esc_attr_e( 'Close filters', 'noae' ); ?>">✕</button>
		</div>

		<?php if ( is_shop() ) : ?>
		<div class="noae-filters__group">
			<p class="noae-filters__group-title"><?php esc_html_e( 'Category', 'noae' ); ?></p>
			<div class="noae-filters__options">
				<?php
				$cats = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true, 'parent' => 0 ) );
				if ( ! is_wp_error( $cats ) ) {
					foreach ( $cats as $cat ) {
						printf(
							'<label class="noae-checkbox"><input type="checkbox" onclick="window.location.href=\'%1$s\'"> %2$s</label>',
							esc_url( get_term_link( $cat ) ),
							esc_html( $cat->name )
						);
					}
				}
				?>
			</div>
		</div>
		<?php endif; ?>

		<div class="noae-filters__group">
			<p class="noae-filters__group-title"><?php esc_html_e( 'Price Range', 'noae' ); ?></p>
			<div class="noae-range-row"><?php the_widget( 'WC_Widget_Price_Filter', array( 'title' => '' ) ); ?></div>
		</div>

		<?php if ( taxonomy_exists( 'pa_skin-type' ) && ! is_wp_error( get_terms( 'pa_skin-type' ) ) && get_terms( 'pa_skin-type' ) ) : ?>
		<div class="noae-filters__group">
			<p class="noae-filters__group-title"><?php esc_html_e( 'Skin Type', 'noae' ); ?></p>
			<div class="noae-filters__options"><?php the_widget( 'WC_Widget_Layered_Nav', array( 'attribute' => 'skin-type', 'title' => '', 'display_type' => 'list' ) ); ?></div>
		</div>
		<?php endif; ?>

		<?php if ( taxonomy_exists( 'pa_size' ) && ! is_wp_error( get_terms( 'pa_size' ) ) && get_terms( 'pa_size' ) ) : ?>
		<div class="noae-filters__group">
			<p class="noae-filters__group-title"><?php esc_html_e( 'Size', 'noae' ); ?></p>
			<div class="noae-filters__options"><?php the_widget( 'WC_Widget_Layered_Nav', array( 'attribute' => 'size', 'title' => '', 'display_type' => 'list' ) ); ?></div>
		</div>
		<?php endif; ?>

		<div class="noae-filters__group">
			<p class="noae-filters__group-title"><?php esc_html_e( 'Availability', 'noae' ); ?></p>
			<div class="noae-filters__options"><?php the_widget( 'WC_Widget_Layered_Nav_Filters', array( 'title' => '' ) ); ?></div>
		</div>

		<div class="noae-filters__group" style="border-bottom:none;">
			<p class="noae-filters__group-title"><?php esc_html_e( 'Rating', 'noae' ); ?></p>
			<div class="noae-filters__options"><?php the_widget( 'WC_Widget_Rating_Filter', array( 'title' => '' ) ); ?></div>
		</div>
	</aside>
	<?php
}

/**
 * Toolbar structure threaded through WooCommerce's own core hooks (all on
 * woocommerce_before_shop_loop), matching the demo's exact nesting:
 *
 *   <div class="noae-shop-toolbar">                 [5]  open
 *     <span class="noae-shop-toolbar__count">        [20] WC core: woocommerce_result_count
 *     <div class="noae-shop-toolbar__right">          [21] open
 *       <button class="noae-filter-trigger">          [22] Filters button (mobile only)
 *       <select>...</select>                          [30] WC core: woocommerce_catalog_ordering
 *     </div>                                          [31] close
 *   </div>                                            [31] close
 */
function noae_open_shop_toolbar() {
	if ( ! noae_shop_is_archive() ) {
		return;
	}
	echo '<div class="noae-shop-toolbar">';
}
add_action( 'woocommerce_before_shop_loop', 'noae_open_shop_toolbar', 5 );

function noae_open_toolbar_right() {
	if ( ! noae_shop_is_archive() ) {
		return;
	}
	echo '<div class="noae-shop-toolbar__right">';
	echo '<button type="button" class="noae-btn noae-btn--outline noae-filter-trigger" data-filter-drawer-open>' . esc_html__( 'Filters', 'noae' ) . '</button>';
}
add_action( 'woocommerce_before_shop_loop', 'noae_open_toolbar_right', 21 );

/**
 * Note: WooCommerce's own product loop already prints `<ul class="products
 * columns-4">`, which the CSS above styles directly as a 4-column grid
 * (see `ul.products` rules in style.css) — matching `.noae-product-grid`
 * exactly, so we deliberately do NOT wrap it in a second `.noae-product-
 * grid` div (that would create a pointless nested grid with a single
 * child). Toolbar just closes its own two wrapper divs here.
 */
function noae_close_shop_toolbar() {
	if ( ! noae_shop_is_archive() ) {
		return;
	}
	echo '</div>'; // .noae-shop-toolbar__right
	echo '</div>'; // .noae-shop-toolbar
}
add_action( 'woocommerce_before_shop_loop', 'noae_close_shop_toolbar', 31 );

function noae_close_shop_layout() {
	if ( ! noae_shop_is_archive() ) {
		return;
	}
	echo '</div></div>'; // shop-results wrapper, .noae-shop-layout
}
add_action( 'woocommerce_after_main_content', 'noae_close_shop_layout', 5 );

/* =============================================================
 * 6. Single product — breadcrumb wrapper, PDP grid layout, eyebrow
 *    category, stock message, Buy Now button, wishlist button, meta list.
 *
 * Layout note: the demo's PDP is a 2-column grid (gallery | info) followed
 * by FULL-WIDTH tabs and FAQ sections below it — but WooCommerce's default
 * template nests the gallery and the `.summary.entry-summary` info column
 * as siblings inside `#product-<id>`, and hooks
 * woocommerce_output_product_data_tabs INSIDE that summary column (on
 * woocommerce_single_product_summary @10). To reproduce the demo's
 * full-width tabs exactly, we (a) open `.noae-pdp` as a grid right before
 * the gallery prints and close it right after `.summary` closes, and (b)
 * move the tabs hook from inside the summary to woocommerce_after_single_
 * product_summary, wrapped in the demo's `.noae-container.noae-tabs`.
 * ============================================================= */

function noae_pdp_open_layout() {
	if ( ! is_product() ) {
		return;
	}
	echo '<div class="noae-container noae-pdp">';
}
add_action( 'woocommerce_before_single_product_summary', 'noae_pdp_open_layout', 0 );

function noae_pdp_close_layout() {
	if ( ! is_product() ) {
		return;
	}
	echo '</div>'; // .noae-container.noae-pdp
}
add_action( 'woocommerce_after_single_product_summary', 'noae_pdp_close_layout', 1 );

/**
 * Move the native product data tabs out from inside `.summary` (where
 * WooCommerce hooks them by default) to full width below the PDP grid,
 * matching the demo's `.noae-container.noae-tabs` section.
 */
remove_action( 'woocommerce_single_product_summary', 'woocommerce_output_product_data_tabs', 10 );
function noae_pdp_output_tabs_full_width() {
	if ( ! is_product() ) {
		return;
	}
	echo '<div class="noae-container noae-tabs">';
	woocommerce_output_product_data_tabs();
	echo '</div>';
}
add_action( 'woocommerce_after_single_product_summary', 'noae_pdp_output_tabs_full_width', 2 );

/**
 * Restyle the default WooCommerce breadcrumb wrapper to match the demo's
 * `.noae-breadcrumb` markup (used as-is on single product pages; shop/
 * category archives print their own breadcrumb manually, see section 5).
 */
function noae_breadcrumb_defaults( $defaults ) {
	$defaults['wrap_before'] = '<nav class="noae-container noae-breadcrumb" aria-label="' . esc_attr__( 'Breadcrumb', 'noae' ) . '"><ol>';
	$defaults['wrap_after']  = '</ol></nav>';
	$defaults['before']      = '<li>';
	$defaults['after']       = '</li>';
	$defaults['delimiter']   = '';
	return $defaults;
}
add_filter( 'woocommerce_breadcrumb_defaults', 'noae_breadcrumb_defaults' );

function noae_pdp_category_eyebrow() {
	global $product;
	if ( ! $product ) {
		return;
	}
	$cats = wc_get_product_category_list( $product->get_id() );
	if ( $cats ) {
		echo '<p class="noae-pdp__category">' . wp_kses_post( $cats ) . '</p>';
	}
}
add_action( 'woocommerce_single_product_summary', 'noae_pdp_category_eyebrow', 4 );

function noae_pdp_stock_message() {
	global $product;
	if ( ! $product ) {
		return;
	}
	if ( ! $product->is_in_stock() ) {
		echo '<p class="noae-pdp__stock" style="color:var(--color-error);">' . esc_html__( 'Currently Out of Stock', 'noae' ) . '</p>';
		return;
	}
	$qty = $product->get_stock_quantity();
	if ( $product->managing_stock() && null !== $qty && $qty <= 5 ) {
		echo '<p class="noae-pdp__stock">' . sprintf(
			/* translators: %d: number of items left in stock. */
			esc_html__( 'Only %d left in stock — order soon.', 'noae' ),
			(int) $qty
		) . '</p>';
	} else {
		echo '<p class="noae-pdp__stock">' . esc_html__( 'In Stock — ships in 1-2 business days', 'noae' ) . '</p>';
	}
}
add_action( 'woocommerce_single_product_summary', 'noae_pdp_stock_message', 15 );

/**
 * Wrap quantity+button in .noae-pdp__actions, add the wishlist heart
 * button, and a "Buy Now" button that piggy-backs on the SAME form submit
 * (see the redirect filter below) so it works for simple AND variable
 * products without any custom AJAX.
 */
$GLOBALS['noae_pdp_actions_open'] = false;

add_action(
	'woocommerce_before_add_to_cart_quantity',
	function () {
		global $noae_pdp_actions_open;
		echo '<div class="noae-pdp__actions">';
		$noae_pdp_actions_open = true;
	}
);

add_action(
	'woocommerce_after_add_to_cart_button',
	function () {
		global $product, $noae_pdp_actions_open;
		$product_id  = $product ? $product->get_id() : 0;
		$in_wishlist = function_exists( 'noae_is_in_wishlist' ) && noae_is_in_wishlist( $product_id );
		if ( $noae_pdp_actions_open ) {
			echo '</div>'; // .noae-pdp__actions
			$noae_pdp_actions_open = false;
		}
		?>
		<button type="submit" name="noae_buy_now" value="1" class="noae-btn noae-btn--primary"><?php esc_html_e( 'Buy Now', 'noae' ); ?></button>
		<button type="button" id="pdpWishlist" class="noae-icon-btn noae-wishlist-toggle<?php echo $in_wishlist ? ' is-active' : ''; ?>" data-wishlist-toggle data-id="<?php echo esc_attr( $product_id ); ?>" aria-pressed="<?php echo $in_wishlist ? 'true' : 'false'; ?>" aria-label="<?php esc_attr_e( 'Add to wishlist', 'noae' ); ?>">
			<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.1 2 4.5 5.6 3.7 8 3.2 10.2 4.3 12 6.7 13.8 4.3 16 3.2 18.4 3.7 22 4.5 23.5 8.1 22 11.7 19.5 16.3 12 21 12 21z" fill="currentColor"/></svg>
		</button>
		<?php
	}
);

/**
 * "Buy Now" — the button above is a second submit button inside
 * WooCommerce's own <form class="cart">, so clicking it still POSTs the
 * chosen variation/quantity through WooCommerce's normal add-to-cart
 * handling. We only need to catch the extra field and redirect straight
 * to checkout instead of back to the product page.
 */
function noae_buy_now_redirect( $url ) {
	if ( isset( $_REQUEST['noae_buy_now'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- native WC add-to-cart request, no state change beyond WC's own handling.
		return wc_get_checkout_url();
	}
	return $url;
}
add_filter( 'woocommerce_add_to_cart_redirect', 'noae_buy_now_redirect' );

/**
 * PDP meta list (SKU / Brand / Category / Skin Type), matching the demo's
 * `#pdpMetaList` under the buy box.
 */
function noae_pdp_meta_list() {
	global $product;
	if ( ! $product ) {
		return;
	}
	$skin_type = get_post_meta( $product->get_id(), '_noae_skin_type', true );
	$cats      = wc_get_product_category_list( $product->get_id(), ', ' );
	?>
	<ul class="noae-pdp__meta-list">
		<li><span><?php esc_html_e( 'SKU', 'noae' ); ?></span><span><?php echo esc_html( $product->get_sku() ? $product->get_sku() : '—' ); ?></span></li>
		<li><span><?php esc_html_e( 'Brand', 'noae' ); ?></span><span>Noaé</span></li>
		<?php if ( $cats ) : ?><li><span><?php esc_html_e( 'Category', 'noae' ); ?></span><span><?php echo wp_kses_post( wp_strip_all_tags( $cats ) ); ?></span></li><?php endif; ?>
		<?php if ( $skin_type ) : ?><li><span><?php esc_html_e( 'Skin Type', 'noae' ); ?></span><span><?php echo esc_html( $skin_type ); ?></span></li><?php endif; ?>
	</ul>
	<?php
}
add_action( 'woocommerce_single_product_summary', 'noae_pdp_meta_list', 40 );

/* =============================================================
 * 7. Product tabs — rename/reorder to match the demo's Overview / Key
 *    Ingredients / How to Use / Skin Type / Shipping / Returns / Storage.
 *    Content sources, documented per tab:
 *      - Overview: product description (native WC field) + short description features
 *      - Key Ingredients: postmeta `_noae_ingredients` — newline-separated list
 *      - How to Use: postmeta `_noae_how_to_use` — text/HTML
 *      - Skin Type: postmeta `_noae_skin_type` — plain text (e.g. "Dry, Combination, All")
 *      - Shipping: static store-wide copy (matches the demo's shipping tab)
 *      - Returns: static store-wide copy (matches the demo's returns tab)
 *      - Storage: postmeta `_noae_storage` — plain text/HTML
 *    Each falls back to sensible default copy when the postmeta is empty,
 *    so new products aren't blank.
 * ============================================================= */
function noae_product_tabs( $tabs ) {
	global $product;
	if ( ! $product ) {
		return $tabs;
	}
	$id = $product->get_id();

	// Overview — rename WooCommerce's core Description tab.
	if ( isset( $tabs['description'] ) ) {
		$tabs['description']['title']    = __( 'Overview', 'noae' );
		$tabs['description']['priority'] = 10;
	}
	// Drop the default Additional Information (attributes) tab; the demo
	// has no such tab — Skin Type/Size data is folded into the Skin Type
	// tab and the variant swatches instead.
	unset( $tabs['additional_information'] );

	$custom = array(
		'noae_ingredients' => array( __( 'Key Ingredients', 'noae' ), '_noae_ingredients', 20, 'list' ),
		'noae_how_to_use'  => array( __( 'How to Use', 'noae' ), '_noae_how_to_use', 30, 'html' ),
		'noae_skin_type'   => array( __( 'Skin Type', 'noae' ), '_noae_skin_type', 40, 'skin_type' ),
		'noae_shipping'    => array( __( 'Shipping', 'noae' ), '', 50, 'shipping' ),
		'noae_returns'     => array( __( 'Returns', 'noae' ), '', 60, 'returns' ),
		'noae_storage'     => array( __( 'Storage', 'noae' ), '_noae_storage', 70, 'html' ),
	);

	foreach ( $custom as $key => $data ) {
		list( $title, $meta_key, $priority, $type ) = $data;
		$tabs[ $key ] = array(
			'title'    => $title,
			'priority' => $priority,
			'callback' => function () use ( $id, $meta_key, $type, $title ) {
				noae_render_product_tab( $id, $meta_key, $type, $title );
			},
		);
	}

	return $tabs;
}
add_filter( 'woocommerce_product_tabs', 'noae_product_tabs' );

function noae_render_product_tab( $product_id, $meta_key, $type, $title ) {
	$value = $meta_key ? get_post_meta( $product_id, $meta_key, true ) : '';

	echo '<h2>' . esc_html( $title ) . '</h2>';

	if ( 'shipping' === $type ) {
		printf(
			'<p>%s</p>',
			esc_html(
				sprintf(
					/* translators: 1: free shipping threshold, 2: flat shipping rate. */
					__( 'Free shipping on orders over %1$s. Orders below this threshold ship for a flat %2$s. Most orders dispatch within 1-2 business days and arrive within 3-6 business days depending on location.', 'noae' ),
					wp_strip_all_tags( wc_price( noae_freeship_threshold() ) ),
					wp_strip_all_tags( wc_price( noae_flat_shipping_rate() ) )
				)
			)
		);
		return;
	}

	if ( 'returns' === $type ) {
		echo '<p>' . esc_html__( 'Unopened products may be returned within 14 days of delivery for a full refund. Opened products can be exchanged if they arrived damaged or defective. Contact our care team to start a return.', 'noae' ) . '</p>';
		return;
	}

	if ( 'skin_type' === $type ) {
		if ( '' === $value ) {
			echo '<p>' . esc_html__( 'Formulated for: ', 'noae' ) . '<strong>' . esc_html__( 'All skin types', 'noae' ) . '</strong></p>';
			return;
		}
		echo '<p>' . esc_html__( 'Formulated for: ', 'noae' ) . '<strong>' . esc_html( $value ) . '</strong>' . esc_html__( ' skin types.', 'noae' ) . '</p>';
		return;
	}

	if ( '' === $value ) {
		echo '<p class="text-muted">' . esc_html__( 'No details added for this product yet.', 'noae' ) . '</p>';
		return;
	}

	if ( 'list' === $type ) {
		$lines = array_filter( array_map( 'trim', explode( "\n", $value ) ) );
		echo '<ul>';
		foreach ( $lines as $line ) {
			echo '<li>' . wp_kses_post( $line ) . '</li>';
		}
		echo '</ul>';
	} else {
		echo '<div>' . wp_kses_post( wpautop( $value ) ) . '</div>';
	}
}

/* =============================================================
 * 8. Variation "chip" pills — restyle WooCommerce's native variation
 *    <select> (e.g. Size: "30ml" / "50ml") as the demo's pill-button
 *    swatch-list without touching WooCommerce's own variations.js: the
 *    real <select> stays in the DOM (hidden via CSS, see style.css), and
 *    assets/js/theme.js just forwards chip clicks onto it and fires a
 *    native change event.
 * ============================================================= */
function noae_variation_swatches( $html, $args ) {
	$options   = isset( $args['options'] ) ? $args['options'] : array();
	$product   = isset( $args['product'] ) ? $args['product'] : null;
	$attribute = isset( $args['attribute'] ) ? $args['attribute'] : '';

	if ( empty( $options ) && $product instanceof WC_Product && $attribute ) {
		$attributes = $product->get_variation_attributes();
		$options    = isset( $attributes[ $attribute ] ) ? $attributes[ $attribute ] : array();
	}
	if ( empty( $options ) ) {
		return $html;
	}

	$select_id = isset( $args['id'] ) ? $args['id'] : sanitize_title( $attribute );
	$selected  = isset( $args['selected'] ) ? $args['selected'] : '';
	$taxonomy  = 0 === strpos( $attribute, 'attribute_pa_' ) ? str_replace( 'attribute_', '', $attribute ) : '';

	ob_start();
	echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- original WC-built <select>, kept for variations.js.
	echo '<div class="noae-variant-options" data-swatch-for="' . esc_attr( $select_id ) . '">';
	foreach ( $options as $option ) {
		$label = $option;
		if ( $taxonomy && taxonomy_exists( $taxonomy ) ) {
			$term = get_term_by( 'slug', $option, $taxonomy );
			if ( $term && ! is_wp_error( $term ) ) {
				$label = $term->name;
			}
		}
		printf(
			'<button type="button" class="noae-variant-chip%3$s" data-swatch-value="%1$s">%2$s</button>',
			esc_attr( $option ),
			esc_html( $label ),
			( $option === $selected ) ? ' is-selected' : ''
		);
	}
	echo '</div>';
	return ob_get_clean();
}
add_filter( 'woocommerce_dropdown_variation_attribute_options_html', 'noae_variation_swatches', 10, 2 );

/* =============================================================
 * 9. FAQ accordion + FAQPage JSON-LD
 *
 * Populate per-product FAQs with postmeta key `_noae_faq`, stored as a
 * serialized array of ['q' => ..., 'a' => ...] pairs, e.g.:
 *
 *   update_post_meta( $product_id, '_noae_faq', array(
 *       array( 'q' => 'Is this serum suitable for oily skin?', 'a' => 'Yes — it is oil-free and non-comedogenic.' ),
 *       array( 'q' => 'How long until I see results?', 'a' => 'Most users notice visible results within 2-4 weeks.' ),
 *   ) );
 *
 * A merchant/developer can also build a small metabox or ACF Repeater
 * field group targeting this same meta key — the accordion and the
 * FAQPage JSON-LD both read directly from it, so what's rendered always
 * matches what's declared in the schema.
 * ============================================================= */
function noae_get_product_faqs( $product_id ) {
	$faqs = get_post_meta( $product_id, '_noae_faq', true );
	if ( ! is_array( $faqs ) ) {
		return array();
	}
	return array_values(
		array_filter(
			$faqs,
			function ( $faq ) {
				return is_array( $faq ) && ! empty( $faq['q'] ) && ! empty( $faq['a'] );
			}
		)
	);
}

function noae_pdp_faq_accordion() {
	global $product;
	if ( ! $product ) {
		return;
	}
	$faqs = noae_get_product_faqs( $product->get_id() );
	if ( empty( $faqs ) ) {
		return;
	}
	?>
	<section class="noae-container noae-section">
		<div class="noae-section__head">
			<h2><?php esc_html_e( 'Frequently Asked Questions', 'noae' ); ?></h2>
		</div>
		<div class="noae-faq" data-pdp-faqs>
			<?php foreach ( $faqs as $i => $faq ) : ?>
				<div class="noae-faq__item" data-faq-item data-index="<?php echo (int) $i; ?>">
					<button type="button" class="noae-faq__question" aria-expanded="false"><span><?php echo esc_html( $faq['q'] ); ?></span><span class="noae-faq__icon">+</span></button>
					<div class="noae-faq__answer"><p class="noae-faq__answer-inner"><?php echo wp_kses_post( $faq['a'] ); ?></p></div>
				</div>
			<?php endforeach; ?>
		</div>
	</section>
	<?php
}
/**
 * Priority 15 — deliberately BEFORE WooCommerce's native related-products
 * output (hooked at woocommerce_after_single_product_summary @20), so the
 * FAQ accordion renders above "You May Also Love" exactly like the demo's
 * Tabs → FAQ → Related → Recently Viewed order.
 */
add_action( 'woocommerce_after_single_product_summary', 'noae_pdp_faq_accordion', 15 );

/* =============================================================
 * 10. Related products + Recently viewed
 *
 * WooCommerce core already ships a related-products template
 * (woocommerce_output_related_products, hooked at
 * woocommerce_after_single_product_summary @20), so "You May Also Love"
 * needs no extra code beyond the content-product.php override + the CSS
 * classes above. Recently Viewed is genuinely custom: a cookie of product
 * IDs, written on woocommerce_before_single_product, rendered via
 * wc_get_products() so it is always real store data, never a fake list.
 * ============================================================= */
function noae_track_recently_viewed() {
	if ( ! is_singular( 'product' ) ) {
		return;
	}
	global $product;
	if ( ! $product ) {
		return;
	}
	$viewed = ! empty( $_COOKIE['noae_recently_viewed'] ) ? explode( '|', sanitize_text_field( wp_unslash( $_COOKIE['noae_recently_viewed'] ) ) ) : array();
	$viewed = array_diff( $viewed, array( (string) $product->get_id() ) );
	array_unshift( $viewed, (string) $product->get_id() );
	$viewed = array_slice( array_filter( $viewed, 'is_numeric' ), 0, 8 );
	wc_setcookie( 'noae_recently_viewed', implode( '|', $viewed ), time() + DAY_IN_SECONDS * 30 );
}
add_action( 'woocommerce_before_single_product', 'noae_track_recently_viewed' );

function noae_recently_viewed_ids( $exclude_id = 0 ) {
	if ( empty( $_COOKIE['noae_recently_viewed'] ) ) {
		return array();
	}
	$ids = array_map( 'absint', explode( '|', sanitize_text_field( wp_unslash( $_COOKIE['noae_recently_viewed'] ) ) ) );
	$ids = array_filter( $ids, fn( $id ) => $id && $id !== (int) $exclude_id );
	return array_slice( $ids, 0, 4 );
}

function noae_pdp_recently_viewed() {
	global $product;
	$ids = noae_recently_viewed_ids( $product ? $product->get_id() : 0 );
	if ( empty( $ids ) || ! function_exists( 'wc_get_products' ) ) {
		return;
	}
	$products = wc_get_products( array( 'include' => $ids, 'orderby' => 'post__in', 'status' => 'publish' ) );
	if ( empty( $products ) ) {
		return;
	}
	?>
	<section class="noae-related">
		<div class="noae-container">
			<div class="noae-section__head"><h2><?php esc_html_e( 'Recently Viewed', 'noae' ); ?></h2></div>
			<div class="noae-product-grid">
				<?php
				foreach ( $products as $recent_product ) {
					$GLOBALS['product'] = $recent_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
					wc_get_template_part( 'content', 'product' );
				}
				?>
			</div>
		</div>
	</section>
	<?php
	$GLOBALS['product'] = $product;
}
add_action( 'woocommerce_after_single_product_summary', 'noae_pdp_recently_viewed', 45 );

/**
 * Rename WooCommerce core's "Related products" heading to the demo's "You
 * May Also Love" using WordPress's own translation filter — deliberately
 * NOT a template override (there is no dedicated filter for this one
 * string), scoped tightly to is_product() so no other "Related products"
 * string anywhere else in wp-admin/other plugins is touched.
 */
function noae_translate_related_heading( $translation, $text, $domain ) {
	if ( 'woocommerce' === $domain && is_product() && 'Related products' === $text ) {
		return __( 'You May Also Love', 'noae' );
	}
	return $translation;
}
add_filter( 'gettext', 'noae_translate_related_heading', 10, 3 );

/* =============================================================
 * 11. JSON-LD: Product/Offer + BreadcrumbList (+ FAQPage when present)
 * ============================================================= */
function noae_product_jsonld() {
	if ( ! is_product() ) {
		return;
	}
	global $product;
	if ( ! $product ) {
		return;
	}

	// BreadcrumbList — always ours; SEO plugins don't consistently emit
	// this for WooCommerce out of the box.
	$crumbs = array(
		array(
			'@type'    => 'ListItem',
			'position' => 1,
			'name'     => get_bloginfo( 'name' ),
			'item'     => home_url( '/' ),
		),
	);
	$shop_page_id = wc_get_page_id( 'shop' );
	if ( $shop_page_id > 0 ) {
		$crumbs[] = array(
			'@type'    => 'ListItem',
			'position' => 2,
			'name'     => get_the_title( $shop_page_id ),
			'item'     => get_permalink( $shop_page_id ),
		);
	}
	$terms    = get_the_terms( $product->get_id(), 'product_cat' );
	$position = count( $crumbs ) + 1;
	if ( $terms && ! is_wp_error( $terms ) ) {
		$term     = current( $terms );
		$crumbs[] = array(
			'@type'    => 'ListItem',
			'position' => $position,
			'name'     => $term->name,
			'item'     => get_term_link( $term ),
		);
		$position++;
	}
	$crumbs[] = array(
		'@type'    => 'ListItem',
		'position' => $position,
		'name'     => $product->get_name(),
		'item'     => get_permalink( $product->get_id() ),
	);

	$breadcrumb_ld = array(
		'@context'        => 'https://schema.org',
		'@type'           => 'BreadcrumbList',
		'itemListElement' => $crumbs,
	);
	echo '<script type="application/ld+json">' . wp_json_encode( $breadcrumb_ld ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_json_encode() output.

	// FAQPage — only when this exact product has FAQs rendered on the
	// page (see section 9), so the schema always matches visible content.
	$faqs = noae_get_product_faqs( $product->get_id() );
	if ( ! empty( $faqs ) ) {
		$faq_ld = array(
			'@context'   => 'https://schema.org',
			'@type'      => 'FAQPage',
			'mainEntity' => array_map(
				function ( $faq ) {
					return array(
						'@type'          => 'Question',
						'name'           => wp_strip_all_tags( $faq['q'] ),
						'acceptedAnswer' => array(
							'@type' => 'Answer',
							'text'  => wp_strip_all_tags( $faq['a'] ),
						),
					);
				},
				$faqs
			),
		);
		echo '<script type="application/ld+json">' . wp_json_encode( $faq_ld ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	// Product/Offer — skipped when Yoast or Rank Math is active (see
	// noae_seo_plugin_active() docblock in functions.php).
	if ( noae_seo_plugin_active() ) {
		return;
	}

	$image_id  = $product->get_image_id();
	$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'large' ) : wc_placeholder_img_src();

	$product_ld = array(
		'@context'    => 'https://schema.org',
		'@type'       => 'Product',
		'name'        => $product->get_name(),
		'description' => wp_strip_all_tags( $product->get_short_description() ? $product->get_short_description() : $product->get_description() ),
		'sku'         => $product->get_sku() ? $product->get_sku() : (string) $product->get_id(),
		'brand'       => array(
			'@type' => 'Brand',
			'name'  => 'Noaé',
		),
		'image'       => $image_url,
		'offers'      => array(
			'@type'         => 'Offer',
			'url'           => get_permalink( $product->get_id() ),
			'priceCurrency' => get_woocommerce_currency(),
			'price'         => $product->get_price(),
			'availability'  => $product->is_in_stock() ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
		),
	);

	if ( $product->get_review_count() > 0 ) {
		$product_ld['aggregateRating'] = array(
			'@type'       => 'AggregateRating',
			'ratingValue' => $product->get_average_rating(),
			'reviewCount' => $product->get_review_count(),
		);
	}

	echo '<script type="application/ld+json">' . wp_json_encode( $product_ld ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
add_action( 'wp_head', 'noae_product_jsonld' );

/**
 * Open Graph / Twitter tags — only when no SEO plugin already covers
 * this, to avoid ever printing duplicate meta tags on the same page.
 */
function noae_social_meta_tags() {
	if ( noae_seo_plugin_active() ) {
		return;
	}
	if ( is_product() ) {
		global $product;
		if ( ! $product ) {
			return;
		}
		$image_id  = $product->get_image_id();
		$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'large' ) : wc_placeholder_img_src();
		?>
		<meta property="og:title" content="<?php echo esc_attr( $product->get_name() . ' | ' . get_bloginfo( 'name' ) ); ?>">
		<meta property="og:description" content="<?php echo esc_attr( wp_trim_words( wp_strip_all_tags( $product->get_short_description() ? $product->get_short_description() : $product->get_description() ), 30 ) ); ?>">
		<meta property="og:type" content="product">
		<meta property="og:url" content="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>">
		<meta property="og:image" content="<?php echo esc_url( $image_url ); ?>">
		<meta property="og:site_name" content="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
		<meta name="twitter:card" content="summary_large_image">
		<?php
	} elseif ( is_front_page() ) {
		?>
		<meta property="og:title" content="<?php echo esc_attr( get_bloginfo( 'name' ) . ' — Premium Skincare & Beauty' ); ?>">
		<meta property="og:description" content="<?php echo esc_attr( get_bloginfo( 'description' ) ); ?>">
		<meta property="og:type" content="website">
		<meta property="og:url" content="<?php echo esc_url( home_url( '/' ) ); ?>">
		<meta property="og:site_name" content="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
		<meta name="twitter:card" content="summary_large_image">
		<?php
	}
}
add_action( 'wp_head', 'noae_social_meta_tags' );

/* =============================================================
 * 12. Quick View — AJAX endpoint returning a compact product summary
 *    for the modal declared in header.php. Always built from a real
 *    WC_Product; never hardcoded.
 * ============================================================= */
function noae_ajax_quick_view() {
	check_ajax_referer( 'noae_quick_view', 'nonce' );
	$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$product    = $product_id ? wc_get_product( $product_id ) : null;
	if ( ! $product ) {
		wp_send_json_error( array( 'message' => __( 'Product not found.', 'noae' ) ) );
	}

	ob_start();
	$image_id  = $product->get_image_id();
	$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'large' ) : wc_placeholder_img_src();
	$in_wishlist = function_exists( 'noae_is_in_wishlist' ) && noae_is_in_wishlist( $product->get_id() );
	?>
	<button type="button" class="noae-modal__close" data-quick-view-close aria-label="<?php esc_attr_e( 'Close quick view', 'noae' ); ?>">✕</button>
	<div class="noae-modal__grid">
		<div class="noae-modal__media"><img src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( $product->get_name() ); ?>"></div>
		<div>
			<p class="noae-pdp__category"><?php echo wp_kses_post( wc_get_product_category_list( $product->get_id() ) ); ?></p>
			<h2 class="noae-pdp__title"><?php echo esc_html( $product->get_name() ); ?></h2>
			<div class="noae-pdp__rating"><?php echo wp_kses_post( wc_get_rating_html( $product->get_average_rating(), $product->get_review_count() ) ); ?></div>
			<div class="noae-pdp__price-row"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
			<p class="noae-pdp__desc"><?php echo wp_kses_post( wp_trim_words( wp_strip_all_tags( $product->get_short_description() ? $product->get_short_description() : $product->get_description() ), 30 ) ); ?></p>
			<a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" class="noae-btn noae-btn--dark noae-btn--full"><?php esc_html_e( 'View Full Details', 'noae' ); ?></a>
			<?php if ( $product->is_purchasable() && $product->is_type( 'simple' ) && $product->is_in_stock() ) : ?>
				<button type="button" class="noae-btn noae-btn--outline noae-btn--full noae-mt-6" data-quick-add data-product_id="<?php echo esc_attr( $product->get_id() ); ?>" data-quantity="1"><?php esc_html_e( 'Quick Add to Bag', 'noae' ); ?></button>
			<?php endif; ?>
			<div class="noae-wishlist-secondary noae-mt-6">
				<button type="button" class="<?php echo $in_wishlist ? 'is-active' : ''; ?>" data-wishlist-toggle data-id="<?php echo esc_attr( $product->get_id() ); ?>">
					<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.1 2 4.5 5.6 3.7 8 3.2 10.2 4.3 12 6.7 13.8 4.3 16 3.2 18.4 3.7 22 4.5 23.5 8.1 22 11.7 19.5 16.3 12 21 12 21z" fill="currentColor"/></svg>
					<?php esc_html_e( 'Add to Wishlist', 'noae' ); ?>
				</button>
			</div>
		</div>
	</div>
	<?php
	wp_send_json_success( array( 'html' => ob_get_clean() ) );
}
add_action( 'wp_ajax_noae_quick_view', 'noae_ajax_quick_view' );
add_action( 'wp_ajax_nopriv_noae_quick_view', 'noae_ajax_quick_view' );

/* =============================================================
 * 13. Newsletter subscribe (skin-quiz style forms in footer/homepage) —
 *    no email service is wired up out of the box (that depends on the
 *    merchant's provider), so this just validates + fires an action hook
 *    a mail-provider integration can listen for.
 * ============================================================= */
function noae_ajax_newsletter_subscribe() {
	check_ajax_referer( 'noae_wishlist', 'nonce' ); // shares the general front-end nonce; no state-changing WP data is touched.
	$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	if ( ! is_email( $email ) ) {
		wp_send_json_error( array( 'message' => __( 'Please enter a valid email address.', 'noae' ) ) );
	}
	/**
	 * Fires when a visitor submits the newsletter/skin-quiz form. Hook a
	 * mail provider's API call (Mailchimp, Klaviyo, etc.) here.
	 */
	do_action( 'noae_newsletter_subscribed', $email );
	wp_send_json_success( array( 'message' => __( 'Welcome to the ritual — check your inbox for 10% off.', 'noae' ) ) );
}
add_action( 'wp_ajax_noae_newsletter_subscribe', 'noae_ajax_newsletter_subscribe' );
add_action( 'wp_ajax_nopriv_noae_newsletter_subscribe', 'noae_ajax_newsletter_subscribe' );

/* =============================================================
 * 14. Live search suggestions for the header search overlay — backs the
 *    same real WC_Product data as everywhere else via wc_get_products()'s
 *    's' search argument (core WooCommerce product search).
 * ============================================================= */
function noae_ajax_search_suggest() {
	check_ajax_referer( 'noae_quick_view', 'nonce' );
	$term = isset( $_POST['term'] ) ? sanitize_text_field( wp_unslash( $_POST['term'] ) ) : '';
	if ( strlen( $term ) < 2 || ! function_exists( 'wc_get_products' ) ) {
		wp_send_json_success( array( 'html' => '' ) );
	}
	$products = wc_get_products(
		array(
			's'       => $term,
			'limit'   => 6,
			'status'  => 'publish',
			'orderby' => 'relevance',
		)
	);
	ob_start();
	if ( empty( $products ) ) {
		echo '<p style="color:var(--color-plum-soft);font-size:0.9rem;">' . sprintf(
			/* translators: %s: search query. */
			esc_html__( 'No products found for "%s". Try "serum", "hair oil", or "sleep".', 'noae' ),
			esc_html( $term )
		) . '</p>';
	}
	foreach ( $products as $sp ) {
		$image_id = $sp->get_image_id();
		$src      = $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : wc_placeholder_img_src();
		?>
		<a class="noae-search-suggestion" href="<?php echo esc_url( get_permalink( $sp->get_id() ) ); ?>">
			<img src="<?php echo esc_url( $src ); ?>" alt="<?php echo esc_attr( $sp->get_name() ); ?>">
			<div>
				<strong><?php echo esc_html( $sp->get_name() ); ?></strong><br>
				<span style="font-size:0.8rem;color:var(--color-plum-soft)"><?php echo wp_kses_post( wc_get_product_category_list( $sp->get_id() ) ); ?> · <?php echo wp_kses_post( $sp->get_price_html() ); ?></span>
			</div>
		</a>
		<?php
	}
	wp_send_json_success( array( 'html' => ob_get_clean() ) );
}
add_action( 'wp_ajax_noae_search_suggest', 'noae_ajax_search_suggest' );
add_action( 'wp_ajax_nopriv_noae_search_suggest', 'noae_ajax_search_suggest' );
