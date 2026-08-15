<?php
/**
 * 404 — matches the demo's 404.html design (error code, heading, two
 * CTAs, "you might like these categories" grid pulling REAL WooCommerce
 * categories rather than the four hardcoded links the static demo used).
 *
 * @package Velora
 */

get_header();
?>
<main id="main">
	<div class="error-page">
		<p class="error-code">404</p>
		<h1><?php esc_html_e( 'This page has left the collection', 'velora' ); ?></h1>
		<p><?php esc_html_e( "The page you're looking for may have been moved, renamed, or never existed. Let's get you back to something beautiful.", 'velora' ); ?></p>
		<div class="error-actions">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Back to Homepage', 'velora' ); ?></a>
			<?php if ( class_exists( 'WooCommerce' ) ) : ?>
				<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-outline"><?php esc_html_e( 'Browse the Shop', 'velora' ); ?></a>
			<?php endif; ?>
		</div>

		<?php if ( class_exists( 'WooCommerce' ) ) : ?>
			<?php
			$velora_404_cats = get_terms(
				array(
					'taxonomy'   => 'product_cat',
					'hide_empty' => true,
					'parent'     => 0,
					'number'     => 4,
				)
			);
			?>
			<?php if ( ! is_wp_error( $velora_404_cats ) && ! empty( $velora_404_cats ) ) : ?>
				<div class="error-shop-suggest">
					<h2 style="margin-bottom:20px"><?php esc_html_e( 'You might like these categories', 'velora' ); ?></h2>
					<div class="cat-grid" style="grid-template-rows:repeat(2,180px)">
						<?php foreach ( $velora_404_cats as $velora_cat ) : ?>
							<a class="cat-card" href="<?php echo esc_url( get_term_link( $velora_cat ) ); ?>">
								<img src="<?php echo esc_url( velora_category_image_url( $velora_cat ) ); ?>" alt="<?php echo esc_attr( sprintf( __( 'Editorial imagery representing the %s collection', 'velora' ), $velora_cat->name ) ); ?>" width="900" height="700" loading="lazy">
								<span class="cat-card-label"><h3 style="font-size:1.1rem"><?php echo esc_html( $velora_cat->name ); ?></h3></span>
							</a>
						<?php endforeach; ?>
					</div>
				</div>
			<?php endif; ?>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
