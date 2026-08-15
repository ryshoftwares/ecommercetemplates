<?php
/**
 * Lightweight custom wishlist.
 *
 * Storage: usermeta `_modix_wishlist` (array of product IDs) for
 * logged-in users, a `modix_wishlist` cookie (pipe-separated product IDs,
 * 180 days) for guests. Add/remove/toggle happens over one AJAX action
 * (`modix_wishlist_toggle`) registered for both wp_ajax_ and
 * wp_ajax_nopriv_ so guests get the same experience as the demo (the demo
 * wishlist has no login wall — it persists to localStorage there).
 *
 * Page choice: a DEDICATED PAGE (via the `[modix_wishlist]` shortcode +
 * template-wishlist.php) rather than a WooCommerce My Account endpoint,
 * because My Account endpoints only render for authenticated customers,
 * which would break the guest cookie path the demo relies on. A merchant
 * creates a Page (e.g. "Wishlist"), assigns it the "Modix: Wishlist"
 * template (or drops the `[modix_wishlist]` shortcode into any page), and
 * modix_get_wishlist_page_url() finds it automatically.
 *
 * @package Modix
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const MODIX_WISHLIST_USERMETA = '_modix_wishlist';
const MODIX_WISHLIST_COOKIE   = 'modix_wishlist';

/**
 * Current visitor's wishlisted product IDs, regardless of login state.
 */
function modix_get_wishlist_ids() {
	if ( is_user_logged_in() ) {
		$ids = get_user_meta( get_current_user_id(), MODIX_WISHLIST_USERMETA, true );
		return is_array( $ids ) ? array_map( 'absint', $ids ) : array();
	}
	if ( empty( $_COOKIE[ MODIX_WISHLIST_COOKIE ] ) ) {
		return array();
	}
	$raw = sanitize_text_field( wp_unslash( $_COOKIE[ MODIX_WISHLIST_COOKIE ] ) );
	return array_values( array_filter( array_map( 'absint', explode( '|', $raw ) ) ) );
}

function modix_save_wishlist_ids( $ids ) {
	$ids = array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) );
	if ( is_user_logged_in() ) {
		update_user_meta( get_current_user_id(), MODIX_WISHLIST_USERMETA, $ids );
	} else {
		// wc_setcookie() falls back to setcookie() with WooCommerce's
		// standard httponly/secure flags.
		$value = implode( '|', $ids );
		if ( function_exists( 'wc_setcookie' ) ) {
			wc_setcookie( MODIX_WISHLIST_COOKIE, $value, time() + DAY_IN_SECONDS * 180 );
		} else {
			setcookie( MODIX_WISHLIST_COOKIE, $value, time() + DAY_IN_SECONDS * 180, COOKIEPATH, COOKIE_DOMAIN );
		}
		$_COOKIE[ MODIX_WISHLIST_COOKIE ] = $value;
	}
	return $ids;
}

function modix_is_in_wishlist( $product_id ) {
	return in_array( (int) $product_id, modix_get_wishlist_ids(), true );
}

function modix_wishlist_count() {
	return count( modix_get_wishlist_ids() );
}

/**
 * On login, merge any guest cookie wishlist into the user's saved
 * wishlist so items picked before signing in aren't lost.
 */
function modix_merge_guest_wishlist_on_login( $user_login, $user ) {
	if ( empty( $_COOKIE[ MODIX_WISHLIST_COOKIE ] ) ) {
		return;
	}
	$guest_ids = array_filter( array_map( 'absint', explode( '|', sanitize_text_field( wp_unslash( $_COOKIE[ MODIX_WISHLIST_COOKIE ] ) ) ) ) );
	if ( empty( $guest_ids ) ) {
		return;
	}
	$existing = get_user_meta( $user->ID, MODIX_WISHLIST_USERMETA, true );
	$existing = is_array( $existing ) ? $existing : array();
	update_user_meta( $user->ID, MODIX_WISHLIST_USERMETA, array_values( array_unique( array_merge( $existing, $guest_ids ) ) ) );
	if ( function_exists( 'wc_setcookie' ) ) {
		wc_setcookie( MODIX_WISHLIST_COOKIE, '', time() - HOUR_IN_SECONDS );
	}
}
add_action( 'wp_login', 'modix_merge_guest_wishlist_on_login', 10, 2 );

/**
 * AJAX: add / remove / toggle a product. Accepts an explicit `action_type`
 * of add|remove|toggle (default toggle) so one endpoint backs both the
 * heart icon (toggle) and an explicit "Remove" action on the wishlist page.
 */
