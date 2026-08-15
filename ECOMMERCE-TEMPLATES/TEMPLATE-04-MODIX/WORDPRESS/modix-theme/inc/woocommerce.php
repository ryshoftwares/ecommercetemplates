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
 * button, quick view/quick add row — has no clean hook seam in the default
 * template; WooCommerce itself expects content-product.php to be
 * themeable, so this is the WooCommerce-recommended override, not a bypass
 * of it).
 *
 * @package Modix
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* =============================================================
 * 1. Mega menu — built from REAL WooCommerce product_cat taxonomy
 *
 * Every top-level category in the MODIX demo's nav (Audio, Smartphones,
 * Laptops, Smart Home, Wearables) opens its OWN mega panel: a links column
 * ("Shop All <Category>" + up to 3 real products + "View All") and a
 * 3-product highlight grid with mini spec-chip tags and price. Nothing
 * here is a hardcoded product/category name — it is always the real
 * product_cat term and its real products.
 * ============================================================= */
function modix_mega_menu_categories( $limit = 5 ) {
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

/**
 * Real products for a category's mega panel / mobile submenu, ordered by
 * menu order so a merchant can control which 3 products get the spotlight.
 */
function modix_mega_menu_products( $term, $limit = 3 ) {
	if ( ! function_exists( 'wc_get_products' ) ) {
		return array();
	}
	return wc_get_products(
		array(
			'category' => array( $term->slug ),
			'limit'    => $limit,
			'orderby'  => 'menu_order',
			'order'    => 'ASC',
			'status'   => 'publish',
		)
	);
}

/**
 * Two short spec-chip strings for a product's mega-panel highlight card.
 * Prefers curated postmeta `_modix_spec_highlights` (newline or comma
 * separated short tags, e.g. "40hr Battery\nANC") so a merchant can pick
 * exactly which two specs are marketing-worthy; falls back to the first
 * two rows of the real `_modix_specifications` table so a new product
 * never shows an empty chip row.
 */
function modix_product_spec_chips( $product_id, $limit = 2 ) {
	$curated = get_post_meta( $product_id, '_modix_spec_highlights', true );
	if ( $curated ) {
		$chips = preg_split( '/[\n,]+/', $curated );
		$chips = array_values( array_filter( array_map( 'trim', $chips ) ) );
		if ( ! empty( $chips ) ) {
			return array_slice( $chips, 0, $limit );
		}
	}
	$specs = modix_get_specifications( $product_id );
	$chips = array();
	foreach ( array_slice( $specs, 0, $limit ) as $row ) {
		$chips[] = $row['value'];
	}
	return $chips;
}

function modix_render_mega_menu( $term ) {
	$products = modix_mega_menu_products( $term, 3 );
	?>
	<div class="mega-panel">
		<div class="mega-panel__inner">
			<div class="mega-panel__links">
				<span class="mega-panel__title"><?php echo esc_html( sprintf( __( 'Browse %s', 'modix' ), $term->name ) ); ?></span>
				<a href="<?php echo esc_url( get_term_link( $term ) ); ?>"><?php echo esc_html( sprintf( __( 'Shop All %s', 'modix' ), $term->name ) ); ?></a>
				<?php foreach ( $products as $mega_product ) : ?>
					<a href="<?php echo esc_url( get_permalink( $mega_product->get_id() ) ); ?>"><?php echo esc_html( $mega_product->get_name() ); ?></a>
				<?php endforeach; ?>
				<a class="is-viewall" href="<?php echo esc_url( get_term_link( $term ) ); ?>"><?php echo esc_html( sprintf( __( 'View All %s →', 'modix' ), $term->name ) ); ?></a>
			</div>
			<div class="mega-panel__products">
				<?php foreach ( $products as $mega_product ) :
					$image_id  = $mega_product->get_image_id();
					$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'modix-mega-product' ) : wc_placeholder_img_src();
					$chips     = modix_product_spec_chips( $mega_product->get_id(), 2 );
					?>
					<a class="mega-product" href="<?php echo esc_url( get_permalink( $mega_product->get_id() ) ); ?>">
						<div class="mega-product__image"><img src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( $mega_product->get_name() ); ?>" width="120" height="120" loading="lazy"></div>
						<div class="mega-product__name"><?php echo esc_html( $mega_product->get_name() ); ?></div>
						<?php if ( ! empty( $chips ) ) : ?>
							<div class="mega-product__chips"><?php foreach ( $chips as $chip ) : ?><span class="spec-chip"><?php echo esc_html( $chip ); ?></span><?php endforeach; ?></div>
						<?php endif; ?>
						<div class="mega-product__price"><?php echo wp_kses_post( wc_price( wc_get_price_to_display( $mega_product ) ) ); ?></div>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</div>
	<?php
}

/**
 * Footer "Shop" column links — pulled from real product category terms
 * (top-level, ordered by menu order) instead of a hardcoded Audio /
 * Smartphones / Laptops / Smart Home / Wearables list, so a merchant's own
 * category set appears automatically.
 */
function modix_footer_shop_links() {
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
		$links[ __( 'Shop All', 'modix' ) ] = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
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
 * Free-shipping progress threshold, matching the demo's real copy
 * ("Free shipping over ₹2,999") quoted in the announcement bar, utility
 * strip and PDP trust row.
 */
function modix_freeship_threshold() {
	return apply_filters( 'modix_freeship_threshold', 2999 );
}

function modix_render_freeship_bar() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart ) {
		return;
	}
	$threshold = modix_freeship_threshold();
	$subtotal  = (float) WC()->cart->get_subtotal();
	$remaining = max( 0, $threshold - $subtotal );
	$pct       = $threshold > 0 ? min( 100, round( ( $subtotal / $threshold ) * 100 ) ) : 100;
	?>
	<div class="cart-drawer__progress">
		<?php if ( $remaining <= 0 ) : ?>
			<p><strong><?php esc_html_e( "You've unlocked free shipping", 'modix' ); ?></strong></p>
		<?php else : ?>
			<p>
				<?php
				printf(
					/* translators: %s: price remaining to unlock free shipping. */
					esc_html__( 'Add %s more for free shipping', 'modix' ),
					wp_kses_post( wc_price( $remaining ) )
				);
				?>
			</p>
		<?php endif; ?>
		<div class="progress-bar"><div class="progress-bar__fill" style="width:<?php echo esc_attr( $pct ); ?>%"></div></div>
	</div>
	<?php
}

