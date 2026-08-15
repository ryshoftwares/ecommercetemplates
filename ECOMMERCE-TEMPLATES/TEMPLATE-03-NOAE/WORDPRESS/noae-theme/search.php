<?php
/**
 * Search results — on-brand, real WP_Query results (posts and, when
 * WooCommerce is active, products, searched together the way WordPress
 * core search naturally includes any public post type). Empty state
 * matches the demo's search.html empty-state treatment.
 *
 * @package Noae
 */

get_header();
?>
<main id="main">
	<nav class="noae-container noae-breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'noae' ); ?>">
		<ol>
			<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'noae' ); ?></a></li>
			<li aria-current="page"><?php esc_html_e( 'Search Results', 'noae' ); ?></li>
		</ol>
	</nav>

	<section class="noae-page-header">
		<div class="noae-container">
			<h1>
				<?php
				printf(
					/* translators: %s: search query. */
					esc_html__( 'Search results for "%s"', 'noae' ),
					esc_html( get_search_query() )
				);
				?>
			</h1>
			<p class="noae-page-header__intro">
				<?php
				global $wp_query;
				printf(
					/* translators: %d: number of results. */
					esc_html( _n( '%d result found', '%d results found', $wp_query->found_posts, 'noae' ) ),
					(int) $wp_query->found_posts
				);
				?>
			</p>
		</div>
	</section>

	<div class="noae-container" style="padding-bottom: var(--space-9);">
		<?php if ( have_posts() ) : ?>
			<?php
			$noae_has_products = false;
			while ( have_posts() ) :
				the_post();
				if ( 'product' === get_post_type() ) {
					$noae_has_products = true;
					break;
				}
			endwhile;
			rewind_posts();
			?>

			<?php if ( $noae_has_products ) : ?>
				<div class="noae-product-grid">
					<?php
					while ( have_posts() ) :
						the_post();
						if ( 'product' === get_post_type() ) {
							global $product;
							$product = wc_get_product( get_the_ID() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
							wc_get_template_part( 'content', 'product' );
						}
					endwhile;
					?>
				</div>
				<?php rewind_posts(); ?>
			<?php endif; ?>

			<div class="noae-scroll-row" style="margin-top:var(--space-8);">
				<?php
				while ( have_posts() ) :
					the_post();
					if ( 'product' === get_post_type() ) {
						continue;
					}
					?>
					<article <?php post_class(); ?>>
						<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
						<div><?php echo wp_kses_post( noae_excerpt() ); ?></div>
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination( array( 'mid_size' => 2 ) ); ?>
		<?php else : ?>
			<div class="noae-empty-state">
				<h3><?php esc_html_e( 'No results found', 'noae' ); ?></h3>
				<p><?php esc_html_e( 'Try a different search term, or browse the shop instead.', 'noae' ); ?></p>
				<?php if ( class_exists( 'WooCommerce' ) ) : ?>
					<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="noae-btn noae-btn--dark noae-mt-6"><?php esc_html_e( 'Browse the Shop', 'noae' ); ?></a>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