function modix_ajax_wishlist_toggle() {
	check_ajax_referer( 'modix_wishlist', 'nonce' );

	$product_id  = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$action_type = isset( $_POST['action_type'] ) ? sanitize_key( $_POST['action_type'] ) : 'toggle';

	if ( ! $product_id || ! get_post( $product_id ) ) {
		wp_send_json_error( array( 'message' => __( 'Invalid product.', 'modix' ) ) );
	}

	$ids     = modix_get_wishlist_ids();
	$in_list = in_array( $product_id, $ids, true );

	if ( 'add' === $action_type || ( 'toggle' === $action_type && ! $in_list ) ) {
		$ids[]  = $product_id;
		$active = true;
	} else {
		$ids    = array_diff( $ids, array( $product_id ) );
		$active = false;
	}

	$ids = modix_save_wishlist_ids( $ids );

	wp_send_json_success(
		array(
			'active'  => $active,
			'count'   => count( $ids ),
			'message' => $active ? __( 'Added to your wishlist.', 'modix' ) : __( 'Removed from your wishlist.', 'modix' ),
		)
	);
}
add_action( 'wp_ajax_modix_wishlist_toggle', 'modix_ajax_wishlist_toggle' );
add_action( 'wp_ajax_nopriv_modix_wishlist_toggle', 'modix_ajax_wishlist_toggle' );

/**
 * [modix_wishlist_count] — bare number, handy for menu badges built in
 * the Site Editor or inside a text widget.
 */
function modix_shortcode_wishlist_count() {
	return (string) modix_wishlist_count();
}
add_shortcode( 'modix_wishlist_count', 'modix_shortcode_wishlist_count' );

/**
 * [modix_wishlist] — full grid of wishlisted products using the same
 * content-product.php card as everywhere else, so wishlisted items get the
 * usual Add to Cart / Quick View controls plus a remove action.
 */
function modix_shortcode_wishlist() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return '<p>' . esc_html__( 'WooCommerce is required to display the wishlist.', 'modix' ) . '</p>';
	}
	$ids = modix_get_wishlist_ids();

	ob_start();
	?>
	<div class="grid-toolbar">
		<span class="grid-toolbar__count"><span data-wishlist-page-count><?php echo (int) count( $ids ); ?></span> <?php esc_html_e( 'saved products', 'modix' ); ?></span>
	</div>
	<?php if ( empty( $ids ) ) : ?>
		<div class="empty-state" data-wishlist-empty>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20.5s-7.5-4.6-10-9.4C.5 7.6 2.4 4 6 4c2.1 0 3.7 1.2 4.7 2.6 1-1.4 2.6-2.6 4.7-2.6 3.6 0 5.5 3.6 4 7.1-2.5 4.8-10 9.4-10 9.4z"/></svg>
			<h3><?php esc_html_e( 'Your wishlist is empty', 'modix' ); ?></h3>
			<p><?php esc_html_e( "Tap the heart icon on any product to save it here for later — it'll stay saved until you move it to your cart or remove it.", 'modix' ); ?></p>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Discover Products', 'modix' ); ?></a>
		</div>
	<?php else : ?>
		<div class="wishlist-grid" data-wishlist-grid>
			<?php
			$products = wc_get_products(
				array(
					'include' => $ids,
					'orderby' => 'post__in',
					'status'  => 'publish',
				)
			);
			global $product;
			foreach ( $products as $modix_wishlist_product ) {
				$product = $modix_wishlist_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
				wc_get_template_part( 'content', 'product' );
			}
			?>
		</div>
	<?php endif; ?>
	<?php
	return ob_get_clean();
}
add_shortcode( 'modix_wishlist', 'modix_shortcode_wishlist' );

/**
 * Resolve the wishlist page URL: prefer a page using template-wishlist.php,
 * then a page containing the [modix_wishlist] shortcode, else fall back to
 * the shop page so the header heart icon is never a dead link.
 */
function modix_get_wishlist_page_url() {
	static $url = null;
	if ( null !== $url ) {
		return $url;
	}
	$templated = get_posts(
		array(
			'post_type'      => 'page',
			'posts_per_page' => 1,
			'meta_key'       => '_wp_page_template', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_value'     => 'template-wishlist.php', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
		)
	);
	if ( ! empty( $templated ) ) {
		$url = get_permalink( $templated[0] );
		return $url;
	}
	$shortcoded = get_posts(
		array(
			'post_type'      => 'page',
			'posts_per_page' => 1,
			's'              => '[modix_wishlist]',
		)
	);
	if ( ! empty( $shortcoded ) ) {
		$url = get_permalink( $shortcoded[0] );
		return $url;
	}
	$url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
	return $url;
}
