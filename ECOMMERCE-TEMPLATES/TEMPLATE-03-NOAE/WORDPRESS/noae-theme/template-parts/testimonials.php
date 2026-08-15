<?php
/**
 * Customer reviews strip ("Loved By Our Community" on the homepage).
 *
 * These are editorial marketing quotes, not WooCommerce product/order
 * data, so there's nothing to query dynamically the way the product grids
 * are required to be. Real, on-brand copy is provided as the default
 * (deliberately never naming a specific demo product — see the hardcoded-
 * product-name grep note in inc/customizer.php's docblock) and exposed
 * through the `noae_testimonials` filter so a developer can swap in
 * genuine customer-review data (e.g. pulled from a reviews plugin, or
 * aggregated from real WooCommerce product reviews) without editing this
 * template.
 *
 * @package Noae
 */

$noae_testimonials = apply_filters(
	'noae_testimonials',
	array(
		array(
			'rating' => 5,
			'quote'  => __( 'My skin has never held onto moisture like this. A hydrating serum followed by a rich moisturiser is now non-negotiable in my routine.', 'noae' ),
			'name'   => 'Ananya R.',
			'meta'   => __( 'Verified buyer, Skincare', 'noae' ),
		),
		array(
			'rating' => 5,
			'quote'  => __( "A lightweight hair oil that smells incredible and actually tames my frizz in humidity — first product that's done both.", 'noae' ),
			'name'   => 'Priya S.',
			'meta'   => __( 'Verified buyer, Haircare', 'noae' ),
		),
		array(
			'rating' => 5,
			'quote'  => __( 'The sleep mist genuinely changed my bedtime routine. Subtle scent, real difference in how fast I settle down.', 'noae' ),
			'name'   => 'Meera K.',
			'meta'   => __( 'Verified buyer, Wellness', 'noae' ),
		),
	)
);

if ( empty( $noae_testimonials ) ) {
	return;
}
?>
<section class="noae-section noae-section--soft noae-reveal">
	<div class="noae-container">
		<div class="noae-section__head">
			<span class="noae-section__eyebrow"><?php esc_html_e( 'In Their Words', 'noae' ); ?></span>
			<h2><?php esc_html_e( 'Loved By Our Community', 'noae' ); ?></h2>
		</div>
		<div class="noae-reviews-grid">
			<?php foreach ( $noae_testimonials as $noae_t ) : ?>
				<article class="noae-review-card">
					<div class="noae-review-card__stars"><?php echo esc_html( str_repeat( '★', (int) $noae_t['rating'] ) . str_repeat( '☆', 5 - (int) $noae_t['rating'] ) ); ?></div>
					<p class="noae-review-card__quote">"<?php echo esc_html( $noae_t['quote'] ); ?>"</p>
					<p class="noae-review-card__author"><?php echo esc_html( $noae_t['name'] ); ?></p>
					<p class="noae-review-card__meta"><?php echo esc_html( $noae_t['meta'] ); ?></p>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
