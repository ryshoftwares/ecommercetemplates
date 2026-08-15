<?php
/**
 * 404 — matches the ARDEA demo's 404.html design (error code, heading,
 * two CTAs, "Shop by Room" grid pulling REAL WooCommerce categories
 * rather than the hardcoded links the static demo used).
 *
 * @package Ardea
 */

get_header();
?>
<main id="main">
	<nav class="breadcrumbs container" aria-label="<?php esc_attr_e( 'Breadcrumb', 'ardea' ); ?>">
		<ol>
			<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'ardea' ); ?></a></li>
			<li aria-current="page"><?php esc_html_e( 'Page Not Found', 'ardea' ); ?></li>
		</ol>
	</nav>

	<section class="container error-page">
		<p class="error-page__code">404</p>
		<p class="eyebrow" style="justify-content:center;"><?php esc_html_e( 'Lost, Not Broken', 'ardea' ); ?></p>
		<h1><?php esc_html_e( "We couldn't find that page", 'ardea' ); ?></h1>
		<p class="lead" style="max-width:520px;margin-inline:auto;"><?php esc_html_e( "The piece you're looking for may have been moved, renamed, or never existed. Let's get you back to browsing the collection.", 'ardea' ); ?></p>
		<div class="error-page__actions">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="btn btn--dark"><?php esc_html_e( 'Back to Home', 'ardea' ); ?></a>
			<?php if ( class_exists( 'WooCommerce' ) ) : ?>
				<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn--outline"><?php esc_html_e( 'Shop All Collections', 'ardea' ); ?></a>
			<?php endif; ?>
		</div>
	</section>

	<?php get_template_part( 'template-parts/categories' ); ?>
</main>
<?php
get_footer();
