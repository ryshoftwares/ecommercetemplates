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
 * @package Ardea
 */

defined( 'ABSPATH' ) || exit;

global $product;

if ( empty( $product ) || ! $product->is_visible() ) {
	return;
}

$primary_image_id   = $product->get_image_id();
$gallery_image_ids   = $product->get_gallery_image_ids();
$secondary_image_id  = ! empty( $gallery_image_ids ) ? $gallery_image_ids[0] : $primary_image_id;

$primary_src   = $primary_image_id ? wp_get_attachment_image_url( $primary_image_id, 'ardea-product-card' ) : wc_placeholder_img_src( 'ardea-product-card' );
$secondary_src = $secondary_image_id ? wp_get_attachment_image_url( $secondary_image_id, 'ardea-product-card' ) : $primary_src;
$alt_text      = $product->get_name();

$is_new     = ( time() - get_post_time( 'U', true, $product->get_id() ) ) < ( DAY_IN_SECONDS * 30 );
$badge_html = '';
if ( $product->is_on_sale() ) {
	$badge_html = apply_filters( 'woocommerce_sale_flash', '', get_post(), $product );
} elseif ( $product->is_featured() ) {
	$badge_html = '<span class="badge badge--bestseller">' . esc_html__( 'Bestseller', 'ardea' ) . '</span>';
} elseif ( $is_new ) {
	$badge_html = '<span class="badge badge--new">' . esc_html__( 'New', 'ardea' ) . '</span>';
}

$in_wishlist  = function_exists( 'ardea_is_in_wishlist' ) && ardea_is_in_wishlist( $product->get_id() );
$cat_list     = wc_get_product_category_list( $product->get_id() );
$can_ajax_add = $product->is_purchasable() && $product->is_in_stock() && $product->is_type( 'simple' );
$dimensions   = get_post_meta( $product->get_id(), '_ardea_dimensions', true );
?>
<article <?php wc_product_class( 'product-card', $product ); ?> data-product-id="<?php echo esc_attr( $product->get_id() ); ?>">
	<div class="product-card__media">
		<a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'View %s', 'ardea' ), $alt_text ) ); ?>">
			<img class="product-card__img product-card__img--primary" src="<?php echo esc_url( $primary_src ); ?>" alt="<?php echo esc_attr( $alt_text ); ?>" width="600" height="750" loading="lazy">
			<img class="product-card__img product-card__img--hover" src="<?php echo esc_url( $secondary_src ); ?>" alt="" width="600" height="750" loading="lazy">
		</a>
		<?php if ( $badge_html ) : ?><div class="product-card__badges"><?php echo $badge_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtered/static markup built above. ?></div><?php endif; ?>
		<button type="button" class="icon-btn product-card__wishlist <?php echo $in_wishlist ? 'is-active' : ''; ?>" data-wishlist-toggle data-id="<?php echo esc_attr( $product->get_id() ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Add %s to wishlist', 'ardea' ), $alt_text ) ); ?>" aria-pressed="<?php echo $in_wishlist ? 'true' : 'false'; ?>">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20.5s-7.5-4.6-10-9.6C.4 7.6 2 4 5.6 4c2 0 3.6 1.2 4.4 2.6C10.8 5.2 12.4 4 14.4 4 18 4 19.6 7.6 18 10.9c-2.5 5-10 9.6-10 9.6z"/></svg>
		</button>
		<div class="product-card__actions">
			<button type="button" class="btn btn--outline btn--sm" data-quick-view data-product-id="<?php echo esc_attr( $product->get_id() ); ?>"><?php esc_html_e( 'Quick View', 'ardea' ); ?></button>
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
				<button type="button" class="btn btn--primary btn--sm" data-quick-add data-product_id="<?php echo esc_attr( $product->get_id() ); ?>" data-quantity="1"><?php esc_html_e( 'Quick Add', 'ardea' ); ?></button>
			<?php else : ?>
				<a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" class="btn btn--primary btn--sm"><?php echo $product->is_in_stock() ? esc_html__( 'Select Options', 'ardea' ) : esc_html__( 'Out of Stock', 'ardea' ); ?></a>
			<?php endif; ?>
		</div>
	</div>
	<div class="product-card__body">
		<?php if ( $cat_list ) : ?><p class="product-card__category"><?php echo wp_kses_post( $cat_list ); ?></p><?php endif; ?>
		<h3 class="product-card__name"><a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>"><?php echo esc_html( $alt_text ); ?></a></h3>
		<?php if ( $product->get_review_count() > 0 || wc_review_ratings_enabled() ) : ?>
			<div class="product-card__rating"><?php echo wp_kses_post( wc_get_rating_html( $product->get_average_rating(), $product->get_review_count() ) ); ?></div>
		<?php endif; ?>
		<div class="product-card__price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
		<?php if ( $dimensions ) : ?><p class="form-hint" style="margin-top:0.3rem;"><?php echo esc_html( $dimensions ); ?></p><?php endif; ?>
	</div>
</article>
