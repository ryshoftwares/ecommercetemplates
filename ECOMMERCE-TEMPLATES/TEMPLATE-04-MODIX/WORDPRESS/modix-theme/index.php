<?php
/**
 * Fallback template — used only when no more specific template
 * (front-page.php, single.php, archive.php, page.php, search.php,
 * WooCommerce's own product templates) matches the current request.
 *
 * @package Modix
 */

get_header();
?>
<main id="main">
	<div class="page-header">
		<div class="container">
			<h1><?php echo is_home() && ! is_front_page() ? esc_html( get_the_title( get_option( 'page_for_posts' ) ) ?: __( 'Latest Posts', 'modix' ) ) : esc_html__( 'Latest Posts', 'modix' ); ?></h1>
		</div>
	</div>

	<div class="container section">
		<?php if ( have_posts() ) : ?>
			<div class="reviews-grid">
				<?php
				while ( have_posts() ) :
					the_post();
					?>
					<article <?php post_class( 'review-card' ); ?>>
						<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
						<p class="form-hint"><?php echo esc_html( get_the_date() ); ?></p>
						<p><?php echo wp_kses_post( modix_excerpt() ); ?></p>
						<a href="<?php the_permalink(); ?>" class="section-link"><?php esc_html_e( 'Read More', 'modix' ); ?> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination( array( 'mid_size' => 2 ) ); ?>
		<?php else : ?>
			<div class="empty-state">
				<h3><?php esc_html_e( 'Nothing found', 'modix' ); ?></h3>
				<?php if ( class_exists( 'WooCommerce' ) ) : ?>
					<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Browse the Shop', 'modix' ); ?></a>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
