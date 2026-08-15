<?php
/**
 * WooCommerce integration.
 *
 * Architectural note: everything here is hook-based restyling of
 * WooCommerce's own archive-product.php / single-product.php templates —
 * we never copy those two files into the theme. The one exception the
 * brief explicitly allows for is documented at velora_content_product
 * below (we DO ship woocommerce/content-product.php, the per-product
 * card partial, because the demo's card markup — hover-swap image, heart
 * button, quick view/quick add row — has no clean hook seam in the
 * default template; WooCommerce itself expects content-product.php to be
 * themeable, so this is the WooCommerce-recommended override, not a
 * bypass of it).
 *
 * @package Velora
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* =============================================================
 * 2. Menu / link helpers used by header.php, footer.php
 *
 * (velora_seo_plugin_active() lives in functions.php, not here — it's
 * used by header.php's robots-meta output too, which must work whether
 * or not WooCommerce is active, whereas this file only loads when
 * WooCommerce is.)
 * ============================================================= */

/**
 * Resolve a "Women / Men / Accessories" style fallback nav link to a real
 * WooCommerce product category archive when one exists with that slug,
 * otherwise fall back to the shop page so the link is never dead.
 */
function velora_menu_fallback_url( $cat_slug ) {
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
function velora_category_image_url( $term ) {
	$thumbnail_id = get_term_meta( $term->term_id, 'thumbnail_id', true );
	if ( $thumbnail_id ) {
		$src = wp_get_attachment_image_url( $thumbnail_id, 'velora-category-tile' );
		if ( $src ) {
			return $src;
		}
	}
	$slug_map = array( 'dresses', 'outerwear', 'knitwear', 'accessories' );
	if ( in_array( $term->slug, $slug_map, true ) ) {
		return VELORA_URI . '/assets/images/velora-category-' . $term->slug . '.svg';
	}
	return VELORA_URI . '/assets/images/velora-editorial-texture.svg';
}

/**
 * Footer "Shop" column links — pulled from real product category terms
 * (top-level, ordered by menu order) instead of the demo's hardcoded
 * Dresses/Outerwear/Knitwear/Accessories list, so a merchant's own
 * category set appears automatically.
 */
function velora_footer_shop_links() {
	$links = array();
	$terms = get_terms(
		array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
			'parent'     => 0,
			'orderby'    => 'menu_order',
			'number'     => 4,
		)
	);
	if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
		foreach ( $terms as $term ) {
			$links[ $term->name ] = get_term_link( $term );
		}
	} else {
		$links[ __( 'Shop All', 'velora' ) ] = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
	}
	return $links;
}

/* =============================================================
 * 3. Cart drawer rendering + AJAX fragments
 *
 * The same three render functions back BOTH the initial server render in
 * header.php and the wc-cart-fragments AJAX refresh below, so there is a
 * single source of truth for the cart drawer's markup.
 * ============================================================= */

function velora_freeship_threshold() {
	// Matches the demo's "Free shipping on orders over ₹4,000" copy.
	return apply_filters( 'velora_freeship_threshold', 4000 );
}

function velora_render_freeship_bar() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart ) {
		return;
	}
	$threshold = velora_freeship_threshold();
	$subtotal  = (float) WC()->cart->get_subtotal();
	$remaining = max( 0, $threshold - $subtotal );
	$pct       = $threshold > 0 ? min( 100, round( ( $subtotal / $threshold ) * 100 ) ) : 100;
	if ( $remaining <= 0 ) {
		echo '<p>' . esc_html__( "You've unlocked free shipping!", 'velora' ) . '</p>';
	} else {
		echo '<p>' . sprintf(
			/* translators: %s: price needed for free shipping. */
			esc_html__( 'Add %s more for free shipping', 'velora' ),
			wp_kses_post( wc_price( $remaining ) )
		) . '</p>';
	}
	echo '<div class="freeship-track"><div class="freeship-fill" style="width:' . esc_attr( $pct ) . '%"></div></div>';
}

