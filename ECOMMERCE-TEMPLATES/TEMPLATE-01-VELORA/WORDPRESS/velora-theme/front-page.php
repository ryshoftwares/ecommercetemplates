<?php
/**
 * Homepage — section order matches the VELORA demo's index.html:
 * Hero → Editorial Quote → Featured Categories → New Arrivals →
 * Brand Story → Best Sellers → Promo Banner → Testimonials → Newsletter.
 *
 * Product data (New Arrivals / Best Sellers) and category data are
 * always pulled from real WooCommerce objects — see
 * template-parts/product-grid.php and template-parts/categories.php.
 *
 * @package Velora
 */

get_header();
?>
<main id="main">

	<?php get_template_part( 'template-parts/hero' ); ?>

	<section class="editorial-quote reveal">
		<div class="container">
			<?php
			$velora_quote = apply_filters(
				'velora_editorial_quote',
				array(
					'text' => __( "We don't design for a season. We design pieces you'll still be reaching for in five years.", 'velora' ),
					'cite' => __( 'Anaïs Moreau, Creative Director, Velora', 'velora' ),
				)
			);
			?>
			<blockquote>"<?php echo esc_html( $velora_quote['text'] ); ?>"</blockquote>
			<cite><?php echo esc_html( $velora_quote['cite'] ); ?></cite>
		</div>
	</section>

	<?php get_template_part( 'template-parts/categories' ); ?>

	<?php
	if ( class_exists( 'WooCommerce' ) ) {
		get_template_part(
			'template-parts/product-grid',
			null,
			array(
				'eyebrow'      => __( 'Just Landed', 'velora' ),
				'heading'      => __( 'New Arrivals', 'velora' ),
				'view_all_url' => wc_get_page_permalink( 'shop' ),
				'query'        => array(
					'orderby' => 'date',
					'order'   => 'DESC',
					'limit'   => 4,
				),
			)
		);
	}
	?>

	<section class="story-strip reveal">
		<div class="story-media">
			<img src="<?php echo esc_url( VELORA_URI . '/assets/images/velora-about-story.svg' ); ?>" alt="<?php esc_attr_e( 'Editorial atelier scene representing the Velora design studio', 'velora' ); ?>" width="900" height="1100" loading="lazy">
		</div>
		<div class="story-content">
			<p class="eyebrow"><?php esc_html_e( 'Our Story', 'velora' ); ?></p>
			<h2><?php esc_html_e( 'Crafted in small batches, built to last seasons', 'velora' ); ?></h2>
			<p><?php esc_html_e( 'Founded in 2014, Velora began as a two-person atelier focused on a single idea: clothing should be made from real materials, cut with real tailoring, and sold without the churn of fast fashion. Today we work with a small number of European mills and Indian ateliers to produce considered collections twice a year.', 'velora' ); ?></p>
			<div class="story-stats">
				<div class="story-stat"><strong>2014</strong><span><?php esc_html_e( 'Founded', 'velora' ); ?></span></div>
				<div class="story-stat"><strong>40+</strong><span><?php esc_html_e( 'Countries Shipped To', 'velora' ); ?></span></div>
				<div class="story-stat"><strong>92%</strong><span><?php esc_html_e( 'Natural Fibres', 'velora' ); ?></span></div>
			</div>
			<?php $velora_about = get_page_by_path( 'about' ); ?>
			<a href="<?php echo esc_url( $velora_about ? get_permalink( $velora_about ) : home_url( '/about/' ) ); ?>" class="btn btn-outline"><?php esc_html_e( 'Read Our Story', 'velora' ); ?></a>
		</div>
	</section>

	<?php
	if ( class_exists( 'WooCommerce' ) ) {
		get_template_part(
			'template-parts/product-grid',
			null,
			array(
				'eyebrow'      => __( 'Customer Favourites', 'velora' ),
				'heading'      => __( 'Best Sellers', 'velora' ),
				'view_all_url' => wc_get_page_permalink( 'shop' ),
				'query'        => array(
					'featured' => true,
					'orderby'  => 'popularity',
					'limit'    => 4,
				),
			)
		);
	}
	?>

	<section class="promo-banner reveal">
		<img src="<?php echo esc_url( VELORA_URI . '/assets/images/velora-campaign-banner.svg' ); ?>" alt="<?php esc_attr_e( 'Wide editorial campaign banner for the Velora end of season sale', 'velora' ); ?>" width="1600" height="900" loading="lazy">
		<div class="promo-content">
			<p class="eyebrow"><?php esc_html_e( 'Limited Time', 'velora' ); ?></p>
			<h2><?php esc_html_e( 'End of Season Sale — Up to 30% Off', 'velora' ); ?></h2>
			<p><?php esc_html_e( 'Selected dresses, outerwear and knitwear are reduced for a limited time. Use code VELORA10 at checkout for an extra 10% off your order.', 'velora' ); ?></p>
			<a href="<?php echo esc_url( class_exists( 'WooCommerce' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>" class="btn btn-ivory"><?php esc_html_e( 'Shop the Sale', 'velora' ); ?></a>
		</div>
	</section>

	<?php get_template_part( 'template-parts/testimonials' ); ?>

	<?php get_template_part( 'template-parts/newsletter' ); ?>

</main>
<?php
get_footer();
