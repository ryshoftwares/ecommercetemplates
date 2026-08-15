<?php
/**
 * Blog archive (and any other non-WooCommerce archive — category, tag,
 * date, author). WooCommerce's product archive uses its own
 * archive-product.php, hook-restyled in inc/woocommerce.php, so this
 * template is never reached for /shop/ or product category pages.
 *
 * @package Modix
 */

get_header();
?>
<main id="main">
	<div class="page-header">
		<div class="container">
			<nav class="breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'modix' ); ?>">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'modix' ); ?></a><span class="breadcrumb__sep">/</span>
				<span class="breadcrumb__current"><?php the_archive_title(); ?></span>
			</nav>
			<h1><?php the_archive_title(); ?></h1>
			<?php if ( get_the_archive_description() ) : ?>
				<p class="page-header__intro"><?php echo wp_kses_post( get_the_archive_description() ); ?></p>
			<?php endif; ?>
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
				<p><?php esc_html_e( 'Try browsing the shop instead.', 'modix' ); ?></p>
				<?php if ( class_exists( 'WooCommerce' ) ) : ?>
					<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-primary"><?php esc_html_e( 'Browse the Shop', 'modix' ); ?></a>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