function velora_render_cart_drawer_items() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart || WC()->cart->is_empty() ) {
		?>
		<div class="cart-empty">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>
			<h3><?php esc_html_e( 'Your cart is empty', 'velora' ); ?></h3>
			<p class="text-muted"><?php esc_html_e( 'Looks like you haven\'t added anything yet.', 'velora' ); ?></p>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Start Shopping', 'velora' ); ?></a>
		</div>
		<?php
		return;
	}
	foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
		$product = $cart_item['data'];
		if ( ! $product || ! $product->exists() || $cart_item['quantity'] <= 0 ) {
			continue;
		}
		$thumbnail = $product->get_image( 'thumbnail' );
		$permalink = $product->get_permalink( $cart_item );
		?>
		<div class="cart-line" data-cart-key="<?php echo esc_attr( $cart_item_key ); ?>">
			<a href="<?php echo esc_url( $permalink ); ?>"><?php echo $thumbnail; // phpcs:ignore ?></a>
			<div>
				<div class="cart-line-name"><a href="<?php echo esc_url( $permalink ); ?>"><?php echo wp_kses_post( $product->get_name() ); ?></a></div>
				<div class="cart-line-variant"><?php echo wc_get_formatted_cart_item_data( $cart_item ); // phpcs:ignore ?></div>
				<a href="<?php echo esc_url( wc_get_cart_remove_url( $cart_item_key ) ); ?>" class="cart-line-remove remove_from_cart_button" data-cart_item_key="<?php echo esc_attr( $cart_item_key ); ?>"><?php esc_html_e( 'Remove', 'velora' ); ?></a>
			</div>
			<div class="cart-line-price"><?php echo wp_kses_post( WC()->cart->get_product_subtotal( $product, $cart_item['quantity'] ) ); ?></div>
		</div>
		<?php
	}
}

function velora_render_cart_drawer_foot() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart ) {
		return;
	}
	$cart = WC()->cart;
	?>
	<div class="summary-row"><span><?php esc_html_e( 'Subtotal', 'velora' ); ?></span><span data-subtotal><?php echo wp_kses_post( wc_price( $cart->get_subtotal() ) ); ?></span></div>
	<?php if ( $cart->get_cart_discount_total() > 0 ) : ?>
	<div class="summary-row" data-discount-row><span><?php esc_html_e( 'Discount', 'velora' ); ?></span><span class="discount-amt" data-discount>-<?php echo wp_kses_post( wc_price( $cart->get_cart_discount_total() ) ); ?></span></div>
	<?php endif; ?>
	<div class="summary-row"><span><?php esc_html_e( 'Shipping', 'velora' ); ?></span><span data-shipping><?php esc_html_e( 'Calculated at checkout', 'velora' ); ?></span></div>
	<div class="summary-row total"><span><?php esc_html_e( 'Total', 'velora' ); ?></span><span data-total><?php echo wp_kses_post( wc_price( $cart->get_total( 'edit' ) ) ); ?></span></div>
	<a href="<?php echo esc_url( wc_get_cart_url() ); ?>" class="btn btn-outline btn-block" style="margin-top:16px"><?php esc_html_e( 'View Cart', 'velora' ); ?></a>
	<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="btn btn-primary btn-block" style="margin-top:10px"><?php esc_html_e( 'Checkout', 'velora' ); ?></a>
	<?php
}

/**
 * wc-cart-fragments hook: whenever an item is added/removed/updated via
 * AJAX, WooCommerce core re-runs this filter and swaps out any element in
 * the DOM matching each key with the fresh HTML — this is what keeps the
 * header cart count and the whole drawer live without a page reload.
 */
function velora_cart_fragments( $fragments ) {
	if ( ! WC()->cart ) {
		return $fragments;
	}
	$count = WC()->cart->get_cart_contents_count();

	ob_start();
	?>
	<span class="icon-count" data-cart-count style="<?php echo $count ? '' : 'display:none'; ?>"><?php echo (int) $count; ?></span>
	<?php
	$fragments['[data-cart-count]'] = ob_get_clean();

	ob_start();
	?>
	<div class="cart-drawer-items" data-cart-drawer-items><?php velora_render_cart_drawer_items(); ?></div>
	<?php
	$fragments['[data-cart-drawer-items]'] = ob_get_clean();

	ob_start();
	?>
	<div class="cart-drawer-foot" data-cart-drawer-foot><?php velora_render_cart_drawer_foot(); ?></div>
	<?php
	$fragments['[data-cart-drawer-foot]'] = ob_get_clean();

	ob_start();
	?>
	<div class="freeship-bar" data-freeship-bar><?php velora_render_freeship_bar(); ?></div>
	<?php
	$fragments['[data-freeship-bar]'] = ob_get_clean();

	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'velora_cart_fragments' );

/* =============================================================
 * 4. Star rating — replace WC's %-width stars with the demo's
 *    Unicode ★/☆ glyphs (span.stars), reused across cards, PDP,
 *    quick view and testimonials so there's exactly one rating look.
 * ============================================================= */
function velora_rating_html( $html, $rating, $count ) {
	$rounded = round( $rating );
	$stars   = '';
	for ( $i = 1; $i <= 5; $i++ ) {
		$stars .= ( $i <= $rounded ) ? '★' : '☆';
	}
	return '<span class="stars">' . $stars . '</span><span class="rating-text">' . esc_html( number_format( $rating, 1 ) ) . ' (' . (int) $count . ')</span>';
}
add_filter( 'woocommerce_product_get_rating_html', 'velora_rating_html', 10, 3 );

