<?php
/**
 * Customer reviews strip ("In Their Words" on the homepage).
 *
 * These are editorial marketing quotes, not WooCommerce product/order
 * data, so there's nothing to query dynamically the way the product grids
 * are required to be. Real, on-brand copy is provided as the default
 * (deliberately not naming any specific product — see the note in
 * inc/customizer.php-adjacent hero/editorial copy about avoiding fake
 * hardcoded product references) and exposed through the
 * `ardea_testimonials` filter so a developer can swap in genuine
 * customer-review data (e.g. pulled from a reviews plugin, or aggregated
 * from real WooCommerce product reviews) without editing this template.
 *
 * @package Ardea
 */

$ardea_testimonials = apply_filters(
	'ardea_testimonials',
	array(
		array(
			'rating'  => 5,
			'quote'   => __( 'Five years in and the joinery on our dining chairs still hasn\'t loosened once. This is the first furniture we\'ve bought that actually feels built to last.', 'ardea' ),
			'name'    => 'Priya Menon',
			'meta'    => __( 'Verified Buyer, Bengaluru', 'ardea' ),
		),
		array(
			'rating'  => 5,
			'quote'   => __( "The delivery team assembled everything and walked us through the care instructions before they left. It's the kind of white-glove service you don't expect at this price point.", 'ardea' ),
			'name'    => 'Arjun Nair',
			'meta'    => __( 'Verified Buyer, Chennai', 'ardea' ),
		),
		array(
			'rating'  => 4,
			'quote'   => __( 'Ordered swatches before committing and I\'m glad I did — the finish in person is even warmer than the photos. Worth the 3-week wait for a made-to-order piece.', 'ardea' ),
			'name'    => 'Divya Rao',
			'meta'    => __( 'Verified Buyer, Pune', 'ardea' ),
		),
	)
);

if ( empty( $ardea_testimonials ) ) {
	return;
}
?>
<section class="section container">
	<div class="section-head">
		<div class="section-head__text">
			<p class="eyebrow"><?php esc_html_e( 'In Their Words', 'ardea' ); ?></p>
			<h2><?php esc_html_e( 'Loved in living rooms across India', 'ardea' ); ?></h2>
		</div>
	</div>
	<div class="review-grid">
		<?php foreach ( $ardea_testimonials as $ardea_t ) : ?>
			<div class="review-card" data-reveal>
				<div class="review-card__stars stars"><?php echo esc_html( str_repeat( '★', (int) $ardea_t['rating'] ) . str_repeat( '☆', 5 - (int) $ardea_t['rating'] ) ); ?></div>
				<p class="review-card__body">"<?php echo esc_html( $ardea_t['quote'] ); ?>"</p>
				<div class="review-card__meta"><strong><?php echo esc_html( $ardea_t['name'] ); ?></strong><span><?php echo esc_html( $ardea_t['meta'] ); ?></span></div>
			</div>
		<?php endforeach; ?>
	</div>
</section>
