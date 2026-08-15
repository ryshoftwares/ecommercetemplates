<?php
/**
 * 404 — matches the demo's 404.html exactly: big accent error code,
 * on-brand copy, primary/secondary CTAs, and quick links to every real
 * top-level product category plus Contact Support.
 *
 * @package Modix
 */

get_header();
?>
<main id="main">
	<div class="container error-page">
		<div class="error-page__code">404</div>
		<h1 style="margin-top:16px;"><?php esc_html_e( 'This page took an unexpected exit.', 'modix' ); ?></h1>
		<p style="max-width:52ch;margin:16px auto 0;"><?php esc_html_e( "The page you're looking for doesn't exist, may have been moved, or the link you followed is out of date. Let's get you back to something real — browse our current lineup or head home.", 'modix' ); ?></p>
		<div class="error-page__actions">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="btn btn-primary btn-lg"><?php esc_html_e( 'Back to Home', 'modix' ); ?></a>
			<?php if ( class_exists( 'WooCommerce' ) ) : ?>
				<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-secondary btn-lg"><?php esc_html_e( 'Shop All Products', 'modix' ); ?></a>
			<?php endif; ?>
		</div>
		<?php if ( class_exists( 'WooCommerce' ) ) : ?>
			<div class="error-page__links">
				<?php
				$modix_cats = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true, 'parent' => 0, 'orderby' => 'menu_order', 'number' => 5 ) );
				if ( ! is_wp_error( $modix_cats ) ) {
					foreach ( $modix_cats as $modix_cat ) {
						echo '<a href="' . esc_url( get_term_link( $modix_cat ) ) . '">' . esc_html( $modix_cat->name ) . '</a>';
					}
				}
				$modix_contact_page = get_page_by_path( 'contact' );
				?>
				<a href="<?php echo esc_url( $modix_contact_page ? get_permalink( $modix_contact_page ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Contact Support', 'modix' ); ?></a>
			</div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
