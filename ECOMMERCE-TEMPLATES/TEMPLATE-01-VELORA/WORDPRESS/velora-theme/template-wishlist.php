<?php
/**
 * Template Name: Velora: Wishlist
 *
 * Assign this template to a Page (e.g. titled "Wishlist") from the Page
 * Attributes panel in the block editor. See inc/wishlist.php's docblock
 * for why this is a dedicated page rather than a My Account endpoint.
 *
 * @package Velora
 */

get_header();
?>
<main id="main" data-wishlist-page>
	<div class="page-band">
		<div class="container">
			<div class="breadcrumb">
				<ol>
					<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'velora' ); ?></a></li>
					<li aria-current="page"><?php the_title(); ?></li>
				</ol>
			</div>
			<h1><?php the_title(); ?></h1>
		</div>
	</div>

	<div class="container" style="padding:var(--sp-8) 0">
		<?php echo do_shortcode( '[velora_wishlist]' ); ?>
	</div>
</main>
<?php
get_footer();
