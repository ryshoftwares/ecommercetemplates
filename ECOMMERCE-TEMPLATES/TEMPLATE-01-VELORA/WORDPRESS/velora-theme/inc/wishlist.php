<?php
/**
 * Lightweight custom wishlist.
 *
 * Storage: usermeta `_velora_wishlist` (serialized array of product IDs)
 * for logged-in users, a `velora_wishlist` cookie (pipe-separated product
 * IDs, 180 days) for guests. Add/remove/toggle happens over one AJAX
 * action (`velora_wishlist_toggle`) registered for both wp_ajax_ and
 * wp_ajax_nopriv_ so guests get the same experience as the demo.
 *
 * Page choice: a DEDICATED PAGE (via the `[velora_wishlist]` shortcode +
 * template-wishlist.php below) rather than a WooCommerce My Account
 * endpoint. Reasoning: the wishlist explicitly supports guests via the
 * cookie fallback, matching the demo (no login wall on wishlist.html) —
 * My Account endpoints only render for authenticated customers, which
 * would break that guest path. A merchant creates a Page (e.g. "Wishlist"),
 * assigns it the "Velora: Wishlist" template (or simply drops the
 * `[velora_wishlist]` shortcode into any page), and velora_get_wishlist_page_url()
 * finds it automatically by template/shortcode without any settings screen.
 *
 * @package Velora
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const VELORA_WISHLIST_USERMETA = '_velora_wishlist';
const VELORA_WISHLIST_COOKIE   = 'velora_wishlist';

/**
 * Current visitor's wishlisted product IDs, regardless of login state.
 */
function velora_get_wishlist_ids() {
	if ( is_user_logged_in() ) {
		$ids = get_user_meta( get_current_user_id(), VELORA_WISHLIST_USERMETA, true );
		return is_array( $ids ) ? array_map( 'absint', $ids ) : array();
	}
	if ( empty( $_COOKIE[ VELORA_WISHLIST_COOKIE ] ) ) {
		return array();
	}
	$raw = sanitize_text_field( wp_unslash( $_COOKIE[ VELORA_WISHLIST_COOKIE ] ) );
	return array_filter( array_map( 'absint', explode( '|', $raw ) ) );
}

function velora_save_wishlist_ids( $ids ) {
	$ids = array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) );
	if ( is_user_logged_in() ) {
		update_user_meta( get_current_user_id(), VELORA_WISHLIST_USERMETA, $ids );
	} else {
		// wc_setcookie() falls back to setcookie() with WooCommerce's
		// standard httponly/secure flags when WooCommerce is active.
		$value = implode( '|', $ids );
		if ( function_exists( 'wc_setcookie' ) ) {
			wc_setcookie( VELORA_WISHLIST_COOKIE, $value, time() + DAY_IN_SECONDS * 180 );
		} else {
			setcookie( VELORA_WISHLIST_COOKIE, $value, time() + DAY_IN_SECONDS * 180, COOKIEPATH, COOKIE_DOMAIN );
		}
		$_COOKIE[ VELORA_WISHLIST_COOKIE ] = $value;
	}
	return $ids;
}

function velora_is_in_wishlist( $product_id ) {
	return in_array( (int) $product_id, velora_get_wishlist_ids(), true );
}

function velora_wishlist_count() {
	return count( velora_get_wishlist_ids() );
}

/**
 * On login, merge any guest cookie wishlist into the user's saved
 * wishlist so items picked before signing in aren't lost.
 */
function velora_merge_guest_wishlist_on_login( $user_login, $user ) {
	if ( empty( $_COOKIE[ VELORA_WISHLIST_COOKIE ] ) ) {
		return;
	}
	$guest_ids = array_filter( array_map( 'absint', explode( '|', sanitize_text_field( wp_unslash( $_COOKIE[ VELORA_WISHLIST_COOKIE ] ) ) ) ) );
	if ( empty( $guest_ids ) ) {
		return;
	}
	$existing = get_user_meta( $user->ID, VELORA_WISHLIST_USERMETA, true );
	$existing = is_array( $existing ) ? $existing : array();
	update_user_meta( $user->ID, VELORA_WISHLIST_USERMETA, array_values( array_unique( array_merge( $existing, $guest_ids ) ) ) );
	if ( function_exists( 'wc_setcookie' ) ) {
		wc_setcookie( VELORA_WISHLIST_COOKIE, '', time() - HOUR_IN_SECONDS );
	}
}
add_action( 'wp_login', 'velora_merge_guest_wishlist_on_login', 10, 2 );

