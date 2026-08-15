<?php
/**
 * 404 — matches the NOAÉ demo's 404.html design (error code, heading,
 * three CTAs, "Shop By Concern" grid pulling REAL WooCommerce categories
 * rather than the hardcoded links the static demo used).
 *
 * @package Noae
 */

get_header();
?>
<main id="main">

	<div class="noae-container">
		<div class="noae-404">
			<p class="noae-404__code">404</p>
			<h1><?php esc_html_e( 'This Page Skipped Its Ritual', 'noae' ); ?></h1>
			<p class="noae-page-header__intro"><?php esc_html_e( "The page you're looking for has been moved, renamed, or never existed. Let's get you back to something worth browsing.", 'noae' ); ?></p>
			<div class="noae-404__actions">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="noae-btn noae-btn--primary"><?php esc_html_e( 'Back To Home', 'noae' ); ?></a>
				<?php if ( class_exists( 'WooCommerce' ) ) : ?>
					<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="noae-btn noae-btn--outline"><?php esc_html_e( 'Shop All Products', 'noae' ); ?></a>
				<?php endif; ?>
				<?php $noae_contact_404 = get_page_by_path( 'contact' ); ?>
				<a href="<?php echo esc_url( $noae_contact_404 ? get_permalink( $noae_contact_404 ) : home_url( '/contact/' ) ); ?>" class="noae-btn noae-btn--outline"><?php esc_html_e( 'Contact Support', 'noae' ); ?></a>
			</div>
		</div>
	</div>

	<?php
	get_template_part(
		'template-parts/categories',
		null,
		array(
			'eyebrow'       => __( 'Or Start Here', 'noae' ),
			'heading'       => __( 'Find Your Category', 'noae' ),
			'desc'          => '',
			'section_class' => 'noae-section--soft',
		)
	);
	?>

</main>
<?php
get_footer();
