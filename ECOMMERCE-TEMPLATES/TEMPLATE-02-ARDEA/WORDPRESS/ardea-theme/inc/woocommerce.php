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
 * @package Ardea
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* =============================================================
 * 1. Mega menu — built from REAL WooCommerce product_cat taxonomy
 *
 * The demo's "Shop" nav item opens a 5-column mega menu: one column per
 * room (Living Room / Bedroom / Kitchen / Lighting / Decor), each headed
 * by an "All <Room>" link followed by that room's sub-categories. Rather
 * than requiring a merchant to hand-build a 3-level WP menu to reproduce
 * that exact layout, we compute it directly from the real product_cat
 * tree every time: top-level terms become columns, each term's direct
 * children become that column's links (falling back to just the "All
 * <Room>" link when a category has no children yet). Nothing here is a
 * hardcoded product or category name — it is always real store taxonomy.
 * ============================================================= */
function ardea_mega_menu_columns( $limit = 5 ) {
	$terms = get_terms(
		array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
			'parent'     => 0,
			'orderby'    => 'menu_order',
			'order'      => 'ASC',
			'number'     => $limit,
			'exclude'    => array( get_option( 'default_product_cat', 0 ) ),
		)
	);
	if ( is_wp_error( $terms ) ) {
		return array();
	}
	return $terms;
}

function ardea_render_mega_menu() {
	$columns = ardea_mega_menu_columns( 5 );
	if ( empty( $columns ) ) {
		return;
	}
	echo '<div class="mega-menu">';
	foreach ( $columns as $column ) {
		$children = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
				'parent'     => $column->term_id,
				'orderby'    => 'menu_order',
				'number'     => 3,
			)
		);
		?>
		<div class="mega-menu__group">
			<h4><?php echo esc_html( $column->name ); ?></h4>
			<ul>
				<li><a href="<?php echo esc_url( get_term_link( $column ) ); ?>"><?php echo esc_html( sprintf( __( 'All %s', 'ardea' ), $column->name ) ); ?></a></li>
				<?php if ( ! is_wp_error( $children ) ) : ?>
					<?php foreach ( $children as $child ) : ?>
						<li><a href="<?php echo esc_url( get_term_link( $child ) ); ?>"><?php echo esc_html( $child->name ); ?></a></li>
					<?php endforeach; ?>
				<?php endif; ?>
			</ul>
		</div>
		<?php
	}
	echo '</div>'; // .mega-menu
}

/**
 * Resolve a "Shop by Room" fallback nav link to a real WooCommerce product
 * category archive when one exists with that slug, otherwise fall back to
 * the shop page so the link is never dead.
 */
function ardea_menu_fallback_url( $cat_slug ) {
	$term = get_term_by( 'slug', $cat_slug, 'product_cat' );
	if ( $term && ! is_wp_error( $term ) ) {
		return get_term_link( $term );
	}
	return function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
}

/**
 * Resolve a category tile image: the term's own WooCommerce thumbnail
 * first, then a slug-matched placeholder shipped with the theme, then a
 * generic editorial placeholder — always something on-brand, never blank.
 * Used by template-parts/categories.php and 404.php.
 */
function ardea_category_image_url( $term ) {
	$thumbnail_id = get_term_meta( $term->term_id, 'thumbnail_id', true );
	if ( $thumbnail_id ) {
		$src = wp_get_attachment_image_url( $thumbnail_id, 'ardea-category-tile' );
		if ( $src ) {
			return $src;
		}
	}
	$slug_map = array( 'living-room', 'bedroom', 'kitchen', 'lighting', 'decor' );
	if ( in_array( $term->slug, $slug_map, true ) ) {
		return ARDEA_URI . '/assets/images/ardea-category-' . $term->slug . '.svg';
	}
	return ARDEA_URI . '/assets/images/ardea-craftsmanship.svg';
}

/**
 * Footer "Shop" column links — pulled from real product category terms
 * (top-level, ordered by menu order) instead of a hardcoded Living
 * Room/Bedroom/Kitchen/Lighting/Decor list, so a merchant's own category
 * set appears automatically.
 */
function ardea_footer_shop_links() {
	$links = array();
	$terms = get_terms(
		array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
			'parent'     => 0,
			'orderby'    => 'menu_order',
			'number'     => 5,
		)
	);
	if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
		foreach ( $terms as $term ) {
			$links[ $term->name ] = get_term_link( $term );
		}
	} else {
		$links[ __( 'Shop All', 'ardea' ) ] = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
	}
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
 * Free-DELIVERY progress threshold used by the cart drawer/cart page
 * progress bar ("Add ₹X more to unlock FREE DELIVERY"). Matches the
 * demo's js/cart.js FREE_SHIP_THRESHOLD (₹6,000) — a lower, everyday
 * free-shipping bar distinct from the white-glove delivery threshold
 * quoted in the announcement bar / PDP trust row (₹75,000, see
 * ardea_free_white_glove_threshold() below). Both numbers are real demo
 * copy, kept separate on purpose.
 */
function ardea_freeship_threshold() {
	return apply_filters( 'ardea_freeship_threshold', 6000 );
}

/**
 * White-glove/complimentary delivery threshold quoted in the announcement
 * bar and the PDP trust badges. See docblock above for why this differs
 * from ardea_freeship_threshold().
 */
function ardea_free_white_glove_threshold() {
	return apply_filters( 'ardea_free_white_glove_threshold', 75000 );
}

function ardea_render_freeship_bar() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart ) {
		return;
	}
	$threshold = ardea_freeship_threshold();
	$subtotal  = (float) WC()->cart->get_subtotal();
	$remaining = max( 0, $threshold - $subtotal );
	$pct       = $threshold > 0 ? min( 100, round( ( $subtotal / $threshold ) * 100 ) ) : 100;
	?>
	<div class="cart-progress">
		<?php if ( $remaining <= 0 ) : ?>
			<p class="cart-progress__label is-met"><?php esc_html_e( "You've unlocked FREE DELIVERY", 'ardea' ); ?></p>
		<?php else : ?>
			<p class="cart-progress__label">
				<?php
				printf(
					/* translators: %s: price remaining to unlock free delivery. */
					esc_html__( 'Add %s more to unlock FREE DELIVERY', 'ardea' ),
					wp_kses_post( wc_price( $remaining ) )
				);
				?>
			</p>
		<?php endif; ?>
		<div class="cart-progress__track"><div class="cart-progress__bar" style="width:<?php echo esc_attr( $pct ); ?>%"></div></div>
	</div>
	<?php
}