/**
 * Sale badge — replace the default <span class="onsale">Sale!</span> with
 * the demo's .product-badge.badge-sale + computed discount percentage.
 */
function velora_sale_flash( $html, $post, $product ) {
	if ( ! $product instanceof WC_Product || ! $product->is_on_sale() ) {
		return $html;
	}
	$regular = (float) $product->get_regular_price();
	$sale    = (float) $product->get_price();
	$percent = ( $regular > 0 ) ? round( ( ( $regular - $sale ) / $regular ) * 100 ) : 0;
	return '<span class="product-badge badge-sale">' . sprintf(
		/* translators: %d: discount percentage. */
		esc_html__( '-%d%%', 'velora' ),
		$percent
	) . '</span>';
}
add_filter( 'woocommerce_sale_flash', 'velora_sale_flash', 10, 3 );

/**
 * Add-to-cart button copy — matches the demo's "Add to Cart" casing.
 */
add_filter( 'woocommerce_product_single_add_to_cart_text', fn() => __( 'Add to Cart', 'velora' ) );
add_filter( 'woocommerce_product_add_to_cart_text', fn() => __( 'Add to Cart', 'velora' ) );

/* =============================================================
 * 5. Products-per-page / grid columns — matches the demo's 4-column
 *    .product-grid and 16-per-page shop listing.
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
 * 6. Shop / category archive layout — filters aside + page-band
 *
 * Fully hook-based: WooCommerce's own woocommerce_output_content_wrapper()
 * (hooked to woocommerce_before_main_content @10) still prints <main>. We
 * only add extra open/close divs around it at neighbouring priorities so
 * the aside sits inside <main> alongside the native product loop —
 * archive-product.php itself is never copied into the theme.
 * ============================================================= */
function velora_shop_is_archive() {
	return is_shop() || is_product_category() || is_product_tag();
}

/**
 * On shop/category/tag archives we print our own woocommerce_breadcrumb()
 * call manually inside the .page-band wrapper (see velora_open_page_band
 * below), so the DEFAULT `woocommerce_breadcrumb` hook (core, priority 20
 * on woocommerce_before_main_content) must be removed there or it would
 * render a second, unstyled breadcrumb right after ours. Single product
 * pages are untouched and keep using that default hook — see the
 * .woocommerce-breadcrumb CSS in style.css §15 that styles it directly.
 */
function velora_maybe_remove_default_breadcrumb() {
	if ( velora_shop_is_archive() ) {
		remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
	}
}
add_action( 'wp', 'velora_maybe_remove_default_breadcrumb' );

function velora_open_page_band() {
	if ( ! velora_shop_is_archive() ) {
		return;
	}
	echo '<div class="page-band"><div class="container">';
	woocommerce_breadcrumb( array( 'wrap_before' => '<div class="breadcrumb"><ol>', 'wrap_after' => '</ol></div>', 'before' => '<li>', 'after' => '</li>' ) );
}
add_action( 'woocommerce_before_main_content', 'velora_open_page_band', 15 );

function velora_close_page_band() {
	if ( ! velora_shop_is_archive() ) {
		return;
	}
	if ( is_shop() ) {
		echo '<h1>' . esc_html( __( 'Shop All', 'velora' ) ) . '</h1><p>' . esc_html__( 'Every Velora piece currently in season — in one place.', 'velora' ) . '</p>';
	} else {
		$term = get_queried_object();
		echo '<h1>' . esc_html( single_term_title( '', false ) ) . '</h1>';
		if ( ! empty( $term->description ) ) {
			echo '<p>' . wp_kses_post( $term->description ) . '</p>';
		}
	}
	echo '</div></div>'; // .container .page-band
	echo '<div class="container"><div class="shop-layout">';
	velora_shop_filters_aside();
	echo '<div>';
}
add_action( 'woocommerce_before_main_content', 'velora_close_page_band', 21 );

