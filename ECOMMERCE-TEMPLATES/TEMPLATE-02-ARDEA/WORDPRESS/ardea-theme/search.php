<?php
/**
 * Search results — on-brand, real WP_Query results (posts and, when
 * WooCommerce is active, products, searched together the way WordPress
 * core search naturally includes any public post type). Empty state
 * matches the demo's search.html empty-state treatment.
 *
 * @package Ardea
 */

get_header();
?>
<main id="main">
	<nav class="breadcrumbs container" aria-label="<?php esc_attr_e( 'Breadcrumb', 'ardea' ); ?>">
		<ol>
			<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'ardea' ); ?></a></li>
			<li aria-current="page"><?php esc_html_e( 'Search Results', 'ardea' ); ?></li>
		</ol>
	</nav>

	<section class="page-hero container">
		<h1 class="page-hero__title">
			<?php
			printf(
				/* translators: %s: search query. */
				esc_html__( 'Search results for "%s"', 'ardea' ),
				esc_html( get_search_query() )
			);
			?>
		</h1>
		<p class="page-hero__lead lead">
			<?php
			global $wp_query;
			printf(
				/* translators: %d: number of results. */
				esc_html( _n( '%d result found', '%d results found', $wp_query->found_posts, 'ardea' ) ),
				(int) $wp_query->found_posts
			);
			?>
		</p>
	</section>

	<div class="container section--tight page-content-wrap">
		<?php if ( have_posts() ) : ?>
			<?php
			$ardea_has_products = false;
			while ( have_posts() ) :
				the_post();
				if ( 'product' === get_post_type() ) {
					$ardea_has_products = true;
					break;
				}
			endwhile;
			rewind_posts();
			?>

			<?php if ( $ardea_has_products ) : ?>
				<ul class="product-grid">
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
				</ul>
				<?php rewind_posts(); ?>
			<?php endif; ?>

			<div class="archive-grid" style="margin-top:var(--space-8);">
				<?php
				while ( have_posts() ) :
					the_post();
					if ( 'product' === get_post_type() ) {
						continue;
					}
					?>
					<article <?php post_class( 'archive-card' ); ?>>
						<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
						<div class="entry-content"><?php echo wp_kses_post( ardea_excerpt() ); ?></div>
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination( array( 'mid_size' => 2 ) ); ?>
		<?php else : ?>
			<div class="search-empty empty-state">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
				<h3><?php esc_html_e( 'No results found', 'ardea' ); ?></h3>
				<p class="lead" style="margin-top:0.5rem;"><?php esc_html_e( 'Try a different search term, or browse the shop instead.', 'ardea' ); ?></p>
				<?php if ( class_exists( 'WooCommerce' ) ) : ?>
					<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn--dark" style="margin-top:1.5rem;"><?php esc_html_e( 'Browse the Shop', 'ardea' ); ?></a>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
