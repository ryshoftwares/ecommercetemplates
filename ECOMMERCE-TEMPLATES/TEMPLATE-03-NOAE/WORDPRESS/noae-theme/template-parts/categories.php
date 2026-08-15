<?php
/**
 * "Shop By Concern" section — pulls REAL WooCommerce top-level product
 * categories (ordered by menu_order, capped at 4 to match the demo's
 * .noae-concern-grid 4-tile layout). Nothing here is a hardcoded category
 * name; a store with fewer categories simply renders fewer tiles (the CSS
 * grid degrades gracefully at each breakpoint already defined in
 * assets/css/responsive.css).
 *
 * @package Noae
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

$noae_concerns = get_terms(
	array(
		'taxonomy'   => 'product_cat',
		'hide_empty' => true,
		'parent'     => 0,
		'orderby'    => 'menu_order',
		'order'      => 'ASC',
		'number'     => 4,
	)
);

if ( is_wp_error( $noae_concerns ) || empty( $noae_concerns ) ) {
	return;
}

$args = wp_parse_args(
	$args ?? array(),
	array(
		'eyebrow'       => __( 'Shop By Concern', 'noae' ),
		'heading'       => __( 'Find Your Category', 'noae' ),
		'desc'          => __( "Whichever ritual you're building, start with the category that fits your routine today.", 'noae' ),
		'section_class' => '',
	)
);
?>
<section class="noae-section noae-reveal<?php echo $args['section_class'] ? ' ' . esc_attr( $args['section_class'] ) : ''; ?>">
	<div class="noae-container">
		<div class="noae-section__head">
			<span class="noae-section__eyebrow"><?php echo esc_html( $args['eyebrow'] ); ?></span>
			<h2><?php echo esc_html( $args['heading'] ); ?></h2>
			<?php if ( $args['desc'] ) : ?><p class="noae-section__desc"><?php echo esc_html( $args['desc'] ); ?></p><?php endif; ?>
		</div>
		<div class="noae-concern-grid">
			<?php foreach ( $noae_concerns as $noae_concern ) : ?>
				<a href="<?php echo esc_url( get_term_link( $noae_concern ) ); ?>" class="noae-concern-pill">
					<span class="noae-concern-pill__media">
						<img src="<?php echo esc_url( noae_category_image_url( $noae_concern ) ); ?>" alt="<?php echo esc_attr( sprintf( __( '%s category', 'noae' ), $noae_concern->name ) ); ?>" width="300" height="300" loading="lazy">
					</span>
					<span class="noae-concern-pill__name"><?php echo esc_html( $noae_concern->name ); ?></span>
					<span class="noae-concern-pill__count"><?php echo $noae_concern->description ? esc_html( wp_trim_words( $noae_concern->description, 10 ) ) : esc_html( sprintf( _n( '%d product', '%d products', $noae_concern->count, 'noae' ), $noae_concern->count ) ); ?></span>
				</a>
			<?php endforeach; ?>
		</div>
	</div>
</section>
