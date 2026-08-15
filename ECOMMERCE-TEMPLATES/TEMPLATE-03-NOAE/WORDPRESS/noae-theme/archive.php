<?php
/**
 * Blog archive (and any other non-WooCommerce archive — category, tag,
 * date, author). WooCommerce's product archive uses its own
 * archive-product.php, hook-restyled in inc/woocommerce.php, so this
 * template is never reached for /shop/ or product category pages.
 *
 * @package Noae
 */

get_header();
?>
<main id="main">
	<section class="noae-page-header">
		<div class="noae-container">
			<h1><?php the_archive_title(); ?></h1>
			<?php if ( get_the_archive_description() ) : ?>
				<p class="noae-page-header__intro"><?php echo wp_kses_post( get_the_archive_description() ); ?></p>
			<?php endif; ?>
		</div>
	</section>

	<div class="noae-container" style="padding-bottom: var(--space-9);">
		<?php if ( have_posts() ) : ?>
			<div class="noae-scroll-row">
				<?php
				while ( have_posts() ) :
					the_post();
					?>
					<article <?php post_class(); ?>>
						<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
						<p style="font-size:0.85rem;color:var(--color-plum-soft);"><?php echo esc_html( get_the_date() ); ?></p>
						<div><?php echo wp_kses_post( noae_excerpt() ); ?></div>
						<a href="<?php the_permalink(); ?>" class="noae-btn noae-btn--ghost noae-mt-6"><?php esc_html_e( 'Read More', 'noae' ); ?></a>
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination( array( 'mid_size' => 2 ) ); ?>
		<?php else : ?>
			<div class="noae-empty-state">
				<h3><?php esc_html_e( 'Nothing found', 'noae' ); ?></h3>
				<p><?php esc_html_e( 'Try browsing the shop instead.', 'noae' ); ?></p>
				<?php if ( class_exists( 'WooCommerce' ) ) : ?>
					<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="noae-btn noae-btn--dark noae-mt-6"><?php esc_html_e( 'Browse the Shop', 'noae' ); ?></a>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
