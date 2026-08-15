<?php
/**
 * Template Name: Noaé: Wishlist
 *
 * Assign this template to a Page (e.g. titled "Wishlist") from the Page
 * Attributes panel in the block editor. See inc/wishlist.php's docblock
 * for why this is a dedicated page rather than a My Account endpoint.
 *
 * @package Noae
 */

get_header();
?>
<main id="main">
	<nav class="noae-container noae-breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'noae' ); ?>">
		<ol>
			<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'noae' ); ?></a></li>
			<li aria-current="page"><?php the_title(); ?></li>
		</ol>
	</nav>

	<section class="noae-page-header">
		<div class="noae-container">
			<h1><?php the_title(); ?></h1>
			<p class="noae-page-header__intro"><?php esc_html_e( "Every ritual you've saved, gathered in one place. Come back whenever you're ready to add them to your bag.", 'noae' ); ?></p>
		</div>
	</section>

	<div class="noae-container" style="padding-bottom: var(--space-9);">
		<?php echo do_shortcode( '[noae_wishlist]' ); ?>
	</div>
</main>
<?php
get_footer();