function modix_render_cart_drawer_items() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart || WC()->cart->is_empty() ) {
		?>
		<div class="empty-state">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h2l2.6 12.6a2 2 0 002 1.4h8.8a2 2 0 002-1.6L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="17" cy="21" r="1"/></svg>
			<h3><?php esc_html_e( 'Your cart is empty', 'modix' ); ?></h3>
			<p><?php esc_html_e( 'Browse the lineup to find your next device.', 'modix' ); ?></p>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Shop All Products', 'modix' ); ?></a>
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
		$meta      = wc_get_formatted_cart_item_data( $cart_item );
		?>
		<div class="cart-item" data-cart-key="<?php echo esc_attr( $cart_item_key ); ?>">
			<div class="cart-item__media"><a href="<?php echo esc_url( $permalink ); ?>"><?php echo $thumbnail; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WC image markup. ?></a></div>
			<div>
				<h4 class="cart-item__name"><a href="<?php echo esc_url( $permalink ); ?>"><?php echo wp_kses_post( $product->get_name() ); ?></a></h4>
				<?php if ( $meta ) : ?><div class="cart-item__variant"><?php echo wp_kses_post( $meta ); ?></div><?php endif; ?>
				<div class="cart-item__row">
					<span class="cart-item__price"><?php echo wp_kses_post( WC()->cart->get_product_subtotal( $product, $cart_item['quantity'] ) ); ?></span>
					<a href="<?php echo esc_url( wc_get_cart_remove_url( $cart_item_key ) ); ?>" class="cart-item__remove remove_from_cart_button" data-cart_item_key="<?php echo esc_attr( $cart_item_key ); ?>"><?php esc_html_e( 'Remove', 'modix' ); ?></a>
				</div>
			</div>
		</div>
		<?php
	}
}

function modix_render_cart_drawer_footer() {
	if ( ! class_exists( 'WooCommerce' ) || ! WC()->cart ) {
		return;
	}
	?>
	<div class="cart-drawer__subtotal"><span><?php esc_html_e( 'Subtotal', 'modix' ); ?></span><span data-cart-subtotal><?php echo wp_kses_post( wc_price( WC()->cart->get_subtotal() ) ); ?></span></div>
	<a href="<?php echo esc_url( wc_get_cart_url() ); ?>" class="btn btn-ghost btn-block"><?php esc_html_e( 'View Cart', 'modix' ); ?></a>
	<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="btn btn-primary btn-block"><?php esc_html_e( 'Checkout', 'modix' ); ?></a>
	<?php
}

/**
 * wc-cart-fragments hook: whenever an item is added/removed/updated via
 * AJAX, WooCommerce core re-runs this filter and swaps out any element in
 * the DOM matching each key with the fresh HTML — this is what keeps the
 * header cart count and the whole drawer live without a page reload.
 */
function modix_cart_fragments( $fragments ) {
	if ( ! WC()->cart ) {
		return $fragments;
	}
	$count = WC()->cart->get_cart_contents_count();

	ob_start();
	?>
	<span class="icon-btn__badge" data-cart-count style="<?php echo $count ? '' : 'display:none'; ?>"><?php echo (int) $count; ?></span>
	<?php
	$fragments['[data-cart-count]'] = ob_get_clean();

	ob_start();
	?>
	<div class="cart-drawer__items" data-cart-drawer-items><?php modix_render_cart_drawer_items(); ?></div>
	<?php
	$fragments['[data-cart-drawer-items]'] = ob_get_clean();

	ob_start();
	?>
	<div class="cart-drawer__footer" data-cart-drawer-footer><?php modix_render_cart_drawer_footer(); ?></div>
	<?php
	$fragments['[data-cart-drawer-footer]'] = ob_get_clean();

	ob_start();
	modix_render_freeship_bar();
	$fragments['[data-cart-drawer-progress]'] = ob_get_clean();

	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'modix_cart_fragments' );

/* =============================================================
 * 3. Star rating — replace WC's %-width stars with the demo's compact
 *    ★/☆ glyphs inside .rating__stars, reused everywhere: cards, PDP,
 *    quick view and the reviews grid, so there's exactly one rating look.
 * ============================================================= */
function modix_rating_html( $html, $rating, $count ) {
	$rounded = round( $rating );
	$stars   = '';
	for ( $i = 1; $i <= 5; $i++ ) {
		$stars .= ( $i <= $rounded ) ? '★' : '☆';
	}
	return '<span class="rating"><span class="rating__stars" aria-hidden="true">' . $stars . '</span><span class="rating__count">' . number_format_i18n( $rating, 1 ) . ' (' . (int) $count . ')</span></span>';
}
add_filter( 'woocommerce_product_get_rating_html', 'modix_rating_html', 10, 3 );

/**
 * Sale badge — replace the default <span class="onsale">Sale!</span> with
 * the demo's .badge.badge--sale + computed discount percentage.
 */
function modix_sale_flash( $html, $post, $product ) {
	if ( ! $product instanceof WC_Product || ! $product->is_on_sale() ) {
		return $html;
	}
	$regular = (float) $product->get_regular_price();
	$sale    = (float) $product->get_price();
	$percent = ( $regular > 0 ) ? round( ( ( $regular - $sale ) / $regular ) * 100 ) : 0;
	return '<span class="badge badge--sale">' . sprintf(
		/* translators: %d: discount percentage. */
		esc_html__( '-%d%%', 'modix' ),
		$percent
	) . '</span>';
}
add_filter( 'woocommerce_sale_flash', 'modix_sale_flash', 10, 3 );

/**
 * Add-to-cart button copy — matches the demo's "Add to Cart" casing.
 */
add_filter( 'woocommerce_product_single_add_to_cart_text', fn() => __( 'Add to Cart', 'modix' ) );
add_filter( 'woocommerce_product_add_to_cart_text', fn() => __( 'Add to Cart', 'modix' ) );