function ardea_render_cart_drawer_items() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart || WC()->cart->is_empty() ) {
		?>
		<div class="cart-empty">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 4h2l1.6 10.6a2 2 0 002 1.4h7.6a2 2 0 002-1.7L20 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>
			<h3><?php esc_html_e( 'Your cart is empty', 'ardea' ); ?></h3>
			<p class="lead" style="margin-top:0.5rem;"><?php esc_html_e( 'Browse our collections to find your next piece.', 'ardea' ); ?></p>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn--dark" style="margin-top:1.5rem;"><?php esc_html_e( 'Continue Shopping', 'ardea' ); ?></a>
		</div>
		<?php
		return;
	}
	foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
		$product = $cart_item['data'];
		if ( ! $product || ! $product->exists() || $cart_item['quantity'] <= 0 ) {
			continue;
		}
		$thumbnail = $product->get_image( 'thumbnail', array( 'class' => 'cart-line__img' ) );
		$permalink = $product->get_permalink( $cart_item );
		?>
		<div class="cart-line" data-cart-key="<?php echo esc_attr( $cart_item_key ); ?>">
			<a href="<?php echo esc_url( $permalink ); ?>"><?php echo $thumbnail; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WC image markup. ?></a>
			<div class="cart-line__body">
				<h4 class="cart-line__name"><a href="<?php echo esc_url( $permalink ); ?>"><?php echo wp_kses_post( $product->get_name() ); ?></a></h4>
				<p class="cart-line__meta"><?php echo wc_get_formatted_cart_item_data( $cart_item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
				<div class="cart-line__price"><?php echo wp_kses_post( WC()->cart->get_product_subtotal( $product, $cart_item['quantity'] ) ); ?></div>
				<a href="<?php echo esc_url( wc_get_cart_remove_url( $cart_item_key ) ); ?>" class="cart-line__remove remove_from_cart_button" data-cart_item_key="<?php echo esc_attr( $cart_item_key ); ?>"><?php esc_html_e( 'Remove', 'ardea' ); ?></a>
			</div>
		</div>
		<?php
	}
}

function ardea_render_cart_drawer_foot() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart ) {
		return;
	}
	$cart = WC()->cart;
	?>
	<div class="summary-row"><span><?php esc_html_e( 'Subtotal', 'ardea' ); ?></span><span data-subtotal><?php echo wp_kses_post( wc_price( $cart->get_subtotal() ) ); ?></span></div>
	<?php if ( $cart->get_cart_discount_total() > 0 ) : ?>
	<div class="summary-row"><span><?php esc_html_e( 'Discount', 'ardea' ); ?></span><span class="value--accent">-<?php echo wp_kses_post( wc_price( $cart->get_cart_discount_total() ) ); ?></span></div>
	<?php endif; ?>
	<div class="summary-row"><span><?php esc_html_e( 'Shipping', 'ardea' ); ?></span><span><?php esc_html_e( 'Calculated at checkout', 'ardea' ); ?></span></div>
	<div class="summary-row summary-row--total"><span><?php esc_html_e( 'Total', 'ardea' ); ?></span><span><?php echo wp_kses_post( wc_price( $cart->get_total( 'edit' ) ) ); ?></span></div>
	<a href="<?php echo esc_url( wc_get_cart_url() ); ?>" class="btn btn--outline btn--full" style="margin-top:1rem;"><?php esc_html_e( 'View Cart', 'ardea' ); ?></a>
	<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="btn btn--primary btn--full" style="margin-top:0.75rem;"><?php esc_html_e( 'Checkout', 'ardea' ); ?></a>
	<?php
}

/**
 * wc-cart-fragments hook: whenever an item is added/removed/updated via
 * AJAX, WooCommerce core re-runs this filter and swaps out any element in
 * the DOM matching each key with the fresh HTML — this is what keeps the
 * header cart count and the whole drawer live without a page reload.
 */
function ardea_cart_fragments( $fragments ) {
	if ( ! WC()->cart ) {
		return $fragments;
	}
	$count = WC()->cart->get_cart_contents_count();

	ob_start();
	?>
	<span class="count-badge" data-cart-count style="<?php echo $count ? '' : 'display:none'; ?>"><?php echo (int) $count; ?></span>
	<?php
	$fragments['[data-cart-count]'] = ob_get_clean();

	ob_start();
	?>
	<div data-cart-drawer-items><?php ardea_render_cart_drawer_items(); ?></div>
	<?php
	$fragments['[data-cart-drawer-items]'] = ob_get_clean();

	ob_start();
	?>
	<div data-cart-drawer-footer><?php ardea_render_cart_drawer_foot(); ?></div>
	<?php
	$fragments['[data-cart-drawer-footer]'] = ob_get_clean();

	ob_start();
	?>
	<div data-cart-drawer-progress><?php ardea_render_freeship_bar(); ?></div>
	<?php
	$fragments['[data-cart-drawer-progress]'] = ob_get_clean();

	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'ardea_cart_fragments' );

/* =============================================================
 * 3. Star rating — replace WC's %-width stars with the demo's compact
 *    Unicode ★/☆ glyphs inside .stars, reused everywhere: cards, PDP,
 *    quick view and the reviews grid, so there's exactly one rating look.
 * ============================================================= */
function ardea_rating_html( $html, $rating, $count ) {
	$rounded = round( $rating );
	$stars   = '';
	for ( $i = 1; $i <= 5; $i++ ) {
		$stars .= ( $i <= $rounded ) ? '★' : '☆';
	}
	return '<span class="stars">' . $stars . '</span><span class="rating-count">(' . (int) $count . ')</span>';
}
add_filter( 'woocommerce_product_get_rating_html', 'ardea_rating_html', 10, 3 );

