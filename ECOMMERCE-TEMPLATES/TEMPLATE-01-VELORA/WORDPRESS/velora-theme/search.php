<?php
/**
 * Search results — on-brand, real WP_Query results (posts and, when
 * WooCommerce is active, products search together the way WordPress core
 * search naturally includes any public post type). Empty state matches
 * the demo's search.html empty-state treatment.
 *
 * @package Velora
 */

get_header();
?>
<main id="main">
	<div class="page-band">
		<div class="container">
			<div class="breadcrumb">
				<ol>
					<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'velora' ); ?></a></li>
					<li aria-current="page"><?php esc_html_e( 'Search Results', 'velora' ); ?></li>
				</ol>
			</div>
			<h1>
				<?php
				printf(
					/* translators: %s: search query. */
					esc_html__( 'Search results for "%s"', 'velora' ),
					esc_html( get_search_query() )
				);
				?>
			</h1>
			<p>
				<?php
				global $wp_query;
				printf(
					/* translators: %d: number of results. */
					esc_html( _n( '%d result found', '%d results found', $wp_query->found_posts, 'velora' ) ),
					(int) $wp_query->found_posts
				);
				?>
			</p>
		</div>
	</div>

	<div class="page-content-wrap">
		<div class="container">
			<?php if ( have_posts() ) : ?>
				<?php
				$velora_has_products = false;
				while ( have_posts() ) :
					the_post();
					if ( 'product' === get_post_type() ) {
						$velora_has_products = true;
						break;
					}
				endwhile;
				rewind_posts();
				?>

				<?php if ( $velora_has_products ) : ?>
					<div class="product-grid">
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

				<div class="archive-grid" style="margin-top:var(--sp-8)">
					<?php
					while ( have_posts() ) :
						the_post();
						if ( 'product' === get_post_type() ) {
							continue;
						}
						?>
						<article <?php post_class( 'archive-card' ); ?>>
							<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
							<div class="entry-content"><?php echo wp_kses_post( velora_excerpt() ); ?></div>
						</article>
						<?php
					endwhile;
					?>
				</div>
				<?php the_posts_pagination(); ?>
			<?php else : ?>
				<div class="empty-state">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>
					<h3><?php esc_html_e( 'No results found', 'velora' ); ?></h3>
					<p class="text-muted"><?php esc_html_e( 'Try a different search term, or browse the shop instead.', 'velora' ); ?></p>
					<?php if ( class_exists( 'WooCommerce' ) ) : ?>
						<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Browse the Shop', 'velora' ); ?></a>
					<?php endif; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</main>
<?php
get_footer();
