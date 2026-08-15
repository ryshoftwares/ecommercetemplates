<?php
/**
 * Featured categories grid — pulls REAL WooCommerce top-level product
 * categories (ordered by menu_order, capped at 4 to match the demo's
 * asymmetric 4-tile .cat-grid). Nothing here is a hardcoded category
 * name; if a store only has one or two categories, the grid simply
 * renders one or two tiles (CSS grid-template areas degrade gracefully
 * for fewer tiles at the 1024/768 breakpoints already defined in
 * responsive.css).
 *
 * @package Velora
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

$velora_categories = get_terms(
	array(
		'taxonomy'   => 'product_cat',
		'hide_empty' => true,
		'parent'     => 0,
		'orderby'    => 'menu_order',
		'order'      => 'ASC',
		'number'     => 4,
	)
);

if ( is_wp_error( $velora_categories ) || empty( $velora_categories ) ) {
	return;
}

// velora_category_image_url() lives in inc/woocommerce.php (needed by
// 404.php too, which may render without this template part ever loading).
?>
<section class="section-pad">
	<div class="container">
		<div class="section-head reveal">
			<div class="intro">
				<p class="eyebrow"><?php esc_html_e( 'Shop by Category', 'velora' ); ?></p>
				<h2><?php echo esc_html( sprintf( _n( 'One category, one point of view', '%d categories, one point of view', count( $velora_categories ), 'velora' ), count( $velora_categories ) ) ); ?></h2>
			</div>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn-text"><?php esc_html_e( 'View All Categories', 'velora' ); ?> &rarr;</a>
		</div>
		<div class="cat-grid reveal">
			<?php foreach ( $velora_categories as $velora_cat ) : ?>
				<a class="cat-card" href="<?php echo esc_url( get_term_link( $velora_cat ) ); ?>">
					<img src="<?php echo esc_url( velora_category_image_url( $velora_cat ) ); ?>" alt="<?php echo esc_attr( sprintf( __( 'Editorial imagery representing the %s collection', 'velora' ), $velora_cat->name ) ); ?>" width="900" height="700" loading="lazy">
					<span class="cat-card-label">
						<span class="eyebrow"><?php esc_html_e( 'Category', 'velora' ); ?></span>
						<h3><?php echo esc_html( $velora_cat->name ); ?></h3>
						<span class="link"><?php echo esc_html( sprintf( __( 'Shop %s', 'velora' ), $velora_cat->name ) ); ?></span>
					</span>
				</a>
			<?php endforeach; ?>
		</div>
	</div>
</section>
