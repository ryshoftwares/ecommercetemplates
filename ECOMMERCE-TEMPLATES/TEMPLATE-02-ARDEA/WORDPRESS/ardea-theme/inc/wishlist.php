<?php
/**
 * Lightweight custom wishlist.
 *
 * Storage: usermeta `_ardea_wishlist` (array of product IDs) for
 * logged-in users, an `ardea_wishlist` cookie (pipe-separated product IDs,
 * 180 days) for guests. Add/remove/toggle happens over one AJAX action
 * (`ardea_wishlist_toggle`) registered for both wp_ajax_ and
 * wp_ajax_nopriv_ so guests get the same experience as the demo (the demo
 * wishlist has no login wall).
 *
 * Page choice: a DEDICATED PAGE (via the `[ardea_wishlist]` shortcode +
 * template-wishlist.php) rather than a WooCommerce My Account endpoint,
 * because My Account endpoints only render for authenticated customers,
 * which would break the guest cookie path the demo relies on. A merchant
 * creates a Page (e.g. "Wishlist"), assigns it the "Ardea: Wishlist"
 * template (or drops the `[ardea_wishlist]` shortcode into any page), and
 * ardea_get_wishlist_page_url() finds it automatically.
 *
 * @package Ardea
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const ARDEA_WISHLIST_USERMETA = '_ardea_wishlist';
const ARDEA_WISHLIST_COOKIE   = 'ardea_wishlist';

/**
 * Current visitor's wishlisted product IDs, regardless of login state.
 */
function ardea_get_wishlist_ids() {
	if ( is_user_logged_in() ) {
		$ids = get_user_meta( get_current_user_id(), ARDEA_WISHLIST_USERMETA, true );
		return is_array( $ids ) ? array_map( 'absint', $ids ) : array();
	}
	if ( empty( $_COOKIE[ ARDEA_WISHLIST_COOKIE ] ) ) {
		return array();
	}
	$raw = sanitize_text_field( wp_unslash( $_COOKIE[ ARDEA_WISHLIST_COOKIE ] ) );
	return array_values( array_filter( array_map( 'absint', explode( '|', $raw ) ) ) );
}

function ardea_save_wishlist_ids( $ids ) {
	$ids = array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) );
	if ( is_user_logged_in() ) {
		update_user_meta( get_current_user_id(), ARDEA_WISHLIST_USERMETA, $ids );
	} else {
		// wc_setcookie() falls back to setcookie() with WooCommerce's
		// standard httponly/secure flags.
		$value = implode( '|', $ids );
		if ( function_exists( 'wc_setcookie' ) ) {
			wc_setcookie( ARDEA_WISHLIST_COOKIE, $value, time() + DAY_IN_SECONDS * 180 );
		} else {
			setcookie( ARDEA_WISHLIST_COOKIE, $value, time() + DAY_IN_SECONDS * 180, COOKIEPATH, COOKIE_DOMAIN );
		}
		$_COOKIE[ ARDEA_WISHLIST_COOKIE ] = $value;
	}
	return $ids;
}

function ardea_is_in_wishlist( $product_id ) {
	return in_array( (int) $product_id, ardea_get_wishlist_ids(), true );
}

function ardea_wishlist_count() {
	return count( ardea_get_wishlist_ids() );
}

/**
 * On login, merge any guest cookie wishlist into the user's saved
 * wishlist so items picked before signing in aren't lost.
 */
function ardea_merge_guest_wishlist_on_login( $user_login, $user ) {
	if ( empty( $_COOKIE[ ARDEA_WISHLIST_COOKIE ] ) ) {
		return;
	}
	$guest_ids = array_filter( array_map( 'absint', explode( '|', sanitize_text_field( wp_unslash( $_COOKIE[ ARDEA_WISHLIST_COOKIE ] ) ) ) ) );
	if ( empty( $guest_ids ) ) {
		return;
	}
	$existing = get_user_meta( $user->ID, ARDEA_WISHLIST_USERMETA, true );
	$existing = is_array( $existing ) ? $existing : array();
	update_user_meta( $user->ID, ARDEA_WISHLIST_USERMETA, array_values( array_unique( array_merge( $existing, $guest_ids ) ) ) );
	if ( function_exists( 'wc_setcookie' ) ) {
		wc_setcookie( ARDEA_WISHLIST_COOKIE, '', time() - HOUR_IN_SECONDS );
	}
}
add_action( 'wp_login', 'ardea_merge_guest_wishlist_on_login', 10, 2 );

