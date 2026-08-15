<?php
/**
 * Template Name: Modix: Wishlist
 *
 * Assign this template to a Page (e.g. titled "Wishlist") from the Page
 * Attributes panel in the block editor. See inc/wishlist.php's docblock
 * for why this is a dedicated page rather than a My Account endpoint.
 *
 * @package Modix
 */

get_header();
?>
<main id="main" data-wishlist-page>
	<div class="page-header">
		<div class="container">
			<nav class="breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'modix' ); ?>">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'modix' ); ?></a><span class="breadcrumb__sep">/</span>
				<span class="breadcrumb__current"><?php the_title(); ?></span>
			</nav>
			<h1><?php the_title(); ?></h1>
			<p class="page-header__intro"><?php esc_html_e( "Products you've saved for later. Move an item straight into your cart, or remove it if you've changed your mind.", 'modix' ); ?></p>
		</div>
	</div>

	<div class="container section">
		<?php echo do_shortcode( '[modix_wishlist]' ); ?>
	</div>
</main>
<?php
get_footer();
