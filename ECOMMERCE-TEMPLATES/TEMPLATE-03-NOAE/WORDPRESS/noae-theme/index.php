<?php
/**
 * Fallback template — required by WordPress. Rarely hit directly since
 * front-page.php, archive.php, single.php, page.php and search.php cover
 * the theme's real templates, but kept on-brand for any query WordPress
 * can't otherwise resolve.
 *
 * @package Noae
 */

get_header();
?>
<main id="main">
	<section class="noae-page-header">
		<div class="noae-container">
			<h1><?php esc_html_e( 'Latest', 'noae' ); ?></h1>
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
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination( array( 'mid_size' => 2 ) ); ?>
		<?php else : ?>
			<div class="noae-empty-state">
				<h3><?php esc_html_e( 'Nothing found', 'noae' ); ?></h3>
			</div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
