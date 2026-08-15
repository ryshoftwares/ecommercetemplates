<?php
/**
 * Product card — override of WooCommerce's content-product.php.
 *
 * This is the one WooCommerce template we DO override. WooCommerce's own
 * docs list content-product.php as an intended theming seam — every
 * product loop, from the shop grid to related/upsells/recently-viewed/
 * wishlist, calls wc_get_template_part( 'content', 'product' ), so
 * overriding this single small partial is how the demo's hover-swap
 * image + heart button + quick view/quick add row reaches every one of
 * those loops without duplicating markup. All data below comes from the
 * real $product object — nothing here is hardcoded.
 *
 * @package Noae
 */

defined( 'ABSPATH' ) || exit;

global $product;

if ( empty( $product ) || ! $product->is_visible() ) {
	return;
}

$primary_image_id  = $product->get_image_id();
$gallery_image_ids = $product->get_gallery_image_ids();
$secondary_image_id = ! empty( $gallery_image_ids ) ? $gallery_image_ids[0] : $primary_image_id;

$primary_src   = $primary_image_id ? wp_get_attachment_image_url( $primary_image_id, 'noae-product-card' ) : wc_placeholder_img_src( 'noae-product-card' );
$secondary_src = $secondary_image_id ? wp_get_attachment_image_url( $secondary_image_id, 'noae-product-card' ) : $primary_src;
$alt_text      = $product->get_name();

$badge_html   = function_exists( 'noae_product_merch_badge_html' ) ? noae_product_merch_badge_html( $product ) : '';
$sale_html    = $product->is_on_sale() ? apply_filters( 'woocommerce_sale_flash', '', get_post(), $product ) : '';
$in_wishlist  = function_exists( 'noae_is_in_wishlist' ) && noae_is_in_wishlist( $product->get_id() );
$cat_list     = wc_get_product_category_list( $product->get_id() );
$can_ajax_add = $product->is_purchasable() && $product->is_in_stock() && $product->is_type( 'simple' );
?>
<article <?php wc_product_class( 'noae-product-card', $product ); ?> data-product-id="<?php echo esc_attr( $product->get_id() ); ?>">
	<div class="noae-product-card__media">
		<a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" class="noae-product-card__link" aria-label="<?php echo esc_attr( sprintf( __( 'View %s', 'noae' ), $alt_text ) ); ?>">
			<img class="noae-product-card__img noae-product-card__img--main" src="<?php echo esc_url( $primary_src ); ?>" alt="<?php echo esc_attr( $alt_text . ' — ' . wp_strip_all_tags( $cat_list ) . ' by NOAÉ' ); ?>" width="400" height="480" loading="lazy">
			<img class="noae-product-card__img noae-product-card__img--hover" src="<?php echo esc_url( $secondary_src ); ?>" alt="" width="400" height="480" loading="lazy">
		</a>
		<div class="noae-badge-stack">
			<?php
			echo $badge_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtered/static markup built above.
			echo $sale_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtered markup from noae_sale_flash().
			?>
		</div>
		<button type="button" class="noae-icon-btn noae-wishlist-toggle<?php echo $in_wishlist ? ' is-active' : ''; ?>" data-wishlist-toggle data-id="<?php echo esc_attr( $product->get_id() ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Add %s to wishlist', 'noae' ), $alt_text ) ); ?>" aria-pressed="<?php echo $in_wishlist ? 'true' : 'false'; ?>">
			<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.1 2 4.5 5.6 3.7 8 3.2 10.2 4.3 12 6.7 13.8 4.3 16 3.2 18.4 3.7 22 4.5 23.5 8.1 22 11.7 19.5 16.3 12 21 12 21z" fill="currentColor"/></svg>
		</button>
		<button type="button" class="noae-btn noae-btn--quickview" data-quick-view data-product-id="<?php echo esc_attr( $product->get_id() ); ?>"><?php esc_html_e( 'Quick View', 'noae' ); ?></button>
	</div>
	<div class="noae-product-card__body">
		<?php if ( $cat_list ) : ?><p class="noae-product-card__category"><?php echo wp_kses_post( $cat_list ); ?></p><?php endif; ?>
		<h3 class="noae-product-card__name"><a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>"><?php echo esc_html( $alt_text ); ?></a></h3>
		<?php if ( $product->get_review_count() > 0 || wc_review_ratings_enabled() ) : ?>
			<div class="noae-product-card__rating" aria-label="<?php echo esc_attr( sprintf( __( 'Rated %s out of 5', 'noae' ), $product->get_average_rating() ) ); ?>"><?php echo wp_kses_post( wc_get_rating_html( $product->get_average_rating(), $product->get_review_count() ) ); ?></div>
		<?php endif; ?>
		<div class="noae-product-card__price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
		<?php if ( $can_ajax_add ) : ?>
			<?php
			/**
			 * Deliberately NOT reusing WooCommerce's own `ajax_add_to_cart`
			 * class: that exact class is also the selector WooCommerce's
			 * core wc-add-to-cart.js binds a click handler to, and that
			 * script may already be enqueued (e.g. "AJAX add to cart on
			 * archives" enabled in WooCommerce settings). Sharing the class
			 * would fire BOTH handlers on one click and add the item
			 * twice. `data-quick-add` is a theme-only hook that
			 * assets/js/theme.js listens for instead.
			 */
			?>
			<button type="button" class="noae-btn noae-btn--outline noae-btn--full noae-quick-add" data-quick-add data-product_id="<?php echo esc_attr( $product->get_id() ); ?>" data-quantity="1"><?php esc_html_e( 'Quick Add', 'noae' ); ?></button>
		<?php else : ?>
			<a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" class="noae-btn noae-btn--outline noae-btn--full"><?php echo $product->is_in_stock() ? esc_html__( 'Select Options', 'noae' ) : esc_html__( 'Out of Stock', 'noae' ); ?></a>
		<?php endif; ?>
	</div>
</article>