/**
 * Sale badge — replace the default <span class="onsale">Sale!</span> with
 * the demo's .badge.badge--sale + computed discount percentage.
 */
function ardea_sale_flash( $html, $post, $product ) {
	if ( ! $product instanceof WC_Product || ! $product->is_on_sale() ) {
		return $html;
	}
	$regular = (float) $product->get_regular_price();
	$sale    = (float) $product->get_price();
	$percent = ( $regular > 0 ) ? round( ( ( $regular - $sale ) / $regular ) * 100 ) : 0;
	return '<span class="badge badge--sale">' . sprintf(
		/* translators: %d: discount percentage. */
		esc_html__( '-%d%%', 'ardea' ),
		$percent
	) . '</span>';
}
add_filter( 'woocommerce_sale_flash', 'ardea_sale_flash', 10, 3 );

/**
 * Add-to-cart button copy — matches the demo's "Add to Cart" casing.
 */
add_filter( 'woocommerce_product_single_add_to_cart_text', fn() => __( 'Add to Cart', 'ardea' ) );
add_filter( 'woocommerce_product_add_to_cart_text', fn() => __( 'Add to Cart', 'ardea' ) );

/* =============================================================
 * 4. Products-per-page / grid columns — matches the demo's 4-column
 *    .product-grid and 16-per-page shop listing ("16 pieces").
 * ============================================================= */
add_filter( 'loop_shop_per_page', fn() => 16, 20 );
add_filter( 'loop_shop_columns', fn() => 4 );
add_filter(
	'woocommerce_output_related_products_args',
	function ( $args ) {
		$args['posts_per_page'] = 4;
		$args['columns']        = 4;
		return $args;
	}
);
// Up-sells shown on cart page — keep to the same 4-col rhythm.
add_filter( 'woocommerce_upsell_display_args', fn( $args ) => wp_parse_args( array( 'posts_per_page' => 4, 'columns' => 4 ), $args ) );

/* =============================================================
 * 5. Shop / category archive layout — filters aside + page-hero band
 *
 * Fully hook-based: WooCommerce's own woocommerce_output_content_wrapper()
 * (hooked to woocommerce_before_main_content @10) still prints <main>. We
 * only add extra open/close divs around it at neighbouring priorities so
 * the aside sits inside <main> alongside the native product loop —
 * archive-product.php itself is never copied into the theme.
 * ============================================================= */
function ardea_shop_is_archive() {
	return is_shop() || is_product_category() || is_product_tag();
}

/**
 * On shop/category/tag archives we print our own woocommerce_breadcrumb()
 * call manually inside the .breadcrumbs wrapper (see ardea_open_page_hero
 * below), so the DEFAULT `woocommerce_breadcrumb` hook (core, priority 20
 * on woocommerce_before_main_content) must be removed there or it would
 * render a second, unstyled breadcrumb right after ours. Single product
 * pages are untouched and keep using that default hook.
 */
function ardea_maybe_remove_default_breadcrumb() {
	if ( ardea_shop_is_archive() ) {
		remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
	}
}
add_action( 'wp', 'ardea_maybe_remove_default_breadcrumb' );

function ardea_open_page_hero() {
	if ( ! ardea_shop_is_archive() ) {
		return;
	}
	echo '<nav class="breadcrumbs container" aria-label="' . esc_attr__( 'Breadcrumb', 'ardea' ) . '">';
	woocommerce_breadcrumb( array( 'wrap_before' => '<ol>', 'wrap_after' => '</ol>', 'before' => '<li>', 'after' => '</li>' ) );
	echo '</nav>';
	echo '<section class="page-hero container">';
}
add_action( 'woocommerce_before_main_content', 'ardea_open_page_hero', 15 );

function ardea_close_page_hero() {
	if ( ! ardea_shop_is_archive() ) {
		return;
	}
	if ( is_shop() ) {
		echo '<h1 class="page-hero__title">' . esc_html__( 'Shop All Furniture & Decor', 'ardea' ) . '</h1>';
		echo '<p class="page-hero__lead lead">' . esc_html__( 'Every Ardea piece in one place — filter by room, finish or price to find the right fit. Each listing includes full dimensions, materials and delivery details so there are no surprises at checkout.', 'ardea' ) . '</p>';
	} else {
		$term = get_queried_object();
		echo '<h1 class="page-hero__title">' . esc_html( single_term_title( '', false ) ) . '</h1>';
		if ( ! empty( $term->description ) ) {
			echo '<p class="page-hero__lead lead">' . wp_kses_post( $term->description ) . '</p>';
		}
	}
	echo '</section>'; // .page-hero
	echo '<section class="container section--tight"><div class="shop-layout">';
	ardea_shop_filters_aside();
	echo '<div class="shop-results">';
}
add_action( 'woocommerce_before_main_content', 'ardea_close_page_hero', 21 );