/* =============================================================
 * 4. Products-per-page / grid columns — matches the demo's 4-column
 *    .product-grid and 16-per-page shop listing ("16 products").
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
add_filter( 'woocommerce_upsell_display_args', fn( $args ) => wp_parse_args( array( 'posts_per_page' => 4, 'columns' => 4 ), $args ) );

/**
 * Swap WooCommerce's default <ul class="products columns-N"> loop wrapper
 * for the demo's <div class="product-grid">. Used by the shop/category
 * archive loop AND (because WooCommerce's related/upsell templates call
 * the same two hooks) the related-products and upsell loops, so every
 * product grid in the theme shares one CSS grid component.
 */
add_filter( 'woocommerce_product_loop_start', fn() => '<div class="product-grid">' );
add_filter( 'woocommerce_product_loop_end', fn() => '</div>' );

/**
 * Relabel WooCommerce's default "Related products" heading to match the
 * demo's "You May Also Like" copy without overriding related.php.
 */
add_filter(
	'gettext',
	function ( $translated, $text, $domain ) {
		if ( 'woocommerce' === $domain && 'Related products' === $text ) {
			return __( 'You May Also Like', 'modix' );
		}
		return $translated;
	},
	10,
	3
);

/* =============================================================
 * 5. Shop / category archive layout — filters aside + page-header band
 *
 * Fully hook-based: WooCommerce's own woocommerce_output_content_wrapper()
 * (hooked to woocommerce_before_main_content @10) still prints <main>. We
 * only add extra open/close divs around it at neighbouring priorities so
 * the aside sits inside <main> alongside the native product loop —
 * archive-product.php itself is never copied into the theme.
 * ============================================================= */
function modix_shop_is_archive() {
	return is_shop() || is_product_category() || is_product_tag();
}

/**
 * On shop/category/tag archives we print our own woocommerce_breadcrumb()
 * call manually inside the .page-header wrapper (see modix_open_page_header
 * below), so the DEFAULT `woocommerce_breadcrumb` hook (core, priority 20
 * on woocommerce_before_main_content) must be removed there or it would
 * render a second, unstyled breadcrumb right after ours. Single product
 * pages are untouched and keep using that default hook.
 */
function modix_maybe_remove_default_breadcrumb() {
	if ( modix_shop_is_archive() ) {
		remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
	}
}
add_action( 'wp', 'modix_maybe_remove_default_breadcrumb' );

function modix_open_page_header() {
	if ( ! modix_shop_is_archive() ) {
		return;
	}
	echo '<div class="page-header"><div class="container">';
	echo '<nav class="breadcrumb" aria-label="' . esc_attr__( 'Breadcrumb', 'modix' ) . '">';
	woocommerce_breadcrumb( array( 'wrap_before' => '', 'wrap_after' => '', 'before' => '', 'after' => '<span class="breadcrumb__sep">/</span>', 'delimiter' => '' ) );
	echo '</nav>';
	if ( is_shop() ) {
		echo '<h1>' . esc_html__( 'Shop All Products', 'modix' ) . '</h1>';
		echo '<p class="page-header__intro">' . esc_html__( 'Every current Modix smartphone, laptop, audio, smart home and wearable device in one place. Use the filters to narrow by category, price, rating or availability — every listed spec comes straight from our product data sheets.', 'modix' ) . '</p>';
	} else {
		echo '<h1>' . esc_html( single_term_title( '', false ) ) . '</h1>';
		$term = get_queried_object();
		if ( ! empty( $term->description ) ) {
			echo '<p class="page-header__intro">' . wp_kses_post( $term->description ) . '</p>';
		}
	}
	echo '</div></div>';
	echo '<div class="container section" data-shop-page><div class="shop-layout">';
	modix_shop_filters_aside();
	echo '<div>';
}
add_action( 'woocommerce_before_main_content', 'modix_open_page_header', 15 );

function modix_shop_filters_aside() {
	?>
	<div class="overlay-scrim" data-filters-scrim></div>
	<aside class="filters-sidebar">
		<div class="filters-sidebar__header">
			<h3 style="font-size:16px;"><?php esc_html_e( 'Filters', 'modix' ); ?></h3>
			<div style="display:flex;gap:12px;align-items:center;">
				<a href="<?php echo esc_url( modix_shop_is_archive() && is_product_category() ? get_term_link( get_queried_object() ) : ( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ) ); ?>" class="quick-view-btn"><?php esc_html_e( 'Clear All', 'modix' ); ?></a>
				<button class="icon-btn filters-drawer-close" type="button" data-filters-drawer-close aria-label="<?php esc_attr_e( 'Close filters', 'modix' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
			</div>
		</div>
		<div class="filter-group">
			<div class="filter-group__title"><span><?php esc_html_e( 'Category', 'modix' ); ?></span></div>
			<div class="filter-group__body">
				<?php
				$cats = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true, 'parent' => 0 ) );
				if ( ! is_wp_error( $cats ) ) {
					foreach ( $cats as $cat ) {
						printf(
							'<label class="checkbox-row"><input type="checkbox" onclick="window.location.href=\'%1$s\'" %2$s> %3$s (%4$d)</label>',
							esc_url( get_term_link( $cat ) ),
							is_product_category( $cat->slug ) ? 'checked' : '',
							esc_html( $cat->name ),
							(int) $cat->count
						);
					}
				}
				?>
			</div>
		</div>
		<div class="filter-group">
			<div class="filter-group__title"><span><?php esc_html_e( 'Price', 'modix' ); ?></span></div>
			<div class="filter-group__body"><?php the_widget( 'WC_Widget_Price_Filter', array( 'title' => '' ) ); ?></div>
		</div>
		<?php if ( taxonomy_exists( 'pa_color' ) && ! is_wp_error( get_terms( 'pa_color' ) ) && get_terms( 'pa_color' ) ) : ?>
		<div class="filter-group">
			<div class="filter-group__title"><span><?php esc_html_e( 'Color', 'modix' ); ?></span></div>
			<div class="filter-group__body"><?php the_widget( 'WC_Widget_Layered_Nav', array( 'attribute' => 'color', 'title' => '', 'display_type' => 'list' ) ); ?></div>
		</div>
		<?php endif; ?>
		<div class="filter-group">
			<div class="filter-group__title"><span><?php esc_html_e( 'Rating', 'modix' ); ?></span></div>
			<div class="filter-group__body"><?php the_widget( 'WC_Widget_Rating_Filter', array( 'title' => '' ) ); ?></div>
		</div>
		<div class="filter-group">
			<div class="filter-group__title"><span><?php esc_html_e( 'Availability', 'modix' ); ?></span></div>
			<div class="filter-group__body"><?php the_widget( 'WC_Widget_Layered_Nav_Filters', array( 'title' => '' ) ); ?></div>
		</div>
	</aside>
	<?php
}