function velora_shop_filters_aside() {
	?>
	<aside class="filters-aside" aria-label="<?php esc_attr_e( 'Product filters', 'velora' ); ?>">
		<div class="aside-drawer-head">
			<h3 style="font-size:1.1rem"><?php esc_html_e( 'Filters', 'velora' ); ?></h3>
			<button class="drawer-close" data-filter-drawer-close aria-label="<?php esc_attr_e( 'Close filters', 'velora' ); ?>">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
			</button>
		</div>

		<div class="filter-group">
			<h4><?php esc_html_e( 'Category', 'velora' ); ?> <span class="chevron">▾</span></h4>
			<div class="filter-body">
				<?php
				$cats = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true, 'parent' => 0 ) );
				if ( ! is_wp_error( $cats ) ) {
					foreach ( $cats as $cat ) {
						$active = is_product_category( $cat->slug );
						printf(
							'<label class="checkbox-row"><input type="checkbox" onclick="window.location.href=\'%1$s\'" %2$s> %3$s (%4$d)</label>',
							esc_url( get_term_link( $cat ) ),
							$active ? 'checked' : '',
							esc_html( $cat->name ),
							(int) $cat->count
						);
					}
				}
				?>
			</div>
		</div>

		<?php if ( taxonomy_exists( 'pa_size' ) && ! is_wp_error( get_terms( 'pa_size' ) ) && get_terms( 'pa_size' ) ) : ?>
		<div class="filter-group">
			<h4><?php esc_html_e( 'Size', 'velora' ); ?> <span class="chevron">▾</span></h4>
			<div class="filter-body"><?php the_widget( 'WC_Widget_Layered_Nav', array( 'attribute' => 'size', 'title' => '', 'display_type' => 'list' ) ); ?></div>
		</div>
		<?php endif; ?>

		<?php if ( taxonomy_exists( 'pa_color' ) && ! is_wp_error( get_terms( 'pa_color' ) ) && get_terms( 'pa_color' ) ) : ?>
		<div class="filter-group">
			<h4><?php esc_html_e( 'Colour', 'velora' ); ?> <span class="chevron">▾</span></h4>
			<div class="filter-body"><?php the_widget( 'WC_Widget_Layered_Nav', array( 'attribute' => 'color', 'title' => '', 'display_type' => 'list' ) ); ?></div>
		</div>
		<?php endif; ?>

		<div class="filter-group">
			<h4><?php esc_html_e( 'Price', 'velora' ); ?> <span class="chevron">▾</span></h4>
			<div class="filter-body"><?php the_widget( 'WC_Widget_Price_Filter', array( 'title' => '' ) ); ?></div>
		</div>

		<div class="filter-group">
			<h4><?php esc_html_e( 'Rating', 'velora' ); ?> <span class="chevron">▾</span></h4>
			<div class="filter-body"><?php the_widget( 'WC_Widget_Rating_Filter', array( 'title' => '' ) ); ?></div>
		</div>

		<div class="filter-group">
			<h4><?php esc_html_e( 'Availability', 'velora' ); ?> <span class="chevron">▾</span></h4>
			<div class="filter-body"><?php the_widget( 'WC_Widget_Layered_Nav_Filters', array( 'title' => '' ) ); ?></div>
		</div>

		<div class="aside-drawer-foot"><button type="button" class="btn btn-primary btn-block" data-filter-drawer-apply><?php esc_html_e( 'Show Results', 'velora' ); ?></button></div>
	</aside>
	<?php
}

/**
 * Toolbar structure we're threading WooCommerce's own core hooks
 * through (all on woocommerce_before_shop_loop), matching the demo's
 * exact nesting:
 *
 *   <div class="shop-toolbar">                     [5]  open
 *     <span class="result-count">...</span>         [20] WC core: woocommerce_result_count
 *     <div class="toolbar-right">                   [21] open (right after result count)
 *       <button class="filter-drawer-trigger">      [21] Filters button (mobile only, CSS-hidden on desktop)
 *       <div class="select-wrap"><select>...</select></div>  [30] WC core: woocommerce_catalog_ordering
 *     </div>                                        [31] close toolbar-right
 *   </div>                                          [31] close shop-toolbar
 */
function velora_open_shop_toolbar() {
	if ( ! velora_shop_is_archive() ) {
		return;
	}
	echo '<div class="shop-toolbar">';
}
add_action( 'woocommerce_before_shop_loop', 'velora_open_shop_toolbar', 5 );

function velora_open_toolbar_right() {
	if ( ! velora_shop_is_archive() ) {
		return;
	}
	echo '<div class="toolbar-right">';
	echo '<button type="button" class="btn btn-outline btn-sm filter-drawer-trigger" data-filter-drawer-open>' . esc_html__( 'Filters', 'velora' ) . '</button>';
}
add_action( 'woocommerce_before_shop_loop', 'velora_open_toolbar_right', 21 );

function velora_close_shop_toolbar() {
	if ( ! velora_shop_is_archive() ) {
		return;
	}
	echo '</div>'; // .toolbar-right
	echo '</div>'; // .shop-toolbar
}
add_action( 'woocommerce_before_shop_loop', 'velora_close_shop_toolbar', 31 );

function velora_close_shop_layout() {
	if ( ! velora_shop_is_archive() ) {
		return;
	}
	echo '</div></div></div>'; // results column, .shop-layout, .container
}
add_action( 'woocommerce_after_main_content', 'velora_close_shop_layout', 5 );

/* =============================================================
 * 7. Single product — eyebrow category, stock message, Buy Now
 *    button, wishlist button, "SKU / Brand" meta row spacing.
 * ============================================================= */

