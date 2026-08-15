<?php
/**
 * Reusable product grid section — used on the homepage for "New Arrivals"
 * and "Best Sellers", and reusable anywhere a titled product rail is
 * needed. Always backed by wc_get_products()/WP_Query on the real
 * `product` post type; $args controls WHICH real products, never
 * hardcoded ones.
 *
 * Expected $args (all optional):
 *   eyebrow      string
 *   heading      string
 *   view_all_url string  (defaults to the shop page)
 *   query        array   passed to wc_get_products()
 *   limit        int     (default 4, matches the demo's 4-up rows)
 *
 * @package Velora
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

$args = wp_parse_args(
	$args ?? array(),
	array(
		'eyebrow'      => '',
		'heading'      => __( 'Products', 'velora' ),
		'view_all_url' => wc_get_page_permalink( 'shop' ),
		'query'        => array(),
		'limit'        => 4,
	)
);

$query_args = wp_parse_args(
	$args['query'],
	array(
		'status'  => 'publish',
		'limit'   => $args['limit'],
		'orderby' => 'date',
		'order'   => 'DESC',
	)
);

$velora_products = wc_get_products( $query_args );

if ( empty( $velora_products ) ) {
	return;
}
?>
<section class="section-pad" style="padding-top:0">
	<div class="container">
		<div class="section-head reveal">
			<div class="intro">
				<?php if ( $args['eyebrow'] ) : ?><p class="eyebrow"><?php echo esc_html( $args['eyebrow'] ); ?></p><?php endif; ?>
				<h2><?php echo esc_html( $args['heading'] ); ?></h2>
			</div>
			<a href="<?php echo esc_url( $args['view_all_url'] ); ?>" class="btn-text"><?php esc_html_e( 'Shop All', 'velora' ); ?> &rarr;</a>
		</div>
		<div class="product-grid reveal">
			<?php
			global $product;
			foreach ( $velora_products as $velora_loop_product ) {
				$product = $velora_loop_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
				wc_get_template_part( 'content', 'product' );
			}
			?>
		</div>
	</div>
</section>