/**
 * Toolbar structure threaded through WooCommerce's own core hooks (all on
 * woocommerce_before_shop_loop), matching the demo's grid-toolbar nesting.
 */
function modix_open_grid_toolbar() {
	if ( ! modix_shop_is_archive() ) {
		return;
	}
	echo '<div class="grid-toolbar">';
	echo '<button type="button" class="btn btn-ghost mobile-filter-toggle" data-mobile-filter-toggle><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg> ' . esc_html__( 'Filters', 'modix' ) . '</button>';
}
add_action( 'woocommerce_before_shop_loop', 'modix_open_grid_toolbar', 5 );

function modix_open_toolbar_right() {
	if ( ! modix_shop_is_archive() ) {
		return;
	}
	echo '<div class="grid-toolbar__right">';
}
add_action( 'woocommerce_before_shop_loop', 'modix_open_toolbar_right', 21 );

function modix_close_grid_toolbar() {
	if ( ! modix_shop_is_archive() ) {
		return;
	}
	echo '</div>'; // .grid-toolbar__right
	echo '</div>'; // .grid-toolbar
}
add_action( 'woocommerce_before_shop_loop', 'modix_close_grid_toolbar', 31 );

function modix_close_shop_layout() {
	if ( ! modix_shop_is_archive() ) {
		return;
	}
	echo '</div></div></div>'; // results column, .shop-layout, .container.section
}
add_action( 'woocommerce_after_main_content', 'modix_close_shop_layout', 5 );

/* =============================================================
 * 6. Single product — eyebrow category, stock message, Buy Now button,
 *    wishlist button, trust badges.
 * ============================================================= */

function modix_pdp_category_eyebrow() {
	global $product;
	if ( ! $product ) {
		return;
	}
	$cats = wc_get_product_category_list( $product->get_id() );
	if ( $cats ) {
		echo '<p class="pdp-info__category">' . wp_kses_post( $cats ) . '</p>';
	}
}
add_action( 'woocommerce_single_product_summary', 'modix_pdp_category_eyebrow', 4 );

function modix_pdp_stock_message() {
	global $product;
	if ( ! $product ) {
		return;
	}
	if ( ! $product->is_in_stock() ) {
		echo '<p class="pdp-stock is-low"><span class="dot"></span>' . esc_html__( 'Currently out of stock', 'modix' ) . '</p>';
		return;
	}
	$qty = $product->get_stock_quantity();
	if ( $product->managing_stock() && null !== $qty && $qty <= 5 ) {
		echo '<p class="pdp-stock is-low"><span class="dot"></span>' . sprintf(
			/* translators: %d: number of items left in stock. */
			esc_html__( 'Only %d left in stock — order soon', 'modix' ),
			(int) $qty
		) . '</p>';
	} else {
		echo '<p class="pdp-stock"><span class="dot"></span>' . esc_html__( 'In stock, ready to ship', 'modix' ) . '</p>';
	}
}
add_action( 'woocommerce_single_product_summary', 'modix_pdp_stock_message', 15 );

/**
 * Trust row, right after the add-to-cart form. Copy matches the demo's
 * product.html trust-badges row (free shipping threshold, warranty,
 * 7-day returns).
 */
function modix_pdp_trust_row() {
	?>
	<ul class="pdp-trust">
		<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l2.6 12.6a2 2 0 002 1.4h8.8a2 2 0 002-1.6L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="17" cy="21" r="1"/></svg>
			<?php
			printf(
				/* translators: %s: free shipping order threshold. */
				esc_html__( 'Free shipping over %s', 'modix' ),
				wp_strip_all_tags( wc_price( modix_freeship_threshold() ) )
			);
			?>
		</li>
		<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/></svg><?php esc_html_e( 'Manufacturer warranty', 'modix' ); ?></li>
		<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v6h6M20 20v-6h-6"/><path d="M5 14a8 8 0 0014 3M19 10A8 8 0 005 7"/></svg><?php esc_html_e( '7-day easy returns', 'modix' ); ?></li>
	</ul>
	<?php
}
add_action( 'woocommerce_single_product_summary', 'modix_pdp_trust_row', 35 );

/* =============================================================
 * 7. Add-to-cart form: wrap quantity+button in .pdp-actions, add the
 *    wishlist heart button, and a "Buy Now" button that piggy-backs on
 *    the SAME form submit (see the redirect filter below) so it works
 *    for simple AND variable products without any custom AJAX.
 * ============================================================= */
$GLOBALS['modix_pdp_actions_open'] = false;

add_action(
	'woocommerce_before_add_to_cart_quantity',
	function () {
		global $modix_pdp_actions_open;
		echo '<div class="pdp-actions">';
		$modix_pdp_actions_open = true;
	}
);