function velora_pdp_category_eyebrow() {
	global $product;
	if ( ! $product ) {
		return;
	}
	$cats = wc_get_product_category_list( $product->get_id() );
	if ( $cats ) {
		echo '<p class="eyebrow">' . wp_kses_post( $cats ) . '</p>';
	}
}
add_action( 'woocommerce_single_product_summary', 'velora_pdp_category_eyebrow', 4 );

function velora_pdp_stock_message() {
	global $product;
	if ( ! $product ) {
		return;
	}
	if ( ! $product->is_in_stock() ) {
		echo '<p class="stock-msg out-of-stock">' . esc_html__( 'Currently out of stock.', 'velora' ) . '</p>';
		return;
	}
	$qty = $product->get_stock_quantity();
	if ( $product->managing_stock() && null !== $qty && $qty <= 5 ) {
		echo '<p class="stock-msg low-stock">' . sprintf(
			/* translators: %d: number of items left in stock. */
			esc_html__( 'Only %d left in stock — order soon.', 'velora' ),
			(int) $qty
		) . '</p>';
	} else {
		echo '<p class="stock-msg in-stock">' . esc_html__( 'In stock, ready to ship.', 'velora' ) . '</p>';
	}
}
add_action( 'woocommerce_single_product_summary', 'velora_pdp_stock_message', 15 );

/**
 * Trust row + SKU/Brand meta, right after the add-to-cart form (see
 * section 8 below for the form wrapper itself).
 */
function velora_pdp_trust_row() {
	?>
	<div class="trust-row">
		<div class="trust-item">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1" y="7" width="15" height="10" rx="1"/><path d="M16 10h3l3 3v4h-6"/><circle cx="6" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/></svg>
			<span><?php echo esc_html( sprintf( __( 'Free delivery on orders over %s, 3-5 business days across India.', 'velora' ), wp_strip_all_tags( wc_price( velora_freeship_threshold() ) ) ) ); ?></span>
		</div>
		<div class="trust-item">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/></svg>
			<span><?php esc_html_e( '30-day returns and exchanges on unworn items with tags attached.', 'velora' ); ?></span>
		</div>
		<div class="trust-item">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 2 4 5v6c0 5 3.4 8.4 8 11 4.6-2.6 8-6 8-11V5z"/></svg>
			<span><?php esc_html_e( 'Secure checkout with card, UPI or cash on delivery.', 'velora' ); ?></span>
		</div>
	</div>
	<?php
}
add_action( 'woocommerce_single_product_summary', 'velora_pdp_trust_row', 35 );

/* =============================================================
 * 8. Add-to-cart form: wrap quantity+button in .pdp-actions, add the
 *    wishlist heart button, and a "Buy Now" button that piggy-backs on
 *    the SAME form submit (see the redirect filter below) so it works
 *    for simple AND variable products without any custom AJAX.
 * ============================================================= */
$GLOBALS['velora_pdp_actions_open'] = false;

add_action(
	'woocommerce_before_add_to_cart_quantity',
	function () {
		global $velora_pdp_actions_open;
		echo '<div class="pdp-actions">';
		$velora_pdp_actions_open = true;
	}
);

add_action(
	'woocommerce_after_add_to_cart_button',
	function () {
		global $product, $velora_pdp_actions_open;
		$product_id = $product ? $product->get_id() : 0;
		$in_wishlist = function_exists( 'velora_is_in_wishlist' ) && velora_is_in_wishlist( $product_id );
		printf(
			'<button type="button" class="btn-icon wishlist-toggle %1$s" data-wishlist-toggle data-id="%2$d" aria-label="%3$s" aria-pressed="%4$s"><svg viewBox="0 0 24 24" stroke-width="1.6" fill="none" stroke="currentColor" width="18" height="18"><path d="M12 21s-7.5-4.6-10-9.2C0.3 8.3 2 4.5 5.7 4c2-.3 3.7.7 4.9 2.3C11.8 4.7 13.5 3.7 15.5 4c3.7.5 5.4 4.3 3.7 7.8C20 16.4 12 21 12 21z"/></svg></button>',
			$in_wishlist ? 'is-active' : '',
			(int) $product_id,
			esc_attr__( 'Add to wishlist', 'velora' ),
			$in_wishlist ? 'true' : 'false'
		);
		if ( $velora_pdp_actions_open ) {
			echo '</div>'; // .pdp-actions
			$velora_pdp_actions_open = false;
		}
		printf(
			'<button type="submit" name="velora_buy_now" value="1" class="btn btn-outline btn-block">%s</button>',
			esc_html__( 'Buy Now', 'velora' )
		);
	}
);