function ardea_shop_filters_aside() {
	?>
	<aside class="filters" aria-label="<?php esc_attr_e( 'Product filters', 'ardea' ); ?>">
		<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
			<h3 style="font-size:1.1rem;"><?php esc_html_e( 'Filters', 'ardea' ); ?></h3>
			<button type="button" class="icon-btn filters__close" data-panel-close aria-label="<?php esc_attr_e( 'Close filters', 'ardea' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
		</div>

		<div class="filter-group">
			<h4 class="filter-group__title" data-filter-group-toggle><?php esc_html_e( 'Room', 'ardea' ); ?> <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg></h4>
			<div class="filter-group__body">
				<?php
				$rooms = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true, 'parent' => 0 ) );
				if ( ! is_wp_error( $rooms ) ) {
					foreach ( $rooms as $room ) {
						$active = is_product_category( $room->slug );
						printf(
							'<label class="checkbox-row"><input type="checkbox" onclick="window.location.href=\'%1$s\'" %2$s> %3$s (%4$d)</label>',
							esc_url( get_term_link( $room ) ),
							$active ? 'checked' : '',
							esc_html( $room->name ),
							(int) $room->count
						);
					}
				}
				?>
			</div>
		</div>

		<div class="filter-group">
			<h4 class="filter-group__title" data-filter-group-toggle><?php esc_html_e( 'Price Range', 'ardea' ); ?> <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg></h4>
			<div class="filter-group__body"><?php the_widget( 'WC_Widget_Price_Filter', array( 'title' => '' ) ); ?></div>
		</div>

		<?php if ( taxonomy_exists( 'pa_finish' ) && ! is_wp_error( get_terms( 'pa_finish' ) ) && get_terms( 'pa_finish' ) ) : ?>
		<div class="filter-group">
			<h4 class="filter-group__title" data-filter-group-toggle><?php esc_html_e( 'Finish & Color', 'ardea' ); ?> <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg></h4>
			<div class="filter-group__body"><?php the_widget( 'WC_Widget_Layered_Nav', array( 'attribute' => 'finish', 'title' => '', 'display_type' => 'list' ) ); ?></div>
		</div>
		<?php endif; ?>

		<div class="filter-group">
			<h4 class="filter-group__title" data-filter-group-toggle><?php esc_html_e( 'Availability', 'ardea' ); ?> <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg></h4>
			<div class="filter-group__body"><?php the_widget( 'WC_Widget_Layered_Nav_Filters', array( 'title' => '' ) ); ?></div>
		</div>

		<div class="filter-group" style="border-bottom:none;">
			<h4 class="filter-group__title" data-filter-group-toggle><?php esc_html_e( 'Customer Rating', 'ardea' ); ?> <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg></h4>
			<div class="filter-group__body"><?php the_widget( 'WC_Widget_Rating_Filter', array( 'title' => '' ) ); ?></div>
		</div>
	</aside>
	<?php
}

/**
 * Toolbar structure threaded through WooCommerce's own core hooks (all on
 * woocommerce_before_shop_loop), matching the demo's exact nesting:
 *
 *   <div class="shop-toolbar">                      [5]  open
 *     <button class="filter-drawer-trigger">        [6]  Filters button (mobile only)
 *     <span class="shop-toolbar__count">...</span>   [20] WC core: woocommerce_result_count
 *     <div class="shop-toolbar__right">              [21] open
 *       <select>...</select>                         [30] WC core: woocommerce_catalog_ordering
 *     </div>                                         [31] close shop-toolbar__right
 *   </div>                                           [31] close shop-toolbar
 */
function ardea_open_shop_toolbar() {
	if ( ! ardea_shop_is_archive() ) {
		return;
	}
	echo '<div class="shop-toolbar">';
	echo '<button type="button" class="btn btn--outline btn--sm filter-drawer-trigger" data-filter-drawer-open><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 6h16M8 12h8M11 18h2" stroke="currentColor" fill="none" stroke-width="2"/></svg> ' . esc_html__( 'Filters', 'ardea' ) . '</button>';
}
add_action( 'woocommerce_before_shop_loop', 'ardea_open_shop_toolbar', 5 );

function ardea_open_toolbar_right() {
	if ( ! ardea_shop_is_archive() ) {
		return;
	}
	echo '<div class="shop-toolbar__right">';
}
add_action( 'woocommerce_before_shop_loop', 'ardea_open_toolbar_right', 21 );

function ardea_close_shop_toolbar() {
	if ( ! ardea_shop_is_archive() ) {
		return;
	}
	echo '</div>'; // .shop-toolbar__right
	echo '</div>'; // .shop-toolbar
}
add_action( 'woocommerce_before_shop_loop', 'ardea_close_shop_toolbar', 31 );

function ardea_open_product_grid() {
	if ( ! ardea_shop_is_archive() ) {
		return;
	}
}
function ardea_close_shop_layout() {
	if ( ! ardea_shop_is_archive() ) {
		return;
	}
	echo '</div></div></section>'; // .shop-results, .shop-layout, .section--tight
}
add_action( 'woocommerce_after_main_content', 'ardea_close_shop_layout', 5 );

/* =============================================================
 * 6. Single product — eyebrow category, stock message, Buy Now
 *    button, wishlist button, dimensions hint, trust badges.
 * ============================================================= */

function ardea_pdp_category_eyebrow() {
	global $product;
	if ( ! $product ) {
		return;
	}
	$cats = wc_get_product_category_list( $product->get_id() );
	if ( $cats ) {
		echo '<p class="pdp__info__category">' . wp_kses_post( $cats ) . '</p>';
	}
}
add_action( 'woocommerce_single_product_summary', 'ardea_pdp_category_eyebrow', 4 );

function ardea_pdp_stock_message() {
	global $product;
	if ( ! $product ) {
		return;
	}
	if ( ! $product->is_in_stock() ) {
		echo '<p class="stock-msg out-of-stock">' . esc_html__( 'Currently out of stock.', 'ardea' ) . '</p>';
		return;
	}
	$qty = $product->get_stock_quantity();
	if ( $product->managing_stock() && null !== $qty && $qty <= 5 ) {
		echo '<p class="stock-msg low-stock">' . sprintf(
			/* translators: %d: number of items left in stock. */
			esc_html__( 'Only %d left in stock — order soon.', 'ardea' ),
			(int) $qty
		) . '</p>';
	} else {
		echo '<p class="stock-note">' . esc_html__( 'In stock, ready to ship', 'ardea' ) . '</p>';
	}
}
add_action( 'woocommerce_single_product_summary', 'ardea_pdp_stock_message', 15 );

/**
 * Dimensions hint under the finish/variation swatches, matching the
 * demo's inline "Dimensions: W74 x D82 x H78 cm, Seat H43 cm" note.
 * Sourced from postmeta `_ardea_dimensions` (see section 8).
 */
function ardea_pdp_dimensions_hint() {
	global $product;
	if ( ! $product ) {
		return;
	}
	$dimensions = get_post_meta( $product->get_id(), '_ardea_dimensions', true );
	if ( '' === $dimensions ) {
		return;
	}
	echo '<p class="form-hint" style="margin-bottom:1.5rem;">' . esc_html( sprintf( __( 'Dimensions: %s', 'ardea' ), $dimensions ) ) . '</p>';
}
add_action( 'woocommerce_before_add_to_cart_button', 'ardea_pdp_dimensions_hint', 20 );

