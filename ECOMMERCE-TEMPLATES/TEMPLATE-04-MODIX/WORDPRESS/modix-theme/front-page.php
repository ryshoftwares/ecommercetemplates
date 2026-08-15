<?php
/**
 * Homepage — section order matches the MODIX demo's index.html:
 * Hero → Shop by Category → Comparison/spec-highlight strip → New
 * Arrivals → Best Sellers → Engineering & Design story → Reviews → Promo
 * Banner → Newsletter.
 *
 * Product/category data is always pulled from real WooCommerce objects —
 * see template-parts/categories.php and template-parts/product-grid.php.
 * The comparison strip below compares up to 3 real products (preferring a
 * "smartphones"-slugged category if the store has one, else the
 * highest-rated products overall) using their real `_modix_specifications`
 * postmeta, so nothing on this page names a specific hardcoded product.
 *
 * @package Modix
 */

get_header();
?>
<main id="main">

	<?php get_template_part( 'template-parts/hero' ); ?>

	<?php get_template_part( 'template-parts/categories' ); ?>

	<?php if ( class_exists( 'WooCommerce' ) ) : ?>
		<?php
		$modix_compare_products = array();
		$modix_compare_term     = get_term_by( 'slug', 'smartphones', 'product_cat' );
		if ( $modix_compare_term && ! is_wp_error( $modix_compare_term ) ) {
			$modix_compare_products = wc_get_products(
				array(
					'category' => array( $modix_compare_term->slug ),
					'limit'    => 3,
					'orderby'  => 'menu_order',
					'status'   => 'publish',
				)
			);
		}
		if ( empty( $modix_compare_products ) ) {
			$modix_compare_products = wc_get_products(
				array(
					'orderby' => 'popularity',
					'limit'   => 3,
					'status'  => 'publish',
				)
			);
		}
		if ( ! empty( $modix_compare_products ) ) {
			// Rank by price so the tag line ("Premium"/"Popular"/"Essentials")
			// reflects real store data rather than a hardcoded product tier.
			usort( $modix_compare_products, fn( $a, $b ) => (float) $b->get_price() <=> (float) $a->get_price() );
			$modix_tier_labels = array( __( 'Premium', 'modix' ), __( 'Popular', 'modix' ), __( 'Essentials', 'modix' ) );

			$modix_spec_labels = array();
			foreach ( $modix_compare_products as $modix_cp ) {
				foreach ( modix_get_specifications( $modix_cp->get_id() ) as $modix_row ) {
					$modix_spec_labels[ $modix_row['label'] ] = true;
				}
			}
			$modix_spec_labels = array_slice( array_keys( $modix_spec_labels ), 0, 5 );
			?>
			<section class="section compare-strip" data-reveal>
				<div class="container">
					<div class="section-header">
						<div class="section-header__text">
							<span class="eyebrow"><?php esc_html_e( 'Compare', 'modix' ); ?></span>
							<h2><?php esc_html_e( 'Which Modix device is right for you?', 'modix' ); ?></h2>
							<p><?php esc_html_e( 'A quick side-by-side of the specs that actually matter before you buy.', 'modix' ); ?></p>
						</div>
						<a href="<?php echo esc_url( $modix_compare_term ? get_term_link( $modix_compare_term ) : wc_get_page_permalink( 'shop' ) ); ?>" class="section-link"><?php esc_html_e( 'Shop This Range', 'modix' ); ?> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
					</div>
					<div class="compare-strip__table-wrap">
						<table class="compare-table">
							<thead>
								<tr>
									<th></th>
									<?php foreach ( $modix_compare_products as $modix_i => $modix_cp ) : ?>
										<th><span class="model-tag"><?php echo esc_html( $modix_tier_labels[ $modix_i ] ?? '' ); ?></span><?php echo esc_html( $modix_cp->get_name() ); ?></th>
									<?php endforeach; ?>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th><?php esc_html_e( 'Price', 'modix' ); ?></th>
									<?php foreach ( $modix_compare_products as $modix_i => $modix_cp ) : ?>
										<td class="<?php echo ( 0 === $modix_i ) ? 'is-highlight' : ''; ?>"><?php echo wp_kses_post( wc_price( wc_get_price_to_display( $modix_cp ) ) ); ?></td>
									<?php endforeach; ?>
								</tr>
								<?php foreach ( $modix_spec_labels as $modix_label ) : ?>
									<tr>
										<th><?php echo esc_html( $modix_label ); ?></th>
										<?php foreach ( $modix_compare_products as $modix_cp ) :
											$modix_specs = array();
											foreach ( modix_get_specifications( $modix_cp->get_id() ) as $modix_row ) {
												$modix_specs[ $modix_row['label'] ] = $modix_row['value'];
											}
											?>
											<td><?php echo esc_html( isset( $modix_specs[ $modix_label ] ) ? $modix_specs[ $modix_label ] : '—' ); ?></td>
										<?php endforeach; ?>
									</tr>
								<?php endforeach; ?>
							</tbody>
						</table>
					</div>
				</div>
			</section>
			<?php
		}
		?>
	<?php endif; ?>

	<?php
	if ( class_exists( 'WooCommerce' ) ) {
		get_template_part(
			'template-parts/product-grid',
			null,
			array(
				'eyebrow'       => __( 'Just Landed', 'modix' ),
				'heading'       => __( 'New Arrivals', 'modix' ),
				'intro'         => __( 'The latest additions to the Modix lineup, fresh from engineering.', 'modix' ),
				'view_all_url'  => add_query_arg( 'orderby', 'date', wc_get_page_permalink( 'shop' ) ),
				'view_all_text' => __( 'View All New', 'modix' ),
				'section_class' => 'section--alt',
				'query'         => array(
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
				'eyebrow'       => __( 'Fan Favorites', 'modix' ),
				'heading'       => __( 'Best Sellers', 'modix' ),
				'intro'         => __( 'The products Modix customers reach for again and again.', 'modix' ),
				'view_all_url'  => add_query_arg( 'orderby', 'popularity', wc_get_page_permalink( 'shop' ) ),
				'view_all_text' => __( 'View All Best Sellers', 'modix' ),
				'query'         => array(
					'orderby' => 'popularity',
					'limit'   => 4,
				),
			)
		);
	}
	?>

	<section class="section editorial" data-reveal>
		<div class="container editorial__grid">
			<div class="editorial__media">
				<img src="<?php echo esc_url( MODIX_URI . '/assets/images/modix-engineering-design-studio.svg' ); ?>" alt="<?php esc_attr_e( 'Modix product design blueprint showing device schematics and precision dimension guides', 'modix' ); ?>" width="700" height="560" loading="lazy">
			</div>
			<div>
				<span class="eyebrow"><?php esc_html_e( 'Engineering & Design', 'modix' ); ?></span>
				<h2><?php esc_html_e( 'Every millimetre is a decision', 'modix' ); ?></h2>
				<p><?php esc_html_e( 'From driver placement in our audio lineup to hinge tolerance in our laptops, our design studio tests each component against real usage — not just a spec sheet — before it ships.', 'modix' ); ?></p>
				<div class="editorial__list">
					<div class="editorial__list-item">
						<span class="num">01</span>
						<div><h4><?php esc_html_e( 'Material Testing', 'modix' ); ?></h4><p><?php esc_html_e( 'Every chassis is drop-tested through 300+ cycles before tooling is approved for production.', 'modix' ); ?></p></div>
					</div>
					<div class="editorial__list-item">
						<span class="num">02</span>
						<div><h4><?php esc_html_e( 'Acoustic Tuning', 'modix' ); ?></h4><p><?php esc_html_e( 'Our audio team hand-tunes every driver across 40+ listening sessions before a headphone ships.', 'modix' ); ?></p></div>
					</div>
					<div class="editorial__list-item">
						<span class="num">03</span>
						<div><h4><?php esc_html_e( 'Battery Validation', 'modix' ); ?></h4><p><?php esc_html_e( 'Battery life claims are measured at 50% brightness on a standardized mixed-use benchmark, not best-case.', 'modix' ); ?></p></div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<?php get_template_part( 'template-parts/testimonials' ); ?>

	<section class="section" data-reveal>
		<div class="container">
			<div class="promo-banner">
				<div>
					<h2><?php esc_html_e( 'Trade in your old device', 'modix' ); ?></h2>
					<p><?php esc_html_e( 'Get instant credit toward any Modix smartphone or laptop — free pickup included in most cities.', 'modix' ); ?></p>
				</div>
				<a href="<?php echo esc_url( get_page_by_path( 'contact' ) ? get_permalink( get_page_by_path( 'contact' ) ) : home_url( '/contact/' ) ); ?>" class="btn btn-secondary btn-lg"><?php esc_html_e( 'Check Trade-In Value', 'modix' ); ?></a>
			</div>
		</div>
	</section>

	<?php get_template_part( 'template-parts/newsletter' ); ?>

</main>
<?php
get_footer();
