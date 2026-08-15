<?php
/**
 * Blog archive (and any other non-WooCommerce archive — category, tag,
 * date, author). WooCommerce's product archive uses its own
 * archive-product.php, hook-restyled in inc/woocommerce.php, so this
 * template is never reached for /shop/ or product category pages.
 *
 * @package Ardea
 */

get_header();
?>
<main id="main">
	<section class="page-hero container">
		<h1 class="page-hero__title"><?php the_archive_title(); ?></h1>
		<?php if ( get_the_archive_description() ) : ?>
			<p class="page-hero__lead lead"><?php echo wp_kses_post( get_the_archive_description() ); ?></p>
		<?php endif; ?>
	</section>

	<div class="container section--tight page-content-wrap">
		<?php if ( have_posts() ) : ?>
			<div class="archive-grid">
				<?php
				while ( have_posts() ) :
					the_post();
					?>
					<article <?php post_class( 'archive-card' ); ?>>
						<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
						<p class="single-post-meta"><?php echo esc_html( get_the_date() ); ?></p>
						<div class="entry-content"><?php echo wp_kses_post( ardea_excerpt() ); ?></div>
						<a href="<?php the_permalink(); ?>" class="btn btn--ghost" style="margin-top:1rem;"><?php esc_html_e( 'Read More', 'ardea' ); ?></a>
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination( array( 'mid_size' => 2 ) ); ?>
		<?php else : ?>
			<div class="no-results">
				<h2><?php esc_html_e( 'Nothing found', 'ardea' ); ?></h2>
				<p class="text-muted"><?php esc_html_e( 'Try browsing the shop instead.', 'ardea' ); ?></p>
				<?php if ( class_exists( 'WooCommerce' ) ) : ?>
					<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn--dark" style="margin-top:1.5rem;"><?php esc_html_e( 'Browse the Shop', 'ardea' ); ?></a>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