/**
 * AJAX: add / remove / toggle a product. Accepts an explicit `action_type`
 * of add|remove|toggle (default toggle) so the same endpoint can back the
 * heart icon (toggle) and an explicit "Remove" button on the wishlist page.
 */
function velora_ajax_wishlist_toggle() {
	check_ajax_referer( 'velora_wishlist', 'nonce' );

	$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$action_type = isset( $_POST['action_type'] ) ? sanitize_key( $_POST['action_type'] ) : 'toggle';

	if ( ! $product_id || ! get_post( $product_id ) ) {
		wp_send_json_error( array( 'message' => __( 'Invalid product.', 'velora' ) ) );
	}

	$ids     = velora_get_wishlist_ids();
	$in_list = in_array( $product_id, $ids, true );

	if ( 'add' === $action_type || ( 'toggle' === $action_type && ! $in_list ) ) {
		$ids[]  = $product_id;
		$active = true;
	} else {
		$ids    = array_diff( $ids, array( $product_id ) );
		$active = false;
	}

	$ids = velora_save_wishlist_ids( $ids );

	wp_send_json_success(
		array(
			'active'  => $active,
			'count'   => count( $ids ),
			'message' => $active ? __( 'Added to your wishlist.', 'velora' ) : __( 'Removed from your wishlist.', 'velora' ),
		)
	);
}
add_action( 'wp_ajax_velora_wishlist_toggle', 'velora_ajax_wishlist_toggle' );
add_action( 'wp_ajax_nopriv_velora_wishlist_toggle', 'velora_ajax_wishlist_toggle' );

/**
 * [velora_wishlist_count] — bare number, handy for menu badges built in
 * the block/Site Editor or inside a text widget.
 */
function velora_shortcode_wishlist_count() {
	return (string) velora_wishlist_count();
}
add_shortcode( 'velora_wishlist_count', 'velora_shortcode_wishlist_count' );

/**
 * [velora_wishlist] — full grid of wishlisted products using the same
 * content-product.php card as everywhere else, each with a working
 * "Move to Cart" action alongside the usual add-to-cart/wishlist controls.
 */
function velora_shortcode_wishlist() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return '<p>' . esc_html__( 'WooCommerce is required to display the wishlist.', 'velora' ) . '</p>';
	}
	$ids = velora_get_wishlist_ids();

	ob_start();
	?>
	<div class="wishlist-toolbar">
		<span class="result-count"><span data-wishlist-page-count><?php echo (int) count( $ids ); ?></span> <?php esc_html_e( 'saved items', 'velora' ); ?></span>
	</div>
	<?php if ( empty( $ids ) ) : ?>
		<div class="empty-state" data-wishlist-empty>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 21s-7.5-4.6-10-9.2C0.3 8.3 2 4.5 5.7 4c2-.3 3.7.7 4.9 2.3C11.8 4.7 13.5 3.7 15.5 4c3.7.5 5.4 4.3 3.7 7.8C20 16.4 12 21 12 21z"/></svg>
			<h3><?php esc_html_e( 'Your wishlist is empty', 'velora' ); ?></h3>
			<p class="text-muted"><?php esc_html_e( 'Tap the heart icon on any product to save it here for later.', 'velora' ); ?></p>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Discover Products', 'velora' ); ?></a>
		</div>
	<?php else : ?>
		<ul class="products" data-wishlist-grid>
			<?php
			$products = wc_get_products( array( 'include' => $ids, 'orderby' => 'post__in', 'status' => 'publish' ) );
			global $product;
			foreach ( $products as $wishlist_product ) {
				$product = $wishlist_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
				wc_get_template_part( 'content', 'product' );
			}
			?>
		</ul>
	<?php endif; ?>
	<?php
	return ob_get_clean();
}
add_shortcode( 'velora_wishlist', 'velora_shortcode_wishlist' );

/**
 * Resolve the wishlist page URL: prefer a page using template-wishlist.php,
 * then a page containing the [velora_wishlist] shortcode, else fall back
 * to the shop page so the header heart icon is never a dead link.
 */
function velora_get_wishlist_page_url() {
	static $url = null;
	if ( null !== $url ) {
		return $url;
	}
	$templated = get_posts(
		array(
			'post_type'      => 'page',
			'posts_per_page' => 1,
			'meta_key'       => '_wp_page_template',
			'meta_value'     => 'template-wishlist.php',
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
			's'              => '[velora_wishlist]',
		)
	);
	if ( ! empty( $shortcoded ) ) {
		$url = get_permalink( $shortcoded[0] );
		return $url;
	}
	$url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
	return $url;
}