/**
 * AJAX: add / remove / toggle a product. Accepts an explicit `action_type`
 * of add|remove|toggle (default toggle) so one endpoint backs both the
 * heart icon (toggle) and an explicit "Remove" action on the wishlist page.
 */
function ardea_ajax_wishlist_toggle() {
	check_ajax_referer( 'ardea_wishlist', 'nonce' );

	$product_id  = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$action_type = isset( $_POST['action_type'] ) ? sanitize_key( $_POST['action_type'] ) : 'toggle';

	if ( ! $product_id || ! get_post( $product_id ) ) {
		wp_send_json_error( array( 'message' => __( 'Invalid product.', 'ardea' ) ) );
	}

	$ids     = ardea_get_wishlist_ids();
	$in_list = in_array( $product_id, $ids, true );

	if ( 'add' === $action_type || ( 'toggle' === $action_type && ! $in_list ) ) {
		$ids[]  = $product_id;
		$active = true;
	} else {
		$ids    = array_diff( $ids, array( $product_id ) );
		$active = false;
	}

	$ids = ardea_save_wishlist_ids( $ids );

	wp_send_json_success(
		array(
			'active'  => $active,
			'count'   => count( $ids ),
			'message' => $active ? __( 'Added to your wishlist.', 'ardea' ) : __( 'Removed from your wishlist.', 'ardea' ),
		)
	);
}
add_action( 'wp_ajax_ardea_wishlist_toggle', 'ardea_ajax_wishlist_toggle' );
add_action( 'wp_ajax_nopriv_ardea_wishlist_toggle', 'ardea_ajax_wishlist_toggle' );

/**
 * [ardea_wishlist_count] — bare number, handy for menu badges built in the
 * Site Editor or inside a text widget.
 */
function ardea_shortcode_wishlist_count() {
	return (string) ardea_wishlist_count();
}
add_shortcode( 'ardea_wishlist_count', 'ardea_shortcode_wishlist_count' );

/**
 * [ardea_wishlist] — full grid of wishlisted products using the same
 * content-product.php card as everywhere else, so wishlisted items get the
 * usual Add to Cart / Quick View controls plus a remove action.
 */
function ardea_shortcode_wishlist() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return '<p>' . esc_html__( 'WooCommerce is required to display the wishlist.', 'ardea' ) . '</p>';
	}
	$ids = ardea_get_wishlist_ids();

	ob_start();
	?>
	<div class="shop-toolbar" style="margin-bottom:2rem;">
		<p class="shop-toolbar__count"><span data-wishlist-page-count><?php echo (int) count( $ids ); ?></span> <?php esc_html_e( 'saved items', 'ardea' ); ?></p>
	</div>
	<?php if ( empty( $ids ) ) : ?>
		<div class="wishlist-empty" data-wishlist-empty>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 20.5s-7.5-4.6-10-9.6C.4 7.6 2 4 5.6 4c2 0 3.6 1.2 4.4 2.6C10.8 5.2 12.4 4 14.4 4 18 4 19.6 7.6 18 10.9c-2.5 5-10 9.6-10 9.6z"/></svg>
			<h2><?php esc_html_e( 'Your wishlist is empty', 'ardea' ); ?></h2>
			<p class="lead" style="margin-top:0.5rem;"><?php esc_html_e( 'Tap the heart icon on any product to save it here for later.', 'ardea' ); ?></p>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn--dark" style="margin-top:1.5rem;"><?php esc_html_e( 'Browse Collections', 'ardea' ); ?></a>
		</div>
	<?php else : ?>
		<ul class="product-grid" data-wishlist-grid>
			<?php
			$products = wc_get_products(
				array(
					'include' => $ids,
					'orderby' => 'post__in',
					'status'  => 'publish',
				)
			);
			global $product;
			foreach ( $products as $ardea_wishlist_product ) {
				$product = $ardea_wishlist_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
				wc_get_template_part( 'content', 'product' );
			}
			?>
		</ul>
	<?php endif; ?>
	<?php
	return ob_get_clean();
}
add_shortcode( 'ardea_wishlist', 'ardea_shortcode_wishlist' );

/**
 * Resolve the wishlist page URL: prefer a page using template-wishlist.php,
 * then a page containing the [ardea_wishlist] shortcode, else fall back to
 * the shop page so the header heart icon is never a dead link.
 */
function ardea_get_wishlist_page_url() {
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
			's'              => '[ardea_wishlist]',
		)
	);
	if ( ! empty( $shortcoded ) ) {
		$url = get_permalink( $shortcoded[0] );
		return $url;
	}
	$url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
	return $url;
}
