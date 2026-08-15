<?php
/**
 * Search results — matches the demo's search.html layout. When
 * WooCommerce is active and the query matches products, real WC_Product
 * results render as the same product-grid cards used everywhere else
 * (content-product.php); otherwise falls back to the standard post loop.
 *
 * @package Modix
 */

get_header();

$modix_query      = get_search_query();
$modix_query_label = $modix_query ? '"' . $modix_query . '"' : __( 'all products', 'modix' );

$modix_products = array();
if ( class_exists( 'WooCommerce' ) && $modix_query ) {
	$modix_products = wc_get_products(
		array(
			's'       => $modix_query,
			'limit'   => 24,
			'status'  => 'publish',
			'orderby' => 'relevance',
		)
	);
}
?>
<main id="main">
	<div class="page-header">
		<div class="container">
			<nav class="breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'modix' ); ?>">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'modix' ); ?></a><span class="breadcrumb__sep">/</span>
				<span class="breadcrumb__current"><?php esc_html_e( 'Search Results', 'modix' ); ?></span>
			</nav>
			<h1><?php esc_html_e( 'Search Results', 'modix' ); ?></h1>
			<p class="page-header__intro search-results-header">
				<?php
				printf(
					/* translators: 1: search term, 2: number of matching products/posts. */
					esc_html__( 'Showing results for %1$s — %2$s matching results.', 'modix' ),
					'<strong>' . esc_html( $modix_query_label ) . '</strong>',
					'<span>' . (int) ( class_exists( 'WooCommerce' ) && $modix_query ? count( $modix_products ) : $wp_query->found_posts ) . '</span>' // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inline markup built above.
				);
				?>
			</p>
		</div>
	</div>

	<div class="container section">
		<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="display:flex;gap:12px;max-width:560px;margin-bottom:32px;">
			<label class="visually-hidden" for="search-page-input"><?php esc_html_e( 'Search products', 'modix' ); ?></label>
			<input type="search" id="search-page-input" name="s" placeholder="<?php esc_attr_e( 'Search phones, laptops, headphones…', 'modix' ); ?>" aria-label="<?php esc_attr_e( 'Search products', 'modix' ); ?>" value="<?php echo esc_attr( $modix_query ); ?>">
			<?php if ( class_exists( 'WooCommerce' ) ) : ?><input type="hidden" name="post_type" value="product"><?php endif; ?>
			<button type="submit" class="btn btn-primary"><?php esc_html_e( 'Search', 'modix' ); ?></button>
		</form>

		<?php if ( class_exists( 'WooCommerce' ) && $modix_query ) : ?>
			<?php if ( ! empty( $modix_products ) ) : ?>
				<div class="search-results-grid">
					<?php
					global $product;
					foreach ( $modix_products as $modix_sp ) {
						$product = $modix_sp; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- matches WC's own loop convention.
						wc_get_template_part( 'content', 'product' );
					}
					?>
				</div>
			<?php else : ?>
				<div class="empty-state">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
					<h3><?php echo esc_html( sprintf( __( 'No results for %s', 'modix' ), $modix_query_label ) ); ?></h3>
					<p><?php esc_html_e( "We couldn't find any products matching your search. Try a different keyword, check your spelling, or browse a category below.", 'modix' ); ?></p>
					<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Browse All Products', 'modix' ); ?></a>
				</div>
			<?php endif; ?>
		<?php elseif ( have_posts() ) : ?>
			<div class="reviews-grid">
				<?php
				while ( have_posts() ) :
					the_post();
					?>
					<article <?php post_class( 'review-card' ); ?>>
						<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
						<p><?php echo wp_kses_post( modix_excerpt() ); ?></p>
						<a href="<?php the_permalink(); ?>" class="section-link"><?php esc_html_e( 'Read More', 'modix' ); ?> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination( array( 'mid_size' => 2 ) ); ?>
		<?php else : ?>
			<div class="empty-state">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
				<h3><?php echo esc_html( sprintf( __( 'No results for %s', 'modix' ), $modix_query_label ) ); ?></h3>
				<p><?php esc_html_e( "We couldn't find anything matching your search. Try a different keyword.", 'modix' ); ?></p>
				<?php if ( class_exists( 'WooCommerce' ) ) : ?>
					<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Browse All Products', 'modix' ); ?></a>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
