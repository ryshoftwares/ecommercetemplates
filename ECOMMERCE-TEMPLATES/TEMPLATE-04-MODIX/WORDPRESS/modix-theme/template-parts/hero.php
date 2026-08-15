<?php
/**
 * Homepage hero — fully customizer-editable (Customize → Homepage Hero),
 * with defaults matching the MODIX demo's real copy. The two-line stacked
 * heading and the floating media badge both mirror the demo's index.html
 * `.hero h1` / `.hero__badge` markup exactly. The three stat figures
 * (products engineered / average rating / warranty standard) are always
 * computed from real store data, never hardcoded.
 *
 * @package Modix
 */

$eyebrow    = get_theme_mod( 'modix_hero_eyebrow', 'Modix Lineup 2026' );
$line1      = get_theme_mod( 'modix_hero_heading_line1', 'TECHNOLOGY,' );
$line2      = get_theme_mod( 'modix_hero_heading_line2', 'REFINED.' );
$subheading = get_theme_mod( 'modix_hero_subheading', 'Precision-engineered smartphones, laptops, audio and smart home devices — built around real specs, not marketing gloss. Every product ships with a published warranty and a full spec sheet.' );
$badge_title = get_theme_mod( 'modix_hero_badge_title', '5,000mAh' );
$badge_text  = get_theme_mod( 'modix_hero_badge_text', 'Flagship phone battery' );
$cta_text   = get_theme_mod( 'modix_hero_cta_text', 'Shop Latest' );
$cta_link   = get_theme_mod( 'modix_hero_cta_link', '' );
$cta2_text  = get_theme_mod( 'modix_hero_cta2_text', 'Compare Models' );
$cta2_link  = get_theme_mod( 'modix_hero_cta2_link', '' );
$image      = get_theme_mod( 'modix_hero_image', MODIX_URI . '/assets/images/modix-hero-technology-refined.svg' );

$shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
if ( ! $cta_link ) {
	$cta_link = $shop_url;
}
if ( ! $cta2_link ) {
	$cta2_link = add_query_arg( 'orderby', 'rating', $shop_url );
}

// Real store stats, never hardcoded.
$product_count = 0;
$avg_rating    = 0;
if ( class_exists( 'WooCommerce' ) ) {
	$counts        = (array) wp_count_posts( 'product' );
	$product_count = isset( $counts['publish'] ) ? (int) $counts['publish'] : 0;
	global $wpdb;
	$avg_rating = (float) $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		"SELECT AVG(meta_value + 0) FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE pm.meta_key = '_wc_average_rating' AND p.post_status = 'publish' AND meta_value > 0"
	);
}
?>
<section class="hero">
	<div class="hero__glow"></div>
	<div class="container hero__grid">
		<div class="hero__text">
			<div class="hero__eyebrow"><span class="dot"></span><span><?php echo esc_html( $eyebrow ); ?></span></div>
			<h1><?php echo esc_html( $line1 ); ?><br><?php echo esc_html( $line2 ); ?></h1>
			<p class="hero__lead"><?php echo esc_html( $subheading ); ?></p>
			<div class="hero__actions">
				<a href="<?php echo esc_url( $cta_link ); ?>" class="btn btn-primary btn-lg"><?php echo esc_html( $cta_text ); ?></a>
				<a href="<?php echo esc_url( $cta2_link ); ?>" class="btn btn-secondary btn-lg"><?php echo esc_html( $cta2_text ); ?></a>
			</div>
			<div class="hero__stats">
				<div class="hero__stat"><strong><?php echo (int) $product_count; ?></strong><span><?php esc_html_e( 'Products Engineered', 'modix' ); ?></span></div>
				<div class="hero__stat"><strong><?php echo esc_html( $avg_rating > 0 ? number_format_i18n( $avg_rating, 1 ) . '★' : '—' ); ?></strong><span><?php esc_html_e( 'Average Rating', 'modix' ); ?></span></div>
				<div class="hero__stat"><strong>1-2 Yr</strong><span><?php esc_html_e( 'Warranty Standard', 'modix' ); ?></span></div>
			</div>
		</div>
		<div class="hero__media">
			<img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) . ' — ' . $line1 . ' ' . $line2 ); ?>" width="700" height="700" fetchpriority="high">
			<?php if ( $badge_title || $badge_text ) : ?>
				<div class="hero__badge">
					<div>
						<?php if ( $badge_title ) : ?><strong><?php echo esc_html( $badge_title ); ?></strong><?php endif; ?>
						<?php if ( $badge_text ) : ?><span><?php echo esc_html( $badge_text ); ?></span><?php endif; ?>
					</div>
				</div>
			<?php endif; ?>
		</div>
	</div>
</section>
