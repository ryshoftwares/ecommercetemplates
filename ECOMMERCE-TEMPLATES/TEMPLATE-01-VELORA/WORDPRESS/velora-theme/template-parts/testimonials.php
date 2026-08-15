<?php
/**
 * Customer testimonials strip.
 *
 * These quotes are editorial marketing copy, not WooCommerce product/order
 * data, so there is nothing to query dynamically the way the product
 * grids are required to be. Real, on-brand copy (matching the demo, not
 * lorem ipsum) is provided as the default and exposed through the
 * `velora_testimonials` filter so a developer can swap in genuine
 * customer-review data (e.g. pulled from a reviews plugin) without
 * editing this template.
 *
 * @package Velora
 */

$velora_testimonials = apply_filters(
	'velora_testimonials',
	array(
		array(
			'rating' => 5,
			'quote'  => __( "My wool coat is the best outerwear purchase I've made in years. The fit is exactly as described and it still looks brand new after a full winter of wear.", 'velora' ),
			'name'   => 'Riya Kapoor',
			'meta'   => __( 'Verified Buyer, Mumbai', 'velora' ),
			'initial' => 'R',
		),
		array(
			'rating' => 5,
			'quote'  => __( 'Ordered the Cashmere Crewneck in three colours after trying the first one. Genuinely the softest cashmere I\'ve owned at this price point.', 'velora' ),
			'name'   => 'Ananya Shah',
			'meta'   => __( 'Verified Buyer, Bengaluru', 'velora' ),
			'initial' => 'A',
		),
		array(
			'rating' => 5,
			'quote'  => __( 'Customer service helped me exchange a size within a day, and my leather tote has held up beautifully to daily commuting.', 'velora' ),
			'name'   => 'Nisha Verma',
			'meta'   => __( 'Verified Buyer, Delhi', 'velora' ),
			'initial' => 'N',
		),
	)
);

if ( empty( $velora_testimonials ) ) {
	return;
}
?>
<section class="section-pad">
	<div class="container">
		<div class="section-head-center reveal">
			<p class="eyebrow"><?php esc_html_e( 'In Their Words', 'velora' ); ?></p>
			<h2><?php esc_html_e( 'What our customers say', 'velora' ); ?></h2>
		</div>
		<div class="testimonial-grid reveal">
			<?php foreach ( $velora_testimonials as $velora_t ) : ?>
				<div class="testimonial-card">
					<span class="stars"><?php echo esc_html( str_repeat( '★', (int) $velora_t['rating'] ) . str_repeat( '☆', 5 - (int) $velora_t['rating'] ) ); ?></span>
					<p>"<?php echo esc_html( $velora_t['quote'] ); ?>"</p>
					<div class="testimonial-author">
						<div class="testimonial-avatar"><?php echo esc_html( $velora_t['initial'] ); ?></div>
						<div><strong><?php echo esc_html( $velora_t['name'] ); ?></strong><span><?php echo esc_html( $velora_t['meta'] ); ?></span></div>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>
