<?php
/**
 * Reusable product grid section — used on the homepage for "New Arrivals"
 * and "Best Sellers", and reusable anywhere a titled product rail is
 * needed. Always backed by wc_get_products() against the real `product`
 * post type; $args controls WHICH real products, never hardcoded ones.
 *
 * Expected $args (all optional):
 *   eyebrow       string
 *   heading       string
 *   intro         string
 *   view_all_url  string  (defaults to the shop page)
 *   view_all_text string
 *   query         array   passed to wc_get_products()
 *   limit         int     (default 4, matches the demo's 4-up rows)
 *   section_class string additional class on the wrapping <section>
 *
 * @package Modix
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

$args = wp_parse_args(
	$args ?? array(),
	array(
		'eyebrow'       => '',
		'heading'       => __( 'Products', 'modix' ),
		'intro'         => '',
		'view_all_url'  => wc_get_page_permalink( 'shop' ),
		'view_all_text' => __( 'View All', 'modix' ),
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

$modix_grid_products = wc_get_products( $query_args );

if ( empty( $modix_grid_products ) ) {
	return;
}
?>
<section class="section<?php echo $args['section_class'] ? ' ' . esc_attr( $args['section_class'] ) : ''; ?>" data-reveal>
	<div class="container">
		<div class="section-header">
			<div class="section-header__text">
				<?php if ( $args['eyebrow'] ) : ?><span class="eyebrow"><?php echo esc_html( $args['eyebrow'] ); ?></span><?php endif; ?>
				<h2><?php echo esc_html( $args['heading'] ); ?></h2>
				<?php if ( $args['intro'] ) : ?><p><?php echo esc_html( $args['intro'] ); ?></p><?php endif; ?>
			</div>
			<a href="<?php echo esc_url( $args['view_all_url'] ); ?>" class="section-link"><?php echo esc_html( $args['view_all_text'] ); ?> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
		</div>
		<div class="product-grid">
			<?php
			global $product;
			foreach ( $modix_grid_products as $modix_loop_product ) {
				$product = $modix_loop_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
				wc_get_template_part( 'content', 'product' );
			}
			?>
		</div>
	</div>
</section>
