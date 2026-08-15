<?php
/**
 * Homepage — section order matches the ARDEA demo's index.html:
 * Hero → Shop by Room → Editorial Spotlight → New Arrivals → Best Sellers
 * → Craftsmanship/Brand Story → Reviews → Promo Banner → Newsletter.
 *
 * Product data (New Arrivals / Best Sellers) and category data are always
 * pulled from real WooCommerce objects — see template-parts/product-grid.php
 * and template-parts/categories.php. The Editorial Spotlight below
 * highlights a real featured product (WooCommerce "Featured" flag) when
 * one exists, rather than naming any specific product in the template
 * itself, so nothing on this page is hardcoded sample content.
 *
 * @package Ardea
 */

get_header();
?>
<main id="main">

	<?php get_template_part( 'template-parts/hero' ); ?>

	<?php get_template_part( 'template-parts/categories' ); ?>

	<?php
	// Editorial spotlight: real featured product when the store has one,
	// otherwise generic on-brand craftsmanship copy naming no product.
	$ardea_spotlight_product = null;
	if ( class_exists( 'WooCommerce' ) ) {
		$ardea_featured = wc_get_products(
			array(
				'featured' => true,
				'limit'    => 1,
				'orderby'  => 'date',
				'order'    => 'DESC',
				'status'   => 'publish',
			)
		);
		if ( ! empty( $ardea_featured ) ) {
			$ardea_spotlight_product = $ardea_featured[0];
		}
	}
	?>
	<section class="section section--alt">
		<div class="container editorial">
			<div class="editorial__media" data-reveal>
				<?php if ( $ardea_spotlight_product ) : ?>
					<?php
					$ardea_spot_image_id = $ardea_spotlight_product->get_image_id();
					$ardea_spot_image    = $ardea_spot_image_id ? wp_get_attachment_image_url( $ardea_spot_image_id, 'ardea-editorial' ) : wc_placeholder_img_src();
					?>
					<img src="<?php echo esc_url( $ardea_spot_image ); ?>" alt="<?php echo esc_attr( $ardea_spotlight_product->get_name() ); ?>" width="1200" height="1400" loading="lazy">
				<?php else : ?>
					<img src="<?php echo esc_url( ARDEA_URI . '/assets/images/ardea-editorial-spotlight.svg' ); ?>" alt="<?php esc_attr_e( 'Editorial portrait of an Ardea piece finished by hand in a sunlit corner', 'ardea' ); ?>" width="1200" height="1400" loading="lazy">
				<?php endif; ?>
				<div class="editorial__caption"><strong>01</strong><?php esc_html_e( 'The Signature Piece', 'ardea' ); ?></div>
			</div>
			<div class="editorial__body" data-reveal>
				<?php if ( $ardea_spotlight_product ) : ?>
					<p class="eyebrow"><?php echo esc_html( $ardea_spotlight_product->get_name() ); ?></p>
					<h2><?php esc_html_e( 'A piece worth building a room around', 'ardea' ); ?></h2>
					<p class="lead">
						<?php
						echo esc_html(
							wp_trim_words(
								wp_strip_all_tags( $ardea_spotlight_product->get_short_description() ? $ardea_spotlight_product->get_short_description() : $ardea_spotlight_product->get_description() ),
								34
							)
						);
						?>
					</p>
					<div class="editorial__meta">
						<div><strong><?php echo esc_html( number_format_i18n( $ardea_spotlight_product->get_average_rating(), 1 ) ); ?></strong><span><?php esc_html_e( 'Average Rating', 'ardea' ); ?></span></div>
						<div><strong><?php echo (int) $ardea_spotlight_product->get_review_count(); ?></strong><span><?php esc_html_e( 'Verified Reviews', 'ardea' ); ?></span></div>
						<div><strong>15yr</strong><span><?php esc_html_e( 'Structural Warranty', 'ardea' ); ?></span></div>
					</div>
					<a href="<?php echo esc_url( get_permalink( $ardea_spotlight_product->get_id() ) ); ?>" class="btn btn--dark"><?php esc_html_e( 'Shop This Piece', 'ardea' ); ?></a>
				<?php else : ?>
					<p class="eyebrow"><?php esc_html_e( 'Our Craft', 'ardea' ); ?></p>
					<h2><?php esc_html_e( 'Slow prototypes, built to be lived in', 'ardea' ); ?></h2>
					<p class="lead"><?php esc_html_e( 'Every signature piece we design spends years, not weeks, in development — testing joinery, proportion and finish until it feels as good after a decade of daily use as it did on day one.', 'ardea' ); ?></p>
					<p><?php esc_html_e( 'Each piece is built from FSC-certified solid wood or natural stone, upholstered in undyed natural fibre where relevant, and finished entirely by hand in one of our partner workshops.', 'ardea' ); ?></p>
					<div class="editorial__meta">
						<div><strong>5</strong><span><?php esc_html_e( 'Years in Development', 'ardea' ); ?></span></div>
						<div><strong>12</strong><span><?php esc_html_e( 'Workshop Partners', 'ardea' ); ?></span></div>
						<div><strong>15yr</strong><span><?php esc_html_e( 'Structural Warranty', 'ardea' ); ?></span></div>
					</div>
					<a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>" class="btn btn--dark"><?php esc_html_e( 'Shop the Collection', 'ardea' ); ?></a>
				<?php endif; ?>
			</div>
		</div>
	</section>

	<?php
	if ( class_exists( 'WooCommerce' ) ) {
		get_template_part(
			'template-parts/product-grid',
			null,
			array(
				'eyebrow'      => __( 'Just Landed', 'ardea' ),
				'heading'      => __( 'New Arrivals', 'ardea' ),
				'view_all_url' => add_query_arg( 'orderby', 'date', wc_get_page_permalink( 'shop' ) ),
				'query'        => array(
					'orderby' => 'date',
					'order'   => 'DESC',
					'limit'   => 4,
				),
			)
		);
	}
	?>

	<?php
	if ( class_exists( 'WooCommerce' ) ) {
		get_template_part(
			'template-parts/product-grid',
			null,
			array(
				'eyebrow'       => __( 'Customer Favorites', 'ardea' ),
				'heading'       => __( 'Best Sellers', 'ardea' ),
				'view_all_url'  => add_query_arg( 'orderby', 'popularity', wc_get_page_permalink( 'shop' ) ),
				'section_class' => 'section--alt',
				'query'         => array(
					'orderby' => 'popularity',
					'limit'   => 4,
				),
			)
		);
	}
	?>

	<section class="section section--dark" id="craftsmanship">
		<div class="container craft">
			<div class="craft__media" data-reveal>
				<img src="<?php echo esc_url( ARDEA_URI . '/assets/images/ardea-craftsmanship.svg' ); ?>" alt="<?php esc_attr_e( 'A woodworker\'s hands shaping an oak joint in an Ardea partner workshop', 'ardea' ); ?>" width="1200" height="1000" loading="lazy">
			</div>
			<div data-reveal>
				<p class="eyebrow"><?php esc_html_e( 'Our Craft', 'ardea' ); ?></p>
				<h2><?php esc_html_e( 'Slow furniture, made by hand', 'ardea' ); ?></h2>
				<p class="lead" style="color:rgba(250,247,242,0.8);"><?php esc_html_e( "Every Ardea piece passes through the hands of fewer than twelve people, from the timber yard to your living room. We work with small, family-run workshops rather than mass factories, because joinery this precise can't be rushed.", 'ardea' ); ?></p>
				<div class="craft__stats">
					<div><strong>12</strong><span><?php esc_html_e( 'Workshop Partners', 'ardea' ); ?></span></div>
					<div><strong>100%</strong><span><?php esc_html_e( 'FSC-Certified Timber', 'ardea' ); ?></span></div>
					<div><strong>15yr</strong><span><?php esc_html_e( 'Structural Warranty', 'ardea' ); ?></span></div>
				</div>
			</div>
		</div>
	</section>

	<?php get_template_part( 'template-parts/testimonials' ); ?>

	<section class="container section--tight">
		<div class="promo-banner" data-reveal>
			<img src="<?php echo esc_url( ARDEA_URI . '/assets/images/ardea-seasonal-promo-banner.svg' ); ?>" alt="<?php esc_attr_e( 'Autumn living room styling in terracotta and olive tones for the Ardea seasonal sale', 'ardea' ); ?>" width="1600" height="560" loading="lazy">
			<div class="promo-banner__content">
				<p class="eyebrow"><?php esc_html_e( 'Seasonal Sale', 'ardea' ); ?></p>
				<h2><?php esc_html_e( 'Up to 15% off select pieces', 'ardea' ); ?></h2>
				<p><?php esc_html_e( 'For a limited time, save on lounge chairs, lighting and decor across the Ardea collection. Ends soon.', 'ardea' ); ?></p>
				<div class="promo-countdown" data-promo-countdown></div>
				<a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>" class="btn btn--primary"><?php esc_html_e( 'Shop the Sale', 'ardea' ); ?></a>
			</div>
		</div>
	</section>

	<?php get_template_part( 'template-parts/newsletter' ); ?>

</main>
<?php
get_footer();
