<?php
/**
 * Template Name: Ardea: Wishlist
 *
 * Assign this template to a Page (e.g. titled "Wishlist") from the Page
 * Attributes panel in the block editor. See inc/wishlist.php's docblock
 * for why this is a dedicated page rather than a My Account endpoint.
 *
 * @package Ardea
 */

get_header();
?>
<main id="main" data-wishlist-page>
	<nav class="breadcrumbs container" aria-label="<?php esc_attr_e( 'Breadcrumb', 'ardea' ); ?>">
		<ol>
			<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'ardea' ); ?></a></li>
			<li aria-current="page"><?php the_title(); ?></li>
		</ol>
	</nav>

	<section class="page-hero container">
		<h1 class="page-hero__title"><?php the_title(); ?></h1>
		<p class="page-hero__lead lead"><?php esc_html_e( 'The pieces you have saved for later.', 'ardea' ); ?></p>
	</section>

	<section class="container section--tight">
		<?php echo do_shortcode( '[ardea_wishlist]' ); ?>
	</section>
</main>
<?php
get_footer();