add_action(
	'woocommerce_after_add_to_cart_button',
	function () {
		global $product, $modix_pdp_actions_open;
		$product_id  = $product ? $product->get_id() : 0;
		$in_wishlist = function_exists( 'modix_is_in_wishlist' ) && modix_is_in_wishlist( $product_id );
		if ( $modix_pdp_actions_open ) {
			echo '</div>'; // .pdp-actions
			$modix_pdp_actions_open = false;
		}
		printf(
			'<button type="submit" name="modix_buy_now" value="1" class="btn btn-dark">%s</button>',
			esc_html__( 'Buy Now', 'modix' )
		);
		?>
		<button type="button" class="icon-btn btn-icon pdp-wishlist-btn <?php echo $in_wishlist ? 'is-active' : ''; ?>" data-wishlist-toggle data-id="<?php echo esc_attr( $product_id ); ?>" aria-pressed="<?php echo $in_wishlist ? 'true' : 'false'; ?>" aria-label="<?php esc_attr_e( 'Add to wishlist', 'modix' ); ?>">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20.5s-7.5-4.6-10-9.4C.5 7.6 2.4 4 6 4c2.1 0 3.7 1.2 4.7 2.6 1-1.4 2.6-2.6 4.7-2.6 3.6 0 5.5 3.6 4 7.1-2.5 4.8-10 9.4-10 9.4z"/></svg>
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
function modix_buy_now_redirect( $url ) {
	if ( isset( $_REQUEST['modix_buy_now'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- native WC add-to-cart request, no state change beyond WC's own handling.
		return wc_get_checkout_url();
	}
	return $url;
}
add_filter( 'woocommerce_add_to_cart_redirect', 'modix_buy_now_redirect' );

/* =============================================================
 * 8. Specifications — postmeta `_modix_specifications`, a serialized
 *    array of ['label' => ..., 'value' => ...] pairs.
 * ============================================================= */
function modix_get_specifications( $product_id ) {
	$specs = get_post_meta( $product_id, '_modix_specifications', true );
	if ( ! is_array( $specs ) ) {
		return array();
	}
	return array_values(
		array_filter(
			$specs,
			function ( $row ) {
				return is_array( $row ) && ! empty( $row['label'] ) && isset( $row['value'] ) && '' !== $row['value'];
			}
		)
	);
}

function modix_render_spec_table( $product_id ) {
	$specs = modix_get_specifications( $product_id );
	if ( empty( $specs ) ) {
		echo '<p class="form-hint">' . esc_html__( 'No specifications added for this product yet.', 'modix' ) . '</p>';
		return;
	}
	echo '<table class="spec-table"><tbody>';
	foreach ( $specs as $row ) {
		echo '<tr><th>' . esc_html( $row['label'] ) . '</th><td>' . esc_html( $row['value'] ) . '</td></tr>';
	}
	echo '</tbody></table>';
}

/* =============================================================
 * 9. Product tabs — rename/reorder to match the demo's Overview / Key
 *    Features / Specifications / What's in the Box / Warranty /
 *    Shipping & Returns. Content sources, documented per tab:
 *      - Overview: native WC short description (product excerpt)
 *      - Key Features: postmeta `_modix_features` — newline-separated list
 *      - Specifications: postmeta `_modix_specifications` — spec-table
 *      - What's in the Box: postmeta `_modix_box_contents` — newline list
 *      - Warranty: postmeta `_modix_warranty` — plain text/HTML
 *      - Shipping & Returns: static store-wide copy (matches demo exactly)
 *    Each falls back to sensible default copy when postmeta is empty, so
 *    new products are never blank.
 * ============================================================= */
function modix_product_tabs( $tabs ) {
	global $product;
	if ( ! $product ) {
		return $tabs;
	}
	$id = $product->get_id();

	if ( isset( $tabs['description'] ) ) {
		$tabs['description']['title']    = __( 'Overview', 'modix' );
		$tabs['description']['priority'] = 10;
	}
	unset( $tabs['additional_information'] );

	$tabs['modix_features'] = array(
		'title'    => __( 'Key Features', 'modix' ),
		'priority' => 20,
		'callback' => function () use ( $id ) {
			modix_render_list_tab( $id, '_modix_features', __( 'Key Features', 'modix' ), 'feature-list' );
		},
	);
	$tabs['modix_specifications'] = array(
		'title'    => __( 'Specifications', 'modix' ),
		'priority' => 30,
		'callback' => function () use ( $id ) {
			echo '<h2>' . esc_html__( 'Specifications', 'modix' ) . '</h2>';
			modix_render_spec_table( $id );
		},
	);
	$tabs['modix_box'] = array(
		'title'    => __( "What's in the Box", 'modix' ),
		'priority' => 40,
		'callback' => function () use ( $id ) {
			modix_render_box_contents_tab( $id );
		},
	);
	$tabs['modix_warranty'] = array(
		'title'    => __( 'Warranty', 'modix' ),
		'priority' => 50,
		'callback' => function () use ( $id ) {
			$value = get_post_meta( $id, '_modix_warranty', true );
			if ( '' === $value ) {
				$value = __( '1-year international limited warranty covering manufacturing defects in materials and workmanship. See our Shipping & Returns page for the full policy and how to start a claim.', 'modix' );
			}
			echo '<h2>' . esc_html__( 'Warranty', 'modix' ) . '</h2>';
			echo '<p>' . wp_kses_post( $value ) . '</p>';
		},
	);
	$tabs['modix_shipping'] = array(
		'title'    => __( 'Shipping & Returns', 'modix' ),
		'priority' => 60,
		'callback' => function () {
			?>
			<h2><?php esc_html_e( 'Shipping & Returns', 'modix' ); ?></h2>
			<p>
				<?php
				printf(
					/* translators: %s: free shipping order threshold. */
					esc_html__( 'Orders over %s ship free; orders below that threshold carry a flat shipping fee. Most in-stock items leave our warehouse within 1-2 business days and arrive within 3-6 business days depending on your location.', 'modix' ),
					wp_strip_all_tags( wc_price( modix_freeship_threshold() ) )
				);
				?>
			</p>
			<p><?php esc_html_e( 'Not the right fit? Unused products in original packaging can be returned within 7 days of delivery for a full refund.', 'modix' ); ?></p>
			<?php
		},
	);

	return $tabs;
}
add_filter( 'woocommerce_product_tabs', 'modix_product_tabs' );

function modix_render_list_tab( $product_id, $meta_key, $title, $list_class ) {
	$value = get_post_meta( $product_id, $meta_key, true );
	echo '<h2>' . esc_html( $title ) . '</h2>';
	if ( '' === $value ) {
		echo '<p class="form-hint">' . esc_html__( 'No details added for this product yet.', 'modix' ) . '</p>';
		return;
	}
	$lines = array_filter( array_map( 'trim', explode( "\n", $value ) ) );
	echo '<ul class="' . esc_attr( $list_class ) . '">';
	foreach ( $lines as $line ) {
		echo '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' . wp_kses_post( $line ) . '</li>';
	}
	echo '</ul>';
}

function modix_render_box_contents_tab( $product_id ) {
	$value = get_post_meta( $product_id, '_modix_box_contents', true );
	echo '<h2>' . esc_html__( "What's in the Box", 'modix' ) . '</h2>';
	if ( '' === $value ) {
		echo '<p class="form-hint">' . esc_html__( 'No box-contents list added for this product yet.', 'modix' ) . '</p>';
		return;
	}
	$lines = array_filter( array_map( 'trim', explode( "\n", $value ) ) );
	echo '<ul class="box-contents-list">';
	foreach ( $lines as $i => $line ) {
		echo '<li><span class="count">' . esc_html( $i + 1 ) . '</span>' . wp_kses_post( $line ) . '</li>';
	}
	echo '</ul>';
}

/* =============================================================
 * 10. Variation "swatch" pills — restyle WooCommerce's native variation
 *    <select> as the demo's circular color swatches (pa_color) or
 *    rectangular option pills (any other attribute, e.g. storage) without
 *    touching WooCommerce's own variations.js: the real <select> stays in
 *    the DOM (hidden via CSS), and assets/js/theme.js just forwards
 *    swatch clicks onto it and fires a native change event.
 * ============================================================= */
function modix_variation_swatches( $html, $args ) {
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

	$select_id  = isset( $args['id'] ) ? $args['id'] : sanitize_title( $attribute );
	$selected   = isset( $args['selected'] ) ? $args['selected'] : '';
	$taxonomy   = 0 === strpos( $attribute, 'attribute_pa_' ) ? str_replace( 'attribute_', '', $attribute ) : '';
	$is_color   = false !== stripos( $attribute, 'color' ) || false !== stripos( $attribute, 'colour' );
	$list_class = $is_color ? 'option-swatches' : 'option-pills';
	$item_class = $is_color ? 'option-swatch' : 'option-pill';

	ob_start();
	echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- original WC-built <select>, kept for variations.js.
	echo '<div class="' . esc_attr( $list_class ) . '" data-swatch-for="' . esc_attr( $select_id ) . '">';
	foreach ( $options as $option ) {
		$label = $option;
		$style = '';
		if ( $taxonomy && taxonomy_exists( $taxonomy ) ) {
			$term = get_term_by( 'slug', $option, $taxonomy );
			if ( $term && ! is_wp_error( $term ) ) {
				$label = $term->name;
				if ( $is_color ) {
					$hex = get_term_meta( $term->term_id, 'modix_color_hex', true );
					if ( $hex ) {
						$style = ' style="background:' . esc_attr( $hex ) . '"';
					}
				}
			}
		}
		if ( $is_color ) {
			printf(
				'<button type="button" class="%1$s%2$s" data-swatch-value="%3$s" aria-pressed="%4$s" title="%5$s"%6$s></button>',
				esc_attr( $item_class ),
				( $option === $selected ) ? ' is-active' : '',
				esc_attr( $option ),
				( $option === $selected ) ? 'true' : 'false',
				esc_attr( $label ),
				$style // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inline background-color built from esc_attr() above.
			);
		} else {
			printf(
				'<button type="button" class="%1$s%2$s" data-swatch-value="%3$s" aria-pressed="%4$s">%5$s</button>',
				esc_attr( $item_class ),
				( $option === $selected ) ? ' is-active' : '',
				esc_attr( $option ),
				( $option === $selected ) ? 'true' : 'false',
				esc_html( $label )
			);
		}
	}
	echo '</div>';
	return ob_get_clean();
}
add_filter( 'woocommerce_dropdown_variation_attribute_options_html', 'modix_variation_swatches', 10, 2 );

/* =============================================================
 * 11. FAQ accordion + FAQPage JSON-LD
 *
 * Populate per-product FAQs with postmeta key `_modix_faq`, stored as a
 * serialized array of ['q' => ..., 'a' => ...] pairs, e.g.:
 *
 *   update_post_meta( $product_id, '_modix_faq', array(
 *       array( 'q' => 'Does this work with Android and iPhone?', 'a' => 'Yes — …' ),
 *   ) );
 *
 * The accordion and the FAQPage JSON-LD both read directly from this same
 * meta key, so what's rendered always matches what's declared in schema.
 * ============================================================= */
function modix_get_product_faqs( $product_id ) {
	$faqs = get_post_meta( $product_id, '_modix_faq', true );
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

function modix_pdp_faq_accordion() {
	global $product;
	if ( ! $product ) {
		return;
	}
	$faqs = modix_get_product_faqs( $product->get_id() );
	if ( empty( $faqs ) ) {
		return;
	}
	?>
	<section class="pdp-tabs">
		<h3 style="margin-bottom:20px;"><?php esc_html_e( 'Frequently Asked Questions', 'modix' ); ?></h3>
		<div data-accordion-group>
			<?php foreach ( $faqs as $i => $faq ) : ?>
				<div class="accordion-item">
					<button class="accordion-item__header" type="button" aria-expanded="false">
						<?php echo esc_html( $faq['q'] ); ?>
						<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
					</button>
					<div class="accordion-item__body"><div class="accordion-item__body-inner"><p><?php echo wp_kses_post( $faq['a'] ); ?></p></div></div>
				</div>
			<?php endforeach; ?>
		</div>
	</section>
	<?php
}
add_action( 'woocommerce_after_single_product_summary', 'modix_pdp_faq_accordion', 30 );

/* =============================================================
 * 12. Compare-with-related spec strip — a small comparison table showing
 *    this product alongside its related products' `_modix_specifications`,
 *    matching the demo's PDP "compare" pattern.
 * ============================================================= */
function modix_pdp_compare_strip() {
	global $product;
	if ( ! $product || ! function_exists( 'wc_get_related_products' ) ) {
		return;
	}
	$related_ids = wc_get_related_products( $product->get_id(), 3 );
	if ( empty( $related_ids ) ) {
		return;
	}
	$products   = array_filter( array_map( 'wc_get_product', $related_ids ) );
	$all        = array_merge( array( $product ), $products );
	$spec_labels = array();
	foreach ( $all as $compare_product ) {
		foreach ( modix_get_specifications( $compare_product->get_id() ) as $row ) {
			$spec_labels[ $row['label'] ] = true;
		}
	}
	$spec_labels = array_slice( array_keys( $spec_labels ), 0, 5 );
	if ( empty( $spec_labels ) ) {
		return;
	}
	?>
	<section class="compare-related">
		<div class="section-header">
			<div class="section-header__text"><h2><?php esc_html_e( 'Compare with Related Products', 'modix' ); ?></h2></div>
		</div>
		<div class="compare-related__grid">
			<?php foreach ( $all as $compare_product ) :
				$specs = array();
				foreach ( modix_get_specifications( $compare_product->get_id() ) as $row ) {
					$specs[ $row['label'] ] = $row['value'];
				}
				?>
				<div class="compare-related__card<?php echo ( $compare_product->get_id() === $product->get_id() ) ? ' is-current' : ''; ?>">
					<a href="<?php echo esc_url( get_permalink( $compare_product->get_id() ) ); ?>" class="compare-related__name"><?php echo esc_html( $compare_product->get_name() ); ?></a>
					<div class="compare-related__price"><?php echo wp_kses_post( wc_price( wc_get_price_to_display( $compare_product ) ) ); ?></div>
					<div class="compare-related__specs">
						<?php foreach ( $spec_labels as $label ) : ?>
							<div class="compare-related__spec"><span><?php echo esc_html( $label ); ?></span><span><?php echo esc_html( isset( $specs[ $label ] ) ? $specs[ $label ] : '—' ); ?></span></div>
						<?php endforeach; ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
	</section>
	<?php
}
add_action( 'woocommerce_after_single_product_summary', 'modix_pdp_compare_strip', 15 );

/**
 * WooCommerce's own related-products output is hooked to
 * woocommerce_after_single_product_summary at priority 20 by default. We
 * move it later (priority 40) so the on-page order matches the demo:
 * tabs → compare strip (15) → FAQ (30) → related "You May Also Like" (40)
 * → recently viewed (50).
 */
function modix_reorder_related_products() {
	remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 20 );
	add_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 40 );
}
add_action( 'init', 'modix_reorder_related_products' );

/* =============================================================
 * 13. Recently viewed products
 *
 * WooCommerce core does not ship a "recently viewed" template out of the
 * box — this is a small, genuinely hook-based implementation: a cookie of
 * product IDs, written on woocommerce_before_single_product, rendered via
 * wc_get_products() so it is always real store data, never a fake list.
 * ============================================================= */
function modix_track_recently_viewed() {
	if ( ! is_singular( 'product' ) ) {
		return;
	}
	global $product;
	if ( ! $product ) {
		return;
	}
	$viewed = ! empty( $_COOKIE['modix_recently_viewed'] ) ? explode( '|', sanitize_text_field( wp_unslash( $_COOKIE['modix_recently_viewed'] ) ) ) : array();
	$viewed = array_diff( $viewed, array( (string) $product->get_id() ) );
	array_unshift( $viewed, (string) $product->get_id() );
	$viewed = array_slice( array_filter( $viewed, 'is_numeric' ), 0, 8 );
	wc_setcookie( 'modix_recently_viewed', implode( '|', $viewed ), time() + DAY_IN_SECONDS * 30 );
}
add_action( 'woocommerce_before_single_product', 'modix_track_recently_viewed' );

function modix_recently_viewed_ids( $exclude_id = 0 ) {
	if ( empty( $_COOKIE['modix_recently_viewed'] ) ) {
		return array();
	}
	$ids = array_map( 'absint', explode( '|', sanitize_text_field( wp_unslash( $_COOKIE['modix_recently_viewed'] ) ) ) );
	$ids = array_filter( $ids, fn( $id ) => $id && $id !== (int) $exclude_id );
	return array_slice( $ids, 0, 4 );
}

function modix_pdp_recently_viewed() {
	global $product;
	$ids = modix_recently_viewed_ids( $product ? $product->get_id() : 0 );
	if ( empty( $ids ) || ! function_exists( 'wc_get_products' ) ) {
		return;
	}
	$products = wc_get_products( array( 'include' => $ids, 'orderby' => 'post__in', 'status' => 'publish' ) );
	if ( empty( $products ) ) {
		return;
	}
	?>
	<section class="recently-viewed">
		<div class="section-header">
			<div class="section-header__text"><h2><?php esc_html_e( 'Recently Viewed', 'modix' ); ?></h2></div>
		</div>
		<div class="product-grid">
			<?php
			foreach ( $products as $recent_product ) {
				$GLOBALS['product'] = $recent_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
				wc_get_template_part( 'content', 'product' );
			}
			?>
		</div>
	</section>
	<?php
	$GLOBALS['product'] = $product;
}
add_action( 'woocommerce_after_single_product_summary', 'modix_pdp_recently_viewed', 50 );

/* =============================================================
 * 14. JSON-LD: Product/Offer + BreadcrumbList (+ FAQPage when present)
 * ============================================================= */
function modix_product_jsonld() {
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
	// page (see section 11), so the schema always matches visible content.
	$faqs = modix_get_product_faqs( $product->get_id() );
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
	// modix_seo_plugin_active() docblock in functions.php).
	if ( modix_seo_plugin_active() ) {
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
			'name'  => 'Modix',
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
add_action( 'wp_head', 'modix_product_jsonld' );

/**
 * Open Graph / Twitter tags — only when no SEO plugin already covers
 * this, to avoid ever printing duplicate meta tags on the same page.
 */
function modix_social_meta_tags() {
	if ( modix_seo_plugin_active() ) {
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
		<meta property="og:title" content="<?php echo esc_attr( get_bloginfo( 'name' ) . ' — Premium Electronics & Smart Technology' ); ?>">
		<meta property="og:description" content="<?php echo esc_attr( get_bloginfo( 'description' ) ); ?>">
		<meta property="og:type" content="website">
		<meta property="og:url" content="<?php echo esc_url( home_url( '/' ) ); ?>">
		<meta property="og:site_name" content="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
		<meta name="twitter:card" content="summary_large_image">
		<?php
	}
}
add_action( 'wp_head', 'modix_social_meta_tags' );

/* =============================================================
 * 15. Quick View — AJAX endpoint returning a compact product summary for
 *    the modal declared in header.php. Always built from a real
 *    WC_Product; never hardcoded.
 * ============================================================= */
function modix_ajax_quick_view() {
	check_ajax_referer( 'modix_quick_view', 'nonce' );
	$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$product    = $product_id ? wc_get_product( $product_id ) : null;
	if ( ! $product ) {
		wp_send_json_error( array( 'message' => __( 'Product not found.', 'modix' ) ) );
	}

	ob_start();
	$image_id  = $product->get_image_id();
	$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'modix-product-large' ) : wc_placeholder_img_src();
	?>
	<button type="button" class="icon-btn modal__close" data-quick-view-close aria-label="<?php esc_attr_e( 'Close quick view', 'modix' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
	<div class="modal__media"><img src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( $product->get_name() ); ?>"></div>
	<div>
		<p class="product-card__category"><?php echo wp_kses_post( wc_get_product_category_list( $product->get_id() ) ); ?></p>
		<h3><?php echo esc_html( $product->get_name() ); ?></h3>
		<div><?php echo wp_kses_post( wc_get_rating_html( $product->get_average_rating(), $product->get_review_count() ) ); ?></div>
		<div class="pdp-info__price" style="margin-top:12px;"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
		<p style="margin:12px 0;"><?php echo wp_kses_post( wp_trim_words( wp_strip_all_tags( $product->get_short_description() ? $product->get_short_description() : $product->get_description() ), 30 ) ); ?></p>
		<div class="pdp-actions">
			<a href="<?php echo esc_url( $product->add_to_cart_url() ); ?>" class="btn btn-primary"><?php echo esc_html( $product->is_purchasable() && $product->is_type( 'simple' ) ? __( 'Add to Cart', 'modix' ) : __( 'View Full Details', 'modix' ) ); ?></a>
			<button type="button" class="icon-btn btn-icon" data-wishlist-toggle data-id="<?php echo esc_attr( $product->get_id() ); ?>" aria-label="<?php esc_attr_e( 'Add to wishlist', 'modix' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20.5s-7.5-4.6-10-9.4C.5 7.6 2.4 4 6 4c2.1 0 3.7 1.2 4.7 2.6 1-1.4 2.6-2.6 4.7-2.6 3.6 0 5.5 3.6 4 7.1-2.5 4.8-10 9.4-10 9.4z"/></svg></button>
		</div>
		<a class="quick-view-btn" style="display:inline-block;margin-top:12px;" href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>"><?php esc_html_e( 'View full details →', 'modix' ); ?></a>
	</div>
	<?php
	wp_send_json_success( array( 'html' => ob_get_clean() ) );
}
add_action( 'wp_ajax_modix_quick_view', 'modix_ajax_quick_view' );
add_action( 'wp_ajax_nopriv_modix_quick_view', 'modix_ajax_quick_view' );

/* =============================================================
 * 16. Newsletter subscribe (footer/homepage forms) — no email service is
 *    wired up out of the box (that depends on the merchant's provider),
 *    so this just validates + fires an action hook a mail-provider
 *    integration can listen for.
 * ============================================================= */
function modix_ajax_newsletter_subscribe() {
	check_ajax_referer( 'modix_wishlist', 'nonce' ); // shares the general front-end nonce; no state-changing WP data is touched.
	$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	if ( ! is_email( $email ) ) {
		wp_send_json_error( array( 'message' => __( 'Please enter a valid email address.', 'modix' ) ) );
	}
	/**
	 * Fires when a visitor submits the newsletter form. Hook a mail
	 * provider's API call (Mailchimp, Klaviyo, etc.) here.
	 */
	do_action( 'modix_newsletter_subscribed', $email );
	wp_send_json_success( array( 'message' => __( "You're subscribed — thanks for joining the Modix insider list.", 'modix' ) ) );
}
add_action( 'wp_ajax_modix_newsletter_subscribe', 'modix_ajax_newsletter_subscribe' );
add_action( 'wp_ajax_nopriv_modix_newsletter_subscribe', 'modix_ajax_newsletter_subscribe' );

/* =============================================================
 * 17. Live search suggestions for the header search overlay — backs the
 *    same real WC_Product data as everywhere else via wc_get_products()'
 *    's' search argument (core WooCommerce product search).
 * ============================================================= */
function modix_ajax_search_suggest() {
	check_ajax_referer( 'modix_quick_view', 'nonce' );
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
		echo '<p class="form-hint">' . esc_html__( 'No products matched your search.', 'modix' ) . '</p>';
	}
	echo '<div class="search-suggestions__grid">';
	foreach ( $products as $sp ) {
		$image_id = $sp->get_image_id();
		$src      = $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : wc_placeholder_img_src();
		?>
		<a class="search-suggestion-card" href="<?php echo esc_url( get_permalink( $sp->get_id() ) ); ?>">
			<div class="search-suggestion-card__media"><img src="<?php echo esc_url( $src ); ?>" alt="<?php echo esc_attr( $sp->get_name() ); ?>"></div>
			<div class="search-suggestion-card__name"><?php echo esc_html( $sp->get_name() ); ?></div>
			<div class="search-suggestion-card__price"><?php echo wp_kses_post( $sp->get_price_html() ); ?></div>
		</a>
		<?php
	}
	echo '</div>';
	wp_send_json_success( array( 'html' => ob_get_clean() ) );
}
add_action( 'wp_ajax_modix_search_suggest', 'modix_ajax_search_suggest' );
add_action( 'wp_ajax_nopriv_modix_search_suggest', 'modix_ajax_search_suggest' );
