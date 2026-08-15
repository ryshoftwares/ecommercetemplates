<?php
/**
 * Reusable product grid section — used on the homepage for "New Arrivals"
 * and "Best Sellers", and reusable anywhere a titled product rail is
 * needed. Always backed by wc_get_products() against the real `product`
 * post type; $args controls WHICH real products, never hardcoded ones.
 *
 * Expected $args (all optional):
 *   eyebrow      string
 *   heading      string
 *   view_all_url string  (defaults to the shop page)
 *   query        array   passed to wc_get_products()
 *   limit        int     (default 4, matches the demo's 4-up rows)
 *   section_class string additional class on the wrapping <section>
 *
 * @package Ardea
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

$args = wp_parse_args(
	$args ?? array(),
	array(
		'eyebrow'       => '',
		'heading'       => __( 'Products', 'ardea' ),
		'view_all_url'  => wc_get_page_permalink( 'shop' ),
		'query'         => array(),
		'limit'         => 4,
		'section_class' => '',
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

$ardea_products = wc_get_products( $query_args );

if ( empty( $ardea_products ) ) {
	return;
}
?>
<section class="section container<?php echo $args['section_class'] ? ' ' . esc_attr( $args['section_class'] ) : ''; ?>">
	<div class="section-head">
		<div class="section-head__text">
			<?php if ( $args['eyebrow'] ) : ?><p class="eyebrow"><?php echo esc_html( $args['eyebrow'] ); ?></p><?php endif; ?>
			<h2><?php echo esc_html( $args['heading'] ); ?></h2>
		</div>
		<a href="<?php echo esc_url( $args['view_all_url'] ); ?>" class="btn btn--outline"><?php esc_html_e( 'Shop All', 'ardea' ); ?></a>
	</div>
	<div class="product-grid" data-reveal>
		<?php
		global $product;
		foreach ( $ardea_products as $ardea_loop_product ) {
			$product = $ardea_loop_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
			wc_get_template_part( 'content', 'product' );
		}
		?>
	</div>
</section>
