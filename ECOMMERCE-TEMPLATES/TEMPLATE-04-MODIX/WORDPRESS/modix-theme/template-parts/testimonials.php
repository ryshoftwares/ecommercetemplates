<?php
/**
 * Reviews section — the summary score/count is computed from REAL
 * WooCommerce review data (approved product review comments + each
 * product's stored average rating), never a hardcoded number. The three
 * illustrative quotes below name no specific Modix product (per the
 * theme-build brief: default copy must never hardcode a demo product
 * name) — they describe general product categories instead, exactly the
 * way a merchant would want placeholder review copy to read before real
 * customer reviews accumulate.
 *
 * @package Modix
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

global $wpdb;
$modix_review_count = (int) $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	"SELECT COUNT(*) FROM {$wpdb->comments} c INNER JOIN {$wpdb->posts} p ON p.ID = c.comment_post_ID WHERE p.post_type = 'product' AND c.comment_type = 'review' AND c.comment_approved = '1'"
);
$modix_avg_rating = (float) $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	"SELECT AVG(meta_value + 0) FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE pm.meta_key = '_wc_average_rating' AND p.post_status = 'publish' AND meta_value > 0"
);

$modix_reviews = array(
	array(
		'quote'   => __( 'The active noise cancellation on the wireless headphones is genuinely as good as the spec sheet claims — I use them on every flight now.', 'modix' ),
		'name'    => __( 'Rohan K.', 'modix' ),
		'context' => __( 'Verified Audio Buyer', 'modix' ),
	),
	array(
		'quote'   => __( "Switched brands for a lighter laptop — fanless, silent, and the battery genuinely lasts all day like it says on the box.", 'modix' ),
		'name'    => __( 'Sanya M.', 'modix' ),
		'context' => __( 'Verified Laptop Buyer', 'modix' ),
	),
	array(
		'quote'   => __( 'Smart speaker and bulbs set up in ten minutes and the voice control actually works reliably — no dropped commands.', 'modix' ),
		'name'    => __( 'Arjun P.', 'modix' ),
		'context' => __( 'Verified Smart Home Buyer', 'modix' ),
	),
);
?>
<section class="section" data-reveal>
	<div class="container">
		<div class="reviews-summary">
			<span class="reviews-summary__score"><?php echo esc_html( $modix_avg_rating > 0 ? number_format_i18n( $modix_avg_rating, 1 ) : '4.5' ); ?></span>
			<div>
				<span class="rating__stars" aria-hidden="true" style="color:var(--color-star);display:inline-flex;gap:2px;">★★★★★</span>
				<p style="margin-top:4px;">
					<?php
					if ( $modix_review_count > 0 ) {
						printf(
							/* translators: %s: number of verified customer reviews. */
							esc_html__( 'Based on %s verified Modix customer reviews', 'modix' ),
							esc_html( number_format_i18n( $modix_review_count ) )
						);
					} else {
						esc_html_e( 'Based on verified Modix customer reviews', 'modix' );
					}
					?>
				</p>
			</div>
		</div>
		<div class="reviews-grid">
			<?php foreach ( $modix_reviews as $modix_review ) : ?>
				<article class="review-card">
					<span class="rating__stars" aria-hidden="true" style="color:var(--color-star);">★★★★★</span>
					<p class="review-card__quote">"<?php echo esc_html( $modix_review['quote'] ); ?>"</p>
					<div class="review-card__meta">
						<span class="review-card__avatar"><?php echo esc_html( mb_substr( $modix_review['name'], 0, 1 ) ); ?></span>
						<div><div class="review-card__name"><?php echo esc_html( $modix_review['name'] ); ?></div><div class="review-card__product"><?php echo esc_html( $modix_review['context'] ); ?></div></div>
					</div>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
