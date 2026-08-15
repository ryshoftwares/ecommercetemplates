<?php
/**
 * Product card — override of WooCommerce's content-product.php.
 *
 * This is the one WooCommerce template we DO override (WooCommerce's own
 * docs list content-product.php as an intended theming seam — every
 * product loop, from the shop grid to related/upsells/recently-viewed/
 * wishlist, calls wc_get_template_part( 'content', 'product' ), so
 * overriding this single small partial is how the demo's hover-swap
 * image + heart button + quick view/quick add row reaches every one of
 * those loops without duplicating markup). All data below comes from the
 * real $product object — nothing here is hardcoded.
 *
 * @package Velora
 */

defined( 'ABSPATH' ) || exit;

global $product;

if ( empty( $product ) || ! $product->is_visible() ) {
	return;
}

$primary_image_id  = $product->get_image_id();
$gallery_image_ids  = $product->get_gallery_image_ids();
$secondary_image_id = ! empty( $gallery_image_ids ) ? $gallery_image_ids[0] : $primary_image_id;

$primary_src   = $primary_image_id ? wp_get_attachment_image_url( $primary_image_id, 'velora-product-card' ) : wc_placeholder_img_src( 'velora-product-card' );
$secondary_src = $secondary_image_id ? wp_get_attachment_image_url( $secondary_image_id, 'velora-product-card' ) : $primary_src;
$alt_text      = $product->get_name();

$is_new     = ( time() - get_post_time( 'U', true, $product->get_id() ) ) < ( DAY_IN_SECONDS * 30 );
$badge_html = '';
if ( $product->is_on_sale() ) {
	$badge_html = apply_filters( 'woocommerce_sale_flash', '', get_post(), $product );
} elseif ( $is_new ) {
	$badge_html = '<span class="product-badge badge-new">' . esc_html__( 'New', 'velora' ) . '</span>';
} elseif ( $product->is_featured() ) {
	$badge_html = '<span class="product-badge badge-bestseller">' . esc_html__( 'Bestseller', 'velora' ) . '</span>';
}

$in_wishlist  = function_exists( 'velora_is_in_wishlist' ) && velora_is_in_wishlist( $product->get_id() );
$cat_list     = wc_get_product_category_list( $product->get_id() );
$can_ajax_add = $product->is_purchasable() && $product->is_in_stock() && $product->is_type( 'simple' );
?>
<article <?php wc_product_class( 'product-card', $product ); ?> data-product-id="<?php echo esc_attr( $product->get_id() ); ?>">
	<div class="product-media">
		<a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'View %s', 'velora' ), $alt_text ) ); ?>">
			<img class="img-primary" src="<?php echo esc_url( $primary_src ); ?>" alt="<?php echo esc_attr( $alt_text ); ?>" width="600" height="800" loading="lazy">
			<img class="img-secondary" src="<?php echo esc_url( $secondary_src ); ?>" alt="<?php echo esc_attr( $alt_text ); ?>" width="600" height="800" loading="lazy">
		</a>
		<?php echo $badge_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtered/static markup built above. ?>
		<button type="button" class="wishlist-toggle <?php echo $in_wishlist ? 'is-active' : ''; ?>" data-wishlist-toggle data-id="<?php echo esc_attr( $product->get_id() ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Add %s to wishlist', 'velora' ), $alt_text ) ); ?>" aria-pressed="<?php echo $in_wishlist ? 'true' : 'false'; ?>">
			<svg viewBox="0 0 24 24" stroke-width="1.6"><path d="M12 21s-7.5-4.6-10-9.2C0.3 8.3 2 4.5 5.7 4c2-.3 3.7.7 4.9 2.3C11.8 4.7 13.5 3.7 15.5 4c3.7.5 5.4 4.3 3.7 7.8C20 16.4 12 21 12 21z"/></svg>
		</button>
		<div class="product-card-actions">
			<button type="button" class="btn btn-ivory btn-sm" data-quickview data-id="<?php echo esc_attr( $product->get_id() ); ?>"><?php esc_html_e( 'Quick View', 'velora' ); ?></button>
			<?php if ( $can_ajax_add ) : ?>
				<?php
				/**
				 * Deliberately NOT reusing WooCommerce's own `ajax_add_to_cart`
				 * class here: that exact class is also the selector WooCommerce's
				 * core wc-add-to-cart.js binds a click handler to, and that
				 * script may already be enqueued (e.g. the store has "AJAX add
				 * to cart on archives" enabled). Sharing the class would fire
				 * BOTH handlers on one click and add the item twice. `velora-quick-add`
				 * is a theme-only hook that assets/js/theme.js listens for instead.
				 */
				?>
				<button type="button" class="btn btn-primary btn-sm velora-quick-add" data-quickadd data-product_id="<?php echo esc_attr( $product->get_id() ); ?>" data-product_sku="<?php echo esc_attr( $product->get_sku() ); ?>" data-quantity="1"><?php esc_html_e( 'Quick Add', 'velora' ); ?></button>
			<?php else : ?>
				<a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" class="btn btn-primary btn-sm"><?php echo $product->is_in_stock() ? esc_html__( 'Select Options', 'velora' ) : esc_html__( 'Out of Stock', 'velora' ); ?></a>
			<?php endif; ?>
		</div>
	</div>
	<div class="product-info">
		<?php if ( $cat_list ) : ?><div class="product-cat"><?php echo wp_kses_post( $cat_list ); ?></div><?php endif; ?>
		<h3 class="product-name"><a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>"><?php echo esc_html( $alt_text ); ?></a></h3>
		<?php if ( $product->get_review_count() > 0 || wc_review_ratings_enabled() ) : ?>
			<div class="product-rating"><?php echo wp_kses_post( wc_get_rating_html( $product->get_average_rating(), $product->get_review_count() ) ); ?></div>
		<?php endif; ?>
		<div class="product-price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
	</div>
</article>
