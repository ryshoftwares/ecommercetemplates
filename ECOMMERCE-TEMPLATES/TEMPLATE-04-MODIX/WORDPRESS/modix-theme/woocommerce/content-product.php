<?php
/**
 * Product card — override of WooCommerce's content-product.php.
 *
 * This is the one WooCommerce template we DO override. WooCommerce's own
 * docs list content-product.php as an intended theming seam — every
 * product loop, from the shop grid to related/upsells/recently-viewed/
 * wishlist, calls wc_get_template_part( 'content', 'product' ), so
 * overriding this single small partial is how the demo's hover-swap image
 * + wishlist heart + quick view/quick add row reaches every one of those
 * loops without duplicating markup. All data below comes from the real
 * $product object — nothing here is hardcoded.
 *
 * @package Modix
 */

defined( 'ABSPATH' ) || exit;

global $product;

if ( empty( $product ) || ! $product->is_visible() ) {
	return;
}

$primary_image_id  = $product->get_image_id();
$gallery_image_ids = $product->get_gallery_image_ids();
$secondary_image_id = ! empty( $gallery_image_ids ) ? $gallery_image_ids[0] : $primary_image_id;

$primary_src   = $primary_image_id ? wp_get_attachment_image_url( $primary_image_id, 'modix-product-card' ) : wc_placeholder_img_src( 'modix-product-card' );
$secondary_src = $secondary_image_id ? wp_get_attachment_image_url( $secondary_image_id, 'modix-product-card' ) : $primary_src;
$name          = $product->get_name();

$badge_html = '';
if ( $product->is_on_sale() ) {
	$badge_html = apply_filters( 'woocommerce_sale_flash', '', get_post(), $product );
} elseif ( $product->is_featured() ) {
	$badge_html = '<span class="badge badge--accent">' . esc_html__( 'Best Seller', 'modix' ) . '</span>';
} elseif ( ( time() - get_post_time( 'U', true, $product->get_id() ) ) < ( DAY_IN_SECONDS * 30 ) ) {
	$badge_html = '<span class="badge">' . esc_html__( 'New', 'modix' ) . '</span>';
}

$in_wishlist  = function_exists( 'modix_is_in_wishlist' ) && modix_is_in_wishlist( $product->get_id() );
$cat_list     = wc_get_product_category_list( $product->get_id() );
$can_ajax_add = $product->is_purchasable() && $product->is_in_stock() && $product->is_type( 'simple' );
?>
<article <?php wc_product_class( 'product-card', $product ); ?> data-product-id="<?php echo esc_attr( $product->get_id() ); ?>">
	<div class="product-card__media">
		<?php if ( $badge_html ) : ?><div class="product-card__badges"><?php echo $badge_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtered/static markup built above. ?></div><?php endif; ?>
		<button type="button" class="wishlist-toggle <?php echo $in_wishlist ? 'is-active' : ''; ?>" data-wishlist-toggle data-id="<?php echo esc_attr( $product->get_id() ); ?>" aria-pressed="<?php echo $in_wishlist ? 'true' : 'false'; ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Add %s to wishlist', 'modix' ), $name ) ); ?>">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20.5s-7.5-4.6-10-9.4C.5 7.6 2.4 4 6 4c2.1 0 3.7 1.2 4.7 2.6 1-1.4 2.6-2.6 4.7-2.6 3.6 0 5.5 3.6 4 7.1-2.5 4.8-10 9.4-10 9.4z"/></svg>
		</button>
		<a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'View %s', 'modix' ), $name ) ); ?>">
			<img class="img-primary" src="<?php echo esc_url( $primary_src ); ?>" alt="<?php echo esc_attr( $name ); ?>" width="400" height="400" loading="lazy">
			<img class="img-secondary" src="<?php echo esc_url( $secondary_src ); ?>" alt="" width="400" height="400" loading="lazy" aria-hidden="true">
		</a>
		<div class="product-card__quick-add">
			<?php if ( $can_ajax_add ) : ?>
				<?php
				/**
				 * Deliberately NOT reusing WooCommerce's own
				 * `ajax_add_to_cart` class: that exact class is also the
				 * selector WooCommerce's core wc-add-to-cart.js binds a
				 * click handler to, and that script may already be
				 * enqueued (e.g. "AJAX add to cart on archives" enabled
				 * in WooCommerce settings). Sharing the class would fire
				 * BOTH handlers on one click and add the item twice.
				 * `data-quick-add` is a theme-only hook that
				 * assets/js/theme.js listens for instead.
				 */
				?>
				<button class="btn btn-dark btn-block btn-sm" type="button" data-quick-add data-product_id="<?php echo esc_attr( $product->get_id() ); ?>" data-quantity="1"><?php esc_html_e( 'Quick Add', 'modix' ); ?></button>
			<?php else : ?>
				<a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" class="btn btn-dark btn-block btn-sm"><?php echo $product->is_in_stock() ? esc_html__( 'Select Options', 'modix' ) : esc_html__( 'Out of Stock', 'modix' ); ?></a>
			<?php endif; ?>
		</div>
	</div>
	<div class="product-card__body">
		<?php if ( $cat_list ) : ?><span class="product-card__category"><?php echo wp_kses_post( $cat_list ); ?></span><?php endif; ?>
		<h3 class="product-card__name"><a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>"><?php echo esc_html( $name ); ?></a></h3>
		<?php if ( $product->get_review_count() > 0 || wc_review_ratings_enabled() ) : ?>
			<?php echo wp_kses_post( wc_get_rating_html( $product->get_average_rating(), $product->get_review_count() ) ); ?>
		<?php endif; ?>
		<div class="product-card__actions-row">
			<div class="price-row"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
			<button type="button" class="quick-view-btn" data-quick-view data-product-id="<?php echo esc_attr( $product->get_id() ); ?>"><?php esc_html_e( 'Quick View', 'modix' ); ?></button>
		</div>
	</div>
</article>