/**
 * Trust row, right after the add-to-cart form (see section 7 for the form
 * wrapper itself). Copy matches the demo's product.html trust-badges row.
 */
function ardea_pdp_trust_row() {
	?>
	<div class="trust-badges">
		<div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 12l7 7 11-13"/></svg><?php esc_html_e( '15-Year Structural Warranty', 'ardea' ); ?></div>
		<div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="7" width="15" height="10" rx="1"/><path d="M18 10h2l2 2v5h-4"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="17.5" cy="18.5" r="1.5"/></svg>
			<?php
			printf(
				/* translators: %s: free delivery order threshold. */
				esc_html__( 'Free Delivery on Orders %s+', 'ardea' ),
				wp_strip_all_tags( wc_price( ardea_free_white_glove_threshold() ) )
			);
			?>
		</div>
		<div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z"/><path d="M12 8v4l3 2"/></svg><?php esc_html_e( '30-Day Returns', 'ardea' ); ?></div>
	</div>
	<?php
}
add_action( 'woocommerce_single_product_summary', 'ardea_pdp_trust_row', 35 );

/* =============================================================
 * 7. Add-to-cart form: wrap quantity+button in .pdp-actions, add the
 *    wishlist heart button, and a "Buy Now" button that piggy-backs on
 *    the SAME form submit (see the redirect filter below) so it works
 *    for simple AND variable products without any custom AJAX.
 * ============================================================= */
$GLOBALS['ardea_pdp_actions_open'] = false;

add_action(
	'woocommerce_before_add_to_cart_quantity',
	function () {
		global $ardea_pdp_actions_open;
		echo '<div class="pdp-actions">';
		$ardea_pdp_actions_open = true;
	}
);