/**
 * "Buy Now" — the button above is a second submit button inside
 * WooCommerce's own <form class="cart">, so clicking it still POSTs the
 * chosen variation/quantity through WooCommerce's normal add-to-cart
 * handling. We only need to catch the extra field and redirect straight
 * to checkout instead of back to the product page.
 */
function velora_buy_now_redirect( $url ) {
	if ( isset( $_REQUEST['velora_buy_now'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- native WC add-to-cart request, no state change beyond WC's own handling.
		return wc_get_checkout_url();
	}
	return $url;
}
add_filter( 'woocommerce_add_to_cart_redirect', 'velora_buy_now_redirect' );

/* =============================================================
 * 9. Product tabs — rename/reorder to match the demo's Overview /
 *    Features / Materials / Size Guide / Shipping / Returns / Care.
 *    Content sources, documented per tab:
 *      - Overview: product short description (native WC field)
 *      - Features: postmeta `_velora_features` — newline-separated list,
 *        editable via a Custom Fields box on the product edit screen
 *      - Materials: postmeta `_velora_materials` — plain text/HTML
 *      - Size Guide: postmeta `_velora_size_guide` — HTML (e.g. a table)
 *      - Shipping / Returns / Care: postmeta `_velora_shipping`,
 *        `_velora_returns`, `_velora_care` — HTML; each falls back to a
 *        sensible store-wide default copy (matching the demo's copy)
 *        when the postmeta is empty, so new products aren't blank.
 * ============================================================= */
function velora_product_tabs( $tabs ) {
	global $product;
	if ( ! $product ) {
		return $tabs;
	}
	$id = $product->get_id();

	// Overview — rename WooCommerce's core Description tab.
	if ( isset( $tabs['description'] ) ) {
		$tabs['description']['title']    = __( 'Overview', 'velora' );
		$tabs['description']['priority'] = 10;
	}
	// Drop the default Additional Information (attributes) tab; attribute
	// data is folded into the variations form + Size Guide tab instead.
	unset( $tabs['additional_information'] );

	$custom = array(
		'velora_features'    => array( __( 'Features', 'velora' ), '_velora_features', 20, 'list' ),
		'velora_materials'   => array( __( 'Materials', 'velora' ), '_velora_materials', 30, 'html' ),
		'velora_size_guide'  => array( __( 'Size Guide', 'velora' ), '_velora_size_guide', 40, 'html' ),
		'velora_shipping'    => array( __( 'Shipping', 'velora' ), '_velora_shipping', 50, 'html' ),
		'velora_returns'     => array( __( 'Returns', 'velora' ), '_velora_returns', 60, 'html' ),
		'velora_care'        => array( __( 'Care', 'velora' ), '_velora_care', 70, 'html' ),
	);

	foreach ( $custom as $key => $data ) {
		list( $title, $meta_key, $priority, $type ) = $data;
		$tabs[ $key ] = array(
			'title'    => $title,
			'priority' => $priority,
			'callback' => function () use ( $id, $meta_key, $type, $title ) {
				velora_render_product_tab( $id, $meta_key, $type, $title );
			},
		);
	}

	return $tabs;
}
add_filter( 'woocommerce_product_tabs', 'velora_product_tabs' );

function velora_render_product_tab( $product_id, $meta_key, $type, $title ) {
	$value = get_post_meta( $product_id, $meta_key, true );

	$defaults = array(
		'_velora_shipping' => __( 'Standard delivery takes 3-5 business days and is free on orders over ₹4,000. Express and international options are shown at checkout.', 'velora' ),
		'_velora_returns'  => __( 'We accept returns and exchanges within 30 days of delivery on unworn items with original tags attached. Refunds are issued to the original payment method within 5-7 business days of us receiving the return.', 'velora' ),
		'_velora_care'     => __( 'Dry clean or hand wash cold depending on fabric. Do not tumble dry. Iron on low heat, inside out, if needed.', 'velora' ),
	);
	if ( '' === $value && isset( $defaults[ $meta_key ] ) ) {
		$value = $defaults[ $meta_key ];
	}

	echo '<h2>' . esc_html( $title ) . '</h2>';

	if ( '' === $value ) {
		echo '<p class="text-muted">' . esc_html__( 'No details added for this product yet.', 'velora' ) . '</p>';
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
 * 10. FAQ accordion + FAQPage JSON-LD
 *
 * Populate per-product FAQs with postmeta key `_velora_faq`, stored as a
 * serialized array of ['q' => ..., 'a' => ...] pairs, e.g.:
 *
 *   update_post_meta( $product_id, '_velora_faq', array(
 *       array( 'q' => 'Does this run true to size?', 'a' => 'Yes — see the Size Guide tab.' ),
 *       array( 'q' => 'Is this machine washable?', 'a' => 'Hand wash cold only; see the Care tab.' ),
 *   ) );
 *
 * A merchant/developer can also build a small metabox or ACF Repeater
 * field group targeting this same meta key — the accordion and the
 * FAQPage JSON-LD both read directly from it, so what's rendered always
 * matches what's declared in the schema.
 * ============================================================= */
function velora_get_product_faqs( $product_id ) {
	$faqs = get_post_meta( $product_id, '_velora_faq', true );
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

function velora_pdp_faq_accordion() {
	global $product;
	if ( ! $product ) {
		return;
	}
	$faqs = velora_get_product_faqs( $product->get_id() );
	if ( empty( $faqs ) ) {
		return;
	}
	?>
	<div class="faq-accordion">
		<h2><?php esc_html_e( 'Frequently Asked Questions', 'velora' ); ?></h2>
		<div data-pdp-faqs>
			<?php foreach ( $faqs as $faq ) : ?>
				<div class="faq-item" data-faq-item>
					<button type="button" class="faq-question" aria-expanded="false"><?php echo esc_html( $faq['q'] ); ?><span class="plus">+</span></button>
					<div class="faq-answer"><p><?php echo wp_kses_post( $faq['a'] ); ?></p></div>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
	<?php
}
add_action( 'woocommerce_after_single_product_summary', 'velora_pdp_faq_accordion', 25 );

/* =============================================================
 * 11. Recently viewed products
 *
 * WooCommerce core does not ship a "recently viewed" template out of the
 * box (that's normally a separate extension) — this is a small,
 * genuinely hook-based implementation: a cookie of product IDs, written
 * on woocommerce_before_single_product, rendered via wc_get_products()
 * so it is always real store data, never a fake list.
 * ============================================================= */
function velora_track_recently_viewed() {
	if ( ! is_singular( 'product' ) ) {
		return;
	}
	global $product;
	if ( ! $product ) {
		return;
	}
	$viewed = ! empty( $_COOKIE['velora_recently_viewed'] ) ? explode( '|', sanitize_text_field( wp_unslash( $_COOKIE['velora_recently_viewed'] ) ) ) : array();
	$viewed = array_diff( $viewed, array( (string) $product->get_id() ) );
	array_unshift( $viewed, (string) $product->get_id() );
	$viewed = array_slice( array_filter( $viewed, 'is_numeric' ), 0, 8 );
	wc_setcookie( 'velora_recently_viewed', implode( '|', $viewed ), time() + DAY_IN_SECONDS * 30 );
}
add_action( 'woocommerce_before_single_product', 'velora_track_recently_viewed' );

function velora_recently_viewed_ids( $exclude_id = 0 ) {
	if ( empty( $_COOKIE['velora_recently_viewed'] ) ) {
		return array();
	}
	$ids = array_map( 'absint', explode( '|', sanitize_text_field( wp_unslash( $_COOKIE['velora_recently_viewed'] ) ) ) );
	$ids = array_filter( $ids, fn( $id ) => $id && $id !== (int) $exclude_id );
	return array_slice( $ids, 0, 4 );
}

function velora_pdp_recently_viewed() {
	global $product;
	$ids = velora_recently_viewed_ids( $product ? $product->get_id() : 0 );
	if ( empty( $ids ) || ! function_exists( 'wc_get_products' ) ) {
		return;
	}
	$products = wc_get_products( array( 'include' => $ids, 'orderby' => 'post__in', 'status' => 'publish' ) );
	if ( empty( $products ) ) {
		return;
	}
	?>
	<section class="recently-viewed">
		<div class="container">
			<div class="section-head"><h2><?php esc_html_e( 'Recently Viewed', 'velora' ); ?></h2></div>
			<ul class="products">
				<?php
				foreach ( $products as $recent_product ) {
					$GLOBALS['product'] = $recent_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
					wc_get_template_part( 'content', 'product' );
				}
				?>
			</ul>
		</div>
	</section>
	<?php
	$GLOBALS['product'] = $product;
}
add_action( 'woocommerce_after_single_product_summary', 'velora_pdp_recently_viewed', 40 );

/* =============================================================
 * 12. JSON-LD: Product/Offer + BreadcrumbList (+ FAQPage when present)
 * ============================================================= */
function velora_product_jsonld() {
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
	$terms = get_the_terms( $product->get_id(), 'product_cat' );
	$position = count( $crumbs ) + 1;
	if ( $terms && ! is_wp_error( $terms ) ) {
		$term = current( $terms );
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
	$faqs = velora_get_product_faqs( $product->get_id() );
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
	// velora_seo_plugin_active() docblock above).
	if ( velora_seo_plugin_active() ) {
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
			'name'  => 'Velora',
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
add_action( 'wp_head', 'velora_product_jsonld' );

/**
 * Open Graph / Twitter tags — only when no SEO plugin already covers
 * this, to avoid ever printing duplicate meta tags on the same page.
 */
function velora_social_meta_tags() {
	if ( velora_seo_plugin_active() ) {
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
		<meta property="og:title" content="<?php echo esc_attr( get_bloginfo( 'name' ) . ' — Premium Fashion & Modern Essentials' ); ?>">
		<meta property="og:description" content="<?php echo esc_attr( get_bloginfo( 'description' ) ); ?>">
		<meta property="og:type" content="website">
		<meta property="og:url" content="<?php echo esc_url( home_url( '/' ) ); ?>">
		<meta property="og:site_name" content="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
		<meta name="twitter:card" content="summary_large_image">
		<?php
	}
}
add_action( 'wp_head', 'velora_social_meta_tags' );

/* =============================================================
 * 13. Quick View — AJAX endpoint returning a compact product summary
 *    for the modal declared in header.php. Always built from a real
 *    WC_Product; never hardcoded.
 * ============================================================= */
function velora_ajax_quick_view() {
	check_ajax_referer( 'velora_quick_view', 'nonce' );
	$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$product    = $product_id ? wc_get_product( $product_id ) : null;
	if ( ! $product ) {
		wp_send_json_error( array( 'message' => __( 'Product not found.', 'velora' ) ) );
	}

	ob_start();
	$image_id  = $product->get_image_id();
	$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'large' ) : wc_placeholder_img_src();
	?>
	<div class="qv-media"><img src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( $product->get_name() ); ?>"></div>
	<div class="qv-body">
		<p class="eyebrow"><?php echo wp_kses_post( wc_get_product_category_list( $product->get_id() ) ); ?></p>
		<h3><?php echo esc_html( $product->get_name() ); ?></h3>
		<div class="product-rating"><?php echo wp_kses_post( wc_get_rating_html( $product->get_average_rating(), $product->get_review_count() ) ); ?></div>
		<div class="product-price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
		<p class="desc"><?php echo wp_kses_post( wp_trim_words( wp_strip_all_tags( $product->get_short_description() ? $product->get_short_description() : $product->get_description() ), 30 ) ); ?></p>
		<a href="<?php echo esc_url( $product->add_to_cart_url() ); ?>" class="btn btn-primary btn-block"><?php echo esc_html( $product->is_purchasable() && $product->is_type( 'simple' ) ? __( 'Add to Cart', 'velora' ) : __( 'View Full Details', 'velora' ) ); ?></a>
		<a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" class="btn-text" style="margin-top:12px;display:inline-block"><?php esc_html_e( 'View Full Details', 'velora' ); ?> &rarr;</a>
	</div>
	<?php
	wp_send_json_success( array( 'html' => ob_get_clean() ) );
}
add_action( 'wp_ajax_velora_quick_view', 'velora_ajax_quick_view' );
add_action( 'wp_ajax_nopriv_velora_quick_view', 'velora_ajax_quick_view' );

/* =============================================================
 * 14. Newsletter subscribe (front-end forms in footer/homepage) — no
 *    email service is wired up out of the box (that depends on the
 *    merchant's provider), so this just validates + fires an action
 *    hook a mail-provider integration can listen for.
 * ============================================================= */
function velora_ajax_newsletter_subscribe() {
	check_ajax_referer( 'velora_wishlist', 'nonce' ); // shares the general front-end nonce; no state-changing WP data is touched.
	$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	if ( ! is_email( $email ) ) {
		wp_send_json_error( array( 'message' => __( 'Please enter a valid email address.', 'velora' ) ) );
	}
	/**
	 * Fires when a visitor submits the newsletter form. Hook a mail
	 * provider's API call (Mailchimp, Klaviyo, etc.) here.
	 */
	do_action( 'velora_newsletter_subscribed', $email );
	wp_send_json_success( array( 'message' => __( 'Thanks for subscribing to Velora.', 'velora' ) ) );
}
add_action( 'wp_ajax_velora_newsletter_subscribe', 'velora_ajax_newsletter_subscribe' );
add_action( 'wp_ajax_nopriv_velora_newsletter_subscribe', 'velora_ajax_newsletter_subscribe' );

/* =============================================================
 * 15. Live search suggestions for the header search overlay — backs
 *    the same real WC_Product data as everywhere else via wc_get_products'
 *    's' search argument (core WooCommerce product search).
 * ============================================================= */
function velora_ajax_search_suggest() {
	check_ajax_referer( 'velora_quick_view', 'nonce' );
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
		echo '<p class="search-empty-hint">' . esc_html__( 'No products matched your search.', 'velora' ) . '</p>';
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
add_action( 'wp_ajax_velora_search_suggest', 'velora_ajax_search_suggest' );
add_action( 'wp_ajax_nopriv_velora_search_suggest', 'velora_ajax_search_suggest' );
