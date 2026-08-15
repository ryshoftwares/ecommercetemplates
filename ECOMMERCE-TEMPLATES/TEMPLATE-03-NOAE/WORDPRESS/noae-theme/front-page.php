<?php
/**
 * Homepage — section order matches the NOAÉ demo's index.html:
 * Hero → Shop By Concern → Bestsellers → Editorial "Ritual" Story →
 * New Arrivals → Ingredient Spotlight/Ethos → Reviews → Promo Banner →
 * Newsletter (skin-quiz style).
 *
 * Product data (Bestsellers / New Arrivals) and category data are always
 * pulled from real WooCommerce objects — see template-parts/product-grid.php
 * and template-parts/categories.php. The Bestsellers rail uses WooCommerce's
 * native "Featured" flag (matches the demo's badge:"Bestseller" concept)
 * rather than naming any specific product in the template itself, so
 * nothing on this page is hardcoded sample content.
 *
 * @package Noae
 */

get_header();
?>
<main id="main">

	<?php get_template_part( 'template-parts/hero' ); ?>

	<?php get_template_part( 'template-parts/categories' ); ?>

	<?php
	if ( class_exists( 'WooCommerce' ) ) {
		get_template_part(
			'template-parts/product-grid',
			null,
			array(
				'eyebrow'      => __( 'Most Loved', 'noae' ),
				'heading'      => __( 'Bestsellers', 'noae' ),
				'desc'         => __( 'The rituals our community reaches for again and again.', 'noae' ),
				'view_all_url' => wc_get_page_permalink( 'shop' ),
				'section_class' => 'noae-section--soft',
				'query'        => array(
					'featured' => true,
					'limit'    => 4,
					'orderby'  => 'date',
					'order'    => 'DESC',
				),
			)
		);
	}
	?>

	<!-- EDITORIAL RITUAL STORY -->
	<section class="noae-section noae-reveal">
		<div class="noae-container noae-editorial">
			<div class="noae-editorial__media">
				<img src="<?php echo esc_url( NOAE_URI . '/assets/images/noae-editorial-ritual-routine.svg' ); ?>" alt="<?php esc_attr_e( 'Cleanser, serum and moisturizer arranged as a three-step morning routine', 'noae' ); ?>" width="800" height="450" loading="lazy">
			</div>
			<div>
				<span class="noae-section__eyebrow"><?php esc_html_e( 'The Ritual', 'noae' ); ?></span>
				<h2><?php esc_html_e( 'The Five-Minute Ritual', 'noae' ); ?></h2>
				<p><?php esc_html_e( "Three honest steps, done consistently, outperform a ten-step routine done occasionally. Here's the sequence our formulators recommend for daily skin health.", 'noae' ); ?></p>
				<div class="noae-editorial__steps">
					<div class="noae-editorial__step">
						<span class="noae-editorial__step-num">1</span>
						<div><p class="noae-editorial__step-title"><?php esc_html_e( 'Cleanse', 'noae' ); ?></p><p><?php esc_html_e( 'A gentle cleanser lifts away the day without stripping the barrier.', 'noae' ); ?></p></div>
					</div>
					<div class="noae-editorial__step">
						<span class="noae-editorial__step-num">2</span>
						<div><p class="noae-editorial__step-title"><?php esc_html_e( 'Treat', 'noae' ); ?></p><p><?php esc_html_e( 'A hydrating serum floods skin with moisture and softens fine dry lines.', 'noae' ); ?></p></div>
					</div>
					<div class="noae-editorial__step">
						<span class="noae-editorial__step-num">3</span>
						<div><p class="noae-editorial__step-title"><?php esc_html_e( 'Seal', 'noae' ); ?></p><p><?php esc_html_e( 'A cushioning moisturizer locks it all in with a layer of ceramides.', 'noae' ); ?></p></div>
					</div>
				</div>
				<a href="<?php echo esc_url( noae_category_url( 'skincare' ) ); ?>" class="noae-btn noae-btn--dark"><?php esc_html_e( 'Shop The Ritual', 'noae' ); ?></a>
			</div>
		</div>
	</section>

	<?php
	if ( class_exists( 'WooCommerce' ) ) {
		get_template_part(
			'template-parts/product-grid',
			null,
			array(
				'eyebrow'       => __( 'Just Landed', 'noae' ),
				'heading'       => __( 'New Arrivals', 'noae' ),
				'desc'          => __( 'Fresh formulas, freshly restocked shelves.', 'noae' ),
				'view_all_url'  => add_query_arg( 'orderby', 'date', wc_get_page_permalink( 'shop' ) ),
				'view_all_text' => '',
				'section_class' => 'noae-section--soft',
				'query'         => array(
					'orderby' => 'date',
					'order'   => 'DESC',
					'limit'   => 4,
				),
			)
		);
	}
	?>

	<!-- INGREDIENT SPOTLIGHT / ETHOS -->
	<section class="noae-section noae-reveal">
		<div class="noae-container noae-ethos">
			<div>
				<span class="noae-section__eyebrow"><?php esc_html_e( 'Our Ethos', 'noae' ); ?></span>
				<h2><?php esc_html_e( 'Formulated With Intention', 'noae' ); ?></h2>
				<p><?php esc_html_e( 'Every NOAÉ formula starts with a short, honest ingredient list — actives that are proven to work, paired with skin-loving botanicals that keep the experience gentle.', 'noae' ); ?></p>
				<div class="noae-ethos__list">
					<div class="noae-ethos__item">
						<span class="noae-ethos__icon">🌿</span>
						<div><p class="noae-ethos__item-title"><?php esc_html_e( 'Clean Actives', 'noae' ); ?></p><p class="noae-ethos__item-desc"><?php esc_html_e( 'No unnecessary fillers — every ingredient earns its place.', 'noae' ); ?></p></div>
					</div>
					<div class="noae-ethos__item">
						<span class="noae-ethos__icon">🧪</span>
						<div><p class="noae-ethos__item-title"><?php esc_html_e( 'Dermatologist-Reviewed', 'noae' ); ?></p><p class="noae-ethos__item-desc"><?php esc_html_e( 'Formulas reviewed for safety across skin types.', 'noae' ); ?></p></div>
					</div>
					<div class="noae-ethos__item">
						<span class="noae-ethos__icon">🐰</span>
						<div><p class="noae-ethos__item-title"><?php esc_html_e( 'Cruelty-Free', 'noae' ); ?></p><p class="noae-ethos__item-desc"><?php esc_html_e( 'Never tested on animals, at any stage.', 'noae' ); ?></p></div>
					</div>
					<div class="noae-ethos__item">
						<span class="noae-ethos__icon">♻️</span>
						<div><p class="noae-ethos__item-title"><?php esc_html_e( 'Recyclable Packaging', 'noae' ); ?></p><p class="noae-ethos__item-desc"><?php esc_html_e( 'Glass and recyclable plastic wherever possible.', 'noae' ); ?></p></div>
					</div>
				</div>
			</div>
			<div class="noae-ethos__media">
				<img src="<?php echo esc_url( NOAE_URI . '/assets/images/noae-ingredient-botanical.svg' ); ?>" alt="<?php esc_attr_e( 'Illustrated botanical leaf and petal shapes representing natural ingredient sourcing', 'noae' ); ?>" width="700" height="700" loading="lazy">
			</div>
		</div>
	</section>

	<?php get_template_part( 'template-parts/testimonials' ); ?>

	<!-- PROMO BANNER -->
	<section class="noae-section noae-reveal">
		<div class="noae-container">
			<div class="noae-promo">
				<h2><?php esc_html_e( 'The Ritual Edit', 'noae' ); ?></h2>
				<p><?php esc_html_e( 'Save 15% when you build your own three-step routine — mix and match any cleanser, serum, and moisturizer.', 'noae' ); ?></p>
				<a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>" class="noae-btn noae-btn--primary"><?php esc_html_e( 'Shop The Edit', 'noae' ); ?></a>
			</div>
		</div>
	</section>

	<?php get_template_part( 'template-parts/newsletter' ); ?>

</main>
<?php
get_footer();