add_action(
	'woocommerce_after_add_to_cart_button',
	function () {
		global $product, $ardea_pdp_actions_open;
		$product_id  = $product ? $product->get_id() : 0;
		$in_wishlist = function_exists( 'ardea_is_in_wishlist' ) && ardea_is_in_wishlist( $product_id );
		if ( $ardea_pdp_actions_open ) {
			echo '</div>'; // .pdp-actions
			$ardea_pdp_actions_open = false;
		}
		printf(
			'<button type="submit" name="ardea_buy_now" value="1" class="btn btn--dark">%s</button>',
			esc_html__( 'Buy Now', 'ardea' )
		);
		?>
		<div class="pdp__secondary-actions">
			<button type="button" data-wishlist-toggle data-id="<?php echo esc_attr( $product_id ); ?>" aria-pressed="<?php echo $in_wishlist ? 'true' : 'false'; ?>" class="<?php echo $in_wishlist ? 'is-active' : ''; ?>">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20.5s-7.5-4.6-10-9.6C.4 7.6 2 4 5.6 4c2 0 3.6 1.2 4.4 2.6C10.8 5.2 12.4 4 14.4 4 18 4 19.6 7.6 18 10.9c-2.5 5-10 9.6-10 9.6z"/></svg>
				<?php esc_html_e( 'Add to Wishlist', 'ardea' ); ?>
			</button>
		</div>
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
function ardea_buy_now_redirect( $url ) {
	if ( isset( $_REQUEST['ardea_buy_now'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- native WC add-to-cart request, no state change beyond WC's own handling.
		return wc_get_checkout_url();
	}
	return $url;
}
add_filter( 'woocommerce_add_to_cart_redirect', 'ardea_buy_now_redirect' );

/* =============================================================
 * 8. Product tabs — rename/reorder to match the demo's Overview /
 *    Features / Materials / Dimensions / Delivery & Assembly / Care.
 *    Content sources, documented per tab:
 *      - Overview: product short description (native WC field)
 *      - Features: postmeta `_ardea_features` — newline-separated list,
 *        editable via a Custom Fields box on the product edit screen
 *      - Materials: postmeta `_ardea_materials` — plain text/HTML
 *      - Dimensions: postmeta `_ardea_dimensions` (also shown inline near
 *        the buy box, see section 6) plus a spec table built from real
 *        product data (SKU, brand, dimensions, materials, finish
 *        options from the `pa_finish`/`pa_color` variation attributes if
 *        present, and live availability)
 *      - Delivery & Assembly: postmeta `_ardea_delivery` — HTML
 *      - Care: postmeta `_ardea_care` — HTML
 *    Each falls back to sensible store-wide default copy (matching the
 *    demo's copy) when the postmeta is empty, so new products aren't blank.
 * ============================================================= */
function ardea_product_tabs( $tabs ) {
	global $product;
	if ( ! $product ) {
		return $tabs;
	}
	$id = $product->get_id();

	// Overview — rename WooCommerce's core Description tab.
	if ( isset( $tabs['description'] ) ) {
		$tabs['description']['title']    = __( 'Overview', 'ardea' );
		$tabs['description']['priority'] = 10;
	}
	// Drop the default Additional Information (attributes) tab; attribute
	// data is folded into the variations form + Dimensions tab instead.
	unset( $tabs['additional_information'] );

	$custom = array(
		'ardea_features'   => array( __( 'Features', 'ardea' ), '_ardea_features', 20, 'list' ),
		'ardea_materials'  => array( __( 'Materials', 'ardea' ), '_ardea_materials', 30, 'html' ),
		'ardea_dimensions' => array( __( 'Dimensions', 'ardea' ), '_ardea_dimensions', 40, 'dimensions' ),
		'ardea_delivery'   => array( __( 'Delivery & Assembly', 'ardea' ), '_ardea_delivery', 50, 'html' ),
		'ardea_care'       => array( __( 'Care', 'ardea' ), '_ardea_care', 60, 'html' ),
	);

	foreach ( $custom as $key => $data ) {
		list( $title, $meta_key, $priority, $type ) = $data;
		$tabs[ $key ] = array(
			'title'    => $title,
			'priority' => $priority,
			'callback' => function () use ( $id, $meta_key, $type, $title ) {
				ardea_render_product_tab( $id, $meta_key, $type, $title );
			},
		);
	}

	return $tabs;
}
add_filter( 'woocommerce_product_tabs', 'ardea_product_tabs' );

function ardea_render_product_tab( $product_id, $meta_key, $type, $title ) {
	$value = get_post_meta( $product_id, $meta_key, true );

	$defaults = array(
		'_ardea_delivery' => __( 'Most Ardea pieces are made to order and ship within 2–4 weeks. Small items (lighting, decor, textiles) are sent by standard courier in protective packaging. Chairs, tables and case goods ship via our furniture delivery partner with room-of-choice placement; sofas, beds, wardrobes and kitchen islands include two-person white-glove delivery with packaging removal. Where assembly is required, this tab and the included printed guide will say so explicitly.', 'ardea' ),
		'_ardea_care'     => __( 'Dust weekly with a dry microfibre cloth. Re-oil solid-wood surfaces every 12–18 months with a food-safe furniture oil. Spot clean upholstery with a damp cloth and mild, undyed soap. Keep out of direct, prolonged sunlight to avoid uneven fading.', 'ardea' ),
	);
	if ( '' === $value && isset( $defaults[ $meta_key ] ) ) {
		$value = $defaults[ $meta_key ];
	}

	echo '<h2>' . esc_html( $title ) . '</h2>';

	if ( 'dimensions' === $type ) {
		if ( '' !== $value ) {
			echo '<p style="margin-bottom:1.5rem;">' . esc_html( sprintf( __( 'Overall dimensions: %s. Please allow up to 1–2 cm of natural variation, typical of handmade and solid-wood construction.', 'ardea' ), $value ) ) . '</p>';
		}
		ardea_render_spec_table( $product_id );
		return;
	}

	if ( '' === $value ) {
		echo '<p class="text-muted">' . esc_html__( 'No details added for this product yet.', 'ardea' ) . '</p>';
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

/**
 * Spec table shown inside the Dimensions tab — SKU/Brand/Availability are
 * always live from the real $product object; Dimensions/Materials come
 * from postmeta; Finish Options comes from the product's own `pa_finish`
 * (or `pa_color`) variation attribute terms when present.
 */
function ardea_render_spec_table( $product_id ) {
	$product = wc_get_product( $product_id );
	if ( ! $product ) {
		return;
	}
	$dimensions = get_post_meta( $product_id, '_ardea_dimensions', true );
	$materials  = get_post_meta( $product_id, '_ardea_materials', true );

	$finish_options = array();
	foreach ( array( 'pa_finish', 'pa_color' ) as $taxonomy ) {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			continue;
		}
		$terms = wc_get_product_terms( $product_id, $taxonomy, array( 'fields' => 'names' ) );
		if ( ! empty( $terms ) ) {
			$finish_options = array_merge( $finish_options, $terms );
		}
	}

	if ( ! $product->is_in_stock() ) {
		$availability = __( 'Out of stock', 'ardea' );
	} elseif ( $product->managing_stock() && null !== $product->get_stock_quantity() ) {
		$availability = sprintf(
			/* translators: %d: number of units in stock. */
			__( 'In stock (%d units)', 'ardea' ),
			(int) $product->get_stock_quantity()
		);
	} else {
		$availability = __( 'In stock', 'ardea' );
	}
	?>
	<table class="spec-table">
		<tr><th><?php esc_html_e( 'SKU', 'ardea' ); ?></th><td><?php echo esc_html( $product->get_sku() ? $product->get_sku() : '—' ); ?></td></tr>
		<tr><th><?php esc_html_e( 'Brand', 'ardea' ); ?></th><td>ARDEA</td></tr>
		<?php if ( $dimensions ) : ?><tr><th><?php esc_html_e( 'Dimensions', 'ardea' ); ?></th><td><?php echo esc_html( $dimensions ); ?></td></tr><?php endif; ?>
		<?php if ( $materials ) : ?><tr><th><?php esc_html_e( 'Materials', 'ardea' ); ?></th><td><?php echo esc_html( $materials ); ?></td></tr><?php endif; ?>
		<?php if ( ! empty( $finish_options ) ) : ?><tr><th><?php esc_html_e( 'Finish Options', 'ardea' ); ?></th><td><?php echo esc_html( implode( ', ', $finish_options ) ); ?></td></tr><?php endif; ?>
		<tr><th><?php esc_html_e( 'Availability', 'ardea' ); ?></th><td><?php echo esc_html( $availability ); ?></td></tr>
	</table>
	<?php
}

/* =============================================================
 * 9. Variation "swatch" pills — restyle WooCommerce's native variation
 *    <select> as the demo's pill-button swatch-list (e.g. Finish:
 *    "Natural Oak / Sand Linen" / "Smoked Oak / Charcoal Linen") without
 *    touching WooCommerce's own variations.js: the real <select> stays in
 *    the DOM (hidden via CSS, see style.css), and assets/js/theme.js just
 *    forwards swatch clicks onto it and fires a native change event.
 * ============================================================= */
function ardea_variation_swatches( $html, $args ) {
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
	echo '<div class="swatch-list" data-swatch-for="' . esc_attr( $select_id ) . '">';
	foreach ( $options as $option ) {
		$label = $option;
		if ( $taxonomy && taxonomy_exists( $taxonomy ) ) {
			$term = get_term_by( 'slug', $option, $taxonomy );
			if ( $term && ! is_wp_error( $term ) ) {
				$label = $term->name;
			}
		}
		printf(
			'<button type="button" class="swatch" data-swatch-value="%1$s" aria-pressed="%2$s">%3$s</button>',
			esc_attr( $option ),
			( $option === $selected ) ? 'true' : 'false',
			esc_html( $label )
		);
	}
	echo '</div>';
	return ob_get_clean();
}
add_filter( 'woocommerce_dropdown_variation_attribute_options_html', 'ardea_variation_swatches', 10, 2 );

/* =============================================================
 * 10. FAQ accordion + FAQPage JSON-LD
 *
 * Populate per-product FAQs with postmeta key `_ardea_faq`, stored as a
 * serialized array of ['q' => ..., 'a' => ...] pairs, e.g.:
 *
 *   update_post_meta( $product_id, '_ardea_faq', array(
 *       array( 'q' => 'What wood is the frame made from?', 'a' => 'Solid FSC-certified European oak.' ),
 *       array( 'q' => 'Does this ship assembled?', 'a' => 'Yes — see the Delivery & Assembly tab.' ),
 *   ) );
 *
 * A merchant/developer can also build a small metabox or ACF Repeater
 * field group targeting this same meta key — the accordion and the
 * FAQPage JSON-LD both read directly from it, so what's rendered always
 * matches what's declared in the schema.
 * ============================================================= */
function ardea_get_product_faqs( $product_id ) {
	$faqs = get_post_meta( $product_id, '_ardea_faq', true );
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

function ardea_pdp_faq_accordion() {
	global $product;
	if ( ! $product ) {
		return;
	}
	$faqs = ardea_get_product_faqs( $product->get_id() );
	if ( empty( $faqs ) ) {
		return;
	}
	?>
	<div class="divider"></div>
	<div>
		<div class="section-head">
			<div class="section-head__text"><p class="eyebrow"><?php esc_html_e( 'Common Questions', 'ardea' ); ?></p><h2><?php esc_html_e( 'Frequently Asked Questions', 'ardea' ); ?></h2></div>
		</div>
		<div class="faq-accordion" data-pdp-faqs>
			<?php foreach ( $faqs as $faq ) : ?>
				<div class="faq-item" data-faq-item>
					<button type="button" class="faq-item__q" aria-expanded="false"><?php echo esc_html( $faq['q'] ); ?><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg></button>
					<div class="faq-item__a"><p><?php echo wp_kses_post( $faq['a'] ); ?></p></div>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
	<?php
}
add_action( 'woocommerce_after_single_product_summary', 'ardea_pdp_faq_accordion', 25 );

/* =============================================================
 * 11. Recently viewed products
 *
 * WooCommerce core does not ship a "recently viewed" template out of the
 * box — this is a small, genuinely hook-based implementation: a cookie of
 * product IDs, written on woocommerce_before_single_product, rendered via
 * wc_get_products() so it is always real store data, never a fake list.
 * ============================================================= */
function ardea_track_recently_viewed() {
	if ( ! is_singular( 'product' ) ) {
		return;
	}
	global $product;
	if ( ! $product ) {
		return;
	}
	$viewed = ! empty( $_COOKIE['ardea_recently_viewed'] ) ? explode( '|', sanitize_text_field( wp_unslash( $_COOKIE['ardea_recently_viewed'] ) ) ) : array();
	$viewed = array_diff( $viewed, array( (string) $product->get_id() ) );
	array_unshift( $viewed, (string) $product->get_id() );
	$viewed = array_slice( array_filter( $viewed, 'is_numeric' ), 0, 8 );
	wc_setcookie( 'ardea_recently_viewed', implode( '|', $viewed ), time() + DAY_IN_SECONDS * 30 );
}
add_action( 'woocommerce_before_single_product', 'ardea_track_recently_viewed' );

function ardea_recently_viewed_ids( $exclude_id = 0 ) {
	if ( empty( $_COOKIE['ardea_recently_viewed'] ) ) {
		return array();
	}
	$ids = array_map( 'absint', explode( '|', sanitize_text_field( wp_unslash( $_COOKIE['ardea_recently_viewed'] ) ) ) );
	$ids = array_filter( $ids, fn( $id ) => $id && $id !== (int) $exclude_id );
	return array_slice( $ids, 0, 4 );
}

function ardea_pdp_related_and_recently_viewed() {
	global $product;
	$ids = ardea_recently_viewed_ids( $product ? $product->get_id() : 0 );
	if ( empty( $ids ) || ! function_exists( 'wc_get_products' ) ) {
		return;
	}
	$products = wc_get_products( array( 'include' => $ids, 'orderby' => 'post__in', 'status' => 'publish' ) );
	if ( empty( $products ) ) {
		return;
	}
	?>
	<div class="recently-viewed-section">
		<div class="section-head">
			<div class="section-head__text"><p class="eyebrow"><?php esc_html_e( 'Your History', 'ardea' ); ?></p><h2><?php esc_html_e( 'Recently Viewed', 'ardea' ); ?></h2></div>
		</div>
		<ul class="product-grid">
			<?php
			foreach ( $products as $recent_product ) {
				$GLOBALS['product'] = $recent_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
				wc_get_template_part( 'content', 'product' );
			}
			?>
		</ul>
	</div>
	<?php
	$GLOBALS['product'] = $product;
}
add_action( 'woocommerce_after_single_product_summary', 'ardea_pdp_related_and_recently_viewed', 45 );

/* =============================================================
 * 12. JSON-LD: Product/Offer + BreadcrumbList (+ FAQPage when present)
 * ============================================================= */
function ardea_product_jsonld() {
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
	// page (see section 10), so the schema always matches visible content.
	$faqs = ardea_get_product_faqs( $product->get_id() );
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
	// ardea_seo_plugin_active() docblock in functions.php).
	if ( ardea_seo_plugin_active() ) {
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
			'name'  => 'Ardea',
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
add_action( 'wp_head', 'ardea_product_jsonld' );

/**
 * Open Graph / Twitter tags — only when no SEO plugin already covers
 * this, to avoid ever printing duplicate meta tags on the same page.
 */
function ardea_social_meta_tags() {
	if ( ardea_seo_plugin_active() ) {
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
		<meta property="og:title" content="<?php echo esc_attr( get_bloginfo( 'name' ) . ' — Modern Furniture & Home Design' ); ?>">
		<meta property="og:description" content="<?php echo esc_attr( get_bloginfo( 'description' ) ); ?>">
		<meta property="og:type" content="website">
		<meta property="og:url" content="<?php echo esc_url( home_url( '/' ) ); ?>">
		<meta property="og:site_name" content="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
		<meta name="twitter:card" content="summary_large_image">
		<?php
	}
}
add_action( 'wp_head', 'ardea_social_meta_tags' );

/* =============================================================
 * 13. Quick View — AJAX endpoint returning a compact product summary
 *    for the modal declared in header.php. Always built from a real
 *    WC_Product; never hardcoded.
 * ============================================================= */
function ardea_ajax_quick_view() {
	check_ajax_referer( 'ardea_quick_view', 'nonce' );
	$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$product    = $product_id ? wc_get_product( $product_id ) : null;
	if ( ! $product ) {
		wp_send_json_error( array( 'message' => __( 'Product not found.', 'ardea' ) ) );
	}

	ob_start();
	$image_id  = $product->get_image_id();
	$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'large' ) : wc_placeholder_img_src();
	$dimensions = get_post_meta( $product->get_id(), '_ardea_dimensions', true );
	?>
	<button type="button" class="icon-btn modal__close" data-quick-view-close aria-label="<?php esc_attr_e( 'Close quick view', 'ardea' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
	<div class="modal__media"><img src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( $product->get_name() ); ?>"></div>
	<div class="modal__body">
		<p class="product-card__category"><?php echo wp_kses_post( wc_get_product_category_list( $product->get_id() ) ); ?></p>
		<h3><?php echo esc_html( $product->get_name() ); ?></h3>
		<div class="product-card__rating"><?php echo wp_kses_post( wc_get_rating_html( $product->get_average_rating(), $product->get_review_count() ) ); ?></div>
		<div class="modal__price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
		<p class="modal__desc"><?php echo wp_kses_post( wp_trim_words( wp_strip_all_tags( $product->get_short_description() ? $product->get_short_description() : $product->get_description() ), 30 ) ); ?></p>
		<?php if ( $dimensions ) : ?><p style="font-size:0.85rem;color:var(--color-text-muted);"><?php echo esc_html( $dimensions ); ?></p><?php endif; ?>
		<div class="modal__actions">
			<a href="<?php echo esc_url( $product->add_to_cart_url() ); ?>" class="btn btn--primary"><?php echo esc_html( $product->is_purchasable() && $product->is_type( 'simple' ) ? __( 'Add to Cart', 'ardea' ) : __( 'View Full Details', 'ardea' ) ); ?></a>
			<button type="button" class="icon-btn" data-wishlist-toggle data-id="<?php echo esc_attr( $product->get_id() ); ?>" aria-label="<?php esc_attr_e( 'Add to wishlist', 'ardea' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20.5s-7.5-4.6-10-9.6C.4 7.6 2 4 5.6 4c2 0 3.6 1.2 4.4 2.6C10.8 5.2 12.4 4 14.4 4 18 4 19.6 7.6 18 10.9c-2.5 5-10 9.6-10 9.6z"/></svg></button>
		</div>
		<a class="modal__link" href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>"><?php esc_html_e( 'View full details →', 'ardea' ); ?></a>
	</div>
	<?php
	wp_send_json_success( array( 'html' => ob_get_clean() ) );
}
add_action( 'wp_ajax_ardea_quick_view', 'ardea_ajax_quick_view' );
add_action( 'wp_ajax_nopriv_ardea_quick_view', 'ardea_ajax_quick_view' );

/* =============================================================
 * 14. Newsletter subscribe (front-end forms in footer/homepage) — no
 *    email service is wired up out of the box (that depends on the
 *    merchant's provider), so this just validates + fires an action
 *    hook a mail-provider integration can listen for.
 * ============================================================= */
function ardea_ajax_newsletter_subscribe() {
	check_ajax_referer( 'ardea_wishlist', 'nonce' ); // shares the general front-end nonce; no state-changing WP data is touched.
	$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	if ( ! is_email( $email ) ) {
		wp_send_json_error( array( 'message' => __( 'Please enter a valid email address.', 'ardea' ) ) );
	}
	/**
	 * Fires when a visitor submits the newsletter form. Hook a mail
	 * provider's API call (Mailchimp, Klaviyo, etc.) here.
	 */
	do_action( 'ardea_newsletter_subscribed', $email );
	wp_send_json_success( array( 'message' => __( "Thanks — you're on the list.", 'ardea' ) ) );
}
add_action( 'wp_ajax_ardea_newsletter_subscribe', 'ardea_ajax_newsletter_subscribe' );
add_action( 'wp_ajax_nopriv_ardea_newsletter_subscribe', 'ardea_ajax_newsletter_subscribe' );

/* =============================================================
 * 15. Live search suggestions for the header search overlay — backs
 *    the same real WC_Product data as everywhere else via wc_get_products'
 *    's' search argument (core WooCommerce product search).
 * ============================================================= */
function ardea_ajax_search_suggest() {
	check_ajax_referer( 'ardea_quick_view', 'nonce' );
	$term = isset( $_POST['term'] ) ? sanitize_text_field( wp_unslash( $_POST['term'] ) ) : '';
	if ( strlen( $term ) < 2 || ! function_exists( 'wc_get_products' ) ) {
		wp_send_json_success( array( 'html' => '' ) );
	}
	$products = wc_get_products(
		array(
			's'       => $term,
			'limit'   => 5,
			'status'  => 'publish',
			'orderby' => 'relevance',
		)
	);
	ob_start();
	if ( empty( $products ) ) {
		echo '<p class="search-empty-hint">' . esc_html__( 'No products matched your search.', 'ardea' ) . '</p>';
	}
	foreach ( $products as $sp ) {
		$image_id = $sp->get_image_id();
		$src      = $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : wc_placeholder_img_src();
		?>
		<a class="suggestion-item" href="<?php echo esc_url( get_permalink( $sp->get_id() ) ); ?>">
			<img src="<?php echo esc_url( $src ); ?>" alt="<?php echo esc_attr( $sp->get_name() ); ?>">
			<span>
				<span class="s-name"><?php echo esc_html( $sp->get_name() ); ?></span><br>
				<span class="s-cat"><?php echo wp_kses_post( wc_get_product_category_list( $sp->get_id() ) ); ?></span>
			</span>
			<span class="s-price"><?php echo wp_kses_post( $sp->get_price_html() ); ?></span>
		</a>
		<?php
	}
	wp_send_json_success( array( 'html' => ob_get_clean() ) );
}
add_action( 'wp_ajax_ardea_search_suggest', 'ardea_ajax_search_suggest' );
add_action( 'wp_ajax_nopriv_ardea_search_suggest', 'ardea_ajax_search_suggest' );
