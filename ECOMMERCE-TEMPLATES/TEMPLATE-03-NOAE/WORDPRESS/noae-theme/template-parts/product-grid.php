<?php
/**
 * Reusable product grid section — used on the homepage for "Bestsellers"
 * and "New Arrivals", and reusable anywhere a titled product rail is
 * needed. Always backed by wc_get_products() against the real `product`
 * post type; $args controls WHICH real products, never hardcoded ones.
 *
 * Expected $args (all optional):
 *   eyebrow        string
 *   heading        string
 *   desc           string
 *   view_all_url   string  (defaults to the shop page)
 *   view_all_text  string
 *   query          array   passed to wc_get_products()
 *   limit          int     (default 4, matches the demo's 4-up rows)
 *   section_class  string  additional class on the wrapping <section>
 *
 * @package Noae
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

$args = wp_parse_args(
	$args ?? array(),
	array(
		'eyebrow'       => '',
		'heading'       => __( 'Products', 'noae' ),
		'desc'          => '',
		'view_all_url'  => wc_get_page_permalink( 'shop' ),
		'view_all_text' => __( 'View All Products', 'noae' ),
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

$noae_grid_products = wc_get_products( $query_args );

if ( empty( $noae_grid_products ) ) {
	return;
}
?>
<section class="noae-section noae-reveal<?php echo $args['section_class'] ? ' ' . esc_attr( $args['section_class'] ) : ''; ?>">
	<div class="noae-container">
		<div class="noae-section__head">
			<?php if ( $args['eyebrow'] ) : ?><span class="noae-section__eyebrow"><?php echo esc_html( $args['eyebrow'] ); ?></span><?php endif; ?>
			<h2><?php echo esc_html( $args['heading'] ); ?></h2>
			<?php if ( $args['desc'] ) : ?><p class="noae-section__desc"><?php echo esc_html( $args['desc'] ); ?></p><?php endif; ?>
		</div>
		<div class="noae-product-grid">
			<?php
			global $product;
			foreach ( $noae_grid_products as $noae_loop_product ) {
				$product = $noae_loop_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
				wc_get_template_part( 'content', 'product' );
			}
			?>
		</div>
		<?php if ( $args['view_all_text'] ) : ?>
		<div class="noae-section__foot"><a href="<?php echo esc_url( $args['view_all_url'] ); ?>" class="noae-btn noae-btn--outline"><?php echo esc_html( $args['view_all_text'] ); ?></a></div>
		<?php endif; ?>
	</div>
</section>
